import type { Note } from '#shared/types/note'

export default defineEventHandler(async (event) => {
  const note = findOr404(db.notes, getRouterParam(event, 'id'), 'Note')
  const body = await readBody<Partial<Pick<Note, 'title' | 'body' | 'citationIds' | 'tags'>>>(event)
  const me = db.users.find(u => u.isCurrentUser)!
  Object.assign(note, body, { updatedAt: new Date().toISOString(), updatedBy: me.id })
  return note
})
