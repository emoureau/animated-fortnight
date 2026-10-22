/**
 * Parser for a note body: Markdown plus GRANITE's extensions (docs/domain-model.md).
 * Covers exactly the subset the notes use. The read-only view renders this AST,
 * and the editor (prompt 5) maps it to editor nodes.
 */

export type NoteInline
  = | { type: 'text', text: string }
    | { type: 'citation', citationId: string }
    | { type: 'noteLink', title: string }
    | { type: 'needsSource' }

export type NoteBlock
  = | { type: 'heading', level: 1 | 2 | 3, content: NoteInline[] }
    | { type: 'paragraph', content: NoteInline[] }
    | { type: 'list', items: NoteInline[][] }
    | { type: 'snippet', snippetId: string }

// [@cit_01] | [[Note title]] | {{needs-source}}
const INLINE = /\[@([\w-]+)\]|\[\[([^\]]+)\]\]|\{\{needs-source\}\}/g

// Markdown backslash escapes, e.g. the editor writes "[" in text as "\[".
const unescape = (s: string) => s.replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')

export function parseInline(text: string): NoteInline[] {
  const out: NoteInline[] = []
  let last = 0
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last)
      out.push({ type: 'text', text: unescape(text.slice(last, match.index)) })
    if (match[1])
      out.push({ type: 'citation', citationId: match[1] })
    else if (match[2])
      out.push({ type: 'noteLink', title: match[2] })
    else
      out.push({ type: 'needsSource' })
    last = match.index + match[0].length
  }
  if (last < text.length)
    out.push({ type: 'text', text: unescape(text.slice(last)) })
  return out
}

/** Parse a note body. The leading `# Title` is dropped: the page shows `note.title`. */
export function parseNoteBody(markdown: string): NoteBlock[] {
  const blocks: NoteBlock[] = []
  // Blank lines separate blocks; a block of "- " lines is a list.
  for (const chunk of markdown.split(/\n\s*\n/)) {
    const text = chunk.trim()
    if (!text)
      continue

    const snippet = text.match(/^!\[\[snippet:([\w-]+)\]\]$/)
    const heading = text.match(/^(#{1,3}) (\S.*)$/)
    const lines = text.split('\n')

    if (snippet)
      blocks.push({ type: 'snippet', snippetId: snippet[1]! })
    else if (heading)
      blocks.push({ type: 'heading', level: heading[1]!.length as 1 | 2 | 3, content: parseInline(heading[2]!) })
    else if (lines.every(l => l.startsWith('- ')))
      blocks.push({ type: 'list', items: lines.map(l => parseInline(l.slice(2))) })
    else
      blocks.push({ type: 'paragraph', content: parseInline(lines.join(' ')) })
  }

  if (blocks[0]?.type === 'heading' && blocks[0].level === 1)
    blocks.shift()
  return blocks
}

/** Citation ids in order of first appearance. */
export function citationOrder(blocks: NoteBlock[]): string[] {
  const ids: string[] = []
  const visit = (inlines: NoteInline[]) => inlines.forEach((n) => {
    if (n.type === 'citation' && !ids.includes(n.citationId))
      ids.push(n.citationId)
  })
  for (const block of blocks) {
    if (block.type === 'heading' || block.type === 'paragraph')
      visit(block.content)
    else if (block.type === 'list')
      block.items.forEach(visit)
  }
  return ids
}

/** Plain text of inline content, with note links as their title. */
export function inlineText(inlines: NoteInline[]): string {
  return inlines.map(n => n.type === 'text' ? n.text : n.type === 'noteLink' ? `[[${n.title}]]` : '').join('')
}
