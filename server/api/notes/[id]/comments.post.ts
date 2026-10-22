import type { Comment } from '#shared/types/note'

// A new comment thread anchored to text in the note.
export default defineEventHandler(async (event) => {
  const note = findOr404(db.notes, getRouterParam(event, 'id'), 'Note')
  const body = await readBody<Pick<Comment, 'anchorText' | 'anchorIndex' | 'body'>>(event)
  if (!body?.anchorText?.trim() || !body.body?.trim())
    throw createError({ statusCode: 400, statusMessage: 'A comment needs anchor text and a body' })
  const me = db.users.find(u => u.isCurrentUser)!
  const comment: Comment = {
    id: newId('cm'),
    noteId: note.id,
    anchorText: body.anchorText,
    anchorIndex: body.anchorIndex ?? 0,
    authorId: me.id,
    createdAt: new Date().toISOString(),
    resolved: false,
    body: body.body.trim(),
    replies: [],
  }
  db.comments.push(comment)
  return comment
})
