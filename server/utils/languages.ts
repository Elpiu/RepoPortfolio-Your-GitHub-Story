import type { LanguageStat, Repository } from '~~/shared/types'
import { languageColor } from '~~/shared/utils/language-colors'

const MAX_LANGUAGES = 8
const OTHER_LABEL = 'Other'

export function computeLanguageStats(repositories: readonly Repository[]): LanguageStat[] {
  const counts = new Map<string, number>()
  let total = 0

  for (const repository of repositories) {
    if (!repository.language) continue
    counts.set(repository.language, (counts.get(repository.language) ?? 0) + 1)
    total += 1
  }

  if (total === 0) return []

  const sorted = [...counts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
  )
  const top = sorted.slice(0, MAX_LANGUAGES).map(([name, repos]) => ({
    name,
    color: languageColor(name),
    repos,
    percent: Math.round((repos / total) * 1000) / 10,
  }))

  const otherCount = sorted.slice(MAX_LANGUAGES).reduce((sum, [, repos]) => sum + repos, 0)
  if (otherCount > 0) {
    top.push({
      name: OTHER_LABEL,
      color: languageColor(OTHER_LABEL),
      repos: otherCount,
      percent: Math.round((otherCount / total) * 1000) / 10,
    })
  }

  const sum = top.reduce((accumulator, language) => accumulator + language.percent, 0)
  const residual = Math.round((100 - sum) * 10) / 10
  if (residual !== 0 && top[0]) {
    top[0].percent = Math.round((top[0].percent + residual) * 10) / 10
  }

  return top
}
