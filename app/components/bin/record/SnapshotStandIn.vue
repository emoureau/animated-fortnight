<script setup lang="ts">
// Stand-in for a saved copy of a web page: the mock data has no real snapshots.
defineProps<{ domain: string, label: string }>()
</script>

<template>
  <figure class="overflow-hidden rounded-lg border border-default bg-(--ui-color-neutral-200)">
    <div class="flex items-center gap-2 border-b border-(--ui-color-neutral-300) bg-(--ui-color-neutral-300) px-3 py-1.5" aria-hidden="true">
      <span class="size-2 rounded-full bg-(--ui-color-neutral-500)" />
      <span class="size-2 rounded-full bg-(--ui-color-neutral-500)" />
      <span class="ms-2 flex-1 truncate rounded-sm bg-(--ui-color-neutral-100) px-2 font-mono text-[11px] text-(--ui-color-neutral-700)">{{ domain }}</span>
    </div>
    <div class="flex flex-col gap-2 p-4" aria-hidden="true">
      <span class="h-2.5 w-1/2 rounded-full bg-(--ui-color-neutral-600)" />
      <span
        v-for="w in [92, 88, 95, 60, 0, 90, 84, 72]"
        :key="w"
        class="h-1.5 rounded-full"
        :class="w ? 'bg-(--ui-color-neutral-400)' : ''"
        :style="{ width: `${w}%` }"
      />
    </div>
    <figcaption class="bg-elevated px-3 py-1.5 text-xs text-toned">
      {{ label }}
    </figcaption>
  </figure>
</template>
