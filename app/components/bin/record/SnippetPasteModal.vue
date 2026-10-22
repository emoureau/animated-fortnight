<script setup lang="ts">
import type { Snippet } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

// "Paste screenshot or text" (B2): a team-made stand-in for a record that can't be viewed.
// Images are kept as data URLs in memory; the prototype has no upload.
const props = defineProps<{
  record: CatalogRecord
  files: string[]
}>()

const emit = defineEmits<{ saved: [snippet: Snippet] }>()
const open = defineModel<boolean>('open', { required: true })
const route = useRoute()
const toast = useToast()

const caption = ref('')
const sourceFile = ref<string | undefined>(undefined)
const text = ref('')
const image = ref<string | null>(null)
const saving = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    caption.value = ''
    sourceFile.value = props.files[0]
    text.value = ''
    image.value = null
  }
})

function onPaste(event: ClipboardEvent) {
  const file = [...(event.clipboardData?.files ?? [])].find(f => f.type.startsWith('image/'))
  if (!file)
    return
  event.preventDefault()
  const reader = new FileReader()
  reader.onload = () => {
    image.value = String(reader.result)
  }
  reader.readAsDataURL(file)
}

const canSave = computed(() => !!caption.value.trim() && (!!image.value || !!text.value.trim()))

async function save() {
  if (!canSave.value)
    return
  saving.value = true
  try {
    const snippet = await $fetch<Snippet>(`/api/records/${props.record.id}/snippets`, {
      method: 'POST',
      body: {
        projectId: 'projectId' in route.params ? String(route.params.projectId) : '',
        kind: image.value ? 'image' : 'text',
        caption: caption.value.trim(),
        sourceFile: sourceFile.value || undefined,
        ...image.value ? { imagePath: image.value } : { text: text.value.trim() },
      },
    })
    emit('saved', snippet)
    open.value = false
    toast.add({ title: 'Snippet added', description: snippet.caption, icon: 'i-mdi-check-circle-outline', color: 'success' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Add a snippet" :description="`A stand-in readers can see for “${record.title}”. It’s labelled as made by your team.`">
    <template #body>
      <form id="snippet-form" class="flex flex-col gap-4" @submit.prevent="save">
        <UFormField label="Caption" required>
          <UInput v-model="caption" class="w-full" placeholder="What does it show?" />
        </UFormField>
        <UFormField label="From file" help="The file in the record this came from">
          <UInputMenu
            v-model="sourceFile"
            :items="files"
            create-item
            class="w-full"
            placeholder="File name"
            @create="(item: string) => { sourceFile = item }"
          />
        </UFormField>
        <UFormField label="Screenshot or text" help="Paste a screenshot (Ctrl or ⌘ + V), or paste or type text">
          <img
            v-if="image"
            :src="image"
            alt="Pasted screenshot"
            class="max-h-48 rounded-md border border-default"
          >
          <UTextarea
            v-else
            v-model="text"
            :rows="4"
            autoresize
            class="w-full font-mono"
            placeholder="Paste here"
            @paste="onPaste"
          />
          <UButton
            v-if="image"
            class="mt-2"
            size="sm"
            color="neutral"
            variant="ghost"
            label="Remove screenshot"
            @click="image = null"
          />
        </UFormField>
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
          form="snippet-form"
          label="Add snippet"
          :loading="saving"
          :disabled="!canSave"
        />
      </div>
    </template>
  </UModal>
</template>
