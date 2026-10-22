export default defineEventHandler((event) => {
  const project = findOr404(db.projects, getRouterParam(event, 'id'), 'Project')
  return db.notes.filter(n => n.projectId === project.id)
})
