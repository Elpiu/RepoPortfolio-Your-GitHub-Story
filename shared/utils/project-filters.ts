import type { Repository } from '../types'

export const ALL_TAB = 'all'
export const OPEN_SOURCE_TAB = 'open-source'
export const LANGUAGE_TAB_PREFIX = 'lang:'
export const PROJECTS_PAGE_SIZE = 12

export type ProjectSort = 'relevance' | 'stars' | 'updated' | 'name'

export type ProjectFilterState = {
  q: string
  lang: string | null
  tab: string
  sort: ProjectSort
  page: number
}

export const DEFAULT_FILTER_STATE: ProjectFilterState = {
  q: '',
  lang: null,
  tab: ALL_TAB,
  sort: 'relevance',
  page: 1,
}

export type LanguageTab = {
  value: string
  label: string
}

export function languageTabValue(language: string): string {
  return `${LANGUAGE_TAB_PREFIX}${language}`
}

export function languageFromTab(tab: string): string | null {
  return tab.startsWith(LANGUAGE_TAB_PREFIX) ? tab.slice(LANGUAGE_TAB_PREFIX.length) : null
}

export function getLanguageTabs(repositories: readonly Repository[], limit = 3): LanguageTab[] {
  const stats = new Map<string, { count: number; stars: number }>()
  for (const repository of repositories) {
    if (!repository.language) continue
    const current = stats.get(repository.language) ?? { count: 0, stars: 0 }
    stats.set(repository.language, {
      count: current.count + 1,
      stars: current.stars + repository.stars,
    })
  }

  return [...stats.entries()]
    .sort(
      (left, right) =>
        right[1].count - left[1].count ||
        right[1].stars - left[1].stars ||
        left[0].localeCompare(right[0]),
    )
    .slice(0, limit)
    .map(([language]) => ({
      value: languageTabValue(language),
      label: language,
    }))
}

export function getLanguages(repositories: readonly Repository[]): string[] {
  const languages = new Set<string>()
  for (const repository of repositories) {
    if (repository.language) languages.add(repository.language)
    for (const language of repository.languages) languages.add(language.name)
  }
  return [...languages].sort((left, right) => left.localeCompare(right))
}

function sortProjects(repositories: readonly Repository[], sort: ProjectSort): Repository[] {
  const sorted = [...repositories]
  switch (sort) {
    case 'stars':
      return sorted.sort(
        (left, right) =>
          right.stars - left.stars ||
          right.updatedAt.localeCompare(left.updatedAt) ||
          left.name.localeCompare(right.name),
      )
    case 'updated':
      return sorted.sort(
        (left, right) =>
          right.updatedAt.localeCompare(left.updatedAt) || left.name.localeCompare(right.name),
      )
    case 'name':
      return sorted.sort((left, right) => left.name.localeCompare(right.name))
    case 'relevance':
    default:
      return sorted.sort(
        (left, right) =>
          right.stars - left.stars ||
          right.updatedAt.localeCompare(left.updatedAt) ||
          left.name.localeCompare(right.name),
      )
  }
}

export function filterProjects(
  repositories: readonly Repository[],
  state: Partial<ProjectFilterState> = {},
): Repository[] {
  const filter = { ...DEFAULT_FILTER_STATE, ...state }
  const search = filter.q.trim().toLowerCase()
  const language = languageFromTab(filter.tab) ?? filter.lang

  const filtered = repositories.filter((repository) => {
    if (filter.tab === OPEN_SOURCE_TAB && !repository.license) return false
    if (language && repository.language !== language) return false
    if (!search) return true

    const haystack = [
      repository.name,
      repository.description ?? '',
      repository.language ?? '',
      ...repository.topics,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })

  return sortProjects(filtered, filter.sort)
}

export function paginate(
  repositories: readonly Repository[],
  page: number,
  pageSize = PROJECTS_PAGE_SIZE,
): Repository[] {
  const safePage = Math.max(1, Math.trunc(page) || 1)
  return repositories.slice(0, safePage * pageSize)
}
