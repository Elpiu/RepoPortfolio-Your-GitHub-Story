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
  rails: StoryRails
}

/**
 * Binari da disegnare nella riga del nodo (le righe vanno dal più recente al più
 * vecchio). Il binario 0 è sempre continuo; questi descrivono i rami (lane > 0).
 */
export type StoryRails = {
  /** Rami che attraversano tutta la riga. */
  through: number[]
  /** Rami che in cima alla riga rientrano nel binario principale (merge). */
  mergeTop: number[]
  /**
   * Ramo del nodo stesso (lane > 0): da dove arriva in cima alla riga.
   * `through` = continua dalla riga sopra, `merge` = rientra qui in cima,
   * `open` = esperienza in corso, ramo ancora aperto. null per il binario 0.
   */
  own: 'through' | 'merge' | 'open' | null
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

const NO_RAILS: StoryRails = { through: [], mergeTop: [], own: null }

export function layoutStory(
  experiences: readonly Experience[],
  milestones: readonly Milestone[],
  options: StoryLayoutOptions,
): StoryGraph {
  const lanes: Array<Array<{ start: string; end: string }>> = [[], [], []]
  const nodes: StoryNode[] = []

  // Il binario principale racconta il lavoro: prima si piazzano i lavori, poi
  // la formazione nel primo binario libero. Un binario è libero se nessun
  // intervallo lo occupa; finire e iniziare nello stesso mese non è sovrapporsi.
  const sortedExperiences = [...experiences].sort(
    (left, right) =>
      (left.type === right.type ? 0 : left.type === 'work' ? -1 : 1) ||
      left.start.localeCompare(right.start) ||
      left.id.localeCompare(right.id),
  )

  for (const experience of sortedExperiences) {
    const span = { start: experience.start, end: experience.end ?? options.now }
    const overlaps = (other: { start: string; end: string }) =>
      span.start < other.end && other.start < span.end
    let lane = lanes.findIndex((taken) => !taken.some(overlaps))
    if (lane === -1) lane = lanes.length - 1
    lanes[lane]!.push(span)

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
      rails: NO_RAILS,
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
      rails: NO_RAILS,
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
      rails: NO_RAILS,
    })
  }

  nodes.sort(
    (left, right) =>
      right.date.localeCompare(left.date) ||
      KIND_ORDER[left.kind] - KIND_ORDER[right.kind] ||
      left.id.localeCompare(right.id),
  )

  return {
    nodes: withRails(nodes, options.now),
    laneCount: Math.max(1, ...nodes.map((node) => node.lane + 1)),
  }
}

/**
 * Collega i rami tra le righe: un'esperienza su lane > 0 si stacca dal binario
 * principale nella sua riga (inizio) e lo attraversa verso l'alto fino alla
 * riga più recente che cade entro la sua fine, dove rientra (merge). Se è in
 * corso resta aperta fino in cima.
 */
function withRails(nodes: readonly StoryNode[], now: string): StoryNode[] {
  const rails = nodes.map(() => ({
    through: [] as number[],
    mergeTop: [] as number[],
    own: null as StoryRails['own'],
  }))

  nodes.forEach((node, row) => {
    if (node.lane === 0 || (node.kind !== 'work' && node.kind !== 'education')) return
    const end = node.end ?? now
    // Righe ordinate dalla più recente: la prima con data <= fine apre lo span.
    let top = nodes.findIndex((other) => other.date <= end)
    if (top === -1 || top > row) top = row

    for (let index = top; index < row; index += 1) {
      if (index === top && !node.current) rails[index]!.mergeTop.push(node.lane)
      else rails[index]!.through.push(node.lane)
    }
    rails[row]!.own = top < row ? 'through' : node.current ? 'open' : 'merge'
  })

  return nodes.map((node, row) => ({ ...node, rails: rails[row]! }))
}
