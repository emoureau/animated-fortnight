<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'

// Project tabs under the app bar (B1/B2): Bin, All notes, Drafts, and Assemble notes into draft.
const props = defineProps<{
  projectId: string
  current: 'bin' | 'notes' | 'drafts'
  binCount: number
  recordNotes: RecordNote[]
  recordById: Map<string, CatalogRecord>
  drafts: Note[]
}>()

const { selected, selecting } = useAssembly()
const assembling = ref(false)

const tabs = computed(() => [
  { id: 'bin', label: 'Bin', count: props.binCount, to: `/p/${props.projectId}/bin/all` },
  { id: 'notes', label: 'All notes', count: props.recordNotes.length, to: `/p/${props.projectId}/bin/notes` },
  { id: 'drafts', label: 'Drafts', count: props.drafts.length, to: `/p/${props.projectId}/bin/drafts` },
] as const)

const recordNoteById = computed(() => new Map(props.recordNotes.map(n => [n.id, n])))
const count = computed(() => selected.value.filter(id => recordNoteById.value.has(id)).length)

// Escape leaves selection mode. A plain listener, not defineShortcuts: that calls preventDefault on
// every Escape, and Reka's dialogs then ignore it, so modals on bin pages couldn't be closed with Escape.
function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && selecting.value && !document.querySelector('[role="dialog"]'))
    selecting.value = false
}
onMounted(() => document.addEventListener('keydown', onEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', onEscape))
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 border-b border-default bg-default px-4">
    <nav aria-label="Bin views" class="flex gap-1">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.id"
        :to="tab.to"
        :aria-current="current === tab.id ? 'page' : undefined"
        class="-mb-px flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm"
        :class="current === tab.id ? 'border-primary font-semibold text-highlighted' : 'border-transparent text-toned hover:text-highlighted'"
      >
        {{ tab.label }}
        <span class="tabular-nums" :class="current === tab.id ? 'text-toned' : 'text-muted'">{{ tab.count }}</span>
      </NuxtLink>
    </nav>

    <div class="ms-auto flex items-center gap-2 py-2">
      <template v-if="selecting">
        <span class="text-sm text-toned" aria-live="polite">
          {{ count }} {{ count === 1 ? 'note' : 'notes' }} selected
        </span>
        <UButton
          icon="i-mdi-format-list-text"
          label="Assemble into draft…"
          :disabled="!count"
          @click="assembling = true"
        />
        <UButton
          color="neutral"
          variant="ghost"
          label="Cancel"
          @click="selecting = false"
        />
      </template>
      <UButton
        v-else
        color="neutral"
        variant="outline"
        icon="i-mdi-format-list-text"
        label="Assemble notes into draft"
        @click="selecting = true"
      />
    </div>

    <BinAssembleModal
      v-model:open="assembling"
      :project-id="projectId"
      :record-note-by-id="recordNoteById"
      :record-by-id="recordById"
      :drafts="drafts"
    />
  </div>
</template>
