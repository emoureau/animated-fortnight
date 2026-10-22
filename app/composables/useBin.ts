import type { BinFolder, RecordNote } from '#shared/types/bin'
import type { Snippet } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { AvailabilityMode, CatalogRecord } from '#shared/types/record'

export type BinFilter = AvailabilityMode | 'no-snippet'

export interface BinFolderNode { folder: BinFolder, children: BinFolder[] }

/** Bumped when something outside the bin (omnisearch "Add to bin") changes folders. */
export function useBinVersion() {
  return useState('bin-version', () => 0)
}

/** Everything the evidence bin reads (spec 02), with derived lists and counts. */
export async function useBin(projectId: MaybeRefOrGetter<string>) {
  // Composables first: Nuxt's context isn't restored after an await in a plain composable.
  const binVersion = useBinVersion()

  const [
    { data: folders, refresh: refreshFolders },
    { data: records },
    { data: recordNotes },
    { data: snippets, refresh: refreshSnippets },
    { data: drafts },
  ] = await Promise.all([
    useFetch<BinFolder[]>(() => `/api/projects/${toValue(projectId)}/folders`, { default: () => [] }),
    useFetch<CatalogRecord[]>('/api/records', { key: 'records', default: () => [] }),
    useFetch<RecordNote[]>(() => `/api/projects/${toValue(projectId)}/record-notes`, { default: () => [] }),
    useFetch<Snippet[]>('/api/snippets', { query: { projectId }, default: () => [] }),
    useFetch<Note[]>(() => `/api/projects/${toValue(projectId)}/notes`, { default: () => [] }),
  ])

  watch(binVersion, () => refreshFolders())

  const recordById = computed(() => new Map(records.value.map(r => [r.id, r])))

  const tree = computed<BinFolderNode[]>(() => folders.value
    .filter(f => !f.parentId)
    .map(folder => ({ folder, children: folders.value.filter(f => f.parentId === folder.id) })))

  /** Records in a folder, or in the whole bin for `all`, in folder order without repeats. */
  function recordsIn(folderId: string): CatalogRecord[] {
    const ids = folderId === 'all'
      ? [...new Set(folders.value.flatMap(f => f.recordIds))]
      : folders.value.find(f => f.id === folderId)?.recordIds ?? []
    return ids.flatMap(id => recordById.value.get(id) ?? [])
  }

  const allRecords = computed(() => recordsIn('all'))

  const noteCount = computed(() => countBy(recordNotes.value.map(n => n.recordId)))
  const snippetCount = computed(() => countBy(snippets.value.map(s => s.recordId)))

  /** Can't be seen here and nobody has made a snippet of it yet. */
  function needsSnippet(record: CatalogRecord) {
    return record.availability.mode !== 'inline' && !snippetCount.value.get(record.id)
  }

  function matchesFilter(record: CatalogRecord, filter: BinFilter | null) {
    if (!filter)
      return true
    return filter === 'no-snippet' ? needsSnippet(record) : record.availability.mode === filter
  }

  function filterCounts(list: CatalogRecord[]): Record<BinFilter, number> {
    return {
      'inline': list.filter(r => r.availability.mode === 'inline').length,
      'download': list.filter(r => r.availability.mode === 'download').length,
      'external': list.filter(r => r.availability.mode === 'external').length,
      'physical': list.filter(r => r.availability.mode === 'physical').length,
      'no-snippet': list.filter(needsSnippet).length,
    }
  }

  function replaceFolder(updated: BinFolder) {
    folders.value = folders.value.some(f => f.id === updated.id)
      ? folders.value.map(f => f.id === updated.id ? updated : f)
      : [...folders.value, updated]
  }

  async function addToFolder(folderId: string, recordId: string) {
    replaceFolder(await $fetch<BinFolder>(`/api/folders/${folderId}/records`, { method: 'POST', body: { recordId } }))
  }

  function addRecordNote(note: RecordNote) {
    recordNotes.value = [...recordNotes.value, note]
  }

  async function createFolder(name: string) {
    const folder = await $fetch<BinFolder>(`/api/projects/${toValue(projectId)}/folders`, { method: 'POST', body: { name } })
    replaceFolder(folder)
    return folder
  }

  return {
    folders,
    tree,
    recordNotes,
    snippets,
    drafts,
    recordById,
    allRecords,
    recordsIn,
    noteCount,
    snippetCount,
    needsSnippet,
    matchesFilter,
    filterCounts,
    addToFolder,
    createFolder,
    refreshSnippets,
    addRecordNote,
  }
}

function countBy(ids: string[]) {
  const counts = new Map<string, number>()
  for (const id of ids)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  return counts
}
