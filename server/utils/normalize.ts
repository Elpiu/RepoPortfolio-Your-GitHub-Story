import type { GitHubRestRepoNode } from '~~/shared/schemas/github'
import type { RepoStory } from '~~/shared/schemas/repo-story'
import type { Repository } from '~~/shared/types'
import { languageColor } from '~~/shared/utils/language-colors'
import { placeholderIndex } from '~~/shared/utils/placeholder'
import { assignUniqueSlugs } from '~~/shared/utils/repo'

export type NormalizeConfig = {
  username: string
  excludedRepos: string[]
  includeForks: boolean
  includeArchived: boolean
  excludeProfileRepo: boolean
  manifests?: ReadonlyMap<string, RepoStory | null>
}

export type ExcludedRepository = {
  name: string
  reason: string
}

export type NormalizeResult = {
  repositories: Repository[]
  excluded: ExcludedRepository[]
}

function normalizeHomepage(value: string | null): string | null {
  if (!value?.trim()) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function normalizeTopics(topics: readonly string[]): string[] {
  return [...new Set(topics.map((topic) => topic.trim().toLowerCase()).filter(Boolean))].slice(
    0,
    10,
  )
}

function normalizeLicense(license: GitHubRestRepoNode['license']): Repository['license'] {
  if (!license?.spdx_id || license.spdx_id === 'NOASSERTION') return null
  return {
    spdxId: license.spdx_id,
    name: license.name ?? license.spdx_id,
  }
}

export function normalizeRepositories(
  nodes: readonly GitHubRestRepoNode[],
  config: NormalizeConfig,
): NormalizeResult {
  const excluded: ExcludedRepository[] = []
  const included: GitHubRestRepoNode[] = []
  const excludedNames = new Set(config.excludedRepos)

  for (const node of nodes) {
    if (node.fork && !config.includeForks) {
      excluded.push({ name: node.name, reason: 'fork' })
      continue
    }
    if (node.archived && !config.includeArchived) {
      excluded.push({ name: node.name, reason: 'archived' })
      continue
    }
    if (config.excludeProfileRepo && node.name.toLowerCase() === config.username.toLowerCase()) {
      excluded.push({ name: node.name, reason: 'profile repository' })
      continue
    }
    if (excludedNames.has(node.name)) {
      excluded.push({ name: node.name, reason: 'excludedRepos' })
      continue
    }
    if (normalizeTopics(node.topics).includes('portfolio-hidden')) {
      excluded.push({ name: node.name, reason: 'topic portfolio-hidden' })
      continue
    }
    if (config.manifests?.get(node.name)?.hidden === true) {
      excluded.push({ name: node.name, reason: 'manifest hidden' })
      continue
    }
    included.push(node)
  }

  const slugs = assignUniqueSlugs(included)

  const repositories: Repository[] = included.map((node) => {
    const topics = normalizeTopics(node.topics)
    const language = node.language?.trim() || null

    return {
      id: node.id,
      name: node.name,
      slug: slugs.get(node.id)!,
      description: node.description?.trim() || null,
      url: node.html_url,
      homepage: normalizeHomepage(node.homepage),
      topics,
      language,
      languages: language ? [{ name: language, color: languageColor(language), percent: 100 }] : [],
      stars: node.stargazers_count,
      forks: node.forks_count,
      sizeKb: node.size,
      license: normalizeLicense(node.license),
      createdAt: node.created_at,
      updatedAt: node.updated_at,
      pushedAt: node.pushed_at,
      defaultBranch: node.default_branch,
      lastCommit: null,
      latestRelease: null,
      isPinned: false,
      pinnedOrder: null,
      previewImage: null,
      previewSource: 'placeholder',
      placeholderIndex: placeholderIndex(node.id),
    }
  })

  return {
    repositories: repositories.sort((left, right) => left.id - right.id),
    excluded,
  }
}
