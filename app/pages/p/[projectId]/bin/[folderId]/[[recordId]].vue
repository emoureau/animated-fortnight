<script setup lang="ts">
import type { BinFilter } from '~/composables/useBin'

// Concept B, the evidence bin (spec 02). Columns 1–2 now; record view and notes come in prompts 8–9.
const route = useRoute('p-projectId-bin-folderId-recordId')
const toast = useToast()
const projectId = computed(() => route.params.projectId)
const folderId = computed(() => route.params.folderId)

const bin = await useBin(projectId)
const { folders, tree, recordNotes, drafts, allRecords, recordsIn, noteCount, snippetCount, matchesFilter, filterCounts } = bin

const folder = computed(() => folders.value.find(f => f.id === folderId.value))
if (folderId.value !== 'all' && !folder.value)
  throw createError({ statusCode: 404, statusMessage: 'Folder not found' })

const folderTitle = computed(() => folder.value?.name ?? 'All records')
useHead({ title: () => `${folderTitle.value} · Bin` })

const filter = ref<BinFilter | null>(null)
watch(folderId, () => {
  filter.value = null
})

const folderRecords = computed(() => recordsIn(folderId.value))
const shownRecords = computed(() => folderRecords.value.filter(r => matchesFilter(r, filter.value)))
const counts = computed(() => filterCounts(folderRecords.value))

const filterLabels: Record<BinFilter, string> = {
  'inline': 'records that open here',
  'download': 'download-only records',
  'external': 'external sites',
  'physical': 'physical items',
  'no-snippet': 'records with no snippet yet',
}

const selected = computed(() => route.params.recordId ? bin.recordById.value.get(route.params.recordId) : undefined)
const selectedNotes = computed(() => recordNotes.value.filter(n => n.recordId === selected.value?.id))
const selectedSnippets = computed(() => bin.snippets.value.filter(s => s.recordId === selected.value?.id))

// "Note from selection" in the viewer: the composer already shows the locked citation; move focus to it.
async function focusComposer() {
  await nextTick()
  document.getElementById('bin-composer')?.focus()
}
const linkFor = (recordId: string) => `/p/${projectId.value}/bin/${folderId.value}/${recordId}`

async function addToFolder(targetId: string, recordId: string) {
  const target = folders.value.find(f => f.id === targetId)
  if (!target)
    return
  if (target.recordIds.includes(recordId)) {
    toast.add({ title: `Already in ${target.name}`, icon: 'i-mdi-information-outline', color: 'info' })
    return
  }
  await bin.addToFolder(targetId, recordId)
  toast.add({ title: `Added to ${target.name}`, description: bin.recordById.value.get(recordId)?.title, icon: 'i-mdi-check-circle-outline', color: 'success' })
}

async function createFolder(name: string) {
  const created = await bin.createFolder(name)
  toast.add({ title: `Folder “${created.name}” created`, icon: 'i-mdi-check-circle-outline', color: 'success' })
}
</script>

<template>
  <div class="flex h-full flex-col">
    <BinTabs
      :project-id="projectId"
      current="bin"
      :bin-count="allRecords.length"
      :record-notes="recordNotes"
      :record-by-id="bin.recordById.value"
      :drafts="drafts"
    />
    <UDashboardGroup storage-key="granite-bin" unit="px" class="relative inset-auto min-h-0 flex-1">
      <UDashboardSidebar
        id="bin-folders"
        resizable
        :default-size="232"
        :min-size="200"
        :max-size="320"
        class="h-full min-h-0 border-e border-default bg-muted"
        :ui="{ body: 'py-4 px-3' }"
      >
        <BinFolders
          v-model:filter="filter"
          :project-id="projectId"
          :tree="tree"
          :current-folder-id="folderId"
          :all-count="allRecords.length"
          :counts="counts"
          @drop="addToFolder"
          @create="createFolder"
        />
      </UDashboardSidebar>

      <UDashboardPanel
        id="bin-records"
        resizable
        :default-size="312"
        :min-size="260"
        :max-size="440"
        class="h-full min-h-0"
        :ui="{ body: 'p-2 sm:p-2' }"
      >
        <template #body>
          <BinRecordList
            :title="folderTitle"
            :records="shownRecords"
            :selected-id="selected?.id"
            :link-for="linkFor"
            :note-count="noteCount"
            :snippet-count="snippetCount"
            :folders="folders"
            :filter-label="filter ? filterLabels[filter] : undefined"
            class="p-2"
            @add="addToFolder"
            @clear-filter="filter = null"
          />
        </template>
      </UDashboardPanel>

      <UDashboardPanel id="bin-record" class="h-full min-h-0" :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }">
        <template #body>
          <BinRecordView
            v-if="selected"
            :key="selected.id"
            :record="selected"
            :notes="selectedNotes"
            :snippets="selectedSnippets"
            @note-from-selection="focusComposer"
            @snippet-added="bin.refreshSnippets()"
          />
          <p v-else class="p-4 text-sm text-muted">
            Select a record to see it here.
          </p>
        </template>
      </UDashboardPanel>

      <UDashboardPanel
        id="bin-notes"
        resizable
        :default-size="380"
        :min-size="300"
        :max-size="480"
        class="h-full min-h-0 border-s border-default bg-muted"
        :ui="{ body: 'p-4 sm:p-4' }"
      >
        <template #body>
          <BinNotesColumn
            v-if="selected"
            :record="selected"
            :project-id="projectId"
            :notes="selectedNotes"
            :snippets="selectedSnippets"
            :drafts="drafts"
            @saved="bin.addRecordNote"
            @snippet-added="bin.refreshSnippets()"
          />
          <p v-else class="text-sm text-muted">
            Select a record to see its notes.
          </p>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </div>
</template>
