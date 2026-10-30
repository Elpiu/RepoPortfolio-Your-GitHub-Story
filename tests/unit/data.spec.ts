import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Profile } from '../../shared/schemas/profile'
import { profileSchema } from '../../shared/schemas/profile'
import { siteSchema } from '../../shared/schemas/site'
import {
  assertAtMostOneCurrentJob,
  assertSameShape,
  assertUniqueIds,
} from '../../shared/utils/validation'

const site = siteSchema.parse(JSON.parse(readFileSync(resolve('data/site.json'), 'utf8')))

const profiles: Record<string, Profile> = Object.fromEntries(
  site.locales.map(({ code }) => [
    code,
    profileSchema.parse(JSON.parse(readFileSync(resolve(`data/profile/${code}.json`), 'utf8'))),
  ]),
)

describe('data/', () => {
  it('site.json ha esattamente una lingua di default', () => {
    expect(site.locales.filter((locale) => locale.default)).toHaveLength(1)
  })

  it('ogni lingua ha il proprio profilo e lo dichiara', () => {
    for (const locale of site.locales) {
      expect(profiles[locale.code]?.locale).toBe(locale.code)
    }
  })

  it('tutte le lingue hanno la stessa struttura', () => {
    expect(() => assertSameShape(profiles)).not.toThrow()
  })

  it('gli id di esperienze e milestone sono univoci', () => {
    for (const profile of Object.values(profiles)) {
      expect(() => assertUniqueIds([...profile.experiences, ...profile.milestones])).not.toThrow()
    }
  })

  it('c e al massimo un lavoro corrente per lingua', () => {
    for (const [code, profile] of Object.entries(profiles)) {
      expect(() => assertAtMostOneCurrentJob(profile, code)).not.toThrow()
    }
  })

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
