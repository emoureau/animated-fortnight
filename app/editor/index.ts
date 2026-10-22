import { Citation } from './citation'
import { NeedsSource } from './needsSource'
import { NoteLink } from './noteLink'
import { SnippetBlock } from './snippet'

/** The note body's Markdown extensions as TipTap nodes (docs/domain-model.md). */
export const noteNodes = [Citation, NoteLink, NeedsSource, SnippetBlock]
