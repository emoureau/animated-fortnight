<script setup lang="ts">
// Lets customers move between the two concepts for the same project (spec 00).
const props = defineProps<{
  projectId: string
  current: 'notes' | 'bin'
}>()

const links = computed(() => [
  { id: 'notes', label: 'Notes', icon: 'i-mdi-note-text-outline', to: `/p/${props.projectId}` },
  { id: 'bin', label: 'Bin', icon: 'i-mdi-tray-full', to: `/p/${props.projectId}/bin` },
])
</script>

<template>
  <nav aria-label="Concept">
    <UFieldGroup size="sm">
      <UButton
        v-for="link in links"
        :key="link.id"
        :to="link.to"
        :icon="link.icon"
        :label="link.label"
        color="neutral"
        :variant="current === link.id ? 'subtle' : 'ghost'"
        :aria-current="current === link.id ? 'page' : undefined"
      />
    </UFieldGroup>
  </nav>
</template>
