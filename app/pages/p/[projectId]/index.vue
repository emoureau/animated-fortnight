<script setup lang="ts">
import type { Note } from '#shared/types/note'

// A project opens on its notes (Concept A); the first note stands in for "last opened".
const route = useRoute('p-projectId')
const notes = await $fetch<Note[]>(`/api/projects/${route.params.projectId}/notes`)
await navigateTo(
  notes[0] ? `/p/${route.params.projectId}/notes/${notes[0].id}` : `/p/${route.params.projectId}/bin`,
  { replace: true },
)
</script>

<template>
  <div />
</template>
