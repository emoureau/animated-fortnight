import type { Rect } from '#shared/types/citation'

// Stand-in page layouts for inline documents (spec 02: placeholder page images, no PDF engine).
// Each page gets a fixed, page-specific pattern of text lines, so pages look different and
// "selecting text" can map to real 0–1 rects on the page.

export interface PageLine {
  index: number
  /** Where the line's ink is drawn */
  ink: Rect
  /** The band the line occupies; bands tile the text area, so selections join up */
  band: Rect
}

export interface PageLayout {
  title: Rect
  lines: PageLine[]
  figure: Rect | null
}

const LEFT = 0.08
const WIDTH = 0.84
const TOP = 0.12
const STEP = 0.034
const INK = 0.012
const BOTTOM = 0.94

/** Small deterministic PRNG (mulberry32) so a page always looks the same. */
function random(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6D2B79F5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function pageLayout(page: number): PageLayout {
  const rand = random(page * 7919)
  // Every third page (1, 4, 7…) has a figure, as on page 4 in the B1 reference.
  const figure = page % 3 === 1 ? { x: LEFT, y: 0.37, w: WIDTH, h: 0.14 } : null
  const lines: PageLine[] = []
  let paragraphLeft = 3 + Math.floor(rand() * 4)

  for (let y = TOP; y + INK <= BOTTOM; y += STEP) {
    const band = { x: LEFT, y: y - (STEP - INK) / 2, w: WIDTH, h: STEP }
    if (figure && band.y + band.h > figure.y && band.y < figure.y + figure.h)
      continue
    paragraphLeft--
    if (paragraphLeft < 0) {
      // A blank line between paragraphs
      paragraphLeft = 3 + Math.floor(rand() * 4)
      continue
    }
    const width = paragraphLeft === 0 ? 0.35 + rand() * 0.35 : 0.88 + rand() * 0.12
    lines.push({ index: lines.length, ink: { x: LEFT, y, w: WIDTH * width, h: INK }, band })
  }

  return { title: { x: LEFT, y: 0.06, w: 0.45, h: 0.016 }, lines, figure }
}

/** The rect covering lines `from`–`to` (inclusive, any order). */
export function linesRect(layout: PageLayout, from: number, to: number): Rect {
  const [a, b] = from <= to ? [from, to] : [to, from]
  const first = layout.lines[a]!.band
  const last = layout.lines[b]!.band
  return { x: first.x, y: first.y, w: first.w, h: last.y + last.h - first.y }
}

/** The line whose band contains a point on the page, if any. */
export function lineAt(layout: PageLayout, y: number) {
  return layout.lines.find(l => y >= l.band.y && y < l.band.y + l.band.h)
}

/** Round a rect to 3 decimals so stored locators stay readable. */
export function roundRect(rect: Rect): Rect {
  const r = (n: number) => Math.round(n * 1000) / 1000
  return { x: r(rect.x), y: r(rect.y), w: r(rect.w), h: r(rect.h) }
}

/**
 * Number the notes that mark a region on a page, in note order (1, 2, …).
 * The viewer's badges and the note cards use the same numbers.
 */
export function regionNumbers(notes: { id: string, locator: import('#shared/types/citation').Locator }[]) {
  const numbers = new Map<string, number>()
  for (const note of notes) {
    if (note.locator.kind === 'page' && note.locator.region)
      numbers.set(note.id, numbers.size + 1)
  }
  return numbers
}
