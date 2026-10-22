import type { Node as PMNode } from '@tiptap/pm/model'

export interface TextRange { from: number, to: number }

/**
 * Every place `text` occurs in the document, in order. Matches stay within one textblock;
 * inline atoms (citation chips and the like) count as one placeholder character, so
 * anchor text never matches across them.
 */
export function findAllTextRanges(doc: PMNode, text: string): TextRange[] {
  const ranges: TextRange[] = []
  if (!text)
    return ranges
  doc.descendants((block, blockPos) => {
    if (!block.isTextblock)
      return true
    let str = ''
    const positions: number[] = []
    block.forEach((child, offset) => {
      const start = blockPos + 1 + offset
      if (child.isText) {
        for (let i = 0; i < child.text!.length; i++)
          positions.push(start + i)
        str += child.text
      }
      else {
        positions.push(start)
        str += '￼'
      }
    })
    for (let i = str.indexOf(text); i !== -1; i = str.indexOf(text, i + 1))
      ranges.push({ from: positions[i]!, to: positions[i + text.length - 1]! + 1 })
    return false
  })
  return ranges
}

/** The nth occurrence of `text`, or null when the note doesn't contain it. */
export function findTextRange(doc: PMNode, text: string, occurrence = 0): TextRange | null {
  return findAllTextRanges(doc, text)[occurrence] ?? null
}

/** Which occurrence of `text` starts at `from` (for anchoring a new comment). */
export function occurrenceAt(doc: PMNode, text: string, from: number) {
  return Math.max(0, findAllTextRanges(doc, text).findIndex(r => r.from === from))
}
