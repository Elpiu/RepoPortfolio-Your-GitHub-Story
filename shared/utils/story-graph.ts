import type { Experience, Milestone } from '../schemas/profile'
import type { StoryEvent } from '../types'
import { slugify } from './repo'

export type StoryNodeKind = 'work' | 'education' | 'milestone' | 'repo' | 'release'

export type StoryNode = {
  id: string
  kind: StoryNodeKind
  date: string
  end: string | null
  title: string
  description: string | null
  organization: string | null
  location: string | null
  tags: string[]
  highlights: string[]
  link: string | null
  repoSlug: string | null
  lane: number
  current: boolean
  source: 'profile' | 'github'
}

export type StoryGraph = {
  nodes: StoryNode[]
  laneCount: number
}

export type StoryLayoutOptions = {
  now: string
  storyEvents?: readonly StoryEvent[]
}

const KIND_ORDER: Record<StoryNodeKind, number> = {
  milestone: 0,
  repo: 1,
  release: 2,
  work: 3,
  education: 4,
}

export function layoutStory(
  experiences: readonly Experience[],
  milestones: readonly Milestone[],
  options: StoryLayoutOptions,
): StoryGraph {
  const laneEnds: string[] = []
  const nodes: StoryNode[] = []

  const sortedExperiences = [...experiences].sort(
    (left, right) =>
      left.start.localeCompare(right.start) ||
      (left.type === right.type ? 0 : left.type === 'work' ? -1 : 1) ||
      left.id.localeCompare(right.id),
  )

  for (const experience of sortedExperiences) {
    const end = experience.end ?? options.now
    let lane = laneEnds.findIndex((laneEnd) => !laneEnd || laneEnd < experience.start)
    if (lane === -1) lane = laneEnds.length < 3 ? laneEnds.length : 2
    lane = Math.min(lane, 2)
    if (!laneEnds[lane] || end > laneEnds[lane]!) laneEnds[lane] = end

    nodes.push({
      id: experience.id,
      kind: experience.type,
      date: experience.start,
      end: experience.end,
      title: experience.title,
      description: experience.description,
      organization: experience.organization,
      location: experience.location,
      tags: [],
      highlights: experience.highlights,
      link: null,
      repoSlug: null,
      lane,
      current: experience.end === null,
      source: 'profile',
    })
  }

  const curated = new Set(
    milestones
      .filter((milestone) => milestone.repo)
      .map((milestone) => `${milestone.type}:${slugify(milestone.repo!)}`),
  )

  for (const milestone of milestones) {
    nodes.push({
      id: milestone.id,
      kind: milestone.type,
      date: milestone.date,
      end: null,
      title: milestone.title,
      description: milestone.description,
      organization: null,
      location: null,
      tags: milestone.tags,
      highlights: [],
      link: milestone.link ?? null,
      repoSlug: milestone.repo ? slugify(milestone.repo) : null,
      lane: 0,
      current: false,
      source: 'profile',
    })
  }

  for (const event of options.storyEvents ?? []) {
    if (curated.has(`${event.type}:${event.repoSlug}`)) continue
    nodes.push({
      id: event.id,
      kind: event.type,
      date: event.date,
      end: null,
      title: event.title,
      description: event.description,
      organization: null,
      location: null,
      tags: event.tags,
      highlights: [],
      link: event.link,
      repoSlug: event.repoSlug,
      lane: 0,
      current: false,
      source: 'github',
    })
  }

  nodes.sort(
    (left, right) =>
      right.date.localeCompare(left.date) ||
      KIND_ORDER[left.kind] - KIND_ORDER[right.kind] ||
      left.id.localeCompare(right.id),
  )

  return {
    nodes,
    laneCount: Math.max(1, ...nodes.map((node) => node.lane + 1)),
  }
}
