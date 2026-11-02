import { join } from 'node:path'
import { addTemplate, addTypeTemplate, defineNuxtModule } from '@nuxt/kit'
import { consola } from 'consola'
import { DEFAULT_DATA_DIR, resolveDataDir } from '../scripts/data-dir.mjs'
import { loadDataDir, relativePath, writeJsonSchemas } from '../shared/utils/validation'

export default defineNuxtModule({
  meta: {
    name: 'validate-data',
    configKey: 'validateData',
  },
  setup(_options, nuxt) {
    const dataDir = resolveDataDir(nuxt.options.rootDir)
    const { site, profiles } = loadDataDir(dataDir)

    if (relativePath(dataDir) !== DEFAULT_DATA_DIR) {
      consola.info(`[validate-data] cartella dati: ${relativePath(dataDir)}`)
    }

    // Gli schemi restano in data/schema: ogni dataset vi punta con "$schema".
    writeJsonSchemas(join(nuxt.options.rootDir, DEFAULT_DATA_DIR, 'schema'))

    // #site-data finisce nel bundle client: i libri (liste lunghe, URL di
    // copertina) restano fuori e arrivano nel payload da /api/books (#site-books,
    // importato solo dal server).
    const clientProfiles = Object.fromEntries(
      Object.entries(profiles).map(([code, profile]) => [code, { ...profile, books: [] }]),
    )
    const books = Object.fromEntries(
      Object.entries(profiles).map(([code, profile]) => [code, profile.books]),
    )
    const hasBooks = Object.values(profiles).some((profile) => profile.books.length > 0)

    addTemplate({
      filename: 'site-data.mjs',
      write: true,
      getContents: () =>
        [
          `export const site = ${JSON.stringify(site)}`,
          `export const profiles = ${JSON.stringify(clientProfiles)}`,
          `export const hasBooks = ${JSON.stringify(hasBooks)}`,
          'export default { site, profiles, hasBooks }',
          '',
        ].join('\n'),
    })
    addTemplate({
      filename: 'site-books.mjs',
      write: true,
      getContents: () => `export const books = ${JSON.stringify(books)}\n`,
    })

    nuxt.options.alias['#site-data'] = join(nuxt.options.buildDir, 'site-data.mjs')
    nuxt.options.alias['#site-books'] = join(nuxt.options.buildDir, 'site-books.mjs')

    addTypeTemplate({
      filename: 'types/site-data.d.ts',
      getContents: () =>
        [
          "declare module '#site-data' {",
          "  import type { SiteConfig } from '~~/shared/schemas/site'",
          "  import type { Profile } from '~~/shared/schemas/profile'",
          '  export const site: SiteConfig',
          '  /** `books` è sempre vuoto qui: i libri stanno in #site-books (/api/books). */',
          '  export const profiles: Record<string, Profile>',
          '  export const hasBooks: boolean',
          '}',
          "declare module '#site-books' {",
          "  import type { Book } from '~~/shared/schemas/profile'",
          '  export const books: Record<string, Book[]>',
          '}',
          '',
        ].join('\n'),
    })

    if (nuxt.options.dev) {
      nuxt.options.watch.push(join(dataDir, '*.json'), join(dataDir, 'profile', '*.json'))
    }
  },
})
