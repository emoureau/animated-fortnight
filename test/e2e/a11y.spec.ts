import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// WCAG 2.2 AA is a hard requirement. axe on every screen and its main open states.
async function expectAccessible(page: Page, { knownIssues = [] as string[] } = {}) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(knownIssues)
    .analyze()
  const summary = violations.map(v => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.slice(0, 5).map(n => `  ${n.target.join(' ')}`).join('\n')}`)
  expect(summary, summary.join('\n')).toEqual([])
}

const BIN = '/p/p_harlow/bin'

test.describe('shell', () => {
  test('project list', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible()
    await expectAccessible(page)
  })

  test('catalog record pages', async ({ page }) => {
    for (const id of ['r_margin1987', 'r_minutes1985', 'r_logbooks', 'r_profiles1978']) {
      await page.goto(`/records/${id}`)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expectAccessible(page)
    }
  })

  test('omnisearch open with results', async ({ page }) => {
    await page.goto('/p/p_harlow/notes/n_drivers')
    await expect(async () => {
      await page.keyboard.press('ControlOrMeta+k')
      await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible({ timeout: 1000 })
    }).toPass()
    await page.keyboard.type('chart')
    await expect(page.getByRole('option').first()).toBeVisible()
    // Known Nuxt UI issue, not fixable locally: UCommandPalette's listbox (Reka ListboxContent) can't be
    // given an accessible name. Logged in docs/ui-layer-requests.md ("Command palette: unnamed listbox").
    await expectAccessible(page, { knownIssues: ['aria-input-field-name'] })
  })
})

test.describe('concept A', () => {
  test('shared note', async ({ page }) => {
    await page.goto('/p/p_harlow/notes/n_drivers')
    await expect(page.locator('.ProseMirror-widget', { hasText: 'Daniel Reyes' })).toBeVisible()
    await expectAccessible(page)
  })

  test('cite popover open', async ({ page }) => {
    await page.goto('/p/p_harlow/notes/n_meeting1014')
    await page.locator('.ProseMirror').click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type(' [[survey')
    await expect(page.getByRole('listbox', { name: 'Records' })).toBeVisible()
    await expectAccessible(page)
  })

  test('comments and outline tabs', async ({ page }) => {
    await page.goto('/p/p_harlow/notes/n_drivers')
    await page.getByRole('tab', { name: /Comments/ }).click()
    await expect(page.getByRole('tabpanel', { name: /Comments/ })).toBeVisible()
    await expectAccessible(page)
    await page.getByRole('tab', { name: 'Outline' }).click()
    await expectAccessible(page)
  })
})

test.describe('concept B', () => {
  test('all records', async ({ page }) => {
    await page.goto(`${BIN}/all`)
    await expect(page.getByRole('heading', { name: 'All records' })).toBeVisible()
    await expectAccessible(page)
  })

  test('inline record with a selection', async ({ page }) => {
    await page.goto(`${BIN}/f_storms/r_stormreport1991`)
    const viewer = page.getByRole('group', { name: /^Page 4 of/ })
    await expect(async () => {
      await viewer.focus()
      await page.keyboard.press('ArrowDown')
      await expect(page.getByRole('button', { name: 'Note from selection' })).toBeVisible({ timeout: 1000 })
    }).toPass()
    await expectAccessible(page)
  })

  test('download, external and physical records', async ({ page }) => {
    for (const id of ['r_margin1987', 'r_minutes1985', 'r_logbooks']) {
      await page.goto(`${BIN}/f_dredging/${id}`)
      await expect(page.getByRole('heading', { name: 'Notes on this record' })).toBeVisible()
      await expectAccessible(page)
    }
  })

  test('all notes in selection mode, assemble modal, drafts', async ({ page }) => {
    await page.goto(`${BIN}/notes`)
    await page.getByRole('button', { name: 'Assemble notes into draft' }).click()
    await page.getByRole('checkbox').first().check()
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Assemble into draft…' }).click()
    await expect(page.getByRole('dialog', { name: /^Assemble 1 note/ })).toBeVisible()
    // Let the modal's opening fade finish so contrast is measured on the final colors
    await page.waitForTimeout(400)
    await expectAccessible(page)
    await page.goto(`${BIN}/drafts`)
    await expectAccessible(page)
  })
})
