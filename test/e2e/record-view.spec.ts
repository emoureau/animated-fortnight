import { expect, test } from '@playwright/test'

// Serial: these tests add a snippet and request a retrieval on the shared mock data.
test.describe.configure({ mode: 'serial' })

const BIN = '/p/p_harlow/bin'

test('B1: the field report opens on page 4 with two numbered regions in their authors\' colors', async ({ page }) => {
  await page.goto(`${BIN}/f_storms`)
  await page.getByRole('link', { name: 'Post-storm field report, October nor’easter' }).click()
  const viewer = page.getByRole('group', { name: /^Page 4 of Post-storm field report/ })
  await expect(viewer).toBeVisible()
  await expect(page.getByText('Page 4 of 18')).toBeVisible()
  await expect(viewer.getByText(/^1, note by Daniel Reyes$/)).toBeAttached()
  await expect(viewer.getByText(/^2, note by Priya Natarajan$/)).toBeAttached()
  await expect(viewer.locator('.border-person-3')).toHaveCount(1)
  await expect(viewer.locator('.border-person-4')).toHaveCount(1)
})

test('page navigation and zoom', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.getByText('Page 5 of 18')).toBeVisible()
  await expect(page.locator('.border-person-3')).toHaveCount(0)
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(page.getByText('125%')).toBeVisible()
})

test('drag a region → Note from selection → the notes column cites it', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  const viewer = page.getByRole('group', { name: /^Page 4 of/ })
  const box = (await viewer.boundingBox())!
  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.72)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.8, { steps: 5 })
  await page.mouse.up()
  await page.getByRole('button', { name: 'Note from selection' }).click()
  const composer = page.locator('#bin-composer')
  await expect(composer).toContainText('Citing p. 4, new selection')
  await expect(composer).toBeFocused()
})

test('select lines by keyboard and start a note', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  const viewer = page.getByRole('group', { name: /^Page 4 of/ })
  await expect(async () => {
    await viewer.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByText('Line 1 selected on page 4')).toBeAttached({ timeout: 1000 })
  }).toPass()
  await page.keyboard.press('Shift+ArrowDown')
  await page.keyboard.press('Shift+ArrowDown')
  await expect(page.getByText('Lines 1–3 selected on page 4')).toBeAttached()
  await page.keyboard.press('Enter')
  await expect(page.locator('#bin-composer')).toContainText('Citing p. 4, new selection')
})

test('B2: the hydrographic survey shows the download state, files and snippets', async ({ page }) => {
  await page.goto(`${BIN}/f_dredging`)
  await page.getByRole('link', { name: 'Channel margin hydrographic survey' }).click()
  await expect(page.getByRole('heading', { name: 'This record can’t be shown in the browser' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Download', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Copy network path' })).toBeVisible()
  const files = page.getByRole('region', { name: /Files inside/ })
  await expect(files.getByRole('listitem')).toHaveCount(4)
  // 2× in the mock data; the [[ e2e test cites line_14.xyz once more on the shared server
  await expect(files).toContainText(/line_14\.xyz · cited [2-9]×/)
  await expect(files).toContainText('+ 10 more files')
  const snippets = page.getByRole('region', { name: 'Team snippets' })
  const snippetLabels = snippets.getByText('Snippet · not part of the catalog record')
  // 2 in the mock data; other e2e tests may have added more on the shared server
  await expect(snippetLabels.first()).toBeVisible()
  const before = await snippetLabels.count()
  expect(before).toBeGreaterThanOrEqual(2)

  await snippets.getByRole('button', { name: 'Paste screenshot or text' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a snippet' })
  await dialog.getByLabel('Caption').fill('Line 08 header')
  await dialog.getByPlaceholder('Paste here').fill('LINE 08  START 14:02  N 41.21')
  await dialog.getByRole('button', { name: 'Add snippet' }).click()
  await expect(snippetLabels).toHaveCount(before + 1)
  await expect(page.getByRole('link', { name: 'Channel margin hydrographic survey' }).locator('..').locator('..')).toContainText(`${before + 1} snippets`)
})

test('a broken external link leads with the snapshot', async ({ page }) => {
  await page.goto(`${BIN}/f_dredging/r_minutes1985`)
  await expect(page.getByText(/Link broken since/)).toBeVisible()
  const buttons = page.locator('section', { has: page.getByText(/Link broken since/) }).getByRole('button')
  await expect(buttons.first()).toHaveText(/View snapshot/)
  await page.getByRole('button', { name: 'View snapshot' }).click()
  await expect(page.getByRole('dialog', { name: /Snapshot · Oct 2/ })).toBeVisible()
})

test('a physical item can be requested', async ({ page }) => {
  await page.request.post('/api/folders/f_unsorted/records', { data: { recordId: 'r_cores' } })
  await page.goto(`${BIN}/f_unsorted/r_cores`)
  await page.getByRole('button', { name: 'Request retrieval' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Retrieval requested by you' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sediment core logs' }).locator('..').locator('..')).toContainText('Retrieval requested')
})
