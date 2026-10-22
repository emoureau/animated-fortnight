import type { InjectionKey, Ref } from 'vue'
import type { Citation, Snippet } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'

/** Shared by the note body components so lookups and the active citation aren't prop-drilled. */
export interface NoteContext {
  citationById: Ref<Map<string, Citation>>
  recordById: Ref<Map<string, CatalogRecord>>
  snippetById: Ref<Map<string, Snippet>>
  projectNotes: Ref<Note[]>
  activeCitationId: Ref<string | null>
  activate: (citationId: string) => void
  /** Register a citation created in this session (cite popover) */
  addCitation: (citation: Citation) => void
  comments: ReturnType<typeof useNoteComments>
  /** Right panel tab, so markers and the Comment button can switch to Comments */
  panelTab: Ref<NotePanelTab>
  /** Show a thread in the Comments tab and move focus to it */
  openThread: (commentId: string) => void
}

export type NotePanelTab = 'record' | 'comments' | 'outline'

const key: InjectionKey<NoteContext> = Symbol('note-context')

export function provideNoteContext(context: NoteContext) {
  provide(key, context)
}

export function useNoteContext() {
  const context = inject(key)
  if (!context)
    throw new Error('useNoteContext() needs provideNoteContext() in a parent')
  return context
}
