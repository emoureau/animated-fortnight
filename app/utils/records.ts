import type { Availability, AvailabilityMode, RecordType } from '#shared/types/record'

export const availabilityIcons: Record<AvailabilityMode, string> = {
  inline: 'i-mdi-eye-outline',
  download: 'i-mdi-download-outline',
  external: 'i-mdi-open-in-new',
  physical: 'i-mdi-package-variant-closed',
}

const availabilityWords: Record<AvailabilityMode, string> = {
  inline: 'Opens here',
  download: 'Download',
  external: 'External site',
  physical: 'Physical item',
}

/** The "how it opens" word, e.g. "Opens here", "Download · 2.1 GB" (docs/domain-model.md). */
export function availabilityLabel(availability: Availability) {
  const word = availabilityWords[availability.mode]
  return availability.mode === 'download' ? `${word} · ${formatBytes(availability.sizeBytes)}` : word
}

export const recordTypeIcons: Record<RecordType, string> = {
  'document': 'i-mdi-file-document-outline',
  'image': 'i-mdi-image-outline',
  'image-set': 'i-mdi-image-multiple-outline',
  'dataset': 'i-mdi-table-large',
  'map': 'i-mdi-map-outline',
  'drawing': 'i-mdi-ruler-square-compass',
  'audio': 'i-mdi-microphone-outline',
  'video': 'i-mdi-video-outline',
  'web': 'i-mdi-web',
  'physical': 'i-mdi-package-variant-closed',
}

export const recordTypeLabels: Record<RecordType, string> = {
  'document': 'Document',
  'image': 'Image',
  'image-set': 'Image set',
  'dataset': 'Dataset',
  'map': 'Map',
  'drawing': 'Drawing',
  'audio': 'Audio',
  'video': 'Video',
  'web': 'Web page',
  'physical': 'Physical item',
}

/** 1024-based, one decimal under 10: "48 MB", "2.1 GB". */
export function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

/** Short extension for a format tile: "Esri shapefile (.zip)" → "ZIP", "GeoTIFF" → "TIFF". */
export function formatExtension(format: string) {
  const inParens = format.match(/\(\.([a-z0-9]+)/i)
  if (inParens)
    return inParens[1]!.toUpperCase()
  return format.match(/[A-Z]{3,5}/)?.[0] ?? format.slice(0, 4).toUpperCase()
}

/** dataTransfer type for dragging a record between bin folders. */
export const RECORD_DRAG_TYPE = 'application/x-granite-record'
