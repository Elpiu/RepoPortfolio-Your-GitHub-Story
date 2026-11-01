import { defineSitemapEventHandler } from '#sitemap/server'
import { site } from '#site-data'
import { getGitHubDataset } from '../../utils/dataset'

export default defineSitemapEventHandler(async () => {
  const dataset = await getGitHubDataset()
  return dataset.repositories.flatMap((repository) =>
    site.locales.map((locale) => ({
      loc: locale.default
        ? `/projects/${repository.slug}`
        : `/${locale.code}/projects/${repository.slug}`,
      lastmod: repository.updatedAt,
    })),
  )
})
