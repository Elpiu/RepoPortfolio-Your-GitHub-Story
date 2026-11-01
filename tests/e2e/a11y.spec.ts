import AxeBuilder from '@axe-core/playwright'
import { expect, firstProjectPath, secondaryLocale, test } from './fixtures'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function seriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  return results.violations
    .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
    .map((violation) => ({
      id: violation.id,
      help: violation.help,
      targets: violation.nodes.slice(0, 5).map((node) => node.target.join(' ')),
    }))
}

const prefix = secondaryLocale ? `/${secondaryLocale.code}` : null

for (const theme of ['dark', 'light'] as const) {
  test.describe(`axe @a11y (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((value) => {
        window.localStorage.setItem('rp-color-mode', value)
      }, theme)
    })

    for (const path of [
      '/',
      '/cv',
      '/questa-pagina-non-esiste',
      ...(prefix ? [`${prefix}/`, `${prefix}/cv`] : []),
    ]) {
      test(`nessuna violazione grave su ${path}`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        expect(await seriousViolations(page)).toEqual([])
      })
    }

    test('nessuna violazione grave sul dettaglio', async ({ page }) => {
      await page.goto(await firstProjectPath(page))
      await page.waitForLoadState('networkidle')
      expect(await seriousViolations(page)).toEqual([])
    })
  })
}

test('a 320 px nessuno scroll orizzontale @a11y', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  const detail = await firstProjectPath(page)
  for (const path of ['/', '/cv', detail]) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('lo skip link porta al contenuto @a11y', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.locator(':focus')
  await expect(skip).toHaveAttribute('href', /#main$/)
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})
