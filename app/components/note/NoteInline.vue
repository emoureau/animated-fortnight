<script setup lang="ts">
import type { NoteInline } from '#shared/utils/note-body'

// Inline content of a note block: text, citation chips, [[note links]] and needs-source markers.
defineProps<{ content: NoteInline[] }>()

const { citationById, recordById, projectNotes, activeCitationId, activate } = useNoteContext()

function chip(citationId: string) {
  const citation = citationById.value.get(citationId)
  const record = citation && recordById.value.get(citation.recordId)
  return citation && record ? { citation, record } : undefined
}

function linkTarget(title: string) {
  return projectNotes.value.find(n => n.title.startsWith(title))
}
</script>

<template>
  <template v-for="(node, i) in content" :key="i">
    <!-- v-text so template whitespace never adds spaces next to chips and punctuation -->
    <span v-if="node.type === 'text'" v-text="node.text" />
    <template v-else-if="node.type === 'citation'">
      <CitationChip
        v-if="chip(node.citationId)"
        :record="chip(node.citationId)!.record"
        :locator="chip(node.citationId)!.citation.locator"
        :label="shortTitle(chip(node.citationId)!.record)"
        :active="activeCitationId === node.citationId"
        @activate="activate(node.citationId)"
      />
    </template>
    <template v-else-if="node.type === 'noteLink'">
      <NuxtLink
        v-if="linkTarget(node.title)"
        :to="`/p/${linkTarget(node.title)!.projectId}/notes/${linkTarget(node.title)!.id}`"
        class="text-primary underline underline-offset-2"
      >
        <span v-text="node.title" />
      </NuxtLink>
      <span v-else class="text-muted" v-text="`[[${node.title}]]`" />
    </template>
    <NoteNeedsSource v-else />
  </template>
</template>
