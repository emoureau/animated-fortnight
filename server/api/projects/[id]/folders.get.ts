export default defineEventHandler((event) => {
  const project = findOr404(db.projects, getRouterParam(event, 'id'), 'Project')
  return db.folders.filter(f => f.projectId === project.id)
})
