import { execSync } from 'node:child_process'
import { consola } from 'consola'
import type { GitHubRestRepoNode } from '~~/shared/schemas/github'
import { githubRestRepoNodeSchema } from '~~/shared/schemas/github'

const API_BASE = 'https://api.github.com'
const PAGE_SIZE = 100
const REQUEST_TIMEOUT_MS = 15_000

const logger = consola.withTag('github')

export class GitHubRequestError extends Error {
  readonly status: number
  readonly resetAt: string | null

  constructor(message: string, status: number, resetAt: string | null = null) {
    super(message)
    this.name = 'GitHubRequestError'
    this.status = status
    this.resetAt = resetAt
  }
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function requestHeaders(): HeadersInit {
  const token = process.env.NUXT_GITHUB_TOKEN || process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'RepoPortfolio',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function formatReset(resetSeconds: string | null): string | null {
  if (!resetSeconds) return null
  const timestamp = Number(resetSeconds) * 1000
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString()
}

function issuesMessage(issues: Array<{ path: readonly PropertyKey[]; message: string }>): string {
  return issues
    .map((issue) => `${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`)
    .join('; ')
}

async function requestJson(url: string, attempt = 0): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: requestHeaders(),
      signal: controller.signal,
    })
    const remaining = response.headers.get('x-ratelimit-remaining')
    const resetAt = formatReset(response.headers.get('x-ratelimit-reset'))
    if (remaining !== null) {
      logger.info(
        `rate limit: ${remaining} richieste rimaste${resetAt ? `, reset ${resetAt}` : ''}`,
      )
    }

    if (response.status === 403 || response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      if (attempt === 0 && retryAfter) {
        await sleep(Number(retryAfter) * 1000)
        return requestJson(url, attempt + 1)
      }
      throw new GitHubRequestError(
        `GitHub ha risposto ${response.status}${resetAt ? ` (rate limit reset ${resetAt})` : ''}`,
        response.status,
        resetAt,
      )
    }

    if (response.status >= 500 && attempt < 2) {
      await sleep(500 * 2 ** attempt)
      return requestJson(url, attempt + 1)
    }

    if (!response.ok) {
      throw new GitHubRequestError(
        `GitHub ha risposto ${response.status} per ${url}`,
        response.status,
        resetAt,
      )
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

export function resolveGithubUsername(configured: string): string {
  if (configured.trim()) return configured.trim()

  const fromEnv =
    process.env.NUXT_PUBLIC_GITHUB_USERNAME?.trim() ||
    process.env.GITHUB_REPOSITORY?.split('/')[0]?.trim()
  if (fromEnv) return fromEnv

  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' })
    const match = remote.trim().match(/github\.com[/:]([^/]+)\//i)
    if (match?.[1]) return match[1]
  } catch {
    // The caller receives a clear error below.
  }

  throw new Error(
    'Username GitHub mancante: imposta "github.username" in data/site.json oppure NUXT_PUBLIC_GITHUB_USERNAME.',
  )
}

export async function fetchPublicRepositories(
  username: string,
  maxRepos: number,
): Promise<GitHubRestRepoNode[]> {
  const repositories: GitHubRestRepoNode[] = []
  const safeMax = Math.max(1, Math.min(maxRepos, 1000))

  for (let page = 1; repositories.length < safeMax; page += 1) {
    const url = `${API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=${PAGE_SIZE}&page=${page}&sort=pushed&direction=desc&type=owner`
    const payload = await requestJson(url)
    if (!Array.isArray(payload)) {
      throw new Error(`[github] Risposta inattesa per ${url}: atteso un array di repository`)
    }

    for (const [index, node] of payload.entries()) {
      const parsed = githubRestRepoNodeSchema.safeParse(node)
      if (!parsed.success) {
        const name =
          node && typeof node === 'object' && 'name' in node ? String(node.name) : `indice ${index}`
        throw new Error(
          `[github] Payload non valido per ${name}: ${issuesMessage(parsed.error.issues)}`,
        )
      }
      repositories.push(parsed.data)
    }

    if (payload.length < PAGE_SIZE) break
  }

  return repositories.slice(0, safeMax)
}
