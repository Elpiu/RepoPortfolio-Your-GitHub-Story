import type { Repository } from '../types'

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function assignUniqueSlugs<T extends { id: number; name: string }>(
  repositories: readonly T[],
): Map<number, string> {
  const used = new Set<string>()
  const slugs = new Map<number, string>()

  for (const repository of [...repositories].sort((left, right) => left.id - right.id)) {
    const base = slugify(repository.name) || 'repository'
    let slug = base
    if (used.has(slug)) slug = `${base}-${repository.id}`
    used.add(slug)
    slugs.set(repository.id, slug)
  }

  return slugs
}

export function featuredRepositories(repositories: readonly Repository[], limit = 6): Repository[] {
  return [...repositories]
    .sort(
      (left, right) =>
        right.stars - left.stars ||
        right.updatedAt.localeCompare(left.updatedAt) ||
        left.name.localeCompare(right.name),
    )
    .slice(0, limit)
}
