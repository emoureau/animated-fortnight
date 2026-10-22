<script setup lang="ts">
// Bin "All notes" tab.
const route = useRoute('p-projectId-bin-notes')
const projectId = computed(() => route.params.projectId)
const { recordNotes, drafts, allRecords, recordById, snippets } = await useBin(projectId)
useHead({ title: 'All notes · Bin' })
</script>

<template>
  <div class="flex h-full flex-col">
    <BinTabs
      :project-id="projectId"
      current="notes"
      :bin-count="allRecords.length"
      :record-notes="recordNotes"
      :record-by-id="recordById"
      :drafts="drafts"
    />
    <div class="min-h-0 flex-1 overflow-y-auto">
      <BinNotesList
        :project-id="projectId"
        :notes="recordNotes"
        :record-by-id="recordById"
        :snippets="snippets"
        :drafts="drafts"
      />
    </div>
  </div>
</template>
