import type { CatalogRecord } from '../../shared/types/record'
import { describe, expect, it } from 'vitest'
import { chicagoReference, shortTitle } from '../../app/utils/citations'
import records from '../../server/data/records.json'

const record = (id: string) => (records as CatalogRecord[]).find(r => r.id === id)!

describe('shortTitle', () => {
  it('matches the chip labels in the references', () => {
    expect(shortTitle(record('r_aerial1962'))).toBe('Aerial photograph, 1962')
    expect(shortTitle(record('r_shoreline'))).toBe('Shoreline positions, 1962–2019')
    expect(shortTitle(record('r_minutes1985'))).toBe('Harbor commission minutes, March 1985')
    expect(shortTitle(record('r_stormreport1991'))).toBe('Post-storm field report, 1991')
  })
})

describe('chicagoReference', () => {
  it('drops the locator for whole-record citations', () => {
    expect(chicagoReference(record('r_aerial1962'), { kind: 'whole', label: 'Whole record' }).locator).toBeNull()
    expect(chicagoReference(record('r_profiles1978'), { kind: 'page', label: 'p. 12', page: 12 })).toMatchObject({
      creator: 'Shore Survey Division',
      date: '1978',
      locator: 'p. 12',
      catalogId: 'CAT-1978-02231',
    })
  })
})
