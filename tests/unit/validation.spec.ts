import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Profile } from '../../shared/schemas/profile'
import { profileSchema } from '../../shared/schemas/profile'
import {
  assertAtMostOneCurrentJob,
  assertSameShape,
  assertUniqueIds,
  parseJsonFile,
} from '../../shared/utils/validation'

const baseProfile: Profile = {
  locale: 'en',
  meta: {
    name: 'A',
    fullName: 'A B',
    role: 'dev',
    tagline: 'x',
    available: false,
  },
  about: { paragraphs: ['x'] },
  skills: {
    groups: [{ id: 'languages', label: 'Languages', items: [{ name: 'TypeScript' }] }],
  },
  experiences: [
    {
      id: 'job',
      type: 'work',
      title: 'Dev',
      organization: 'Acme',
      location: 'Remote',
      start: '2024-01',
      end: null,
      description: 'x',
      highlights: [],
    },
  ],
  milestones: [],
  books: [],
}

describe('validazione dei dati owner', () => {
  it('rileva id duplicati tra esperienze e milestone', () => {
    const profile: Profile = {
      ...baseProfile,
      milestones: [
        {
          id: 'job',
          type: 'milestone',
          date: '2025-01',
          title: 'x',
          description: 'x',
          tags: [],
        },
      ],
    }
    expect(() => assertUniqueIds([...profile.experiences, ...profile.milestones])).toThrow(
      /id duplicato/,
    )
  })

  it('rileva strutture diverse tra lingue', () => {
    const italian: Profile = {
      ...baseProfile,
      locale: 'it',
      experiences: [],
    }
    expect(() => assertSameShape({ en: baseProfile, it: italian })).toThrow(/non allineate/)
  })

  it('blocca più di un lavoro corrente', () => {
    const secondJob = {
      ...baseProfile.experiences[0]!,
      id: 'job-2',
    }
    expect(() =>
      assertAtMostOneCurrentJob(
        { ...baseProfile, experiences: [...baseProfile.experiences, secondJob] },
        'en',
      ),
    ).toThrow(/al massimo un lavoro corrente/)
  })

  it('riporta file e percorso del campo quando il JSON non è valido', () => {
    const directory = mkdtempSync(join(tmpdir(), 'rp-validation-'))
    try {
      const file = join(directory, 'profile.json')
      writeFileSync(file, JSON.stringify({ locale: 'en', meta: {} }))

      expect(() => parseJsonFile(profileSchema, file)).toThrow(
        /profile\.json: dati non validi\n {2}- meta\.name: /,
      )
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('i libri sono opzionali, "read" di default e allineati tra lingue', () => {
    expect(profileSchema.parse({ ...baseProfile, books: undefined }).books).toEqual([])
    const book = { id: 'b', title: 'T', author: 'A' }
    const english = profileSchema.parse({ ...baseProfile, books: [book] })
    expect(english.books[0]?.status).toBe('read')
    expect(() => assertSameShape({ en: english, it: { ...english, books: [] } })).toThrow(
      /"books" non allineate/,
    )
    expect(() => assertUniqueIds([book, book], 'books')).toThrow(/id duplicato: "b" \(books\)/)
    // Copertina e link facoltativi, solo https.
    expect(() =>
      profileSchema.parse({ ...baseProfile, books: [{ ...book, cover: 'http://x.test/c.jpg' }] }),
    ).toThrow()
    expect(
      profileSchema.parse({
        ...baseProfile,
        books: [{ ...book, cover: 'https://x.test/c.jpg', url: 'https://x.test/b' }],
      }).books[0],
    ).toMatchObject({ cover: 'https://x.test/c.jpg', url: 'https://x.test/b' })
  })

  it('riporta un errore leggibile per JSON malformato', () => {
    const directory = mkdtempSync(join(tmpdir(), 'rp-validation-'))
    try {
      const file = join(directory, 'profile.json')
      writeFileSync(file, '{ nope')

      expect(() => parseJsonFile(profileSchema, file)).toThrow(/JSON non valido/)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
