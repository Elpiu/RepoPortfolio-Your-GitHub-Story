import { site } from '#site-data'
import { getGitHubDataset } from '../../utils/dataset'
import { getProjectDetail } from '../../utils/readme'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  const dataset = await getGitHubDataset()
  const repository = dataset.repositories.find((entry) => entry.slug === slug)
  if (!repository) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  return getProjectDetail(repository, dataset.username, site.github.readmeMaxBytes)
})
