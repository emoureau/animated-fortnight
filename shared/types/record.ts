export type RecordType
  = | 'document' | 'image' | 'image-set' | 'dataset' | 'map'
    | 'drawing' | 'audio' | 'video' | 'web' | 'physical'

export interface InlineAvailability {
  mode: 'inline'
  format: string
  mimeType: string
  pages?: number
  frames?: number
  hasOcr?: boolean
  widthPx?: number
  heightPx?: number
}

export interface ManifestFile {
  path: string
  sizeBytes: number
}

export interface DownloadAvailability {
  mode: 'download'
  format: string
  sizeBytes: number
  opensIn: string
  manifest?: ManifestFile[]
  manifestTotalFiles?: number
  durationSec?: number
}

export interface ExternalAvailability {
  mode: 'external'
  url: string
  domain: string
  linkStatus: 'ok' | 'broken'
  linkCheckedAt: string
  brokenSince?: string
  snapshotAt?: string
}

export interface PhysicalAvailability {
  mode: 'physical'
  location: string
  retrieval?: {
    status: 'requested' | 'available' | 'returned'
    requestedBy: string
    requestedAt: string
  }
}

export type Availability
  = | InlineAvailability
    | DownloadAvailability
    | ExternalAvailability
    | PhysicalAvailability

export type AvailabilityMode = Availability['mode']

export interface CatalogRecord {
  id: string
  /** Shown in IBM Plex Mono, e.g. CAT-1987-03318 */
  catalogId: string
  title: string
  date: string
  creator: string
  collection: string
  type: RecordType
  /** Catalog description; often the only text we have */
  description: string
  keywords: string[]
  availability: Availability
}
