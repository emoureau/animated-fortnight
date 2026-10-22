export default defineEventHandler((event) => {
  const noteId = getQuery(event).noteId
  return noteId ? db.presence.filter(p => p.noteId === noteId) : db.presence
})
