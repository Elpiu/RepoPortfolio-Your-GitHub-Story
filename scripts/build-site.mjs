import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { DATA_DIR_ENV, parseDataDirArg, resolveDataDir } from './data-dir.mjs'
import { resolveRepoContext, resolveSiteUrls } from './repo-context.mjs'

/**
 * Genera `.output/public` come verrà pubblicato: risolve repository, base URL e
 * cartella dati, poi `nuxt generate`. La pubblicazione la fa `deploy.yml` a ogni
 * push sul branch di default (ADR-030) e una volta a settimana (ADR-031). Uso: pnpm build:site [-- --data datasets/me]
 */

// Stesse variabili di `nuxt dev/generate` (es. PORTFOLIO_DATA_DIR, GITHUB_OFFLINE);
// quelle già presenti nell'ambiente vincono.
if (existsSync('.env')) process.loadEnvFile('.env')

const dataDirArg = parseDataDirArg(process.argv.slice(2))
const dataDir = resolveDataDir(
  process.cwd(),
  dataDirArg ? { ...process.env, [DATA_DIR_ENV]: dataDirArg } : process.env,
)
const site = JSON.parse(readFileSync(resolve(dataDir, 'site.json'), 'utf8'))
const context = resolveRepoContext()
const { baseURL, siteUrl } = resolveSiteUrls(context, site.deploy?.customDomain ?? null)
const token = process.env.NUXT_GITHUB_TOKEN || process.env.GITHUB_TOKEN

if (!token && process.env.GITHUB_OFFLINE !== '1') {
  console.info(
    '[build-site] Nessun token GitHub: uso le API REST pubbliche (limite non autenticato: 60 richieste/ora).',
  )
}

console.log(`[build-site] ${context.owner}/${context.repo} → ${siteUrl} (base ${baseURL})`)
console.log(`[build-site] dati: ${relative(process.cwd(), dataDir) || '.'}`)

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

// build.json: lo smoke test di deploy.yml lo usa per riconoscere il deploy online.
// `run` distingue anche i rebuild programmati, che ripubblicano lo stesso commit.
const sha = process.env.GITHUB_SHA ?? execSync('git rev-parse HEAD').toString().trim()
const run = process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_RUN_ID}.${process.env.GITHUB_RUN_ATTEMPT ?? '1'}`
  : null
writeFileSync(
  resolve('.output/public/build.json'),
  `${JSON.stringify({ sha, run, syncedAt: new Date().toISOString(), siteUrl }, null, 2)}\n`,
)
console.log('[build-site] Generato .output/public.')
