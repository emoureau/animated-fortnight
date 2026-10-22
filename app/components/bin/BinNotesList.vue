<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Snippet } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'

// All notes tab: every record note in the project, grouped by record. Uses the same cards as the
// notes column, so notes from any record can be selected for a draft here.
const props = defineProps<{
  projectId: string
  notes: RecordNote[]
  recordById: Map<string, CatalogRecord>
  snippets: Snippet[]
  drafts: Note[]
}>()

const groups = computed(() => {
  const order = [...new Set(props.notes.map(n => n.recordId))]
  return order.flatMap((recordId) => {
    const record = props.recordById.get(recordId)
    const notes = props.notes.filter(n => n.recordId === recordId)
    return record ? [{ record, notes, numbers: regionNumbers(notes) }] : []
  })
})
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
    <h1 class="text-2xl font-semibold text-highlighted">
      All notes
    </h1>
    <p v-if="!groups.length" class="text-muted">
      No notes on records yet.
    </p>
    <section
      v-for="group in groups"
      :key="group.record.id"
      class="flex flex-col gap-2"
      :aria-label="group.record.title"
    >
      <h2 class="flex items-center gap-3">
        <RecordTypeTile :record="group.record" size="sm" />
        <NuxtLink :to="`/p/${projectId}/bin/all/${group.record.id}`" class="font-semibold text-highlighted hover:underline">
          {{ group.record.title }}
        </NuxtLink>
        <RecordAvailabilityBadge :availability="group.record.availability" />
      </h2>
      <BinNotesNoteCard
        v-for="note in group.notes"
        :key="note.id"
        :note="note"
        :record="group.record"
        :number="group.numbers.get(note.id)"
        :snippets="snippets.filter(s => s.recordId === group.record.id)"
        :drafts="drafts"
      />
    </section>
  </div>
</template>
