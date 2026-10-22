<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { BinFolder } from '#shared/types/bin'
import type { CatalogRecord } from '#shared/types/record'
import type { SearchResults } from '#shared/types/search'

// Omnisearch (spec 00): one query over projects, notes and catalog records.
const { open, mode } = useOmniSearch()
const route = useRoute()
const toast = useToast()
const binVersion = useBinVersion()

defineShortcuts({
  // Works from inside the note editor and other fields too.
  meta_k: {
    usingInput: true,
    handler: () => {
      mode.value = 'search'
      open.value = !open.value
    },
  },
})

const searchTerm = ref('')
watch(open, (isOpen) => {
  if (!isOpen)
    searchTerm.value = ''
})

const { data: results, status } = useFetch<SearchResults>('/api/search', {
  query: { q: searchTerm },
  server: false,
  default: () => ({ projects: [], notes: [], records: [] }),
})

const projectId = computed(() => 'projectId' in route.params ? String(route.params.projectId) : undefined)
const onNotePage = computed(() => 'noteId' in route.params)

const { data: folders } = useFetch<BinFolder[]>(() => `/api/projects/${projectId.value}/folders`, {
  server: false,
  immediate: !!projectId.value,
  watch: [projectId],
  default: () => [],
})

const projectNames = useFetch('/api/projects', { key: 'projects', default: () => [] }).data
const projectName = (id: string) => projectNames.value.find(p => p.id === id)?.name

/** Set by "Cite in current note"; the note editor picks it up. */
const citeRequest = useState<string | null>('cite-request', () => null)
// Handed over only once the modal has fully closed and returned focus, or the cite popover
// would open behind it and be dismissed by that focus change.
let pendingCite: string | null = null

function afterLeave() {
  if (pendingCite) {
    citeRequest.value = pendingCite
    pendingCite = null
  }
}

async function addToBin(record: CatalogRecord, folder: BinFolder) {
  await $fetch(`/api/folders/${folder.id}/records`, { method: 'POST', body: { recordId: record.id } })
  binVersion.value++
  open.value = false
  toast.add({ title: `Added to ${folder.name}`, description: record.title, icon: 'i-mdi-check-circle-outline', color: 'success' })
}

function recordActions(record: CatalogRecord): CommandPaletteItem[] {
  const binItem: CommandPaletteItem = {
    label: 'Add to bin',
    icon: 'i-mdi-tray-arrow-down',
    placeholder: 'Choose a folder…',
    children: folders.value.map(folder => ({
      label: folder.name,
      icon: 'i-mdi-folder-outline',
      suffix: `${folder.recordIds.length}`,
      onSelect: () => addToBin(record, folder),
    })),
  }
  const openItem: CommandPaletteItem = {
    label: 'Open',
    icon: 'i-mdi-arrow-right',
    to: `/records/${record.id}`,
    onSelect: () => { open.value = false },
  }
  const citeItem: CommandPaletteItem = {
    label: 'Cite in current note',
    icon: 'i-mdi-code-brackets',
    onSelect: () => {
      pendingCite = record.id
      open.value = false
    },
  }

  const actions: CommandPaletteItem[] = [openItem]
  if (projectId.value)
    actions.push(binItem)
  if (onNotePage.value)
    actions.push(citeItem)
  // In "add to bin" mode the bin action comes first.
  return mode.value === 'add-to-bin' && projectId.value ? [binItem, openItem] : actions
}

const groups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'projects',
    label: 'Projects',
    ignoreFilter: true,
    items: results.value.projects.map(p => ({
      label: p.name,
      suffix: p.description,
      icon: 'i-mdi-folder-account-outline',
      to: `/p/${p.id}`,
      onSelect: () => { open.value = false },
    })),
  },
  {
    id: 'notes',
    label: 'Notes',
    ignoreFilter: true,
    items: results.value.notes.map(n => ({
      label: n.title,
      suffix: projectName(n.projectId),
      icon: 'i-mdi-note-text-outline',
      to: `/p/${n.projectId}/notes/${n.id}`,
      onSelect: () => { open.value = false },
    })),
  },
  {
    id: 'records',
    label: 'Catalog records',
    slot: 'records',
    ignoreFilter: true,
    items: results.value.records.map(r => ({
      label: r.title,
      icon: recordTypeIcons[r.type],
      record: r,
      placeholder: r.title,
      children: recordActions(r),
    })),
  },
])
</script>

<template>
  <UModal
    v-model:open="open"
    title="Search"
    description="Search projects, notes and the catalog"
    :ui="{ content: 'sm:max-w-2xl', header: 'sr-only' }"
    @after:leave="afterLeave"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        :loading="status === 'pending'"
        placeholder="Search projects, notes and the catalog"
        close
        class="max-h-[min(70vh,560px)]"
        @update:open="open = $event"
      >
        <template #records-description="{ item }">
          <span class="flex flex-wrap items-center gap-x-1.5">
            <span>{{ recordTypeLabels[item.record.type as CatalogRecord['type']] }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ item.record.date }}</span>
            <span aria-hidden="true">·</span>
            <span class="font-mono">{{ item.record.catalogId }}</span>
          </span>
        </template>
        <template #records-trailing="{ item }">
          <RecordAvailabilityBadge :availability="item.record.availability" />
        </template>

        <template #empty="{ searchTerm: term }">
          <p class="py-6 text-center text-sm text-muted">
            {{ term ? `Nothing matches “${term}”.` : 'Type to search projects, notes and catalog records.' }}
          </p>
        </template>

        <template #footer>
          <div class="flex flex-wrap items-center gap-4 text-xs text-muted">
            <span class="flex items-center gap-1"><UKbd value="↑" /><UKbd value="↓" /> Move</span>
            <span class="flex items-center gap-1"><UKbd value="enter" /> Open or show actions</span>
            <span class="flex items-center gap-1"><UKbd value="escape" /> Close</span>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
