import type { Citation } from '#shared/types/citation'

export default defineEventHandler(async (event) => {
  const body = await readBody<Omit<Citation, 'id' | 'createdBy'>>(event)
  findOr404(db.records, body?.recordId, 'Record')
  if (!body.locator?.label?.trim())
    throw createError({ statusCode: 400, statusMessage: 'A citation needs a locator' })
  const me = db.users.find(u => u.isCurrentUser)!
  const citation: Citation = { ...body, id: newId('cit'), createdBy: me.id }
  db.citations.push(citation)
  return citation
})
