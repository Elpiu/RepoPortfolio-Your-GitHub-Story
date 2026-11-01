import { existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveDataIcon } from '../../server/utils/data-icons'
import { profileSchema } from '../../shared/schemas/profile'
import { siteSchema } from '../../shared/schemas/site'
import { loadDataDir } from '../../shared/utils/validation'

// data/ è il template per chi clona; datasets/* sono payload alternativi
// selezionabili con PORTFOLIO_DATA_DIR. Devono restare tutti validi.
const datasetsRoot = resolve('datasets')
const dataDirs = [
  'data',
  ...(existsSync(datasetsRoot)
    ? readdirSync(datasetsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join('datasets', entry.name))
    : []),
]

describe.each(dataDirs)('%s/', (dir) => {
  const { site, profiles } = loadDataDir(resolve(dir))

  it('site.json ha esattamente una lingua di default', () => {
    expect(site.locales.filter((locale) => locale.default)).toHaveLength(1)
  })

  it('ogni lingua ha il proprio profilo e lo dichiara', () => {
    for (const locale of site.locales) {
      expect(profiles[locale.code]?.locale).toBe(locale.code)
    }
  })

  it('le icone delle competenze esistono nelle collezioni installate', () => {
    for (const profile of Object.values(profiles)) {
      for (const item of profile.skills.groups.flatMap((group) => group.items)) {
        if (item.icon) expect(resolveDataIcon(item.icon), item.icon).not.toBeNull()
      }
    }
  })
})

describe('schemi minimi', () => {
  it('un profilo minimo è valido', () => {
    const minimal = {
      locale: 'en',
      meta: { name: 'A', fullName: 'A B', role: 'dev', tagline: 'x' },
      about: { paragraphs: ['x'] },
    }
    expect(() => profileSchema.parse(minimal)).not.toThrow()
  })

  it('un site.json minimo è valido', () => {
    const minimal = {
      links: { email: 'you@example.com' },
      locales: [{ code: 'en', language: 'en-US', name: 'English', default: true }],
    }
    expect(() => siteSchema.parse(minimal)).not.toThrow()
  })

  it('rifiuta due lingue di default', () => {
    const invalid = {
      links: { email: 'you@example.com' },
      locales: [
        { code: 'en', language: 'en-US', name: 'English', default: true },
        { code: 'it', language: 'it-IT', name: 'Italiano', default: true },
      ],
    }
    expect(() => siteSchema.parse(invalid)).toThrow(/esattamente una lingua/)
  })
})
