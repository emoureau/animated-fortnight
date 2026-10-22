import { expect, test } from '@playwright/test'

// Serial: these tests add records to the shared mock folders.
test.describe.configure({ mode: 'serial' })

const BIN = '/p/p_harlow/bin'
const folderNav = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Bin folders' })
const records = (page: import('@playwright/test').Page) => page.getByRole('region', { name: /^Records in / }).getByRole('listitem')

test('the bin opens on All records', async ({ page }) => {
  await page.goto(BIN)
  await expect(page).toHaveURL(/\/bin\/all$/)
  await expect(page.getByRole('heading', { name: 'All records' })).toBeVisible()
  await expect(records(page)).toHaveCount(21)
})

test('Storm events lists its records with how they open', async ({ page }) => {
  await page.goto(BIN)
  await folderNav(page).getByRole('link', { name: /Storm events/ }).click()
  await expect(page).toHaveURL(/\/bin\/f_storms$/)
  await expect(records(page)).toHaveCount(5)
  const report = records(page).filter({ hasText: 'Post-storm field report' })
  await expect(report).toContainText('Opens here')
  await expect(report).toContainText('3 notes')

  await report.getByRole('link').click()
  await expect(page).toHaveURL(/\/bin\/f_storms\/r_stormreport1991$/)
  await expect(report.getByRole('link')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByRole('heading', { level: 2, name: /Post-storm field report/ })).toBeVisible()
})

test('How records open filters the list and adds up to the folder', async ({ page }) => {
  await page.goto(`${BIN}/f_dredging`)
  const filters = page.getByRole('group', { name: 'How records open' })
  const count = async (name: string) => Number(await filters.getByRole('button', { name: new RegExp(`^${name}`) }).locator('span').last().textContent())
  const total = await records(page).count()
  expect(await count('Opens here') + await count('Download only') + await count('External site') + await count('Physical item')).toBe(total)

  const download = filters.getByRole('button', { name: /^Download only/ })
  await download.click()
  await expect(download).toHaveAttribute('aria-pressed', 'true')
  await expect(records(page)).toHaveCount(await count('Download only'))
  for (const row of await records(page).all())
    await expect(row).toContainText('Download')
  await download.click()
  await expect(records(page)).toHaveCount(total)
})

test('⋯ → Add to folder adds the record there', async ({ page }) => {
  await page.goto(`${BIN}/f_storms`)
  const unsorted = folderNav(page).getByRole('link', { name: /Unsorted/ })
  await expect(unsorted).toContainText('3')
  await page.getByRole('button', { name: 'More for Oral history: harbor pilot interview' }).click()
  await page.getByRole('menuitem', { name: 'Add to folder' }).click()
  await page.getByRole('menuitem', { name: 'Unsorted' }).click()
  await expect(page.getByText('Added to Unsorted')).toBeVisible()
  await expect(unsorted).toContainText('4')
})

test('dragging a record onto a folder adds it', async ({ page }) => {
  await page.goto(`${BIN}/f_storms`)
  const target = folderNav(page).getByRole('link', { name: /Dredging and permits/ })
  await expect(target).toContainText('5')
  await records(page).filter({ hasText: 'Emergency dune repair work order' }).dragTo(target)
  await expect(page.getByText('Added to Dredging and permits')).toBeVisible()
  await expect(target).toContainText('6')
})

test('New folder from the keyboard', async ({ page }) => {
  await page.goto(`${BIN}/all`)
  await page.getByRole('button', { name: 'New folder' }).click()
  const name = page.getByLabel('New folder name')
  await expect(name).toBeFocused()
  await name.fill('Sediment budget')
  await page.keyboard.press('Enter')
  await expect(folderNav(page).getByRole('link', { name: /Sediment budget/ })).toBeVisible()
})

test('Add from catalog opens search', async ({ page }) => {
  await page.goto(`${BIN}/f_storms`)
  await expect(async () => {
    await page.getByRole('button', { name: 'Add from catalog' }).click()
    await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible({ timeout: 1000 })
  }).toPass()
})

test('All notes and Drafts tabs', async ({ page }) => {
  await page.goto(`${BIN}/notes`)
  await expect(page.getByRole('heading', { level: 1, name: 'All notes' })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(7)
  await page.getByRole('link', { name: /^Drafts/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Drafts' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Drivers of north-spit retreat/ })).toBeVisible()
})
