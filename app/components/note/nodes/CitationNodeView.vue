<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const { citationById, recordById, activeCitationId, activate } = useNoteContext()

const citationId = computed(() => props.node.attrs.citationId as string)
const citation = computed(() => citationById.value.get(citationId.value))
const record = computed(() => citation.value && recordById.value.get(citation.value.recordId))

// Moving the caret onto the chip (node selection) drives the right panel too.
watch(() => props.selected, (selected) => {
  if (selected)
    activate(citationId.value)
})
</script>

<template>
  <NodeViewWrapper as="span" class="mx-px">
    <CitationChip
      v-if="citation && record"
      :record="record"
      :locator="citation.locator"
      :label="shortTitle(record)"
      :active="selected || activeCitationId === citationId"
      @activate="activate(citationId)"
    />
    <span v-else class="text-muted">[citation not found]</span>
  </NodeViewWrapper>
</template>
