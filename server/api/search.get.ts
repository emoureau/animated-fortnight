import type { SearchResults } from '#shared/types/search'

/** Case-insensitive matching over the mock data (spec 00, Omnisearch). */
export default defineEventHandler((event): SearchResults => {
  const q = String(getQuery(event).q ?? '').trim().toLowerCase()
  if (!q)
    return { projects: [], notes: [], records: [] }

  const has = (...fields: string[]) => fields.some(f => f.toLowerCase().includes(q))
  const me = db.users.find(u => u.isCurrentUser)!
  const myProjects = db.projects.filter(p => p.memberIds.includes(me.id))
  const myProjectIds = new Set(myProjects.map(p => p.id))

  return {
    projects: myProjects.filter(p => has(p.name, p.description)),
    notes: db.notes.filter(n => myProjectIds.has(n.projectId) && has(n.title, n.body)),
    records: db.records.filter(r => has(r.title, r.description, r.catalogId, ...r.keywords)),
  }
})
