import { describe, expect, it } from 'vitest'
import type { Milestone } from '../../shared/schemas/profile'
import type { StoryEvent } from '../../shared/types'
import { yearsOfExperience } from '../../shared/utils/experience'
import { layoutStory } from '../../shared/utils/story-graph'

const experience = (id: string, type: 'work' | 'education', start: string, end: string | null) => ({
  id,
  type,
  title: id,
  organization: 'Org',
  location: 'Remote',
  start,
  end,
  description: 'Description',
  highlights: [],
})

describe('layoutStory', () => {
  it('mette due esperienze sovrapposte su lane diverse', () => {
    const { nodes } = layoutStory(
      [
        experience('job', 'work', '2021-01', null),
        experience('uni', 'education', '2019-09', '2022-07'),
      ],
      [],
      { now: '2026-10' },
    )
    const lanes = new Map(nodes.map((node) => [node.id, node.lane]))
    expect(lanes.get('uni')).toBe(0)
    expect(lanes.get('job')).toBe(1)
    expect(nodes.find((node) => node.id === 'job')?.current).toBe(true)
  })

  it('non supera 3 lane', () => {
    const overlapping = Array.from({ length: 5 }, (_, index) =>
      experience(`e${index}`, 'work', '2020-01', '2021-01'),
    )
    const { nodes, laneCount } = layoutStory(overlapping, [], { now: '2026-10' })
    expect(Math.max(...nodes.map((node) => node.lane))).toBe(2)
    expect(laneCount).toBe(3)
  })

  it('mette i punti sul tronco e ordina per data decrescente', () => {
    const milestones: Milestone[] = [
      { id: 'm1', type: 'milestone', date: '2024-01', title: 'One', description: 'x', tags: [] },
      { id: 'm2', type: 'milestone', date: '2025-01', title: 'Two', description: 'y', tags: [] },
    ]
    const { nodes } = layoutStory([], milestones, { now: '2026-10' })
    expect(nodes.map((node) => node.id)).toEqual(['m2', 'm1'])
    expect(nodes.every((node) => node.lane === 0)).toBe(true)
  })

  it('un milestone curato vince sull evento automatico', () => {
    const milestones: Milestone[] = [
      {
        id: 'curated',
        type: 'repo',
        date: '2024-01',
        title: 'Curated',
        description: 'x',
        repo: 'alpha',
        tags: [],
      },
    ]
    const storyEvents: StoryEvent[] = [
      {
        id: 'auto-repo-alpha',
        type: 'repo',
        date: '2023-01',
        title: 'alpha',
        description: null,
        repoSlug: 'alpha',
        link: 'https://github.com/Elpiu/alpha',
        tags: [],
      },
      {
        id: 'auto-repo-beta',
        type: 'repo',
        date: '2023-02',
        title: 'beta',
        description: null,
        repoSlug: 'beta',
        link: 'https://github.com/Elpiu/beta',
        tags: [],
      },
    ]
    const { nodes } = layoutStory([], milestones, { now: '2026-10', storyEvents })
    expect(nodes.map((node) => node.id)).toEqual(['curated', 'auto-repo-beta'])
  })
})

describe('yearsOfExperience', () => {
  it('calcola gli anni pieni', () => {
    expect(yearsOfExperience('2022-07', '2026-10-30T00:00:00Z')).toBe(4)
    expect(yearsOfExperience('2022-12', '2026-10-30T00:00:00Z')).toBe(3)
  })

  it('restituisce null senza inizio o con data futura', () => {
    expect(yearsOfExperience(null, '2026-10-30T00:00:00Z')).toBeNull()
    expect(yearsOfExperience('2027-01', '2026-10-30T00:00:00Z')).toBeNull()
  })
})
