export interface Note {
  id: string
  projectId: string
  folder: string | null
  title: string
  format: 'markdown-with-citations'
  /** Markdown plus [@cit_id], ![[snippet:id]], [[Note title]] and {{needs-source}} */
  body: string
  citationIds: string[]
  editorIds: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export interface CommentReply {
  authorId: string
  createdAt: string
  body: string
}

export interface Comment {
  id: string
  noteId: string
  anchorText: string
  /** Which occurrence of anchorText in the note (0 = first) */
  anchorIndex?: number
  authorId: string
  createdAt: string
  resolved: boolean
  body: string
  replies: CommentReply[]
}

/** Fake live presence for the demo: a caret after some text, or a selection of some text */
export interface Presence {
  noteId: string
  userId: string
  cursorAfterText?: string
  selectionText?: string
}
