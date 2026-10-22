<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'
import type { SaveStatus } from './NoteSaveStatus.vue'

// Spec 01 toolbar: block type, Bold, Italic, lists, quote, link, Cite record. Right: save status, Version history.
const props = defineProps<{
  editor: Editor
  status: SaveStatus
  /** Bumped on every editor transaction so the block type label follows the caret */
  revision: number
}>()

const emit = defineEmits<{ comment: [] }>()

const toast = useToast()

const hasSelection = computed(() => {
  void props.revision
  return !props.editor.state.selection.empty
})

const blockTypes = [
  { label: 'Paragraph', icon: 'i-mdi-format-paragraph', kind: 'paragraph' as const },
  { label: 'Heading 2', icon: 'i-mdi-format-header-2', kind: 'heading' as const, level: 2 as const },
  { label: 'Heading 3', icon: 'i-mdi-format-header-3', kind: 'heading' as const, level: 3 as const },
]

const blockLabel = computed(() => {
  void props.revision
  const active = blockTypes.find(b => b.kind === 'heading' ? props.editor.isActive('heading', { level: b.level }) : props.editor.isActive('paragraph'))
  return active?.label ?? 'Text style'
})

const items = computed(() => [
  [{
    'label': blockLabel.value,
    'trailingIcon': 'i-mdi-chevron-down',
    'color': 'neutral',
    'variant': 'outline',
    // Its state is shown by the label; primary would read as "actionable" (design rule 2).
    'activeColor': 'neutral',
    'activeVariant': 'outline',
    'aria-label': `Text style: ${blockLabel.value}`,
    'content': { align: 'start' },
    'items': blockTypes,
  }],
  [
    { 'kind': 'mark', 'mark': 'bold', 'icon': 'i-mdi-format-bold', 'aria-label': 'Bold', 'tooltip': { text: 'Bold' } },
    { 'kind': 'mark', 'mark': 'italic', 'icon': 'i-mdi-format-italic', 'aria-label': 'Italic', 'tooltip': { text: 'Italic' } },
  ],
  [
    { 'kind': 'bulletList', 'icon': 'i-mdi-format-list-bulleted', 'aria-label': 'Bulleted list', 'tooltip': { text: 'Bulleted list' } },
    { 'kind': 'orderedList', 'icon': 'i-mdi-format-list-numbered', 'aria-label': 'Numbered list', 'tooltip': { text: 'Numbered list' } },
    { 'kind': 'blockquote', 'icon': 'i-mdi-format-quote-open-outline', 'aria-label': 'Quote', 'tooltip': { text: 'Quote' } },
    { 'kind': 'link', 'icon': 'i-mdi-link-variant', 'aria-label': 'Link', 'tooltip': { text: 'Link' } },
  ],
  [{ slot: 'cite' as const }, { slot: 'comment' as const }],
] satisfies EditorToolbarItem[][])

function versionHistory() {
  toast.add({ title: 'Version history isn’t part of this prototype', icon: 'i-mdi-information-outline', color: 'info' })
}
</script>

<template>
  <div class="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 border-b border-default bg-default">
    <UEditorToolbar
      :editor="editor"
      :items="items"
      aria-label="Formatting"
    >
      <template #cite>
        <UButton
          color="secondary"
          variant="soft"
          icon="i-mdi-code-brackets"
          aria-keyshortcuts="[ ["
          @click="editor.chain().focus().insertContent('[[').run()"
        >
          Cite record
          <span class="font-mono text-xs opacity-80" aria-hidden="true">[[</span>
        </UButton>
      </template>
      <template #comment>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-mdi-comment-outline"
          label="Comment"
          :disabled="!hasSelection"
          :title="hasSelection ? undefined : 'Select text to comment on it'"
          @mousedown.prevent
          @click="emit('comment')"
        />
      </template>
    </UEditorToolbar>
    <div class="ms-auto flex items-center gap-4">
      <NoteSaveStatus :status="status" />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-mdi-history"
        label="Version history"
        @click="versionHistory"
      />
    </div>
  </div>
</template>
