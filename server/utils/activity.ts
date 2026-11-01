import type { Activity, Repository } from '~~/shared/types'

export function computeActivity(repositories: readonly Repository[]): Activity | null {
  const latest = [...repositories]
    .filter((repository) => repository.pushedAt !== null)
    .sort((left, right) => right.pushedAt!.localeCompare(left.pushedAt!))[0]

  if (!latest) return null

  return {
    repoName: latest.name,
    repoSlug: latest.slug,
    branch: latest.defaultBranch,
    pushedAt: latest.pushedAt,
    commit: latest.lastCommit,
  }
}
