import { expect, test } from '@playwright/test'

// Serial: these tests reply to and resolve the shared mock comment.
test.describe.configure({ mode: 'serial' })

const NOTE = '/p/p_harlow/notes/n_drivers'

test('teammates show as carets and selections in their colors', async ({ page }) => {
  await page.goto(NOTE)
  const editor = page.locator('.ProseMirror')
  await expect(editor).toBeVisible()
  // Daniel's caret after "compare against the 1978 profiles"
  const daniel = editor.locator('.ProseMirror-widget', { hasText: 'Daniel Reyes' })
  await expect(daniel).toBeVisible()
  await expect(daniel).toHaveClass(/border-person-3/)
  // Priya's selection over the first "edge", with her flag
  // The flag's wrapper is zero-width, so check the flag itself
  await expect(editor.locator('.ProseMirror-widget').getByText('Priya Natarajan')).toBeVisible()
  await expect(editor.locator('.bg-person-4\\/30', { hasText: 'edge' })).toHaveCount(1)
})

test('a comment marker opens its thread; reply and resolve', async ({ page }) => {
  await page.goto(NOTE)
  await expect(page.getByRole('tab', { name: /Comments\s*1/ })).toBeVisible()

  await page.getByRole('button', { name: /^Comment by Priya Natarajan/ }).click()
  const thread = page.locator('#thread-cm_01')
  await expect(thread).toBeFocused()

  await thread.getByRole('button', { name: 'Reply' }).click()
  const reply = thread.getByLabel('Reply to Priya Natarajan')
  await expect(reply).toBeFocused()
  await reply.fill('Agreed, citing it next.')
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(thread).toContainText('Agreed, citing it next.')
  await expect(thread).toContainText('Sam Rivera')

  await thread.getByRole('button', { name: 'Resolve' }).click()
  await expect(page.getByRole('button', { name: /^Comment by Priya Natarajan/ })).toHaveCount(0)
  await expect(page.locator('[data-comment-id="cm_01"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Resolved · 1' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Comments', exact: true })).toBeVisible()
})

test('select text, Comment, and a new anchored thread appears', async ({ page }) => {
  await page.goto(NOTE)
  const heading = page.locator('.ProseMirror h2', { hasText: '3. Sediment supply' })
  await expect(heading).toBeVisible()
  // Wait for the teammate decorations: they load after the note and redraw the text
  await expect(page.locator('.ProseMirror-widget', { hasText: 'Daniel Reyes' })).toBeVisible()
  // Select "Reduced sand" through the DOM (ProseMirror reads it like a mouse selection);
  // typed Shift+Arrow runs drop keys on a busy machine.
  await page.locator('.ProseMirror').evaluate((root: HTMLElement) => {
    root.focus()
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const at = node.textContent!.indexOf('Reduced sand')
      if (at === -1)
        continue
      const range = document.createRange()
      range.setStart(node, at)
      range.setEnd(node, at + 'Reduced sand'.length)
      getSelection()!.removeAllRanges()
      getSelection()!.addRange(range)
      return
    }
  })
  await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe('Reduced sand')
  await page.getByRole('button', { name: 'Comment', exact: true }).click()
  const composer = page.getByLabel('New comment')
  await expect(composer).toBeFocused()
  await expect(page.getByText('On “Reduced sand”')).toBeVisible()
  await composer.fill('Which updrift source?')
  await page.getByRole('button', { name: 'Comment', exact: true }).last().click()

  await expect(page.getByRole('button', { name: /^Comment by Sam Rivera: Which updrift source\?/ })).toBeVisible()
  await expect(page.locator('[data-comment-id]', { hasText: 'Reduced sand' })).toHaveCount(1)
})
