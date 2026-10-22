<script setup lang="ts">
import type { Locator } from '#shared/types/citation'

defineProps<{ locator: Locator }>()
</script>

<template>
  <section v-if="locator.kind !== 'whole'" class="flex flex-col gap-1.5">
    <h3 class="text-xs font-medium text-muted">
      Cited at
    </h3>
    <p class="rounded-md border border-default bg-default px-3 py-2 font-mono text-sm">
      {{ locator.label }}
    </p>
  </section>
</template>
