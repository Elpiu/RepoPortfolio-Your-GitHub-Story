import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Locale } from 'vue-i18n'
import { resolveDataDir } from './scripts/data-dir.mjs'
import { loadDataDir } from './shared/utils/validation'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
// data/ per default; PORTFOLIO_DATA_DIR sceglie un altro dataset (es. datasets/me).
const { site } = loadDataDir(resolveDataDir(rootDir))
const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8')) as {
  version: string
}
const defaultLocale = (site.locales.find((locale) => locale.default)?.code ?? 'en') as Locale
const appBaseURL = process.env.NUXT_APP_BASE_URL || '/'
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000/'
const siteOrigin = `${new URL(siteUrl).origin}/`
const crawlLinks = appBaseURL === '/'

const uiLocales = site.locales.map(({ code, language, name }) => {
  const file = join(rootDir, 'i18n', 'locales', `${code}.json`)
  if (!existsSync(file)) {
    console.warn(`[i18n] Nessun file i18n/locales/${code}.json: la lingua "${code}" userà en.json`)
    return { code, language, name, file: 'en.json' }
  }
  return { code, language, name, file: `${code}.json` }
})

const nonDefaultRoutes = site.locales
  .filter((locale) => locale.code !== defaultLocale)
  .flatMap((locale) => [`/${locale.code}/`, `/${locale.code}/cv`, `/${locale.code}/resume.json`])

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    storage: 'localStorage',
    storageKey: 'rp-color-mode',
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    './modules/validate-data',
    './modules/prerender-routes',
    './modules/icon-bundle',
  ],

  css: ['~/assets/css/main.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    baseURL: appBaseURL,
    head: {
      meta: [{ name: 'color-scheme', content: 'dark light' }],
    },
  },

  runtimeConfig: {
    githubToken: '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      githubUsername: process.env.NUXT_PUBLIC_GITHUB_USERNAME || site.github.username,
      version: pkg.version,
    },
  },

  site: {
    url: siteOrigin,
    _priority: 0,
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },

  robots: {
    robotsTxt: false,
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale,
    locales: uiLocales,
    langDir: 'locales',
    detectBrowserLanguage: false,
    baseUrl: siteOrigin,
  },

  icon: {
    mode: 'css',
    // Nessuna richiesta a api.iconify.design a runtime (ADR-013). Le icone dei dati
    // (competenze) non passano da qui: arrivano nel payload (/api/data-icons).
    fallbackToApi: false,
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
    serverBundle: 'local',
  },

  fonts: {
    families: [
      { name: 'Geist', provider: 'google', weights: ['400 700'], subsets: ['latin'] },
      { name: 'Geist Mono', provider: 'google', weights: [400], subsets: ['latin'] },
    ],
    defaults: {
      fallbacks: {
        'sans-serif': ['system-ui', 'sans-serif'],
        monospace: ['ui-monospace', 'monospace'],
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  nitro: {
    prerender: {
      crawlLinks,
      routes: ['/', '/cv', '/resume.json', ...nonDefaultRoutes, '/robots.txt'],
    },
  },

  experimental: {
    payloadExtraction: true,
    prerenderErrorPages: true,
  },
})
