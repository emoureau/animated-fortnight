<script setup lang="ts">
import type { Rect } from '#shared/types/citation'

// Placeholder page image for inline records (no PDF engine in the prototype).
// Lines come from pageLayout(page), so each page looks different and selections map to rects.
// `regions` are cited regions in the highlighter data color; the default slot takes other overlays.
const props = withDefaults(defineProps<{
  kind?: 'page' | 'image'
  page?: number
  regions?: Rect[]
}>(), { kind: 'page', page: 1, regions: () => [] })

const layout = computed(() => pageLayout(props.page))
const box = (r: Rect) => ({ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` })
</script>

<template>
  <div
    class="relative aspect-[3/4] w-full overflow-hidden"
    :class="kind === 'image' ? 'bg-(--ui-color-neutral-600)' : 'bg-(--ui-color-neutral-200)'"
  >
    <div v-if="kind === 'page'" aria-hidden="true">
      <span class="absolute rounded-full bg-(--ui-color-neutral-600)" :style="box(layout.title)" />
      <span
        v-for="line in layout.lines"
        :key="line.index"
        class="absolute rounded-full bg-(--ui-color-neutral-400)"
        :style="box(line.ink)"
      />
      <span v-if="layout.figure" class="absolute border border-(--ui-color-neutral-400) bg-(--ui-color-neutral-300)" :style="box(layout.figure)" />
    </div>
    <UIcon
      v-else
      name="i-mdi-image-outline"
      class="absolute inset-0 m-auto size-12 text-(--ui-color-neutral-300)"
      aria-hidden="true"
    />
    <span
      v-for="(region, i) in regions"
      :key="i"
      class="absolute border-2 border-highlight-outline bg-highlight/60"
      aria-hidden="true"
      :style="box(region)"
    />
    <slot :box="box" :layout="layout" />
  </div>
</template>
