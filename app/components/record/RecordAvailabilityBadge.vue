<script setup lang="ts">
import type { Availability } from '#shared/types/record'

// "How it opens": neutral, always icon plus word (docs/design-rules.md).
const props = withDefaults(defineProps<{
  availability: Availability
  /** Extra state after the word, e.g. "Snapshot Oct 2" or "Retrieval requested" */
  detail?: string
  size?: 'sm' | 'md'
}>(), { size: 'sm' })

const label = computed(() => {
  const base = availabilityLabel(props.availability)
  return props.detail ? `${base} · ${props.detail}` : base
})
</script>

<template>
  <UBadge
    color="neutral"
    variant="outline"
    :size="size"
    :icon="availabilityIcons[availability.mode]"
    :label="label"
  />
</template>
