import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import ghpages from 'gh-pages'
import { DATA_DIR_ENV, parseDataDirArg, resolveDataDir } from './data-dir.mjs'
import { resolveRepoContext, resolveSiteUrls } from './repo-context.mjs'

const dryRun = process.argv.includes('--dry-run')
const dataDirArg = parseDataDirArg(process.argv.slice(2))
const dataDir = resolveDataDir(
  process.cwd(),
  dataDirArg ? { ...process.env, [DATA_DIR_ENV]: dataDirArg } : process.env,
)
const site = JSON.parse(readFileSync(resolve(dataDir, 'site.json'), 'utf8'))
const context = resolveRepoContext()
const domain = site.deploy?.customDomain ?? null
const { baseURL, siteUrl } = resolveSiteUrls(context, domain)
const token = process.env.NUXT_GITHUB_TOKEN || process.env.GITHUB_TOKEN

if (!token && process.env.GITHUB_OFFLINE !== '1') {
  console.info(
    '[deploy] Nessun token GitHub: uso le API REST pubbliche (limite non autenticato: 60 richieste/ora).',
  )
}

console.log(`[deploy] ${context.owner}/${context.repo} → ${siteUrl} (base ${baseURL})`)
console.log(`[deploy] dati: ${relative(process.cwd(), dataDir) || '.'}`)

execSync('nuxt generate', {
  stdio: 'inherit',
  env: {
    ...process.env,
    [DATA_DIR_ENV]: dataDir,
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
