import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { GitHubRestRepoNode } from '../../shared/schemas/github'
import { githubRestRepoListSchema } from '../../shared/schemas/github'
import type { Repository } from '../../shared/types'
import { normalizeRepositories } from '../../server/utils/normalize'

export function fixtureNodes(): GitHubRestRepoNode[] {
  return githubRestRepoListSchema.parse(
    JSON.parse(readFileSync(resolve('tests/fixtures/github.json'), 'utf8')),
  )
}

export function fixtureRepositories(): Repository[] {
  return normalizeRepositories(fixtureNodes(), {
    username: 'Elpiu',
    excludedRepos: ['secret-repo'],
    includeForks: false,
    includeArchived: false,
    excludeProfileRepo: true,
  }).repositories
}
