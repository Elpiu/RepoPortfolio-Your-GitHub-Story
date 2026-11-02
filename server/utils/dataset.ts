import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { consola } from 'consola'
import { site } from '#site-data'
import type { GitHubRestRepoNode } from '~~/shared/schemas/github'
import { githubRestRepoListSchema } from '~~/shared/schemas/github'
import type { RepoStory } from '~~/shared/schemas/repo-story'
import { githubDatasetSchema } from '~~/shared/schemas/repository'
import type { GitHubDataset, Repository } from '~~/shared/types'
import { featuredRepositories } from '~~/shared/utils/repo'
import { computeActivity } from './activity'
import { mapWithConcurrency } from './concurrency'
import { fetchPublicRepositories, resolveGithubUsername } from './github-rest'
import { computeLanguageStats } from './languages'
import { normalizeRepositories, type ExcludedRepository } from './normalize'
import {
  fetchReadmeForPreview,
  fetchRepoStory,
  resolvePreview,
  type PreviewResult,
} from './preview'
import { buildStoryEvents } from './story-events'

const CACHE_PATH = resolve('.cache/github/last-good.json')
const FIXTURE_PATH = resolve('tests/fixtures/github.json')
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const DEV_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000
const BUILD_SYNC_MARKER = 'PORTFOLIO_BUILD_SYNCED_AT'
const PREVIEW_SOURCES = ['manifest', 'convention', 'readme', 'social', 'placeholder'] as const

const logger = consola.withTag('github')

type DatasetOptions = {
  username: string
  offline: boolean
}

let datasetPromise: Promise<GitHubDataset> | null = null

function isOffline(): boolean {
  return process.env.GITHUB_OFFLINE === '1'
}

async function readJson(path: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code !== 'ENOENT') {
      logger.warn(
        `Impossibile leggere ${path}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return null
  }
}

async function loadCache(username: string | null): Promise<GitHubDataset | null> {
  const raw = await readJson(CACHE_PATH)
  if (!raw) return null
  const parsed = githubDatasetSchema.safeParse(raw)
  if (!parsed.success) {
    logger.warn('[cache] last-good.json non valido, ignorato')
    return null
  }
  // Lo snapshot di un altro account (es. dopo un cambio di cartella dati) non va riusato.
  if (username && parsed.data.username.toLowerCase() !== username.toLowerCase()) {
    logger.warn(
      `[cache] last-good.json appartiene a "${parsed.data.username}", atteso "${username}": ignorato`,
    )
    return null
  }
  return parsed.data
}

function cacheAgeMs(dataset: GitHubDataset): number {
  return Date.now() - new Date(dataset.syncedAt).getTime()
}

async function writeCache(dataset: GitHubDataset): Promise<void> {
  await mkdir(dirname(CACHE_PATH), { recursive: true })
  await writeFile(CACHE_PATH, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')
}

async function loadFixture(): Promise<GitHubRestRepoNode[]> {
  const raw = await readJson(FIXTURE_PATH)
  const payload = Array.isArray(raw) ? raw : (raw as { repositories?: unknown })?.repositories
  const parsed = githubRestRepoListSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(
      `[github] Fixture non valida (${FIXTURE_PATH}): ${parsed.error.issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ')}`,
    )
  }
  return parsed.data
}

function logExclusions(excluded: readonly ExcludedRepository[]): void {
  for (const entry of excluded) {
    logger.info(`escluso ${entry.name}: ${entry.reason}`)
  }
}

async function buildDataset(
  nodes: readonly GitHubRestRepoNode[],
  options: DatasetOptions,
): Promise<GitHubDataset> {
  const baseConfig = {
    username: options.username,
    excludedRepos: site.github.excludedRepos,
    includeForks: site.github.includeForks,
    includeArchived: site.github.includeArchived,
    excludeProfileRepo: site.github.excludeProfileRepo,
  }

  const structural = normalizeRepositories(nodes, baseConfig)
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  const manifests = new Map<string, RepoStory | null>()
  if (!options.offline) {
    await mapWithConcurrency(structural.repositories, 8, async (repository) => {
      const node = nodeById.get(repository.id)
      if (!node) return
      manifests.set(repository.name, await fetchRepoStory(node))
    })
  }

  const normalized = normalizeRepositories(nodes, { ...baseConfig, manifests })
  logExclusions(normalized.excluded)

  if (options.offline) {
    const offlineRepositories = normalized.repositories
    return githubDatasetSchema.parse({
      syncedAt: new Date().toISOString(),
      username: options.username,
      repositories: offlineRepositories,
      languageStats: computeLanguageStats(offlineRepositories),
      activity: computeActivity(offlineRepositories),
      storyEvents: buildStoryEvents(offlineRepositories, site.story, manifests),
    })
  }

  const featuredIds = new Set(featuredRepositories(normalized.repositories).map((repo) => repo.id))
  const previewCounts = Object.fromEntries(PREVIEW_SOURCES.map((source) => [source, 0])) as Record<
    (typeof PREVIEW_SOURCES)[number],
    number
  >

  const repositories = await mapWithConcurrency(
    normalized.repositories,
    8,
    async (repository): Promise<Repository> => {
      const node = nodeById.get(repository.id)
      if (!node) return repository
      const readme = await fetchReadmeForPreview(node)
      const preview: PreviewResult = await resolvePreview(node, {
        manifest: manifests.get(repository.name) ?? null,
        readme,
        featured: featuredIds.has(repository.id),
      })
      previewCounts[preview.previewSource] += 1
      return { ...repository, ...preview }
    },
  )

  logger.info(
    `letti ${nodes.length} repository, inclusi ${repositories.length}, esclusi ${normalized.excluded.length}`,
  )
  logger.info(
    `preview: ${PREVIEW_SOURCES.map((source) => `${source}=${previewCounts[source]}`).join(', ')}`,
  )

  return githubDatasetSchema.parse({
    syncedAt: new Date().toISOString(),
    username: options.username,
    repositories,
    languageStats: computeLanguageStats(repositories),
    activity: computeActivity(repositories),
    storyEvents: buildStoryEvents(repositories, site.story, manifests),
  })
}

function configuredUsername(): string | null {
  try {
    return resolveGithubUsername(site.github.username)
  } catch {
    return null
  }
}

function offlineUsername(): string {
  return configuredUsername() ?? 'fixture'
}

async function loadDataset(): Promise<GitHubDataset> {
  if (isOffline()) {
    const cache = await loadCache(configuredUsername())
    if (cache) {
      logger.info('GITHUB_OFFLINE=1: uso lo snapshot .cache/github/last-good.json')
      return cache
    }
    const fixture = await loadFixture()
    logger.warn('GITHUB_OFFLINE=1: snapshot assente, uso tests/fixtures/github.json')
    return buildDataset(fixture, { username: offlineUsername(), offline: true })
  }

  const username = resolveGithubUsername(site.github.username)

  // `generate` carica questo modulo due volte nello stesso processo (hook di
  // prerender e server Nitro): la seconda istanza riusa la sync della prima.
  const syncedInThisBuild = process.env[BUILD_SYNC_MARKER]
  if (syncedInThisBuild) {
    const cache = await loadCache(username)
    if (cache?.syncedAt === syncedInThisBuild) {
      logger.info('uso lo snapshot sincronizzato in questa build')
      return cache
    }
  }

  // In `pnpm dev` la sync completa (lista REST + centinaia di richieste raw per
  // manifest, README e preview) costerebbe secondi a ogni riavvio: si riusa lo
  // snapshot recente. `GITHUB_REFRESH=1` forza la sync. `generate` sincronizza sempre.
  if (import.meta.dev && process.env.GITHUB_REFRESH !== '1') {
    const cache = await loadCache(username)
    if (cache && cacheAgeMs(cache) < DEV_CACHE_MAX_AGE_MS) {
      logger.info(
        `dev: uso lo snapshot del ${cache.syncedAt.slice(0, 16).replace('T', ' ')} (GITHUB_REFRESH=1 per aggiornarlo)`,
      )
      return cache
    }
  }

  try {
    const nodes = await fetchPublicRepositories(username, site.github.maxRepos)
    const dataset = await buildDataset(nodes, { username, offline: false })
    await writeCache(dataset)
    process.env[BUILD_SYNC_MARKER] = dataset.syncedAt
    return dataset
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const cache = await loadCache(username)
    if (cache && cacheAgeMs(cache) < CACHE_MAX_AGE_MS) {
      logger.warn(`Sync GitHub fallita, uso lo snapshot recente: ${message}`)
      return cache
    }

    if (process.env.NODE_ENV !== 'production') {
      const fixture = await loadFixture()
      logger.warn(`Sync GitHub fallita, in sviluppo uso la fixture: ${message}`)
      return buildDataset(fixture, { username: offlineUsername(), offline: true })
    }

    throw new Error(
      `[github] Sync GitHub fallita e nessuno snapshot valido disponibile. ${message}`,
      { cause: error },
    )
  }
}

export function getGitHubDataset(): Promise<GitHubDataset> {
  if (!datasetPromise) {
    datasetPromise = loadDataset().catch((error) => {
      datasetPromise = null
      throw error
    })
  }
  return datasetPromise
}
