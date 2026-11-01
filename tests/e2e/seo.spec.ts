import { expect, firstProjectPath, site, test, ui } from './fixtures'

async function jsonLd(page: import('@playwright/test').Page) {
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent()
  return JSON.parse(raw ?? '{}')
}

test('home: meta, canonical, hreflang, Open Graph e JSON-LD', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/.+\/$/)

  const hreflangs = await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('hreflang')))
  for (const locale of site.locales) expect(hreflangs).toContain(locale.language)
  expect(hreflangs).toContain('x-default')

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/)
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /^https?:/)
  expect((await jsonLd(page))['@type']).toBe('Person')
})

test('titoli diversi per home, CV e dettaglio', async ({ page }) => {
  const detail = await firstProjectPath(page)
  const titles = new Set<string>()
  for (const path of ['/', '/cv', detail]) {
    await page.goto(path)
    titles.add(await page.title())
  }
  expect(titles.size).toBe(3)
})

test('il dettaglio dichiara SoftwareSourceCode', async ({ page }) => {
  await page.goto(await firstProjectPath(page))
  expect((await jsonLd(page))['@type']).toBe('SoftwareSourceCode')
})

test('la 404 risponde 404, è localizzata e non indicizzabile', async ({ page }) => {
  const response = await page.goto('/questa-pagina-non-esiste')
  expect(response?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText(ui('error.notFoundTitle'))
  const robots = await page
    .locator('meta[name="robots"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('content') ?? ''))
  expect(robots.length).toBeGreaterThan(0)
  for (const content of robots) expect(content).toMatch(/noindex/)
})

test('sitemap e robots elencano le rotte generate', async ({ request }) => {
  const defaultLocale = site.locales.find((locale) => locale.default)!
  const sitemap = await (await request.get(`/__sitemap__/${defaultLocale.language}.xml`)).text()
  expect(sitemap).toContain('/cv')
  expect(sitemap).toContain('/projects/')

  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toMatch(/Sitemap: https?:\/\/.+sitemap/)
})
