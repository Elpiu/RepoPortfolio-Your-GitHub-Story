import { profiles, site } from '#site-data'
import { getGitHubDataset } from '../../utils/dataset'
import { buildResume } from '../../utils/resume'

export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  const profile = locale ? profiles[locale] : undefined
  if (!locale || !profile) {
    throw createError({ statusCode: 404, statusMessage: 'Resume not found' })
  }

  const dataset = await getGitHubDataset()
  const runtimeSiteUrl = useRuntimeConfig(event).public.siteUrl || 'http://localhost:3000/'
  const baseUrl = runtimeSiteUrl.endsWith('/') ? runtimeSiteUrl : `${runtimeSiteUrl}/`
  const siteUrl = new URL(`${locale}/`, baseUrl).toString()
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')

  return buildResume(profile, site, dataset.repositories, {
    username: dataset.username,
    siteUrl,
    syncedAt: dataset.syncedAt,
  })
})
