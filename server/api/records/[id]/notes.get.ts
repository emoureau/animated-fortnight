export default defineEventHandler((event) => {
  const record = findOr404(db.records, getRouterParam(event, 'id'), 'Record')
  return db.recordNotes.filter(n => n.recordId === record.id)
})
