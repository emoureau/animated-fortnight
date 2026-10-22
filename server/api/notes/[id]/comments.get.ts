export default defineEventHandler((event) => {
  const note = findOr404(db.notes, getRouterParam(event, 'id'), 'Note')
  return db.comments.filter(c => c.noteId === note.id)
})
