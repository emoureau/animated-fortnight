import type { Availability } from '../../shared/types/record'
import { describe, expect, it } from 'vitest'
import { availabilityLabel, formatBytes, formatExtension } from '../../app/utils/records'

describe('availabilityLabel', () => {
  it('names every mode with a word', () => {
    const modes: [Availability, string][] = [
      [{ mode: 'inline', format: 'PDF', mimeType: 'application/pdf' }, 'Opens here'],
      [{ mode: 'download', format: 'TIFF', sizeBytes: 50331648, opensIn: 'GIS' }, 'Download · 48 MB'],
      [{ mode: 'external', url: 'https://x.org', domain: 'x.org', linkStatus: 'ok', linkCheckedAt: '2026-10-01' }, 'External site'],
      [{ mode: 'physical', location: 'Records Center' }, 'Physical item'],
    ]
    for (const [availability, label] of modes)
      expect(availabilityLabel(availability)).toBe(label)
  })
})

describe('formatBytes', () => {
  it('uses one decimal under 10', () => {
    expect(formatBytes(2254857830)).toBe('2.1 GB')
    expect(formatBytes(796917760)).toBe('760 MB')
    expect(formatBytes(512)).toBe('512 B')
  })
})

describe('formatExtension', () => {
  it('prefers the extension in parentheses, then an uppercase run', () => {
    expect(formatExtension('Esri shapefile (.zip)')).toBe('ZIP')
    expect(formatExtension('File geodatabase (.gdb.zip)')).toBe('GDB')
    expect(formatExtension('GeoTIFF')).toBe('TIFF')
    expect(formatExtension('WAV audio')).toBe('WAV')
  })
})
