<script setup lang="ts">
useHead({
  titleTemplate: title => (title ? `${title} · GRANITE` : 'GRANITE'),
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
