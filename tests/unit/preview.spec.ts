import { describe, expect, it } from 'vitest'
import type { RepoStory } from '../../shared/schemas/repo-story'
import { RUNTIME_CONVENTION_PATHS, firstExisting, resolvePreview } from '../../server/utils/preview'
import { LEGACY_PREVIEW_PATH, resolveReadmeLink } from '../../shared/utils/preview'
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

  it('con più file per convenzione vince la cartella, poi il nome, poi l estensione', async () => {
    const result = await resolvePreview(fixtureNodes()[0]!, {
      featured: true,
      head: async (url) =>
        url.endsWith('/docs/cover.png') ||
        url.endsWith('/.github/hero.png') ||
        url.endsWith('/.github/hero.jpg'),
    })
    expect(result.previewImage).toMatch(/\/\.github\/hero\.png$/)
  })

  it('trova tutte le estensioni documentate, non solo png', async () => {
    for (const file of ['screenshot.webp', 'docs/banner.avif', '.github/cover.jpeg', 'hero.gif']) {
      const result = await resolvePreview(fixtureNodes()[0]!, {
        featured: true,
        head: async (url) => url.endsWith(`/${file}`),
      })
      expect(result).toMatchObject({ previewSource: 'convention' })
      expect(result.previewImage).toMatch(new RegExp(`/${file.replace('.', '\\.')}$`))
    }
  })

  it('il path legacy è l ultimo candidato e i non featured saltano la convenzione', async () => {
    expect(RUNTIME_CONVENTION_PATHS.at(-1)).toBe(LEGACY_PREVIEW_PATH)
    expect(RUNTIME_CONVENTION_PATHS).toHaveLength(3 * 6 * 6 + 1)
    const result = await resolvePreview(fixtureNodes()[0]!, {
      featured: false,
      head: async (url) => url.endsWith('/.github/preview.png'),
    })
    expect(result.previewSource).toBe('placeholder')
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

describe('firstExisting', () => {
  const urls = Array.from({ length: 30 }, (_, index) => `u${index}`)

  it('si ferma al primo blocco con un risultato e rispetta l ordine', async () => {
    const asked: string[] = []
    const found = await firstExisting(
      urls,
      async (url) => {
        asked.push(url)
        return url === 'u13' || url === 'u15' || url === 'u2'
      },
      12,
    )
    expect(found).toBe('u2')
    expect(asked).toHaveLength(12)
  })

  it('controlla i blocchi successivi solo se serve', async () => {
    const asked: string[] = []
    const found = await firstExisting(
      urls,
      async (url) => {
        asked.push(url)
        return url === 'u15' || url === 'u13'
      },
      12,
    )
    expect(found).toBe('u13')
    expect(asked).toHaveLength(24)
    expect(await firstExisting(urls, async () => false, 12)).toBeNull()
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
