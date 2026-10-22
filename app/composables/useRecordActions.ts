import type { CatalogRecord } from '#shared/types/record'

/** Record changes that every view of the record should see (bin list, record view, Concept A panel). */
export function useRecordActions() {
  const { data: records } = useNuxtData<CatalogRecord[]>('records')

  async function requestRetrieval(recordId: string) {
    const updated = await $fetch<CatalogRecord>(`/api/records/${recordId}/retrieval`, { method: 'POST' })
    if (records.value)
      records.value = records.value.map(r => r.id === updated.id ? updated : r)
    return updated
  }

  return { requestRetrieval }
}
