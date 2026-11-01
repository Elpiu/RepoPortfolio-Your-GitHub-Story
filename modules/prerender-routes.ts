import { join } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { resolveDataDir } from '../scripts/data-dir.mjs'
import { siteSchema } from '../shared/schemas/site'
import { parseJsonFile } from '../shared/utils/validation'

export default defineNuxtModule({
  meta: { name: 'prerender-routes' },
  setup(_options, nuxt) {
    const site = parseJsonFile(siteSchema, join(resolveDataDir(nuxt.options.rootDir), 'site.json'))

    nuxt.hook('prerender:routes', async ({ routes }) => {
      const { getGitHubDataset } = await import('../server/utils/dataset')
      const dataset = await getGitHubDataset()

      for (const repository of dataset.repositories) {
        for (const locale of site.locales) {
          routes.add(
            locale.default
              ? `/projects/${repository.slug}`
              : `/${locale.code}/projects/${repository.slug}`,
          )
        }
      }
    })
  },
})
