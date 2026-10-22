import type { Note } from './note'
import type { CatalogRecord } from './record'
import type { Project } from './user'

export interface SearchResults {
  projects: Project[]
  notes: Note[]
  records: CatalogRecord[]
}
