import { profiles, site } from '#site-data'
import { getGitHubDataset } from '../utils/dataset'
import { buildResume } from '../utils/resume'

export default defineEventHandler(async (event) => {
  const defaultLocale = site.locales.find((locale) => locale.default)?.code
  const profile = defaultLocale ? profiles[defaultLocale] : undefined
  if (!profile) {
    throw createError({ statusCode: 500, statusMessage: 'Default profile not found' })
  }

  const dataset = await getGitHubDataset()
  const siteUrl = useRuntimeConfig(event).public.siteUrl || 'http://localhost:3000/'
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')

  return buildResume(profile, site, dataset.repositories, {
    username: dataset.username,
    siteUrl,
    syncedAt: dataset.syncedAt,
  })
})
