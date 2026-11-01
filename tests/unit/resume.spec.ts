import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { profileSchema } from '../../shared/schemas/profile'
import { siteSchema } from '../../shared/schemas/site'
import { buildResume } from '../../server/utils/resume'
import { fixtureRepositories } from '../helpers/repositories'

const site = siteSchema.parse(JSON.parse(readFileSync(resolve('data/site.json'), 'utf8')))
const profile = profileSchema.parse(
  JSON.parse(readFileSync(resolve('data/profile/en.json'), 'utf8')),
)

describe('buildResume', () => {
  const resume = buildResume(profile, site, fixtureRepositories(), {
    username: 'Elpiu',
    siteUrl: 'https://example.github.io/portfolio/',
    syncedAt: '2026-10-30T00:00:00.000Z',
  })

  it('produce le sezioni JSON Resume principali', () => {
    expect(resume.basics.name).toBe(profile.meta.fullName)
    expect(resume.basics.email).toBe(site.links.email)
    expect(resume.basics.profiles[0]).toMatchObject({ network: 'GitHub', username: 'Elpiu' })
    expect(resume.work.length).toBeGreaterThan(0)
    expect(resume.education.length).toBeGreaterThan(0)
    expect(resume.skills.length).toBe(profile.skills.groups.length)
    expect(resume.projects).toHaveLength(6)
  })

  it('usa date ISO e non lascia undefined nel JSON', () => {
    expect(resume.work[0]?.startDate).toMatch(/^\d{4}-\d{2}-01$/)
    expect(resume.education[0]?.startDate).toMatch(/^\d{4}-\d{2}-01$/)
    const serialized = JSON.parse(JSON.stringify(resume)) as Record<string, unknown>
    expect(serialized).toHaveProperty('basics')
    expect(JSON.stringify(serialized)).not.toContain('undefined')
  })

  it('include i profili social solo se configurati', () => {
    expect(resume.basics.profiles.map((entry) => entry.network)).toContain('GitHub')
    expect(resume.basics.profiles.map((entry) => entry.network)).not.toContain('LinkedIn')
  })
})
