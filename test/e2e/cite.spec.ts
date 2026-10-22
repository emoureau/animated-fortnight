import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// These tests edit notes other than n_drivers, which note.spec.ts counts chips in.
async function caretAtEnd(page: Page, noteId: string) {
  await page.goto(`/p/p_harlow/notes/${noteId}`)
  const editor = page.locator('.ProseMirror')
  await expect(editor).toBeVisible()
  await editor.click()
  await page.keyboard.press('ControlOrMeta+End')
  return editor
}

test('[[ → download-only record → locator → ↵ inserts a chip and updates References', async ({ page }) => {
  await caretAtEnd(page, 'n_prior')
  await page.keyboard.type(' [[hydrographic')

  const options = page.getByRole('option')
  await expect(options).toHaveCount(1)
  await expect(options.first()).toContainText('Channel margin hydrographic survey')
  await expect(options.first()).toContainText('Download')

  await page.keyboard.press('Tab')
  const locator = page.getByLabel('Where in it?')
  await expect(locator).toBeFocused()
  await expect(locator).toHaveValue('Whole record')
  await locator.fill('line_14.xyz · rows 1,200–1,450')
  await page.keyboard.press('Enter')

  // .last(): the assemble e2e test may already have put a line_14 chip in this note
  const chip = page.getByRole('button', { name: /Citation: Channel margin hydrographic survey, line_14\.xyz/ }).last()
  await expect(chip).toBeVisible()
  await expect(chip).toHaveAttribute('aria-label', /Download/)
  await expect(page.getByRole('listbox')).toBeHidden()

  const refs = page.getByRole('region', { name: 'References' })
  await expect(refs).toContainText('line_14.xyz · rows 1,200–1,450')
  await expect(refs).toContainText('CAT-1987-03318')
})

test('Escape closes the popover and leaves the typed text', async ({ page }) => {
  const editor = await caretAtEnd(page, 'n_prior')
  await page.keyboard.type(' [[nautical')
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect(page.getByText(/matches for “nautical”/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(editor).toContainText('[[nautical')
})

test('⌘↵ opens the highlighted record in a new tab', async ({ page, context }) => {
  await caretAtEnd(page, 'n_prior')
  await page.keyboard.type(' [[hydrographic')
  await expect(page.getByRole('option')).toHaveCount(1)
  const [tab] = await Promise.all([context.waitForEvent('page'), page.keyboard.press('ControlOrMeta+Enter')])
  await expect(tab).toHaveURL(/\/records\/r_margin1987$/)
})

test('an inline document needs a page or the whole record', async ({ page }) => {
  await caretAtEnd(page, 'n_prior')
  await page.keyboard.type(' [[beach profile')
  await page.keyboard.press('Tab')
  const locator = page.getByLabel('Where in it?')
  await expect(locator).toHaveValue('p. 1')
  await locator.fill('somewhere')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Use a page, like p. 12, or “Whole record”.')).toBeVisible()
  await locator.fill('p. 7')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /Citation: Beach profile survey notebook.*p\. 7/ })).toBeVisible()
})

test('Cite record opens the popover', async ({ page }) => {
  await caretAtEnd(page, 'n_prior')
  await page.getByRole('button', { name: /Cite record/ }).click()
  await expect(page.getByRole('listbox', { name: 'Records' })).toBeVisible()
})

test('edits autosave and survive a reload', async ({ page }) => {
  await caretAtEnd(page, 'n_dredginghistory')
  await page.keyboard.type(' Channel deepened in 1985.')
  await expect(page.getByRole('status').filter({ hasText: 'Saving…' })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Saved · just now' })).toBeVisible()
  await page.reload()
  await expect(page.locator('.ProseMirror')).toContainText('Channel deepened in 1985.')
})

test('"Cite in current note" from search opens the popover at the caret', async ({ page }) => {
  const editor = await caretAtEnd(page, 'n_meeting1014')
  await page.keyboard.press('ControlOrMeta+k')
  const search = page.getByRole('dialog', { name: 'Search' })
  await expect(search).toBeVisible()
  await page.keyboard.type('tide gauge')
  await search.getByRole('option', { name: /Harlow Inlet tide gauge, station page/ }).click()
  await search.getByRole('option', { name: /Cite in current note/ }).click()

  await expect(page.getByRole('listbox', { name: 'Records' })).toBeVisible()
  await expect(page.getByRole('option')).toHaveCount(1)
  await expect(page.getByText('A snapshot of the page is saved with the citation in case the link changes.')).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /Citation: Harlow Inlet tide gauge, station page/ })).toBeVisible()
  await expect(editor).not.toContainText('[[CAT-')
})
