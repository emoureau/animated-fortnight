import type { CommentReply } from '#shared/types/note'

export default defineEventHandler(async (event) => {
  const comment = findOr404(db.comments, getRouterParam(event, 'id'), 'Comment')
  const { body } = await readBody<{ body: string }>(event)
  if (!body?.trim())
    throw createError({ statusCode: 400, statusMessage: 'A reply needs a body' })
  const me = db.users.find(u => u.isCurrentUser)!
  const reply: CommentReply = { authorId: me.id, createdAt: new Date().toISOString(), body: body.trim() }
  comment.replies.push(reply)
  return comment
})
