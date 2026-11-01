import { describe, expect, it } from 'vitest'
import type { Experience, Milestone } from '../../shared/schemas/profile'
import type { StoryEvent } from '../../shared/types'
import { layoutStory } from '../../shared/utils/story-graph'
import {
  countStoryFilters,
  defaultStoryView,
  filterStoryInput,
  parseStoryView,
  serializeStoryView,
  storyViews,
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

const layout = (view: Parameters<typeof filterStoryInput>[1]) => {
  const input = filterStoryInput({ experiences, milestones, storyEvents }, view)
  return layoutStory(input.experiences, input.milestones, {
    now: '2026-11',
    storyEvents: input.storyEvents,
  })
}

describe('story views', () => {
  it('il default è il lavoro, oppure tutto se non c è lavoro', () => {
    expect(defaultStoryView(['work', 'education', 'projects'])).toBe('work')
    expect(defaultStoryView(['education', 'projects'])).toBe('all')
  })

  it('offre "tutto" solo con più di un tipo', () => {
    expect(storyViews(['work', 'education'])).toEqual(['work', 'education', 'all'])
    expect(storyViews(['work'])).toEqual(['work'])
  })

  it('legge la query ignorando valori sconosciuti o non disponibili', () => {
    const available = ['work', 'education', 'projects'] as const
    expect(parseStoryView('education', available)).toBe('education')
    expect(parseStoryView('all', available)).toBe('all')
    expect(parseStoryView('milestones', available)).toBeNull()
    expect(parseStoryView('work,education', available)).toBeNull()
  })

  it('non scrive nella query il default', () => {
    const available = ['work', 'education'] as const
    expect(serializeStoryView('work', available)).toBeNull()
    expect(serializeStoryView('education', available)).toBe('education')
  })

  it('una vista sola alla volta, con lane ricalcolate', () => {
    const work = layout('work')
    expect(work.nodes.map((node) => node.kind)).toEqual(['work', 'work'])
    expect(work.laneCount).toBe(1)
    expect(layout('education').nodes.map((node) => node.kind)).toEqual(['education'])
    expect(layout('all').nodes).toHaveLength(5)
  })

  it('conta i nodi per tipo', () => {
    expect(countStoryFilters(layout('all').nodes)).toEqual({
      work: 2,
      education: 1,
      projects: 1,
      milestones: 1,
    })
  })
})
