// All team snippets in a project; the note body embeds them by id (![[snippet:id]]).
export default defineEventHandler((event) => {
  const projectId = getQuery(event).projectId
  return projectId ? db.snippets.filter(s => s.projectId === projectId) : db.snippets
})
