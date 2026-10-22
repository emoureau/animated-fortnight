import type { Note } from '../../shared/types/note'
import { Editor } from '@tiptap/core'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { afterAll, describe, expect, it } from 'vitest'
import { noteNodes } from '../../app/editor'
import { findAllTextRanges, findTextRange, occurrenceAt } from '../../app/editor/findText'
import notes from '../../server/data/notes.json'

const editor = new Editor({ extensions: [StarterKit, Markdown, ...noteNodes] })
editor.commands.setContent((notes as Note[]).find(n => n.id === 'n_drivers')!.body, { contentType: 'markdown' })
const doc = editor.state.doc
const textAt = (r: { from: number, to: number } | null) => r && doc.textBetween(r.from, r.to)

afterAll(() => editor.destroy())

describe('findTextRange', () => {
  it('finds the first and later occurrences', () => {
    // "inner edge" twice; the raw Markdown's third "edge" is the snippet id, not text
    expect(findAllTextRanges(doc, 'edge')).toHaveLength(2)
    expect(textAt(findTextRange(doc, 'edge'))).toBe('edge')
    const second = findTextRange(doc, 'edge', 1)!
    expect(second.from).toBeGreaterThan(findTextRange(doc, 'edge')!.from)
    expect(occurrenceAt(doc, 'edge', second.from)).toBe(1)
  })

  it('finds presence anchors from the mock data', () => {
    expect(textAt(findTextRange(doc, 'compare against the 1978 profiles'))).toBe('compare against the 1978 profiles')
  })

  it('does not match across citation chips', () => {
    // "dune line [@cit_01]. The beach" — the chip sits between "line " and "."
    expect(findTextRange(doc, 'dune line . The')).toBeNull()
    expect(findTextRange(doc, 'dune line ')).not.toBeNull()
  })

  it('returns null for missing text', () => {
    expect(findTextRange(doc, 'not in this note')).toBeNull()
    expect(findTextRange(doc, '')).toBeNull()
  })
})
