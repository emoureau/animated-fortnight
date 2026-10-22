import type { Note } from '../../shared/types/note'
import { Editor } from '@tiptap/core'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'
import { noteNodes } from '../../app/editor'
import notes from '../../server/data/notes.json'

function roundTrip(markdown: string) {
  const editor = new Editor({ extensions: [StarterKit, Markdown, ...noteNodes] })
  editor.commands.setContent(markdown, { contentType: 'markdown' })
  const json = editor.getJSON()
  const out = editor.getMarkdown()
  editor.destroy()
  return { json, out }
}

// The editor escapes literal brackets ("\\[Section\\]"); same Markdown, so compare unescaped.
const normalize = (s: string) => s.trim().replace(/\n{3,}/g, '\n\n').replace(/\\([[\]])/g, '$1')

describe('note markdown round trip', () => {
  for (const note of notes as Note[]) {
    it(`keeps ${note.id} unchanged`, () => {
      expect(normalize(roundTrip(note.body).out)).toBe(normalize(note.body))
    })
  }

  it('parses the extensions into nodes', () => {
    const { json } = roundTrip((notes as Note[]).find(n => n.id === 'n_drivers')!.body)
    const types = JSON.stringify(json)
    expect(types).toContain('"type":"citation","attrs":{"citationId":"cit_01"}')
    expect(types).toContain('"type":"snippet","attrs":{"snippetId":"snp_inneredge"}')
    expect(types).toContain('"type":"needsSource"')
  })
})
