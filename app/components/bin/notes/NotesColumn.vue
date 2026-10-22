<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Snippet } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'

// Column 4 (spec 02): the composer, then this record's notes with their locked citations.
const props = defineProps<{
  record: CatalogRecord
  projectId: string
  notes: RecordNote[]
  snippets: Snippet[]
  drafts: Note[]
}>()

const emit = defineEmits<{ saved: [note: RecordNote], snippetAdded: [] }>()

const numbers = computed(() => regionNumbers(props.notes))

async function onSaved(note: RecordNote) {
  emit('saved', note)
  await nextTick()
  document.getElementById(`record-note-${note.id}`)?.focus()
}
</script>

<template>
  <section class="flex flex-col gap-3" aria-labelledby="notes-on-record">
    <div class="flex items-center justify-between">
      <h2 id="notes-on-record" class="text-base font-semibold text-highlighted">
        Notes on this record
      </h2>
      <UBadge
        color="neutral"
        variant="soft"
        :label="String(notes.length)"
        :aria-label="`${notes.length} notes`"
      />
    </div>
    <BinNotesNoteComposer
      :key="record.id"
      :record="record"
      :project-id="projectId"
      :snippets="snippets"
      @saved="onSaved"
      @snippet-added="emit('snippetAdded')"
    />
    <p v-if="!notes.length" class="text-sm text-muted">
      No notes on this record yet.
    </p>
    <BinNotesNoteCard
      v-for="note in notes"
      :key="note.id"
      :note="note"
      :record="record"
      :number="numbers.get(note.id)"
      :snippets="snippets"
      :drafts="drafts"
    />
  </section>
</template>
