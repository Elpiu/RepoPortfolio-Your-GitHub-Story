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
    // Il lavoro tiene il binario principale; lo studio in parallelo è un ramo.
    expect(lanes.get('job')).toBe(0)
    expect(lanes.get('uni')).toBe(1)
    expect(nodes.find((node) => node.id === 'job')?.current).toBe(true)
  })

  it('lavori in sequenza restano sul principale, anche con cambio nello stesso mese', () => {
    const { nodes } = layoutStory(
      [
        experience('unisa', 'education', '2019-09', '2022-07'),
        experience('nexsoft', 'work', '2022-07', '2024-06'),
        experience('system-management', 'work', '2024-05', '2025-09'),
        experience('neverhack', 'work', '2025-09', null),
      ],
      [],
      { now: '2026-11' },
    )
    const lanes = Object.fromEntries(nodes.map((node) => [node.id, node.lane]))
    expect(lanes).toEqual({ neverhack: 0, 'system-management': 1, nexsoft: 0, unisa: 0 })
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

describe('binari della story', () => {
  const railsById = (graph: ReturnType<typeof layoutStory>) =>
    Object.fromEntries(graph.nodes.map((node) => [node.id, { lane: node.lane, ...node.rails }]))

  it('un ramo si stacca nella sua riga e rientra nella riga della sua fine', () => {
    // Caso reale: Nexsoft e System Management si sovrappongono, NEVERHACK è in corso.
    const graph = layoutStory(
      [
        experience('nexsoft', 'work', '2022-07', '2024-06'),
        experience('system-management', 'work', '2024-05', '2025-09'),
        experience('neverhack', 'work', '2025-09', null),
      ],
      [],
      { now: '2026-11' },
    )
    expect(graph.nodes.map((node) => node.id)).toEqual([
      'neverhack',
      'system-management',
      'nexsoft',
    ])
    expect(railsById(graph)).toEqual({
      neverhack: { lane: 0, through: [], mergeTop: [1], own: null },
      'system-management': { lane: 1, through: [], mergeTop: [], own: 'through' },
      nexsoft: { lane: 0, through: [], mergeTop: [], own: null },
    })
  })

  it('un ramo attraversa le righe intermedie e resta aperto se in corso', () => {
    const events: StoryEvent[] = [2023, 2024].map((year) => ({
      id: `auto-repo-${year}`,
      type: 'repo',
      date: `${year}-03`,
      title: String(year),
      description: null,
      repoSlug: String(year),
      link: 'https://github.com/me/x',
      tags: [],
    }))
    const graph = layoutStory(
      [experience('job', 'work', '2020-01', null), experience('uni', 'education', '2022-09', null)],
      [],
      { now: '2026-11', storyEvents: events },
    )
    const rails = railsById(graph)
    expect(rails.uni).toMatchObject({ lane: 1, own: 'through' })
    expect(rails['auto-repo-2024']).toMatchObject({ through: [1], mergeTop: [] })
    expect(rails['auto-repo-2023']).toMatchObject({ through: [1], mergeTop: [] })
  })

  it('senza righe più recenti entro la fine, il ramo rientra in cima alla sua riga', () => {
    const graph = layoutStory(
      [
        experience('job', 'work', '2019-01', '2026-01'),
        experience('side', 'work', '2020-01', '2020-06'),
      ],
      [],
      { now: '2026-11' },
    )
    expect(railsById(graph).side).toMatchObject({ lane: 1, own: 'merge', through: [] })
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
