import type { RepoStory } from '~~/shared/schemas/repo-story'
import type { Repository, StoryEvent } from '~~/shared/types'
import { featuredRepositories } from '~~/shared/utils/repo'

type StoryConfig = {
  autoEvents: boolean
  maxAutoEvents: number
}

export function buildStoryEvents(
  repositories: readonly Repository[],
  config: StoryConfig,
  manifests: ReadonlyMap<string, RepoStory | null> = new Map(),
): StoryEvent[] {
  if (!config.autoEvents || config.maxAutoEvents <= 0) return []

  const events: StoryEvent[] = []

  for (const repository of featuredRepositories(repositories)) {
    if (manifests.get(repository.name)?.story === false) continue
    events.push({
      id: `auto-repo-${repository.name}`,
      type: 'repo',
      date: repository.createdAt.slice(0, 7),
      title: repository.name,
      description: repository.description,
      repoSlug: repository.slug,
      link: repository.url,
      tags: repository.topics.slice(0, 3),
    })
  }

  return events
    .sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id))
    .slice(0, config.maxAutoEvents)
}
