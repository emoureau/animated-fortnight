<script setup lang="ts">
// Bin "Drafts" tab: the project's shared notes.
const route = useRoute('p-projectId-bin-drafts')
const projectId = computed(() => route.params.projectId)
const { recordNotes, drafts, allRecords, recordById } = await useBin(projectId)
useHead({ title: 'Drafts · Bin' })
</script>

<template>
  <div class="flex h-full flex-col">
    <BinTabs
      :project-id="projectId"
      current="drafts"
      :bin-count="allRecords.length"
      :record-notes="recordNotes"
      :record-by-id="recordById"
      :drafts="drafts"
    />
    <div class="min-h-0 flex-1 overflow-y-auto">
      <BinDraftsList :drafts="drafts" />
    </div>
  </div>
</template>
