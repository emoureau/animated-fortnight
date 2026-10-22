<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { RecordNote } from '#shared/types/bin'
import type { Locator, Snippet } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

// The note composer (spec 02, B1/B2). The citation is locked into the note: from the viewer's
// selection for records that open here, or typed ("Where in the record?") for everything else.
const props = defineProps<{
  record: CatalogRecord
  projectId: string
  snippets: Snippet[]
}>()

const emit = defineEmits<{ saved: [note: RecordNote], snippetAdded: [] }>()

const toast = useToast()
const { currentUser } = useUsers()
const binSelection = useBinSelection()
const { toggle } = useAssembly()

const mine = computed(() => personClasses[currentUser.value?.dataColor ?? 'person-1'])
const isInline = computed(() => props.record.availability.mode === 'inline')
const manifest = computed(() => props.record.availability.mode === 'download' ? props.record.availability.manifest?.map(f => f.path) ?? [] : [])

// Inline: the viewer's selection, or the whole record.
const wholeChosen = ref(false)
const selectionLocator = computed<Locator | null>(() => {
  if (binSelection.value?.recordId === props.record.id)
    return binSelection.value.locator
  return wholeChosen.value ? { kind: 'whole', label: WHOLE_RECORD } : null
})

// Everything else: file (download) + typed location.
const file = ref<string | undefined>(undefined)
const location = ref('')
const typedLocator = computed(() => composeLocator(props.record, file.value, location.value))

const locator = computed(() => isInline.value ? selectionLocator.value : typedLocator.value)
const citingLabel = computed(() => {
  const l = selectionLocator.value
  return l ? `Citing ${l.label}${l.kind === 'page' && l.region ? ', new selection' : ''}` : ''
})

const body = ref('')
const followUp = ref(false)
const addToDraft = ref(false)
const snippetIds = ref<string[]>([])
const attaching = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)

const fileSelect = useTemplateRef('fileSelect')
const errorId = useId()

const tagItems = computed<DropdownMenuItem[]>(() => [{
  type: 'checkbox',
  label: 'Follow-up',
  icon: 'i-mdi-flag-outline',
  checked: followUp.value,
  onUpdateChecked: (checked: boolean) => { followUp.value = checked },
}])

const attachedSnippets = computed(() => snippetIds.value.flatMap(id => props.snippets.find(s => s.id === id) ?? []))

function onSnippetSaved(snippet: Snippet) {
  snippetIds.value = [...snippetIds.value, snippet.id]
  emit('snippetAdded')
}

function reset() {
  body.value = ''
  followUp.value = false
  addToDraft.value = false
  snippetIds.value = []
  location.value = ''
  file.value = undefined
  wholeChosen.value = false
  error.value = null
  if (binSelection.value?.recordId === props.record.id)
    binSelection.value = null
}

async function save() {
  error.value = null
  if (!locator.value) {
    if (isInline.value) {
      error.value = 'Select text or a region in the viewer, or cite the whole record.'
    }
    else {
      error.value = 'Choose a file or “Whole record”.'
      fileSelect.value?.triggerRef?.focus()
    }
    return
  }
  if (!body.value.trim())
    return
  saving.value = true
  try {
    const note = await $fetch<RecordNote>(`/api/records/${props.record.id}/notes`, {
      method: 'POST',
      body: {
        projectId: props.projectId,
        locator: locator.value,
        body: body.value.trim(),
        excerpt: null,
        snippetIds: snippetIds.value.length ? snippetIds.value : undefined,
        flags: followUp.value ? ['follow-up'] : [],
      },
    })
    if (addToDraft.value)
      toggle(note.id, true)
    reset()
    emit('saved', note)
    toast.add({ title: 'Note saved', description: note.locator.label, icon: 'i-mdi-check-circle-outline', color: 'success' })
  }
  finally {
    saving.value = false
  }
}

// ⌘/Ctrl+Enter saves from anywhere in the composer.
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    save()
  }
}
</script>

<template>
  <!-- The textarea is borderless (variant none), so the composer box shows its focus. -->
  <form
    id="bin-composer"
    tabindex="-1"
    class="flex flex-col rounded-lg border-2 bg-default text-sm focus-visible:outline-2 focus-visible:outline-primary has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-primary"
    :class="isInline && selectionLocator ? mine.border : 'border-default'"
    aria-label="New note on this record"
    @submit.prevent="save"
    @keydown="onKeyDown"
  >
    <!-- Where the note cites -->
    <div class="flex flex-col gap-2 border-b border-default p-3">
      <template v-if="isInline">
        <p v-if="selectionLocator" class="flex items-center gap-1.5" :class="mine.text">
          <UIcon name="i-mdi-code-brackets" class="size-4" aria-hidden="true" />
          {{ citingLabel }}
          <span class="ms-auto flex items-center gap-1 text-xs">
            <UIcon name="i-mdi-lock-outline" class="size-4" aria-hidden="true" />
            Attached
          </span>
        </p>
        <div v-else class="flex flex-wrap items-center gap-2 text-muted">
          <span class="flex-1">Select text or a region in the viewer to cite it.</span>
          <UButton
            size="xs"
            color="neutral"
            variant="outline"
            label="Cite the whole record"
            @click="wholeChosen = true"
          />
        </div>
      </template>

      <template v-else>
        <span :id="`${errorId}-where`" class="font-medium text-toned">Where in the record?</span>
        <div class="flex gap-2">
          <USelect
            v-if="record.availability.mode === 'download'"
            ref="fileSelect"
            v-model="file"
            :items="[...manifest, WHOLE_RECORD]"
            placeholder="Choose a file"
            class="w-40 shrink-0 font-mono"
            :aria-labelledby="`${errorId}-where`"
            :aria-invalid="!!error"
            :aria-describedby="error ? errorId : undefined"
          />
          <UInput
            v-model="location"
            class="min-w-0 flex-1"
            :placeholder="record.availability.mode === 'download' ? 'rows, layer, timestamp…' : record.availability.mode === 'external' ? 'section or item (empty: whole page)' : 'box or folder (empty: whole item)'"
            aria-label="Location in the record"
          />
        </div>
        <ul v-if="attachedSnippets.length" class="flex flex-wrap gap-1.5">
          <li v-for="snippet in attachedSnippets" :key="snippet.id">
            <UBadge
              color="neutral"
              variant="outline"
              icon="i-mdi-crop"
              :label="`Snippet: ${snippet.caption}`"
            />
          </li>
        </ul>
        <!-- A dashed "add" affordance (B2); a plain button so no Nuxt UI component is restyled -->
        <button
          type="button"
          class="flex items-center gap-1.5 self-start rounded-md border border-dashed border-accented px-2 py-1 text-xs text-toned hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
          @click="attaching = true"
        >
          <UIcon name="i-mdi-crop" class="size-4" aria-hidden="true" />
          Attach a snippet so readers can see it
        </button>
      </template>

      <p v-if="error" :id="errorId" class="flex items-center gap-1.5 text-xs text-error">
        <UIcon name="i-mdi-alert-circle-outline" class="size-4" aria-hidden="true" />
        {{ error }}
      </p>
    </div>

    <div class="flex flex-col gap-3 p-3">
      <UTextarea
        v-model="body"
        :rows="3"
        autoresize
        variant="none"
        class="w-full"
        :placeholder="isInline ? 'Write a note about this passage…' : 'Write a note about this part of the record…'"
        aria-label="Note"
      />
      <div class="flex flex-wrap items-center gap-2">
        <UDropdownMenu :items="tagItems">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-mdi-plus"
            label="Tag"
          />
        </UDropdownMenu>
        <UBadge
          v-if="followUp"
          color="warning"
          variant="subtle"
          icon="i-mdi-flag-outline"
          label="Follow-up"
        />
        <UButton
          size="sm"
          color="neutral"
          :variant="addToDraft ? 'subtle' : 'outline'"
          :icon="addToDraft ? 'i-mdi-check' : undefined"
          label="Add to draft"
          :aria-pressed="addToDraft"
          @click="addToDraft = !addToDraft"
        />
        <UButton
          type="submit"
          class="ms-auto"
          label="Save note"
          :loading="saving"
          :disabled="!body.trim()"
        />
      </div>
    </div>

    <BinRecordSnippetPasteModal
      v-if="!isInline"
      v-model:open="attaching"
      :record="record"
      :files="manifest"
      @saved="onSnippetSaved"
    />
  </form>
</template>
