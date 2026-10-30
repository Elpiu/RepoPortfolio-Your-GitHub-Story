type PageSeo = {
  title?: string
  description?: string
  type?: 'website' | 'profile' | 'article'
}

export function usePageSeo(options: PageSeo = {}) {
  const { site, profile, locales, defaultLocale } = useSiteData()
  const { locale } = useI18n()
  const route = useRoute()
  const switchLocalePath = useSwitchLocalePath()
  const config = useRuntimeConfig()

  const switchPath = (code: string) =>
    switchLocalePath(code as Parameters<typeof switchLocalePath>[0]) || '/'

  const siteUrl = config.public.siteUrl || 'http://localhost:3000/'
  const normalizedSiteUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  const siteName = site.seo.siteName ?? `${profile.value.meta.fullName} — Portfolio`
  const title = options.title ?? `${profile.value.meta.fullName} — ${profile.value.meta.role}`
  const description = options.description ?? profile.value.meta.tagline
  const currentLocale = locales.find((entry) => entry.code === locale.value) ?? locales[0]
  const canonical = new URL(route.path.replace(/^\//, ''), normalizedSiteUrl).toString()

  const languageLinks: Array<{ rel: 'alternate'; hreflang: string; href: string }> = locales.map(
    (entry) => {
      const path = switchPath(entry.code)
      return {
        rel: 'alternate' as const,
        hreflang: entry.language,
        href: new URL(path.replace(/^\//, ''), normalizedSiteUrl).toString(),
      }
    },
  )

  const defaultPath = switchPath(defaultLocale)
  languageLinks.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: new URL(defaultPath.replace(/^\//, ''), normalizedSiteUrl).toString(),
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: options.type ?? 'website',
    ogSiteName: siteName,
    ogUrl: canonical,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
  })

  useHead({
    htmlAttrs: {
      lang: currentLocale?.language ?? locale.value,
    },
    link: [{ rel: 'canonical', href: canonical }, ...languageLinks],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.value.meta.fullName,
          jobTitle: profile.value.meta.role,
          description,
          url: normalizedSiteUrl,
          email: site.links.email,
          sameAs: [site.links.linkedin, site.links.website].filter(Boolean),
        }),
      },
    ],
  })

  return { title, description, canonical, siteName }
}
