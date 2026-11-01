import { describe, expect, it } from 'vitest'
import { computeActivity } from '../../server/utils/activity'
import { computeLanguageStats } from '../../server/utils/languages'
import { buildStoryEvents } from '../../server/utils/story-events'
import { fixtureRepositories } from '../helpers/repositories'

describe('computeLanguageStats', () => {
  it('calcola percentuali che sommano a 100', () => {
    const stats = computeLanguageStats(fixtureRepositories())
    const sum = stats.reduce((total, entry) => total + entry.percent, 0)
    expect(Math.round(sum * 10) / 10).toBe(100)
    expect(stats[0]?.name).toBe('TypeScript')
    expect(stats.some((entry) => entry.name === 'Other')).toBe(true)
    expect(stats.length).toBeLessThanOrEqual(9)
  })

  it('restituisce un array vuoto senza linguaggi', () => {
    expect(computeLanguageStats([])).toEqual([])
  })
})

describe('computeActivity', () => {
  it('usa il repository con pushedAt più recente', () => {
    const activity = computeActivity(fixtureRepositories())
    expect(activity).toMatchObject({
      repoName: 'alpha',
      repoSlug: 'alpha',
      branch: 'develop',
      pushedAt: '2026-10-29T09:30:00Z',
      commit: null,
    })
  })

  it('restituisce null senza push', () => {
    expect(
      computeActivity(
        fixtureRepositories().map((repository) => ({ ...repository, pushedAt: null })),
      ),
    ).toBeNull()
  })
})

describe('buildStoryEvents', () => {
  const config = { autoEvents: true, maxAutoEvents: 8 }

  it('genera eventi repo per i featured per stelle', () => {
    const events = buildStoryEvents(fixtureRepositories(), config)
    expect(events).toHaveLength(6)
    expect(events.map((event) => event.repoSlug)).toContain('alpha')
    expect(events.every((event) => event.type === 'repo')).toBe(true)
    expect(events).toEqual(
      [...events].sort(
        (left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id),
      ),
    )
  })

  it('rispetta maxAutoEvents e story: false', () => {
    const manifests = new Map([['alpha', { hidden: false, story: false }]])
    const events = buildStoryEvents(
      fixtureRepositories(),
      { ...config, maxAutoEvents: 3 },
      manifests,
    )
    expect(events).toHaveLength(3)
    expect(events.map((event) => event.repoSlug)).not.toContain('alpha')
  })

  it('non genera eventi se disattivati', () => {
    expect(buildStoryEvents(fixtureRepositories(), { ...config, autoEvents: false })).toEqual([])
  })
})
