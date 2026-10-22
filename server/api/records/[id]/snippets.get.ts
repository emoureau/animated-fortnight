export default defineEventHandler((event) => {
  const record = findOr404(db.records, getRouterParam(event, 'id'), 'Record')
  return db.snippets.filter(s => s.recordId === record.id)
})
