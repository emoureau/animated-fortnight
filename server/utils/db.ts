import type { BinFolder, RecordNote } from '#shared/types/bin'
import type { Citation, Snippet } from '#shared/types/citation'
import type { Comment, Note, Presence } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'
import type { Project, User } from '#shared/types/user'
import citations from '../data/citations.json'
import comments from '../data/comments.json'
import folders from '../data/folders.json'
import notes from '../data/notes.json'
import presence from '../data/presence.json'
import projects from '../data/projects.json'
import recordNotes from '../data/record-notes.json'
import records from '../data/records.json'
import snippets from '../data/snippets.json'
import users from '../data/users.json'

/**
 * The prototype's whole "database": the mock JSON, loaded once into memory.
 * Writes mutate these arrays and are lost when the server restarts.
 */
export const db = structuredClone({
  users: users as User[],
  projects: projects as Project[],
  records: records as CatalogRecord[],
  notes: notes as Note[],
  citations: citations as Citation[],
  snippets: snippets as Snippet[],
  comments: comments as Comment[],
  presence: presence as Presence[],
  folders: folders as BinFolder[],
  recordNotes: recordNotes as RecordNote[],
})

export function findOr404<T extends { id: string }>(items: T[], id: string | undefined, what: string): T {
  const item = items.find(i => i.id === id)
  if (!item)
    throw createError({ statusCode: 404, statusMessage: `${what} not found` })
  return item
}

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
