<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const { projectNotes } = useNoteContext()
const title = computed(() => props.node.attrs.title as string)
const target = computed(() => projectNotes.value.find(n => n.title.startsWith(title.value)))
</script>

<template>
  <NodeViewWrapper as="span">
    <NuxtLink
      v-if="target"
      :to="`/p/${target.projectId}/notes/${target.id}`"
      class="text-primary underline underline-offset-2"
    >
      <span v-text="title" />
    </NuxtLink>
    <span v-else class="text-muted" v-text="`[[${title}]]`" />
  </NodeViewWrapper>
</template>
