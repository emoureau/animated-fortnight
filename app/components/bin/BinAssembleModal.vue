<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'

// "Assemble notes into draft" (spec 02): each selected note becomes a paragraph with its citation chip,
// in a new or an existing shared note, which then opens in the editor.
const props = defineProps<{
  projectId: string
  recordNoteById: Map<string, RecordNote>
  recordById: Map<string, CatalogRecord>
  drafts: Note[]
}>()

const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const { selected, clear } = useAssembly()

const target = ref<'new' | 'existing'>('new')
const title = ref('')
const existingId = ref<string | undefined>(undefined)
const saving = ref(false)
const error = ref<string | null>(null)

watch(open, (isOpen) => {
  if (isOpen) {
    target.value = 'new'
    title.value = `Draft from the bin, ${formatShortDate(new Date().toISOString())}`
    existingId.value = props.drafts[0]?.id
    error.value = null
  }
})

const items = computed(() => selected.value.flatMap((id) => {
  const note = props.recordNoteById.get(id)
  const record = note && props.recordById.get(note.recordId)
  return note && record ? [{ note, record }] : []
}))

function move(index: number, delta: number) {
  const ids = [...selected.value]
  const [id] = ids.splice(index, 1)
  ids.splice(index + delta, 0, id!)
  selected.value = ids
}

async function assemble() {
  error.value = null
  if (target.value === 'new' && !title.value.trim()) {
    error.value = 'Name the new note.'
    return
  }
  saving.value = true
  try {
    const note = await $fetch<Note>('/api/notes/assemble', {
      method: 'POST',
      body: {
        projectId: props.projectId,
        recordNoteIds: items.value.map(i => i.note.id),
        target: target.value === 'new' ? { title: title.value.trim() } : { noteId: existingId.value },
      },
    })
    clear()
    open.value = false
    toast.add({ title: 'Draft ready', description: note.title, icon: 'i-mdi-check-circle-outline', color: 'success' })
    await navigateTo(`/p/${props.projectId}/notes/${note.id}`)
  }
  catch {
    error.value = 'Couldn’t assemble the draft. Try again.'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Assemble ${items.length} ${items.length === 1 ? 'note' : 'notes'}`"
    description="Each note becomes a paragraph followed by its citation."
  >
    <template #body>
      <form id="assemble-form" class="flex flex-col gap-5" @submit.prevent="assemble">
        <URadioGroup
          v-model="target"
          legend="Put them in"
          :items="[{ label: 'New note', value: 'new' }, { label: 'Add to an existing note', value: 'existing' }]"
        />
        <UFormField v-if="target === 'new'" label="Title" required>
          <UInput v-model="title" class="w-full" />
        </UFormField>
        <UFormField v-else label="Note">
          <USelect
            v-model="existingId"
            :items="drafts"
            value-key="id"
            label-key="title"
            class="w-full"
          />
        </UFormField>

        <section class="flex flex-col gap-2" aria-labelledby="assemble-order">
          <h3 id="assemble-order" class="text-sm font-medium text-toned">
            In this order
          </h3>
          <ol class="flex flex-col gap-1">
            <li
              v-for="({ note, record }, i) in items"
              :key="note.id"
              class="flex items-center gap-2 rounded-md border border-default bg-elevated px-2 py-1.5 text-sm"
            >
              <span class="w-5 text-center tabular-nums text-muted">{{ i + 1 }}</span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-highlighted">{{ note.body }}</span>
                <span class="truncate text-xs text-secondary">{{ shortTitle(record) }} · {{ note.locator.label }}</span>
              </span>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-mdi-arrow-up"
                :aria-label="`Move note ${i + 1} up`"
                :disabled="i === 0"
                @click="move(i, -1)"
              />
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-mdi-arrow-down"
                :aria-label="`Move note ${i + 1} down`"
                :disabled="i === items.length - 1"
                @click="move(i, 1)"
              />
            </li>
          </ol>
        </section>

        <p v-if="error" class="flex items-center gap-1.5 text-sm text-error" role="alert">
          <UIcon name="i-mdi-alert-circle-outline" class="size-4" aria-hidden="true" />
          {{ error }}
        </p>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          label="Cancel"
          @click="open = false"
        />
        <UButton
          type="submit"
          form="assemble-form"
          label="Assemble and open"
          :loading="saving"
          :disabled="!items.length"
        />
      </div>
    </template>
  </UModal>
</template>
