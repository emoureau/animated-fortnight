<script setup lang="ts">
import type { Note } from '#shared/types/note'
import { citationOrder, parseNoteBody } from '#shared/utils/note-body'

// Drafts tab: the project's shared notes (Concept A), where assembled notes end up.
const props = defineProps<{ drafts: Note[] }>()

const { byId } = useUsers()

const rows = computed(() => props.drafts.map(note => ({
  note,
  citations: citationOrder(parseNoteBody(note.body)).length,
  editor: byId.value.get(note.updatedBy)?.name,
})))
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
    <h1 class="text-2xl font-semibold text-highlighted">
      Drafts
    </h1>
    <ul class="flex flex-col divide-y divide-default rounded-lg border border-default bg-elevated">
      <li v-for="{ note, citations, editor } in rows" :key="note.id">
        <NuxtLink :to="`/p/${note.projectId}/notes/${note.id}`" class="flex items-center gap-3 px-4 py-3 hover:bg-accented">
          <UIcon name="i-mdi-file-document-outline" class="size-5 shrink-0 text-muted" aria-hidden="true" />
          <span class="flex flex-1 flex-col">
            <span class="font-medium text-highlighted">{{ note.title }}</span>
            <span class="text-xs text-muted">
              Updated {{ formatShortDate(note.updatedAt) }}<template v-if="editor">
                by {{ editor }}
              </template> · {{ citations }} {{ citations === 1 ? 'citation' : 'citations' }}
            </span>
          </span>
          <UIcon name="i-mdi-chevron-right" class="size-5 text-muted" aria-hidden="true" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
