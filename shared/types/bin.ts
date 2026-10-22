import type { Locator } from './citation'

export interface RecordNote {
  id: string
  projectId: string
  recordId: string
  /** Locked: the citation is part of the note */
  locator: Locator
  excerpt: string | null
  snippetIds?: string[]
  body: string
  authorId: string
  createdAt: string
  flags: 'follow-up'[]
  /** Concept A notes that include it ("Used in 2 drafts") */
  usedInNoteIds: string[]
}

export interface BinFolder {
  id: string
  projectId: string
  name: string
  parentId: string | null
  /** A record can be in more than one folder */
  recordIds: string[]
}
