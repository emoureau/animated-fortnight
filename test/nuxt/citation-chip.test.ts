import type { CatalogRecord } from '../../shared/types/record'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CitationChip from '../../app/components/citation/CitationChip.vue'

const base: Omit<CatalogRecord, 'availability'> = { id: 'r', catalogId: 'CAT-1', title: 'Survey', date: '1987', creator: 'c', collection: 'c', type: 'dataset', description: '', keywords: [] }

describe('citationChip', () => {
  it('shows the locator and a download icon for download-only records', async () => {
    const record: CatalogRecord = { ...base, availability: { mode: 'download', format: 'XYZ (.zip)', sizeBytes: 1, opensIn: 'GIS' } }
    const chip = await mountSuspended(CitationChip, { props: { record, locator: { kind: 'file', label: 'line_14.xyz', file: 'line_14.xyz' } } })
    expect(chip.text()).toContain('Survey · line_14.xyz')
    expect(chip.html()).toContain('download-outline')
    expect(chip.attributes('aria-label')).toContain('Download')
  })

  it('has no trailing icon when the record opens here', async () => {
    const record: CatalogRecord = { ...base, type: 'document', availability: { mode: 'inline', format: 'PDF', mimeType: 'application/pdf' } }
    const chip = await mountSuspended(CitationChip, { props: { record, locator: { kind: 'page', label: 'p. 4', page: 4 } } })
    expect(chip.html()).not.toContain('download-outline')
    expect(chip.html()).not.toContain('open-in-new')
  })
})
