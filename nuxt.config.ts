import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Locale } from 'vue-i18n'
import site from './data/site.json'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
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
  .map((locale) => `/${locale.code}/`)

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

  robots: {
    robotsTxt: false,
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale,
    locales: uiLocales,
    langDir: 'locales',
    detectBrowserLanguage: false,
    baseUrl: siteUrl,
  },

  icon: {
    mode: 'css',
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
      routes: ['/', ...nonDefaultRoutes, '/robots.txt'],
    },
  },

  experimental: {
    payloadExtraction: true,
    prerenderErrorPages: true,
  },
})
