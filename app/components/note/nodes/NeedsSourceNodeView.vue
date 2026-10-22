<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

defineProps<NodeViewProps>()
</script>

<template>
  <NodeViewWrapper as="span">
    <NoteNeedsSource />
  </NodeViewWrapper>
</template>
