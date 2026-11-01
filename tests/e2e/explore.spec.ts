import { expect, test, ui } from './fixtures'

test('la ricerca filtra, aggiorna l URL e sopravvive al reload', async ({ page }) => {
  await page.goto('/')
  const cards = page.getByTestId('project-card')
  const name = (await cards.first().locator('h3').innerText()).trim()

  await page.getByLabel(ui('projects.filters.searchLabel')).fill(name)
  await expect(page).toHaveURL(/[?&]q=/)
  await expect(cards.first().locator('h3')).toContainText(name)

  await page.reload()
  await expect(page.getByLabel(ui('projects.filters.searchLabel'))).toHaveValue(name)
  await expect(cards.first().locator('h3')).toContainText(name)

  await page
    .getByRole('button', { name: ui('projects.filters.reset') })
    .first()
    .click()
  await expect(page).not.toHaveURL(/[?&]q=/)
  await expect(page.getByLabel(ui('projects.filters.searchLabel'))).toHaveValue('')
})

test('zero risultati mostra uno stato vuoto con reset', async ({ page }) => {
  await page.goto('/?q=zz-nessun-progetto-zz')
  await expect(page.getByTestId('project-card')).toHaveCount(0)
  await expect(page.getByText(ui('projects.empty.title'))).toBeVisible()
})

test('i tab seguono il pattern ARIA e si usano da tastiera', async ({ page }) => {
  await page.goto('/')
  const tablist = page.getByRole('tablist', { name: ui('projects.tabs.label') })
  const tabs = tablist.getByRole('tab')
  expect(await tabs.count()).toBeGreaterThan(1)

  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  await tabs.first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(page).toHaveURL(/[?&]tab=/)
})

test('il filtro linguaggio si combina con il contatore', async ({ page }) => {
  await page.goto('/')
  const select = page.locator('#project-language')
  const option = await select.locator('option').nth(1).getAttribute('value')
  test.skip(!option, 'Dataset senza linguaggi')

  await select.selectOption(option!)
  await expect(page).toHaveURL(/[?&]lang=/)
  const languages = await page
    .getByTestId('project-card')
    .locator('[data-testid="project-language"]')
    .allInnerTexts()
  expect(languages.length).toBeGreaterThan(0)
  for (const language of languages) expect(language.trim()).toBe(option)
})
