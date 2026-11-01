import type { Experience, Milestone } from '../schemas/profile'
import type { StoryEvent } from '../types'
import type { StoryNode, StoryNodeKind } from './story-graph'

/** Filtri della GitHub Story: ognuno raggruppa uno o più tipi di nodo. */
export const STORY_FILTERS = ['work', 'education', 'projects', 'milestones'] as const
export type StoryFilter = (typeof STORY_FILTERS)[number]

const FILTER_BY_KIND: Record<StoryNodeKind, StoryFilter> = {
  work: 'work',
  education: 'education',
  repo: 'projects',
  release: 'projects',
  milestone: 'milestones',
}

export function storyFilterOf(kind: StoryNodeKind): StoryFilter {
  return FILTER_BY_KIND[kind]
}

/** Default: la storia del lavoro; se non ci sono esperienze di lavoro, tutto. */
export function defaultStoryFilters(available: readonly StoryFilter[]): StoryFilter[] {
  return available.includes('work') ? ['work'] : [...available]
}

function ordered(filters: Iterable<StoryFilter>): StoryFilter[] {
  const set = new Set(filters)
  return STORY_FILTERS.filter((filter) => set.has(filter))
}

/** Legge `?story=work,education`; null se vuoto o senza filtri disponibili. */
export function parseStoryFilters(
  value: string,
  available: readonly StoryFilter[],
): StoryFilter[] | null {
  const selected = ordered(
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry): entry is StoryFilter => available.includes(entry as StoryFilter)),
  )
  return selected.length > 0 ? selected : null
}

/** Valore per la query string; null quando coincide con il default. */
export function serializeStoryFilters(
  selected: readonly StoryFilter[],
  available: readonly StoryFilter[],
): string | null {
  const value = ordered(selected).join(',')
  return value === defaultStoryFilters(available).join(',') ? null : value
}

/** Attiva o disattiva un filtro; almeno uno resta sempre selezionato. */
export function toggleStoryFilter(
  selected: readonly StoryFilter[],
  filter: StoryFilter,
): StoryFilter[] {
  if (!selected.includes(filter)) return ordered([...selected, filter])
  return selected.length > 1 ? selected.filter((entry) => entry !== filter) : [...selected]
}

export function countStoryFilters(nodes: readonly StoryNode[]): Record<StoryFilter, number> {
  const counts: Record<StoryFilter, number> = { work: 0, education: 0, projects: 0, milestones: 0 }
  for (const node of nodes) counts[storyFilterOf(node.kind)] += 1
  return counts
}

/** Filtra gli input del grafo prima del layout, così le lane si ricalcolano. */
export function filterStoryInput(
  input: {
    experiences: readonly Experience[]
    milestones: readonly Milestone[]
    storyEvents: readonly StoryEvent[]
  },
  selected: readonly StoryFilter[],
) {
  const visible = (kind: StoryNodeKind) => selected.includes(storyFilterOf(kind))
  return {
    experiences: input.experiences.filter((experience) => visible(experience.type)),
    milestones: input.milestones.filter((milestone) => visible(milestone.type)),
    storyEvents: input.storyEvents.filter((event) => visible(event.type)),
  }
}
