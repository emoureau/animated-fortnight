<script setup lang="ts">
export type SaveStatus = 'saved' | 'saving' | 'error'

defineProps<{ status: SaveStatus }>()
</script>

<template>
  <p class="flex items-center gap-1.5 text-sm text-muted" role="status">
    <template v-if="status === 'saving'">
      <UIcon name="i-mdi-loading" class="size-4 animate-spin" aria-hidden="true" />
      Saving…
    </template>
    <template v-else-if="status === 'error'">
      <UIcon name="i-mdi-alert-circle-outline" class="size-4 text-error" aria-hidden="true" />
      <span class="text-error">Not saved · retrying when you type</span>
    </template>
    <template v-else>
      <UIcon name="i-mdi-check" class="size-4 text-success" aria-hidden="true" />
      Saved · just now
    </template>
  </p>
</template>
