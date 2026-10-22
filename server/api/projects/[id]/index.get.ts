export default defineEventHandler(event =>
  findOr404(db.projects, getRouterParam(event, 'id'), 'Project'))
