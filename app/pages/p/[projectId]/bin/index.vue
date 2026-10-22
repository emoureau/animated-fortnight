<script setup lang="ts">
const route = useRoute('p-projectId-bin')
await navigateTo(`/p/${route.params.projectId}/bin/all`, { replace: true })
</script>

<template>
  <div />
</template>
