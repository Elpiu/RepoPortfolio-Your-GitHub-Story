import { profiles, site } from '#site-data'
import type { Profile } from '~~/shared/schemas/profile'

export function useSiteData() {
  const { locale } = useI18n()
  const defaultLocale = site.locales.find((entry) => entry.default)?.code ?? 'en'

  const profile = computed<Profile>(() => {
    const active = profiles[locale.value] ?? profiles[defaultLocale]
    if (!active) {
      throw new Error(`[useSiteData] profilo mancante per la lingua "${locale.value}"`)
    }
    return active
  })

  const githubUrl = computed<string | null>(() => {
    const username = useRuntimeConfig().public.githubUsername || site.github.username
    return username ? `https://github.com/${username}` : null
  })

  return {
    site,
    profile,
    locales: site.locales,
    defaultLocale,
    githubUrl,
  }
}
