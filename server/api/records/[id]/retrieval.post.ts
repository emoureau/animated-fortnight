// Request a physical item from storage (in memory). Requested by the current user.
export default defineEventHandler((event) => {
  const record = findOr404(db.records, getRouterParam(event, 'id'), 'Record')
  if (record.availability.mode !== 'physical')
    throw createError({ statusCode: 400, statusMessage: 'Only physical items can be retrieved' })
  const me = db.users.find(u => u.isCurrentUser)!
  record.availability.retrieval ??= { status: 'requested', requestedBy: me.id, requestedAt: new Date().toISOString() }
  return record
})
