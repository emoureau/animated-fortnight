// Every record note in the project (bin counts and the All notes tab).
export default defineEventHandler((event) => {
  const project = findOr404(db.projects, getRouterParam(event, 'id'), 'Project')
  return db.recordNotes.filter(n => n.projectId === project.id)
})
