import { expect, firstProjectPath, secondaryLocale, site, test, ui } from './fixtures'

const defaultLanguage = site.locales.find((locale) => locale.default)!.language

test.describe('lingua', () => {
  test.use({ locale: 'it-IT', extraHTTPHeaders: { 'Accept-Language': 'it-IT,it;q=0.9' } })

  test('la root resta nella lingua di default, senza redirect', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await page.waitForLoadState('networkidle')
    expect(new URL(page.url()).pathname).toBe('/')
    await expect(page.locator('html')).toHaveAttribute('lang', defaultLanguage)
  })

  test('il cambio lingua mantiene la pagina equivalente', async ({ page, context }) => {
    test.skip(!secondaryLocale, 'Una sola lingua configurata')
    const path = await firstProjectPath(page)
    await page.goto(path)

    await page.locator('header summary', { hasText: ui('language.label') }).click()
    await page
      .locator('header')
      .getByRole('link', { name: secondaryLocale!.name, exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`/${secondaryLocale!.code}${path}/?$`))
    await expect(page.locator('html')).toHaveAttribute('lang', secondaryLocale!.language)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/${secondaryLocale!.code}${path}/?$`),
    )

    expect(await context.cookies()).toEqual([])
  })
})

test('con una sola lingua lo switcher non esiste, altrimenti elenca il registry', async ({
  page,
}) => {
  await page.goto('/')
  const summary = page.locator('header summary', { hasText: ui('language.label') })
  if (site.locales.length < 2) {
    await expect(summary).toHaveCount(0)
    return
  }
  await summary.click()
  const menu = page.locator('header').getByRole('list', { name: ui('language.label') })
  const languages = await menu
    .getByRole('link')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('lang')))
  expect(languages).toEqual(site.locales.map((locale) => locale.language))
  await expect(menu.locator('[aria-current="true"]')).toHaveAttribute(
    'lang',
    site.locales.find((locale) => locale.default)!.language,
  )

  // Si chiude con Esc e cliccando fuori.
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await summary.click()
  await page.locator('main').click({ position: { x: 5, y: 300 } })
  await expect(menu).toBeHidden()
})

test('tema scuro di default, scelta persistita al reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)

  await page.locator('summary', { hasText: ui('theme.label') }).click()
  await page.getByRole('button', { name: ui('theme.light') }).click()
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)

  await page.reload()
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  await expect(page.locator('html')).toHaveClass(/\blight\b/)
})

test('la copia email è annunciata', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  // Un click prima dell'idratazione non ha effetto: si ritenta finché il bottone risponde.
  await expect(async () => {
    await page.getByRole('button', { name: ui('bento.copyEmail') }).click()
    await expect(page.getByRole('button', { name: ui('bento.copied') })).toBeVisible({
      timeout: 1000,
    })
  }).toPass()
  await expect(page.locator('[aria-live="polite"]', { hasText: ui('bento.copied') })).toHaveCount(1)
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(site.links.email)
})

test('motion ridotto: niente pulse né sollevamento delle card', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const ping = page.locator('[class*="animate-ping"]')
  if ((await ping.count()) > 0) {
    expect(await ping.first().evaluate((node) => getComputedStyle(node).animationName)).toBe('none')
  }

  const card = page.getByTestId('project-card').first()
  await card.hover()
  expect(await card.evaluate((node) => getComputedStyle(node).transform)).toBe('none')
})
