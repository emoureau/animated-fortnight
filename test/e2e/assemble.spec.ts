import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// Serial: these tests create and change shared notes.
test.describe.configure({ mode: 'serial' })

const BIN = '/p/p_harlow/bin'
const cards = (page: Page) => page.getByRole('region', { name: 'Notes on this record' }).getByRole('article')

test('assemble two notes into a new draft that opens with working chips', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  await page.getByRole('button', { name: 'Assemble notes into draft' }).click()
  await cards(page).nth(0).getByRole('checkbox').check()
  await cards(page).nth(1).getByRole('checkbox').check()
  await expect(page.getByText('2 notes selected')).toBeVisible()
  await page.getByRole('button', { name: 'Assemble into draft…' }).click()

  const dialog = page.getByRole('dialog', { name: 'Assemble 2 notes' })
  await dialog.getByLabel('Title').fill('Storm evidence')
  await dialog.getByRole('button', { name: 'Assemble and open' }).click()

  await expect(page).toHaveURL(/\/p\/p_harlow\/notes\/n_[a-z0-9]+$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Storm evidence' })).toBeVisible()
  const editor = page.locator('.ProseMirror')
  await expect(editor).toContainText('First direct record of a breach at the narrow section.')
  const chips = page.getByRole('button', { name: /Citation: Post-storm field report/ })
  await expect(chips).toHaveCount(2)
  await expect(chips.first()).toContainText('Post-storm field report, 1991 · p. 4')
  await chips.first().hover()
  await expect(page.getByRole('tabpanel').getByText('Page 4 of 18 · cited region')).toBeVisible()
  await expect(page.getByRole('region', { name: 'References' }).getByRole('listitem')).toHaveCount(2)
})

test('the notes now say where they were used', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  await expect(cards(page).nth(0).getByRole('button', { name: 'Used in 3 drafts' })).toBeVisible()
  await expect(cards(page).nth(1).getByRole('button', { name: 'Used in 1 draft' })).toBeVisible()
})

test('a download note added to an existing note, from All notes', async ({ page }) => {
  await page.goto(`${BIN}/notes`)
  await page.getByRole('button', { name: 'Assemble notes into draft' }).click()
  await page.getByRole('checkbox', { name: /Select note by Daniel Reyes on line_14\.xyz/ }).check()
  await page.getByRole('button', { name: 'Assemble into draft…' }).click()
  const dialog = page.getByRole('dialog', { name: 'Assemble 1 note' })
  await dialog.getByRole('radio', { name: 'Add to an existing note' }).check()
  await dialog.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Prior shoreline studies' }).click()
  await dialog.getByRole('button', { name: 'Assemble and open' }).click()

  await expect(page).toHaveURL(/\/notes\/n_prior$/)
  const chip = page.getByRole('button', { name: /Citation: Channel margin hydrographic survey, line_14\.xyz/ }).last()
  await expect(chip).toBeVisible()
  await expect(chip).toHaveAttribute('aria-label', /Download/)
  await expect(page.locator('.ProseMirror')).toContainText('Tabulated change rates already note inner-edge retreat')
})

test('the order can be changed before assembling', async ({ page }) => {
  await page.goto(`${BIN}/f_dredging/r_margin1987`)
  await page.getByRole('button', { name: 'Assemble notes into draft' }).click()
  await cards(page).nth(0).getByRole('checkbox').check()
  await cards(page).nth(1).getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Assemble into draft…' }).click()
  const dialog = page.getByRole('dialog', { name: 'Assemble 2 notes' })
  await dialog.getByRole('button', { name: 'Move note 2 up' }).click()
  await expect(dialog.getByRole('listitem').first()).toContainText('Confirms the timing')
  await dialog.getByLabel('Title').fill('Survey timing')
  await dialog.getByRole('button', { name: 'Assemble and open' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Survey timing' })).toBeVisible()
  const paragraphs = page.locator('.ProseMirror p')
  await expect(paragraphs.first()).toContainText('Confirms the timing')
})

test('Cancel and Escape leave selection mode', async ({ page }) => {
  await page.goto(`${BIN}/f_storms/r_stormreport1991`)
  await page.getByRole('button', { name: 'Assemble notes into draft' }).click()
  await expect(cards(page).first().getByRole('checkbox')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(cards(page).first().getByRole('checkbox')).toHaveCount(0)
  await page.getByRole('button', { name: 'Assemble notes into draft' }).click()
  await page.keyboard.press('Escape')
  await expect(cards(page).first().getByRole('checkbox')).toHaveCount(0)
})
