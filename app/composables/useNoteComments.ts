import type { Comment } from '#shared/types/note'

/** Pending new comment: the selected text and which occurrence of it. */
export interface CommentDraft { anchorText: string, anchorIndex: number }

/**
 * Comment threads for a note: the list, the thread in focus, a draft for a new one,
 * and the actions. Writes go to the in-memory server and update the list from its reply.
 */
export function useNoteComments(noteId: MaybeRefOrGetter<string>, comments: Ref<Comment[]>) {
  const activeCommentId = ref<string | null>(null)
  const draft = ref<CommentDraft | null>(null)

  const open = computed(() => comments.value.filter(c => !c.resolved))
  const resolved = computed(() => comments.value.filter(c => c.resolved))

  function replace(updated: Comment) {
    comments.value = comments.value.map(c => c.id === updated.id ? updated : c)
  }

  async function create(body: string) {
    if (!draft.value)
      return
    const created = await $fetch<Comment>(`/api/notes/${toValue(noteId)}/comments`, {
      method: 'POST',
      body: { ...draft.value, body },
    })
    comments.value = [...comments.value, created]
    draft.value = null
    activeCommentId.value = created.id
  }

  async function reply(id: string, body: string) {
    replace(await $fetch<Comment>(`/api/comments/${id}/replies`, { method: 'POST', body: { body } }))
  }

  async function resolve(id: string) {
    replace(await $fetch<Comment>(`/api/comments/${id}`, { method: 'PATCH', body: { resolved: true } }))
    if (activeCommentId.value === id)
      activeCommentId.value = null
  }

  return { open, resolved, activeCommentId, draft, create, reply, resolve }
}
