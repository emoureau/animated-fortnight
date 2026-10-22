<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const { snippetById } = useNoteContext()
const { byId } = useUsers()
const snippet = computed(() => snippetById.value.get(props.node.attrs.snippetId as string))
</script>

<template>
  <NodeViewWrapper :class="selected ? 'rounded-lg outline-2 outline-offset-2 outline-primary' : undefined">
    <NoteSnippetFigure v-if="snippet" :snippet="snippet" :author="byId.get(snippet.createdBy)" />
    <p v-else class="text-muted">
      Snippet not found
    </p>
  </NodeViewWrapper>
</template>
