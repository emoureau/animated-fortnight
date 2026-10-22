export default defineEventHandler(event =>
  findOr404(db.records, getRouterParam(event, 'id'), 'Record'))
