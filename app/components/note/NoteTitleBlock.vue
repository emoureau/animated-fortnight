<script setup lang="ts">
defineProps<{ title: string, byline: string }>()
</script>

<template>
  <h1 class="text-[32px]/[40px] font-semibold text-highlighted">
    {{ title }}
  </h1>
  <p class="mt-2 text-sm text-muted">
    {{ byline }}
  </p>
</template>
