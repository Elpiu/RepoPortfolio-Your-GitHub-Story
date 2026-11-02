import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test as base, expect, type Page } from '@playwright/test'
import { resolveDataDir } from '../../scripts/data-dir.mjs'
import { loadDataDir } from '../../shared/utils/validation'

// Stessa cartella dati della build (PORTFOLIO_DATA_DIR o data/).
export const { site, profiles } = loadDataDir(resolveDataDir())
export const defaultLocale = site.locales.find((locale) => locale.default)?.code ?? 'en'
export const defaultProfile = profiles[defaultLocale]!
export const secondaryLocale = site.locales.find((locale) => !locale.default) ?? null

function readUiStrings(code: string): Record<string, unknown> {
  const file = resolve('i18n/locales', `${code}.json`)
  return JSON.parse(readFileSync(existsSync(file) ? file : resolve('i18n/locales/en.json'), 'utf8'))
}

const uiStrings = readUiStrings(defaultLocale)

/** Stringa UI della lingua di default, es. ui('projects.filters.reset'). */
export function ui(key: string): string {
  const value = key.split('.').reduce<unknown>((node, part) => {
    return node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined
  }, uiStrings)
  if (typeof value !== 'string') throw new Error(`Stringa UI mancante: ${key}`)
  return value
}

/** Host remoti ammessi a runtime: solo immagini GitHub (ADR-013). */
export const IMAGE_HOSTS = new Set([
  'avatars.githubusercontent.com',
  'raw.githubusercontent.com',
  'user-images.githubusercontent.com',
  'private-user-images.githubusercontent.com',
  'repository-images.githubusercontent.com',
  'github.com',
  // Eccezione opt-in a ADR-013: solo gli host delle copertine dichiarate nei dati.
  ...Object.values(profiles).flatMap((profile) =>
    profile.books.flatMap((book) => (book.cover ? [new URL(book.cover).hostname] : [])),
  ),
])

/** Slug del primo progetto della griglia di default. */
export async function firstProjectPath(page: Page): Promise<string> {
  await page.goto('/')
  const href = await page.getByTestId('project-card').first().locator('h3 a').getAttribute('href')
  if (!href) throw new Error('Nessun progetto nella griglia')
  return href
}

type Fixtures = {
  /** URL richiesti fuori da localhost; vengono bloccati per tenere i test ermetici. */
  externalRequests: string[]
}

export const test = base.extend<Fixtures>({
  externalRequests: [
    async ({ page }, use) => {
      const requests: string[] = []
      await page.route(
        (url) => url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
        (route) => {
          requests.push(route.request().url())
          return route.abort()
        },
      )
      await use(requests)
    },
    { auto: true },
  ],
})

export { expect }
