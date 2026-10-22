import { expect, test } from '@playwright/test'

const NOTE = '/p/p_harlow/notes/n_drivers'

test('renders the note, its chips and References from the mock data', async ({ page }) => {
  await page.goto(NOTE)
  await expect(page.getByRole('heading', { level: 1, name: 'Drivers of north-spit retreat, 1962–2019' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Citation:/ })).toHaveCount(6)
  const refs = page.getByRole('region', { name: 'References' }).getByRole('listitem')
  await expect(refs).toHaveCount(6)
  // First-appearance order: cit_05 and cit_06 come before cit_04
  await expect(refs.nth(3)).toContainText('CAT-2019-08812')
  await expect(refs.nth(5)).toContainText('CAT-1991-07750')
  await expect(page.getByText('Needs a source')).toBeVisible()
  await expect(page.getByText('Snippet · screenshot')).toBeVisible()
})

test('hovering a chip shows its record by how it opens', async ({ page }) => {
  await page.goto(NOTE)
  const panel = page.getByRole('tabpanel')

  await page.getByRole('button', { name: /Citation: Beach profile survey notebook/ }).hover()
  await expect(panel.getByText('Page 12 of 64 · cited region')).toBeVisible()

  await page.getByRole('button', { name: /Citation: Shoreline positions/ }).hover()
  await expect(panel.getByText('What’s inside (from the catalog)')).toBeVisible()
  await expect(panel.getByText('Team snippets · 2')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Download' })).toBeVisible()

  await page.getByRole('button', { name: /Citation: Harbor commission minutes/ }).hover()
  await expect(panel.getByText(/Link broken/)).toBeVisible()
  await expect(panel.getByRole('button', { name: 'View snapshot' })).toBeVisible()
})

test('chips drive the panel from the keyboard', async ({ page }) => {
  await page.goto(NOTE)
  const chip = page.getByRole('button', { name: /Citation: Post-storm field report/ })
  await expect(async () => {
    await chip.focus()
    await expect(chip).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 })
  }).toPass()
  await expect(page.getByRole('tabpanel').getByText('Page 4 of 18')).toBeVisible()
})

test('sidebar lists notes, mentions and sources', async ({ page }) => {
  await page.goto(NOTE)
  await expect(page.getByRole('heading', { name: 'Linked mentions' })).toBeVisible()
  await expect(page.getByText('Download only')).toBeVisible()
  await page.getByRole('treeitem', { name: 'Storm event timeline' }).click()
  await expect(page).toHaveURL(/\/notes\/n_timeline$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Storm event timeline' })).toBeVisible()
})
