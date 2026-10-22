import { expect, test } from '@playwright/test'

test('project list and record page render', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible()
  await page.goto('/records/r_minutes1985')
  await expect(page.getByText('Link broken')).toBeVisible()
})

test('a project opens on its notes', async ({ page }) => {
  await page.goto('/p/p_harlow')
  await expect(page).toHaveURL(/\/p\/p_harlow\/notes\/n_drivers$/)
})

test('omnisearch works from the keyboard', async ({ page }) => {
  await page.goto('/p/p_harlow/notes/n_drivers')
  const dialog = page.getByRole('dialog')
  // Retry until the page has hydrated and the shortcut is registered
  await expect(async () => {
    await page.keyboard.press('ControlOrMeta+k')
    await expect(dialog).toBeVisible({ timeout: 1000 })
  }).toPass()
  await page.keyboard.type('nautical')
  await expect(dialog.getByText('CAT-1971-00093')).toBeVisible()
  await page.keyboard.press('Enter') // first result → its actions
  await expect(dialog.getByText('Add to bin')).toBeVisible()
  await page.keyboard.press('Enter') // Open
  await expect(page).toHaveURL(/\/records\/r_chart1971$/)
  await page.keyboard.press('ControlOrMeta+k')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
