import type { Note } from '../../shared/types/note'
import { describe, expect, it } from 'vitest'
import notes from '../../server/data/notes.json'
import { citationOrder, parseInline, parseNoteBody } from '../../shared/utils/note-body'

const body = (id: string) => (notes as Note[]).find(n => n.id === id)!.body

describe('parseInline', () => {
  it('splits text and the three inline extensions', () => {
    expect(parseInline('a [@cit_01] b [[Some note]] c {{needs-source}}')).toEqual([
      { type: 'text', text: 'a ' },
      { type: 'citation', citationId: 'cit_01' },
      { type: 'text', text: ' b ' },
      { type: 'noteLink', title: 'Some note' },
      { type: 'text', text: ' c ' },
      { type: 'needsSource' },
    ])
  })
})

describe('parseNoteBody', () => {
  it('parses the drivers note', () => {
    const blocks = parseNoteBody(body('n_drivers'))
    expect(blocks[0]).toEqual({ type: 'heading', level: 2, content: [{ type: 'text', text: 'Summary' }] })
    expect(blocks.filter(b => b.type === 'heading')).toHaveLength(4)
    expect(blocks).toContainEqual({ type: 'snippet', snippetId: 'snp_inneredge' })
    const last = blocks.at(-1)!
    expect(last.type === 'paragraph' && last.content.at(-1)).toEqual({ type: 'needsSource' })
    expect(citationOrder(blocks)).toEqual(['cit_01', 'cit_02', 'cit_03', 'cit_05', 'cit_06', 'cit_04'])
  })

  it('drops the leading title and keeps note links', () => {
    const blocks = parseNoteBody(body('n_timeline'))
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ type: 'paragraph', content: [{ type: 'text' }, { type: 'noteLink', title: 'Drivers of north-spit retreat' }, { type: 'text' }] })
  })

  it('parses lists', () => {
    const [list] = parseNoteBody(body('n_meeting1014'))
    expect(list).toMatchObject({ type: 'list', items: [[{ type: 'text', text: 'Daniel to extend section 1 of ' }, { type: 'noteLink' }]] })
  })

  it('handles every note without losing text', () => {
    for (const note of notes as Note[])
      expect(() => parseNoteBody(note.body)).not.toThrow()
  })
})

describe('escapes', () => {
  it('unescapes backslash escapes in text', () => {
    expect(parseInline('\\[Section to write\\]')).toEqual([{ type: 'text', text: '[Section to write]' }])
  })
})
