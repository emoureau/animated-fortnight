import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// Serial: these tests save notes on the shared mock records.
test.describe.configure({ mode: 'serial' })

const BIN = '/p/p_harlow/bin'
const cards = (page: Page) => page.getByRole('region', { name: 'Notes on this record' }).getByRole('article')

test('B1: the field report\'s notes, numbered like their regions', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  await expect(cards(page)).toHaveCount(3)
  const [daniel, priya, maya] = [cards(page).nth(0), cards(page).nth(1), cards(page).nth(2)]
  await expect(daniel).toContainText('1, region')
  await expect(daniel.locator('header .bg-person-3')).toHaveCount(1)
  await expect(daniel).toContainText('Overwash observed across the spit')
  // 2 in the mock data; the assemble e2e test adds one on the shared server
  await expect(daniel.getByRole('button', { name: /^Used in [2-9] drafts$/ })).toBeVisible()
  await expect(priya).toContainText('2, region')
  await expect(priya.locator('header .bg-person-4')).toHaveCount(1)
  await expect(priya).toContainText('Follow-up')
  await expect(maya).toContainText('Whole record')
})

test('a note from a page selection gets the next region number', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  const viewer = page.getByRole('group', { name: /^Page 4 of/ })
  const box = (await viewer.boundingBox())!
  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.72)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.8, { steps: 5 })
  await page.mouse.up()
  await page.getByRole('button', { name: 'Note from selection' }).click()

  const composer = page.getByRole('form', { name: 'New note on this record' })
  await expect(composer).toContainText('Citing p. 4, new selection')
  await composer.getByLabel('Note').fill('Dune line returns south of the breach.')
  await composer.getByRole('button', { name: 'Tag' }).click()
  await page.getByRole('menuitemcheckbox', { name: 'Follow-up' }).click()
  await page.keyboard.press('Escape')
  await composer.getByRole('button', { name: 'Add to draft' }).click()
  await page.keyboard.press('ControlOrMeta+Enter')

  await expect(cards(page)).toHaveCount(4)
  const added = cards(page).nth(3)
  await expect(added).toBeFocused()
  await expect(added).toContainText('3, region')
  await expect(added).toContainText('Follow-up')
  await expect(added).toContainText('In next draft')
  await expect(viewer.getByText(/^3, note by Sam Rivera$/)).toBeAttached()
  await expect(page.getByRole('link', { name: 'Post-storm field report, October nor’easter' }).locator('../..')).toContainText('4 notes')
})

test('B2: a download-only note needs a file and keeps the typed location and snippet', async ({ page }) => {
  await page.goto(`${BIN}/f_dredging/r_margin1987`)
  const composer = page.getByRole('form', { name: 'New note on this record' })
  await composer.getByLabel('Note').fill('Line 14 shows the deepened margin.')
  await composer.getByRole('button', { name: 'Save note' }).click()
  await expect(composer.getByText('Choose a file or “Whole record”.')).toBeVisible()

  await composer.getByRole('combobox').click()
  await page.getByRole('option', { name: 'line_14.xyz' }).click()
  await composer.getByLabel('Location in the record').fill('rows 1,200–1,450')
  await composer.getByRole('button', { name: 'Attach a snippet so readers can see it' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a snippet' })
  await dialog.getByLabel('Caption').fill('Rows 1,200–1,450')
  await dialog.getByPlaceholder('Paste here').fill('1200 41.2101 -70.1102 -6.4')
  await dialog.getByRole('button', { name: 'Add snippet' }).click()
  await expect(composer.getByText('Snippet: Rows 1,200–1,450')).toBeVisible()
  await composer.getByRole('button', { name: 'Save note' }).click()

  const added = cards(page).last()
  await expect(added).toContainText('line_14.xyz · rows 1,200–1,450')
  await expect(added).toContainText('Snippet: Rows 1,200–1,450')
  await expect(page.getByRole('region', { name: /Files inside/ })).toContainText(/line_14\.xyz · cited [3-9]×/)
  await expect(page.getByRole('link', { name: 'Channel margin hydrographic survey' }).locator('../..')).toContainText('3 notes · 3 snippets')
})
