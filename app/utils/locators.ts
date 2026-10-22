import type { Locator } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

const WHOLE: Locator = { kind: 'whole', label: 'Whole record' }

/** What "Where in it?" starts with for a record (spec 01). */
export function defaultLocatorText(record: CatalogRecord) {
  const a = record.availability
  return a.mode === 'inline' && a.pages ? 'p. 1' : 'Whole record'
}

/**
 * Turn the typed "Where in it?" text into a locator for this record.
 * Returns null when it can't be one: an inline document needs a page or "Whole record".
 */
export function parseLocator(input: string, record: CatalogRecord): Locator | null {
  const text = input.trim()
  if (!text || /^whole(?: record)?$/i.test(text))
    return WHOLE

  const page = /^p(?:age|\.)?\s*(\d+)$/i.exec(text)
  if (page)
    return { kind: 'page', label: `p. ${page[1]}`, page: Number(page[1]) }

  const time = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/.exec(text)
  if (time)
    return { kind: 'timestamp', label: text, startSec: Number(time[1] ?? 0) * 3600 + Number(time[2]) * 60 + Number(time[3]) }

  const a = record.availability
  switch (a.mode) {
    case 'inline':
      return a.frames && /^frames?\b/i.test(text) ? { kind: 'frame', label: text } : null
    case 'external':
      return { kind: 'url-section', label: text }
    case 'physical':
      return { kind: 'box', label: text }
    case 'download': {
      const file = a.manifest?.map(f => f.path).find(path => text.startsWith(path)) ?? text.split(' · ')[0]!
      if (/^layer\b/i.test(text))
        return { kind: 'layer', label: text }
      const rows = /rows?\s+([\d,]+\s*[–-]\s*[\d,]+)/i.exec(text)?.[1]
      return {
        kind: 'file',
        label: text,
        file,
        ...rows && { rows: rows.replace(/[,\s]/g, '').replace('–', '-') },
      }
    }
  }
}

export const WHOLE_RECORD = 'Whole record'

/**
 * The composer's "Where in the record?" for records that can't open here (spec 02):
 * a file from the manifest (or Whole record) plus a typed location.
 * Returns null when a download record has no file chosen yet.
 */
export function composeLocator(record: CatalogRecord, file: string | undefined, location: string): Locator | null {
  const where = location.trim()
  const mode = record.availability.mode
  if (mode === 'download') {
    if (!file)
      return null
    if (file === WHOLE_RECORD)
      return where ? parseLocator(where, record) : WHOLE
    return parseLocator(where ? `${file} · ${where}` : file, record)
  }
  if (!where)
    return WHOLE
  return parseLocator(where, record)
}
