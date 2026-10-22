import { describe, expect, it } from 'vitest'
import { lineAt, linesRect, pageLayout, regionNumbers } from '../../app/utils/pages'

describe('pageLayout', () => {
  it('is the same every time for a page and differs between pages', () => {
    expect(pageLayout(4)).toEqual(pageLayout(4))
    expect(pageLayout(4).lines.map(l => l.ink.w)).not.toEqual(pageLayout(5).lines.map(l => l.ink.w))
  })

  it('keeps lines inside the page and clear of the figure', () => {
    const layout = pageLayout(4)
    expect(layout.figure).not.toBeNull()
    for (const { ink } of layout.lines) {
      expect(ink.x + ink.w).toBeLessThanOrEqual(0.92 + 1e-9)
      expect(ink.y + ink.h).toBeLessThanOrEqual(0.94 + 1e-9)
      expect(ink.y + ink.h <= layout.figure!.y || ink.y >= layout.figure!.y + layout.figure!.h).toBe(true)
    }
    expect(pageLayout(5).figure).toBeNull()
  })

  it('maps lines to rects and points to lines', () => {
    const layout = pageLayout(2)
    const rect = linesRect(layout, 3, 1)
    expect(rect.y).toBe(layout.lines[1]!.band.y)
    expect(rect.y + rect.h).toBeCloseTo(layout.lines[3]!.band.y + layout.lines[3]!.band.h)
    const line = layout.lines[5]!
    expect(lineAt(layout, line.band.y + line.band.h / 2)?.index).toBe(5)
    expect(lineAt(layout, 0.01)).toBeUndefined()
  })
})

describe('regionNumbers', () => {
  it('numbers only page regions, in note order', () => {
    const numbers = regionNumbers([
      { id: 'a', locator: { kind: 'page', label: 'p. 4', page: 4, region: { x: 0, y: 0, w: 1, h: 0.1 } } },
      { id: 'b', locator: { kind: 'whole', label: 'Whole record' } },
      { id: 'c', locator: { kind: 'page', label: 'p. 4', page: 4, region: { x: 0, y: 0.5, w: 1, h: 0.1 } } },
    ])
    expect([...numbers]).toEqual([['a', 1], ['c', 2]])
  })
})
