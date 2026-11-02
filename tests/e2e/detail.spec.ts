import { expect, firstProjectPath, test, ui } from './fixtures'

test('dalla card al dettaglio e ritorno', async ({ page }) => {
  await page.goto('/')
  const card = page.getByTestId('project-card').first()
  const name = (await card.locator('h3').innerText()).trim()

  await card.locator('h3 a').click()
  await expect(page).toHaveURL(/\/projects\/[^/]+\/?$/)
  await expect(page.locator('h1')).toHaveText(name)
  await expect(page.locator('h1')).toHaveCount(1)

  const github = page.getByRole('link', { name: ui('project.openOnGitHub') }).first()
  await expect(github).toHaveAttribute('href', /^https:\/\/github\.com\/[^/]+\/[^/]+/)
  await expect(github).toHaveAttribute('target', '_blank')
  await expect(github).toHaveAttribute('rel', /noopener/)

  await page.getByRole('link', { name: ui('project.backToProjects') }).click()
  await expect(page).toHaveURL(/\/(#projects)?$/)
})

test('il ritorno ai progetti segue lo scroll oltre metà pagina', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 })
  const path = await firstProjectPath(page)
  await page.goto(path)
  const floating = page.getByTestId('floating-back')
  await expect(floating).toHaveCount(0)

  const scrollable = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  )
  test.skip(scrollable < 200, 'Pagina troppo corta per scorrere')

  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), scrollable)
  await expect(floating).toBeVisible()
  await expect(floating).toBeInViewport()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(floating).toHaveCount(0)

  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), scrollable)
  await floating.click()
  await expect(page).toHaveURL(/\/#projects$/)
  await expect(page.locator('#projects')).toBeInViewport()
})

test('il dettaglio è una pagina statica raggiungibile direttamente', async ({ page, request }) => {
  const path = await firstProjectPath(page)
  const response = await request.get(path)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('id="project-title"')
})

test('il README non contiene script né handler inline', async ({ page }) => {
  await page.goto(await firstProjectPath(page))
  const readme = page.locator('.readme')
  if ((await readme.count()) === 0) return
  expect(await readme.locator('script, iframe, [onerror], [onclick]').count()).toBe(0)
  for (const link of await readme.locator('a[target="_blank"]').all()) {
    await expect(link).toHaveAttribute('rel', /noopener/)
  }
})

test('uno slug inesistente restituisce 404', async ({ page }) => {
  const response = await page.goto('/projects/questo-progetto-non-esiste')
  expect(response?.status()).toBe(404)
})
