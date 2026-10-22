import type { Locator } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

/**
 * Chip label: first part of the title plus a date, e.g. "Aerial photograph, 1962".
 * A date already at the end of the title wins ("Shoreline positions, 1962–2019").
 */
export function shortTitle(record: CatalogRecord) {
  const parts = record.title.split(',').map(p => p.trim())
  const first = parts[0]!
  const last = parts.at(-1)!
  if (parts.length > 1 && /\d{4}/.test(last))
    return `${first}, ${last}`
  return /\d{4}/.test(first) ? first : `${first}, ${record.date}`
}

/** Pieces of a Chicago author-date entry: "Creator. Date. *Title*, locator. CAT-…" */
export function chicagoReference(record: CatalogRecord, locator: Locator) {
  return {
    creator: record.creator,
    date: record.date,
    title: record.title,
    locator: locator.kind === 'whole' ? null : locator.label,
    catalogId: record.catalogId,
  }
}
