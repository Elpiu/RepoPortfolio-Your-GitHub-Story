import { join } from 'node:path'
import { addTemplate, addTypeTemplate, defineNuxtModule } from '@nuxt/kit'
import type { Profile } from '../shared/schemas/profile'
import { profileSchema } from '../shared/schemas/profile'
import { siteSchema } from '../shared/schemas/site'
import {
  assertAtMostOneCurrentJob,
  assertLocaleMatches,
  assertLocalesHaveProfiles,
  assertSameShape,
  assertUniqueIds,
  parseJsonFile,
  writeJsonSchemas,
} from '../shared/utils/validation'

export default defineNuxtModule({
  meta: {
    name: 'validate-data',
    configKey: 'validateData',
  },
  setup(_options, nuxt) {
    const dataDir = join(nuxt.options.rootDir, 'data')
    const site = parseJsonFile(siteSchema, join(dataDir, 'site.json'))

    const profiles: Record<string, Profile> = {}
    for (const locale of site.locales) {
      const profile = parseJsonFile(profileSchema, join(dataDir, 'profile', `${locale.code}.json`))
      assertLocaleMatches(locale.code, profile)
      profiles[locale.code] = profile
    }

    assertLocalesHaveProfiles(site, profiles)
    assertSameShape(profiles)

    for (const [code, profile] of Object.entries(profiles)) {
      assertUniqueIds([...profile.experiences, ...profile.milestones])
      assertAtMostOneCurrentJob(profile, code)
    }

    writeJsonSchemas(join(dataDir, 'schema'))

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
