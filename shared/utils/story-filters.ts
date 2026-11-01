import type { Experience, Milestone } from '../schemas/profile'
import type { StoryEvent } from '../types'
import type { StoryNode, StoryNodeKind } from './story-graph'

/** Viste della GitHub Story: ognuna raggruppa uno o più tipi di nodo; `all` li mostra tutti. */
export const STORY_FILTERS = ['work', 'education', 'projects', 'milestones'] as const
export type StoryFilter = (typeof STORY_FILTERS)[number]
export type StoryView = StoryFilter | 'all'

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

/** Viste selezionabili: i filtri con almeno un nodo, più `all` se ce n'è più di uno. */
export function storyViews(available: readonly StoryFilter[]): StoryView[] {
  return available.length > 1 ? [...available, 'all'] : [...available]
}

/** Default: la storia del lavoro; se non ci sono esperienze di lavoro, tutto. */
export function defaultStoryView(available: readonly StoryFilter[]): StoryView {
  return available.includes('work') ? 'work' : 'all'
}

/** Legge `?story=education`; null se assente o non disponibile. */
export function parseStoryView(value: string, available: readonly StoryFilter[]): StoryView | null {
  const view = value.trim() as StoryView
  return storyViews(available).includes(view) ? view : null
}

/** Valore per la query string; null quando coincide con il default. */
export function serializeStoryView(
  view: StoryView,
  available: readonly StoryFilter[],
): string | null {
  return view === defaultStoryView(available) ? null : view
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
  view: StoryView,
) {
  const visible = (kind: StoryNodeKind) => view === 'all' || storyFilterOf(kind) === view
  return {
    experiences: input.experiences.filter((experience) => visible(experience.type)),
    milestones: input.milestones.filter((milestone) => visible(milestone.type)),
    storyEvents: input.storyEvents.filter((event) => visible(event.type)),
  }
}
