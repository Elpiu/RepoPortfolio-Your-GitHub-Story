import { describe, expect, it } from 'vitest'
import type { Experience, Milestone } from '../../shared/schemas/profile'
import type { StoryEvent } from '../../shared/types'
import { layoutStory } from '../../shared/utils/story-graph'
import {
  countStoryFilters,
  defaultStoryFilters,
  filterStoryInput,
  parseStoryFilters,
  serializeStoryFilters,
  toggleStoryFilter,
} from '../../shared/utils/story-filters'

const experience = (id: string, type: Experience['type'], start: string, end: string | null) =>
  ({
    id,
    type,
    title: id,
    organization: id,
    location: 'x',
    start,
    end,
    description: 'x',
    highlights: [],
  }) satisfies Experience

const experiences = [
  experience('job-a', 'work', '2022-07', '2024-06'),
  experience('job-b', 'work', '2024-07', null),
  experience('uni', 'education', '2019-09', '2022-07'),
]
const milestones: Milestone[] = [
  { id: 'm', type: 'milestone', date: '2023-01', title: 'm', description: 'x', tags: [] },
]
const storyEvents: StoryEvent[] = [
  {
    id: 'auto-repo-a',
    type: 'repo',
    date: '2023-05',
    title: 'a',
    description: null,
    repoSlug: 'a',
    link: 'https://github.com/me/a',
    tags: [],
  },
]

describe('story filters', () => {
  it('il default è il lavoro, oppure tutto se non c è lavoro', () => {
    expect(defaultStoryFilters(['work', 'education', 'projects'])).toEqual(['work'])
    expect(defaultStoryFilters(['education', 'projects'])).toEqual(['education', 'projects'])
  })

  it('legge la query ignorando valori sconosciuti o non disponibili', () => {
    const available = ['work', 'education', 'projects'] as const
    expect(parseStoryFilters('education,work', available)).toEqual(['work', 'education'])
    expect(parseStoryFilters('milestones,nope', available)).toBeNull()
    expect(parseStoryFilters('', available)).toBeNull()
  })

  it('non scrive nella query il default', () => {
    const available = ['work', 'education'] as const
    expect(serializeStoryFilters(['work'], available)).toBeNull()
    expect(serializeStoryFilters(['education', 'work'], available)).toBe('work,education')
  })

  it('il toggle lascia sempre almeno un filtro', () => {
    expect(toggleStoryFilter(['work'], 'education')).toEqual(['work', 'education'])
    expect(toggleStoryFilter(['work', 'education'], 'work')).toEqual(['education'])
    expect(toggleStoryFilter(['work'], 'work')).toEqual(['work'])
  })

  it('filtra prima del layout: solo lavoro, lane ricalcolate', () => {
    const input = filterStoryInput({ experiences, milestones, storyEvents }, ['work'])
    const graph = layoutStory(input.experiences, input.milestones, {
      now: '2026-11',
      storyEvents: input.storyEvents,
    })
    expect(graph.nodes.map((node) => node.kind)).toEqual(['work', 'work'])
    expect(graph.laneCount).toBe(1)
  })

  it('conta i nodi per filtro', () => {
    const graph = layoutStory(experiences, milestones, { now: '2026-11', storyEvents })
    expect(countStoryFilters(graph.nodes)).toEqual({
      work: 2,
      education: 1,
      projects: 1,
      milestones: 1,
    })
  })
})
