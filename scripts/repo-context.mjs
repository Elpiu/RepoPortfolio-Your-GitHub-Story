import { execSync } from 'node:child_process'

/**
 * @param {string} remote
 * @returns {{ owner: string, repo: string }}
 */
export function parseGitHubRemote(remote) {
  const cleaned = remote
    .trim()
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
  const match = cleaned.match(/github\.com[/:]([^/]+)\/([^/]+)$/i)
  if (!match) {
    throw new Error(`[repo-context] Remote GitHub non riconosciuto: ${remote}`)
  }
  return { owner: match[1], repo: match[2] }
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @param {string} [cwd]
 * @returns {{ owner: string, repo: string }}
 */
export function resolveRepoContext(env = process.env, cwd = process.cwd()) {
  const slug = env.GITHUB_REPOSITORY
  if (slug) {
    const [owner, repo] = slug.split('/')
    if (!owner || !repo) {
      throw new Error(`[repo-context] GITHUB_REPOSITORY non valido: ${slug}`)
    }
    return { owner, repo }
  }

  const remote = execSync('git remote get-url origin', { cwd, encoding: 'utf8' })
  return parseGitHubRemote(remote)
}

/**
 * @param {{ owner: string, repo: string }} context
 * @param {string | null} [customDomain]
 * @returns {{ baseURL: string, siteUrl: string }}
 */
export function resolveSiteUrls(context, customDomain = null) {
  const { owner, repo } = context

  if (customDomain) {
    return {
      baseURL: '/',
      siteUrl: `https://${customDomain}/`,
    }
  }

  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return {
      baseURL: '/',
      siteUrl: `https://${owner}.github.io/`,
    }
  }

  return {
    baseURL: `/${repo}/`,
    siteUrl: `https://${owner}.github.io/${repo}/`,
  }
}
