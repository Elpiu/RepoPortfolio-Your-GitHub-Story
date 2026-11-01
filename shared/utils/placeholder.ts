export const PLACEHOLDER_COUNT = 8

export function placeholderIndex(id: number): number {
  return Math.abs(id) % PLACEHOLDER_COUNT
}

export function placeholderFile(id: number): string {
  return `repo-placeholder/placeholder-${placeholderIndex(id) + 1}.webp`
}
