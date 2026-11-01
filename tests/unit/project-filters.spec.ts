import { describe, expect, it } from 'vitest'
import {
  ALL_TAB,
  OPEN_SOURCE_TAB,
  PROJECTS_PAGE_SIZE,
  filterProjects,
  getLanguageTabs,
  getLanguages,
  paginate,
} from '../../shared/utils/project-filters'
import { fixtureRepositories } from '../helpers/repositories'

const repositories = fixtureRepositories()

describe('filterProjects', () => {
  it('cerca in nome, descrizione e topics, case-insensitive', () => {
    expect(filterProjects(repositories, { q: 'NUXT' }).map((repo) => repo.name)).toEqual([
      'alpha',
      'eta',
    ])
    expect(filterProjects(repositories, { q: 'spring' }).map((repo) => repo.name)).toEqual(['beta'])
  })

  it('combina filtri in AND', () => {
    expect(filterProjects(repositories, { q: 'nuxt', lang: 'Java' })).toHaveLength(0)
  })

  it('ordina per stelle desc', () => {
    const result = filterProjects(repositories, { sort: 'stars' })
    expect(result[0]?.name).toBe('alpha')
  })

  it('filtra per tab Open Source', () => {
    const result = filterProjects(repositories, { tab: OPEN_SOURCE_TAB })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((repo) => repo.license !== null)).toBe(true)
  })

  it('filtra per tab linguaggio', () => {
    const result = filterProjects(repositories, { tab: 'lang:Vue' })
    expect(result.map((repo) => repo.name)).toEqual(['gamma'])
  })

  it('lo stato iniziale non filtra', () => {
    expect(filterProjects(repositories, { tab: ALL_TAB })).toHaveLength(repositories.length)
  })
})

describe('getLanguageTabs', () => {
  it('deriva i tre linguaggi principali', () => {
    expect(getLanguageTabs(repositories).map((tab) => tab.label)).toEqual([
      'TypeScript',
      'Java',
      'Vue',
    ])
  })
})

describe('getLanguages', () => {
  it('elenca i linguaggi univoci e ordinati', () => {
    const languages = getLanguages(repositories)
    expect(languages).toContain('TypeScript')
    expect(languages).toContain('PHP')
    expect(new Set(languages).size).toBe(languages.length)
    expect(languages).toEqual([...languages].sort((left, right) => left.localeCompare(right)))
  })
})

describe('paginate', () => {
  it('mostra 12 elementi e poi tutti', () => {
    expect(paginate(repositories, 1)).toHaveLength(PROJECTS_PAGE_SIZE)
    expect(paginate(repositories, 2)).toHaveLength(repositories.length)
  })
})
