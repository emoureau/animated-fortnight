// Resolve or reopen a thread.
export default defineEventHandler(async (event) => {
  const comment = findOr404(db.comments, getRouterParam(event, 'id'), 'Comment')
  const { resolved } = await readBody<{ resolved: boolean }>(event)
  comment.resolved = !!resolved
  return comment
})
