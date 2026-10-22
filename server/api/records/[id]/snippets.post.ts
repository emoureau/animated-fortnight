import type { Snippet } from '#shared/types/citation'

// No real upload: the prototype stores the caption, text and an optional image path in memory.
export default defineEventHandler(async (event) => {
  const record = findOr404(db.records, getRouterParam(event, 'id'), 'Record')
  const body = await readBody<Pick<Snippet, 'projectId' | 'kind' | 'caption' | 'sourceFile' | 'imagePath' | 'text'>>(event)
  if (!body?.caption?.trim())
    throw createError({ statusCode: 400, statusMessage: 'A snippet needs a caption' })
  const me = db.users.find(u => u.isCurrentUser)!
  const snippet: Snippet = {
    ...body,
    id: newId('snp'),
    recordId: record.id,
    createdBy: me.id,
    createdAt: new Date().toISOString(),
  }
  db.snippets.push(snippet)
  return snippet
})
