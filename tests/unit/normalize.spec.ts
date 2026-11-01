import { describe, expect, it } from 'vitest'
import { assignUniqueSlugs } from '../../shared/utils/repo'
import { normalizeRepositories } from '../../server/utils/normalize'
import { fixtureNodes } from '../helpers/repositories'

const config = {
  username: 'Elpiu',
  excludedRepos: ['secret-repo'],
  includeForks: false,
  includeArchived: false,
  excludeProfileRepo: true,
}

describe('normalizeRepositories', () => {
  it('applica tutte le regole di esclusione', () => {
    const result = normalizeRepositories(fixtureNodes(), config)
    const names = result.repositories.map((repository) => repository.name)
    expect(names).not.toContain('forked-tool')
    expect(names).not.toContain('old-experiment')
    expect(names).not.toContain('Elpiu')
    expect(names).not.toContain('hidden-notes')
    expect(names).not.toContain('secret-repo')
    expect(result.excluded.map((entry) => entry.reason)).toEqual(
      expect.arrayContaining([
        'fork',
        'archived',
        'profile repository',
        'topic portfolio-hidden',
        'excludedRepos',
      ]),
    )
  })

  it('non assume il branch main', () => {
    const result = normalizeRepositories(fixtureNodes(), config)
    const alpha = result.repositories.find((repository) => repository.name === 'alpha')
    expect(alpha?.defaultBranch).toBe('develop')
  })

  it('normalizza descrizione, homepage, topics e licenza', () => {
    const nodes = fixtureNodes()
    const alpha = nodes.find((node) => node.name === 'alpha')!
    const delta = nodes.find((node) => node.name === 'delta')!
    const result = normalizeRepositories(
      [{ ...alpha, description: '  ', topics: ['Nuxt', 'NUXT', ' typescript '] }, delta],
      { ...config, excludedRepos: [] },
    )
    const normalizedAlpha = result.repositories.find((repository) => repository.name === 'alpha')
    const normalizedDelta = result.repositories.find((repository) => repository.name === 'delta')
    expect(normalizedAlpha?.description).toBeNull()
    expect(normalizedAlpha?.topics).toEqual(['nuxt', 'typescript'])
    expect(normalizedDelta?.license).toBeNull()
  })

  it('esclude i repository con hidden nel manifest', () => {
    const manifests = new Map([
      ['alpha', { hidden: true, story: true }],
      ['beta', { hidden: false, story: true }],
    ])
    const result = normalizeRepositories(fixtureNodes(), { ...config, manifests })
    expect(result.repositories.map((repository) => repository.name)).not.toContain('alpha')
    expect(result.repositories.map((repository) => repository.name)).toContain('beta')
  })

  it('non marca featured manuali: in modalità pubblica i pinned non esistono', () => {
    const result = normalizeRepositories(fixtureNodes(), config)
    expect(result.repositories.every((repository) => !repository.isPinned)).toBe(true)
    expect(result.repositories.every((repository) => repository.pinnedOrder === null)).toBe(true)
  })
})

describe('assignUniqueSlugs', () => {
  it('risolve le collisioni in modo deterministico', () => {
    const slugs = assignUniqueSlugs([
      { id: 20, name: 'my_repo' },
      { id: 10, name: 'my-repo' },
    ])
    expect(slugs.get(10)).toBe('my-repo')
    expect(slugs.get(20)).toBe('my-repo-20')
  })
})
