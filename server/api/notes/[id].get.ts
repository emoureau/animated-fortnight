export default defineEventHandler(event =>
  findOr404(db.notes, getRouterParam(event, 'id'), 'Note'))
