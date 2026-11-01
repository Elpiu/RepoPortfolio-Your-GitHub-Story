import { describe, expect, it } from 'vitest'
import type { RepoStory } from '../../shared/schemas/repo-story'
import { resolvePreview } from '../../server/utils/preview'
import { resolveReadmeLink } from '../../shared/utils/preview'
import { fixtureNodes } from '../helpers/repositories'

const manifest: RepoStory = {
  preview: 'docs/hero.png',
  hidden: false,
  story: true,
}

describe('resolvePreview', () => {
  it('usa il manifest quando il file esiste', async () => {
    const result = await resolvePreview(fixtureNodes()[0]!, {
      manifest,
      head: async () => true,
    })
    expect(result).toMatchObject({
      previewSource: 'manifest',
      previewImage: 'https://raw.githubusercontent.com/Elpiu/alpha/develop/docs/hero.png',
    })
  })

  it('trova un file per convenzione in .github', async () => {
    const result = await resolvePreview(fixtureNodes()[0]!, {
      featured: true,
      head: async (url) => url.endsWith('/.github/preview.png'),
    })
    expect(result).toMatchObject({
      previewSource: 'convention',
      previewImage: 'https://raw.githubusercontent.com/Elpiu/alpha/develop/.github/preview.png',
    })
  })

  it('con più file per convenzione vince il primo in ordine di priorità', async () => {
    const result = await resolvePreview(fixtureNodes()[0]!, {
      featured: true,
      head: async (url) => url.endsWith('/docs/cover.png') || url.endsWith('/.github/hero.png'),
    })
    expect(result.previewImage).toMatch(/\/docs\/cover\.png$/)
  })

  it('scarta i badge del README e usa la prima immagine utile', async () => {
    const readme = '![ci](https://img.shields.io/badge/x.svg)\n![shot](docs/shot.png)'
    const result = await resolvePreview(fixtureNodes()[0]!, {
      readme,
      head: async () => true,
    })
    expect(result).toMatchObject({
      previewSource: 'readme',
      previewImage: 'https://raw.githubusercontent.com/Elpiu/alpha/develop/docs/shot.png',
    })
  })

  it('ricade sul placeholder deterministico', async () => {
    const result = await resolvePreview(fixtureNodes()[0]!, {
      featured: false,
      head: async () => false,
    })
    expect(result).toEqual({ previewSource: 'placeholder', previewImage: null })
  })
})

describe('resolveReadmeLink', () => {
  const ref = { owner: 'Elpiu', repo: 'alpha', branch: 'develop' }

  it('risolve i link relativi sul blob del branch', () => {
    expect(resolveReadmeLink('docs/guide.md', ref)).toBe(
      'https://github.com/Elpiu/alpha/blob/develop/docs/guide.md',
    )
  })

  it('mantiene link esterni, mailto e anchor', () => {
    expect(resolveReadmeLink('https://example.com', ref)).toBe('https://example.com')
    expect(resolveReadmeLink('mailto:you@example.com', ref)).toBe('mailto:you@example.com')
    expect(resolveReadmeLink('#section', ref)).toBe('#section')
  })

  it('rifiuta schemi pericolosi', () => {
    expect(resolveReadmeLink('javascript:alert(1)', ref)).toBeNull()
  })
})
