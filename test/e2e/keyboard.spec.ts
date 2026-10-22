import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// No keyboard traps (WCAG 2.1.2): Tab keeps moving through each screen, and every popover or
// modal gives focus back when it closes.

/** Press Tab `presses` times; fail if focus stays on one element for 3 presses in a row. */
async function tabThrough(page: Page, presses = 40) {
  const seen = new Set<string>()
  let same = 0
  let last = ''
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab')
    const id = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body)
        return 'body'
      return `${el.tagName}|${el.getAttribute('aria-label') ?? ''}|${(el.textContent ?? '').trim().slice(0, 40)}|${Array.from(el.parentNode?.children ?? []).indexOf(el)}`
    })
    same = id === last ? same + 1 : 0
    expect(same, `focus stuck on ${id}`).toBeLessThan(2)
    last = id
    seen.add(id)
  }
  return seen
}

const BIN = '/p/p_harlow/bin'

// Minimum distinct stops per screen: enough to show Tab gets past the app bar into the content.
for (const [name, path, minStops] of [
  ['project list', '/', 6],
  ['shared note', '/p/p_harlow/notes/n_drivers', 10],
  ['bin with an inline record', `${BIN}/f_storms/r_stormreport1991`, 10],
  ['bin with a download record', `${BIN}/f_dredging/r_margin1987`, 10],
  ['all notes', `${BIN}/notes`, 10],
] as const) {
  test(`Tab moves through the ${name}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const seen = await tabThrough(page)
    expect(seen.size).toBeGreaterThanOrEqual(minStops)
  })
}

test('Tab leaves the note editor and the page viewer', async ({ page }) => {
  await page.goto('/p/p_harlow/notes/n_drivers')
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Tab')
  await expect(editor).not.toBeFocused()

  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  const viewer = page.getByRole('group', { name: /^Page 4 of/ })
  await viewer.focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Tab')
  await expect(viewer).not.toBeFocused()
})

test('Escape closes the cite popover and returns to the editor', async ({ page }) => {
  await page.goto('/p/p_harlow/notes/n_meeting1014')
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type(' [[chart')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Where in it?')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox', { name: 'Records' })).toBeHidden()
  await expect(editor).toBeFocused()
})

test('modals give focus back when closed', async ({ page }) => {
  // Search
  await page.goto(`${BIN}/f_storms`)
  const addFromCatalog = page.getByRole('button', { name: 'Add from catalog' })
  await expect(async () => {
    await addFromCatalog.click()
    await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible({ timeout: 1000 })
  }).toPass()
  await page.keyboard.press('Escape')
  await expect(addFromCatalog).toBeFocused()

  // Snippet form
  await page.goto(`${BIN}/f_dredging/r_margin1987`)
  const paste = page.getByRole('button', { name: 'Paste screenshot or text' })
  await paste.click()
  await expect(page.getByRole('dialog', { name: 'Add a snippet' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(paste).toBeFocused()

  // Assemble
  await page.getByRole('button', { name: 'Assemble notes into draft' }).click()
  await page.getByRole('region', { name: 'Notes on this record' }).getByRole('checkbox').first().check()
  const assemble = page.getByRole('button', { name: 'Assemble into draft…' })
  await assemble.click()
  await expect(page.getByRole('dialog', { name: /^Assemble 1 note/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(assemble).toBeFocused()
})
