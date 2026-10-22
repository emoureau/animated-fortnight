import type { CatalogRecord } from '../../shared/types/record'
import { describe, expect, it } from 'vitest'
import { composeLocator, defaultLocatorText, parseLocator, WHOLE_RECORD } from '../../app/utils/locators'
import records from '../../server/data/records.json'

const record = (id: string) => (records as CatalogRecord[]).find(r => r.id === id)!

describe('parseLocator', () => {
  it('understands whole records, pages and timestamps on any record', () => {
    expect(parseLocator('Whole record', record('r_margin1987'))).toEqual({ kind: 'whole', label: 'Whole record' })
    expect(parseLocator('page 12', record('r_profiles1978'))).toEqual({ kind: 'page', label: 'p. 12', page: 12 })
    expect(parseLocator('00:14:32', record('r_oralhistory'))).toEqual({ kind: 'timestamp', label: '00:14:32', startSec: 872 })
  })

  it('needs a page on an inline document', () => {
    expect(parseLocator('somewhere in the middle', record('r_profiles1978'))).toBeNull()
  })

  it('reads files and rows on download records', () => {
    expect(parseLocator('line_14.xyz · rows 1,200–1,450', record('r_margin1987'))).toEqual({
      kind: 'file',
      label: 'line_14.xyz · rows 1,200–1,450',
      file: 'line_14.xyz',
      rows: '1200-1450',
    })
    expect(parseLocator('layer inner_edge', record('r_shoreline'))).toMatchObject({ kind: 'layer' })
  })

  it('uses url sections and boxes for external and physical records', () => {
    expect(parseLocator('item 7', record('r_minutes1985'))).toEqual({ kind: 'url-section', label: 'item 7' })
    expect(parseLocator('box 14', record('r_logbooks'))).toEqual({ kind: 'box', label: 'box 14' })
  })
})

describe('defaultLocatorText', () => {
  it('starts paged inline records on a page and everything else on the whole record', () => {
    expect(defaultLocatorText(record('r_profiles1978'))).toBe('p. 1')
    expect(defaultLocatorText(record('r_margin1987'))).toBe('Whole record')
  })
})

describe('composeLocator', () => {
  it('needs a file or Whole record on a download record', () => {
    expect(composeLocator(record('r_margin1987'), undefined, 'rows 1–2')).toBeNull()
    expect(composeLocator(record('r_margin1987'), WHOLE_RECORD, '')).toEqual({ kind: 'whole', label: 'Whole record' })
  })

  it('joins the file and the typed location', () => {
    expect(composeLocator(record('r_margin1987'), 'line_14.xyz', 'rows 1,200–1,450')).toEqual({
      kind: 'file',
      label: 'line_14.xyz · rows 1,200–1,450',
      file: 'line_14.xyz',
      rows: '1200-1450',
    })
    expect(composeLocator(record('r_margin1987'), 'survey_notes.txt', '')).toMatchObject({ kind: 'file', file: 'survey_notes.txt', label: 'survey_notes.txt' })
  })

  it('uses the location alone for external and physical records', () => {
    expect(composeLocator(record('r_minutes1985'), undefined, 'item 7')).toEqual({ kind: 'url-section', label: 'item 7' })
    expect(composeLocator(record('r_logbooks'), undefined, 'box 14 · 1991 volume')).toEqual({ kind: 'box', label: 'box 14 · 1991 volume' })
    expect(composeLocator(record('r_logbooks'), WHOLE_RECORD, '')).toEqual({ kind: 'whole', label: 'Whole record' })
  })
})
