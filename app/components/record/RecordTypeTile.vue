<script setup lang="ts">
import type { CatalogRecord } from '#shared/types/record'

// Thumbnail stand-in: a page preview for inline documents, the file extension for downloads,
// and the record-type icon for everything else.
const props = withDefaults(defineProps<{
  record: CatalogRecord
  size?: 'sm' | 'md'
}>(), { size: 'md' })

const box = computed(() => props.size === 'sm' ? 'size-9' : 'size-13')
const extension = computed(() =>
  props.record.availability.mode === 'download' ? formatExtension(props.record.availability.format) : null)
const isInlinePage = computed(() => props.record.availability.mode === 'inline' && props.record.type === 'document')
</script>

<template>
  <div
    :class="box"
    class="shrink-0 rounded-md overflow-hidden flex items-center justify-center"
    aria-hidden="true"
  >
    <!-- Inline document: a light page with text lines -->
    <div v-if="isInlinePage" class="size-full bg-(--ui-color-neutral-200) p-1.5 flex flex-col gap-1">
      <span class="h-0.5 w-2/3 bg-(--ui-color-neutral-500)" />
      <span class="h-0.5 w-full bg-(--ui-color-neutral-400)" />
      <span class="h-0.5 w-full bg-(--ui-color-neutral-400)" />
      <span class="h-0.5 w-4/5 bg-(--ui-color-neutral-400)" />
    </div>
    <div v-else-if="extension" class="size-full bg-accented flex items-center justify-center">
      <span class="font-mono text-[10px] leading-none font-semibold text-toned">{{ extension }}</span>
    </div>
    <div v-else class="size-full bg-accented flex items-center justify-center">
      <UIcon :name="recordTypeIcons[record.type]" class="size-5 text-toned" />
    </div>
  </div>
</template>
