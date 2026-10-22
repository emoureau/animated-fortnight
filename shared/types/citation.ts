/** Fractions of the page, 0–1 */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export type Locator
  = | { kind: 'whole', label: string }
    | { kind: 'page', label: string, page: number, region?: Rect }
    | { kind: 'frame', label: string }
    | { kind: 'file', label: string, file: string, rows?: string }
    | { kind: 'layer', label: string, file?: string }
    | { kind: 'timestamp', label: string, startSec: number }
    | { kind: 'url-section', label: string }
    | { kind: 'box', label: string }

export interface Citation {
  id: string
  recordId: string
  locator: Locator
  /** Team-made stand-ins for unviewable records */
  snippetIds?: string[]
  /** External records: the saved copy this citation points at */
  snapshotAt?: string
  /** Physical items: false until someone has seen the box */
  verified?: boolean
  createdBy: string
}

export interface Snippet {
  id: string
  projectId: string
  recordId: string
  kind: 'image' | 'text'
  caption: string
  sourceFile?: string
  imagePath?: string
  text?: string
  createdBy: string
  createdAt: string
}
