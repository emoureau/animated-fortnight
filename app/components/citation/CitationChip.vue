<script setup lang="ts">
import type { Locator } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

// Inline citation: secondary soft chip with type icon, short title and locator.
// Records that can't open here get a trailing download or external icon.
// A native button (not UButton) so it sits in running text and scales with it.
const props = defineProps<{
  record: CatalogRecord
  locator: Locator
  /** Short title shown in the chip; defaults to the record title */
  label?: string
  active?: boolean
}>()

const emit = defineEmits<{ activate: [] }>()

const trailingIcon = computed(() => {
  const mode = props.record.availability.mode
  return mode === 'inline' ? undefined : availabilityIcons[mode]
})

const text = computed(() => [props.label ?? props.record.title, props.locator.kind === 'whole' ? null : props.locator.label].filter(Boolean).join(' · '))
// Starts with the visible text (WCAG 2.5.3, label in name), then the full citation.
const accessibleName = computed(() =>
  `${text.value}. Citation: ${props.record.title}, ${props.locator.label}. ${availabilityLabel(props.record.availability)}.`)
</script>

<template>
  <button
    type="button"
    :aria-label="accessibleName"
    :aria-pressed="active"
    class="inline-flex items-center gap-[0.3em] rounded-md border px-[0.35em] text-[0.89em] leading-[1.45] align-baseline cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="active
      ? 'border-secondary bg-secondary/20 text-(--ui-color-secondary-200)'
      : 'border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20'"
    @mouseenter="emit('activate')"
    @focus="emit('activate')"
    @click="emit('activate')"
  >
    <UIcon :name="recordTypeIcons[record.type]" class="size-[1em] shrink-0" aria-hidden="true" />
    <span>{{ text }}</span>
    <UIcon
      v-if="trailingIcon"
      :name="trailingIcon"
      class="size-[0.9em] shrink-0"
      aria-hidden="true"
    />
  </button>
</template>
