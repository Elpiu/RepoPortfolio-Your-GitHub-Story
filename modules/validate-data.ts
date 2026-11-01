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

    addTemplate({
      filename: 'site-data.mjs',
      write: true,
      getContents: () =>
        [
          `export const site = ${JSON.stringify(site)}`,
          `export const profiles = ${JSON.stringify(profiles)}`,
          'export default { site, profiles }',
          '',
        ].join('\n'),
    })

    nuxt.options.alias['#site-data'] = join(nuxt.options.buildDir, 'site-data.mjs')

    addTypeTemplate({
      filename: 'types/site-data.d.ts',
      getContents: () =>
        [
          "declare module '#site-data' {",
          "  import type { SiteConfig } from '~~/shared/schemas/site'",
          "  import type { Profile } from '~~/shared/schemas/profile'",
          '  export const site: SiteConfig',
          '  export const profiles: Record<string, Profile>',
          '}',
          '',
        ].join('\n'),
    })

    if (nuxt.options.dev) {
      nuxt.options.watch.push(join(dataDir, '*.json'), join(dataDir, 'profile', '*.json'))
    }
  },
})
