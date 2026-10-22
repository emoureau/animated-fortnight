<script setup lang="ts">
import type { NotePanelTab } from '~/composables/useNoteContext'

// Concept A: the shared note (spec 01). Read-only view; editing arrives in prompt 5.
const route = useRoute('p-projectId-notes-noteId')
const projectId = computed(() => route.params.projectId)
const noteId = computed(() => route.params.noteId)

const view = await useNoteView(projectId, noteId)
const { note, project, blocks, cited } = view

if (!note.value)
  throw createError({ statusCode: 404, statusMessage: 'Note not found' })

useHead({ title: () => note.value?.title ?? 'Note' })

// The hovered or selected citation drives the right panel; start on the first one.
const activeCitationId = ref<string | null>(cited.value[0]?.citation.id ?? null)
watch(noteId, () => {
  activeCitationId.value = cited.value[0]?.citation.id ?? null
})
const active = computed(() => cited.value.find(c => c.citation.id === activeCitationId.value))

const comments = useNoteComments(noteId, view.comments)
const panelTab = ref<NotePanelTab>('record')

async function openThread(commentId: string) {
  comments.activeCommentId.value = commentId
  panelTab.value = 'comments'
  // The tab's content mounts a frame or two after the switch.
  let thread: HTMLElement | null = null
  for (let i = 0; i < 10 && !thread; i++) {
    await new Promise(resolve => requestAnimationFrame(resolve))
    thread = document.getElementById(`thread-${commentId}`)
  }
  thread?.scrollIntoView({ block: 'nearest' })
  thread?.focus()
}

provideNoteContext({
  citationById: view.citationById,
  recordById: view.recordById,
  snippetById: view.snippetById,
  projectNotes: view.projectNotes,
  activeCitationId,
  activate: (id) => { activeCitationId.value = id },
  addCitation: view.addCitation,
  comments,
  panelTab,
  openThread,
})

// The editor reports every edit; the sidebar, References and chips derive from the live body.
// useFetch data is a shallow ref, so replace the note rather than mutating it.
function onBodyChange(body: string) {
  if (note.value)
    note.value = { ...note.value, body }
}
</script>

<template>
  <UDashboardGroup
    v-if="note && project"
    storage-key="granite-note"
    unit="px"
    class="relative inset-auto h-full"
  >
    <UDashboardSidebar
      id="note-sidebar"
      resizable
      :default-size="264"
      :min-size="220"
      :max-size="360"
      class="min-h-0 h-full bg-muted border-e border-default"
      :ui="{ body: 'py-4 px-3' }"
    >
      <NoteSidebar
        :project="project"
        :note="note"
        :project-notes="view.projectNotes.value"
        :linked-mentions="view.linkedMentions.value"
        :source-counts="view.sourceCounts.value"
      />
    </UDashboardSidebar>

    <UDashboardPanel id="note-editor" class="min-h-0 h-full" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0 scroll-pt-16' }">
      <template #body>
        <NoteDocument
          :key="note.id"
          :note="note"
          :project-id="project.id"
          :blocks="blocks"
          :cited="cited"
          @change="onBodyChange"
        />
      </template>
    </UDashboardPanel>

    <UDashboardPanel
      id="note-panel"
      resizable
      :default-size="340"
      :min-size="300"
      :max-size="480"
      class="min-h-0 h-full bg-muted border-s border-default"
      :ui="{ body: 'p-4 sm:p-4' }"
    >
      <template #body>
        <NoteRightPanel
          :active="active"
          :also-cited-in="active ? view.alsoCitedIn(active.record.id) : []"
          :blocks="blocks"
        />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
