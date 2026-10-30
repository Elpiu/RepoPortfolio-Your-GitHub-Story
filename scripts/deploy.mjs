import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ghpages from 'gh-pages'
import { resolveRepoContext, resolveSiteUrls } from './repo-context.mjs'

const dryRun = process.argv.includes('--dry-run')
const site = JSON.parse(readFileSync('data/site.json', 'utf8'))
const context = resolveRepoContext()
const domain = site.deploy?.customDomain ?? null
const { baseURL, siteUrl } = resolveSiteUrls(context, domain)
const token = process.env.NUXT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN

if (!token && process.env.GITHUB_OFFLINE !== '1') {
  console.warn(
    '[deploy] Nessun token GitHub: la build procederà solo se GITHUB_OFFLINE=1 o se i dati sono in cache.',
  )
}

console.log(`[deploy] ${context.owner}/${context.repo} → ${siteUrl} (base ${baseURL})`)

execSync('nuxt generate', {
  stdio: 'inherit',
  env: {
    ...process.env,
    NUXT_APP_BASE_URL: baseURL,
    NUXT_PUBLIC_SITE_URL: siteUrl,
    NUXT_PUBLIC_GITHUB_USERNAME: site.github?.username || context.owner,
    ...(token ? { NUXT_GITHUB_TOKEN: token } : {}),
  },
})

const outputDir = resolve('.output/public')
const sha = process.env.GITHUB_SHA ?? execSync('git rev-parse HEAD').toString().trim()
const syncedAt = new Date().toISOString()

writeFileSync(resolve(outputDir, '.nojekyll'), '')
writeFileSync(
  resolve(outputDir, 'build.json'),
  `${JSON.stringify({ sha, syncedAt, siteUrl }, null, 2)}\n`,
)

if (dryRun) {
  console.log('[deploy] --dry-run: generato .output/public senza pubblicare.')
  process.exit(0)
}

try {
  await ghpages.publish(outputDir, {
    branch: 'gh-pages',
    dotfiles: true,
    nojekyll: true,
    cname: domain ?? undefined,
    message: `deploy: ${context.owner}/${context.repo}`,
    ...(process.env.CI && {
      repo: `https://x-access-token:${token}@github.com/${context.owner}/${context.repo}.git`,
      user: {
        name: 'github-actions[bot]',
        email: '41898282+github-actions[bot]@users.noreply.github.com',
      },
    }),
  })
  console.log('[deploy] Pubblicato sul branch gh-pages.')
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  const sanitized = token ? message.replaceAll(token, '***') : message
  console.error(`[deploy] Pubblicazione fallita: ${sanitized}`)
  process.exitCode = 1
}
