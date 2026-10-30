import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'
import type { Profile } from '../schemas/profile'
import { profileSchema } from '../schemas/profile'
import { repoStorySchema } from '../schemas/repo-story'
import { siteSchema } from '../schemas/site'

export function relativePath(filePath: string): string {
  return resolve(filePath)
    .replace(process.cwd(), '')
    .replace(/^[\\/]/, '')
    .replaceAll('\\', '/')
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path
        .map((segment, index) =>
          typeof segment === 'number'
            ? `[${segment}]`
            : index === 0
              ? String(segment)
              : `.${String(segment)}`,
        )
        .join('')
      return `${path || '(root)'}: ${issue.message}`
    })
    .join('\n  - ')
}

export function parseJsonFile<T extends z.ZodType>(schema: T, filePath: string): z.infer<T> {
  const file = relativePath(filePath)
  let raw: unknown

  try {
    raw = JSON.parse(readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''))
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`[validate-data] ${file}: JSON non valido — ${reason}`, { cause: error })
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new Error(`[validate-data] ${file}: dati non validi\n  - ${formatIssues(result.error)}`)
  }

  return result.data
}

export function assertSameShape(profiles: Record<string, Profile>): void {
  const entries = Object.entries(profiles)
  if (entries.length < 2) return

  const [referenceCode, reference] = entries[0]!
  const shape = (profile: Profile) => ({
    experiences: profile.experiences.map((experience) => experience.id).sort(),
    milestones: profile.milestones.map((milestone) => milestone.id).sort(),
    skillGroups: profile.skills.groups.map((group) => group.id).sort(),
  })
  const expected = shape(reference)

  for (const [code, profile] of entries.slice(1)) {
    const actual = shape(profile)
    for (const key of ['experiences', 'milestones', 'skillGroups'] as const) {
      if (actual[key].join('\u0000') !== expected[key].join('\u0000')) {
        throw new Error(
          `[validate-data] data/profile/${code}.json: "${key}" non allineate a ${referenceCode}.json (${actual[key].join(', ') || 'vuoto'} ≠ ${expected[key].join(', ') || 'vuoto'})`,
        )
      }
    }
  }
}

export function assertUniqueIds(items: Array<{ id: string }>): void {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(
        `[validate-data] id duplicato: "${item.id}" (esperienze e milestone condividono lo stesso grafo)`,
      )
    }
    seen.add(item.id)
  }
}

export function assertAtMostOneCurrentJob(profile: Profile, code: string): void {
  const current = profile.experiences.filter(
    (experience) => experience.type === 'work' && experience.end === null,
  )
  if (current.length > 1) {
    throw new Error(
      `[validate-data] data/profile/${code}.json: al massimo un lavoro corrente (end: null), trovati ${current.length}`,
    )
  }
}

export function assertLocaleMatches(code: string, profile: Profile): void {
  if (profile.locale !== code) {
    throw new Error(
      `[validate-data] data/profile/${code}.json: "locale" è "${profile.locale}", atteso "${code}"`,
    )
  }
}

export function assertLocalesHaveProfiles(
  site: z.infer<typeof siteSchema>,
  profiles: Record<string, Profile>,
): void {
  for (const locale of site.locales) {
    if (!profiles[locale.code]) {
      throw new Error(
        `[validate-data] manca data/profile/${locale.code}.json per la lingua "${locale.code}" dichiarata in data/site.json`,
      )
    }
  }
}

export const schemas = {
  site: siteSchema,
  profile: profileSchema,
  'repo-story': repoStorySchema,
} as const

export function jsonSchemaFor(schema: z.ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema, {
    io: 'input',
    target: 'draft-2020-12',
  }) as Record<string, unknown>
}

export function writeJsonSchemas(directory: string): void {
  mkdirSync(directory, { recursive: true })

  for (const [name, schema] of Object.entries(schemas)) {
    const destination = resolve(directory, `${name}.schema.json`)
    const contents = `${JSON.stringify(jsonSchemaFor(schema), null, 2)}\n`
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, contents, 'utf8')
  }
}
