export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl || 'http://localhost:3000/'
  const sitemap = new URL('sitemap_index.xml', siteUrl).toString()

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nDisallow: /404\n\nSitemap: ${sitemap}\n`
})
