import { z } from 'zod'

const localeCode = z
  .string()
  .min(2)
  .regex(/^[a-z]{2}(-[A-Za-z0-9]+)*$/, 'Codice lingua atteso, es. "en" o "pt-BR"')

const isoMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato atteso: YYYY-MM')

export const localeSchema = z.object({
  code: localeCode,
  language: z.string().min(2),
  name: z.string().min(1),
  default: z.boolean().default(false),
})

export const githubConfigSchema = z.object({
  username: z.string().default(''),
  excludedRepos: z.array(z.string().min(1)).default([]),
  includeForks: z.boolean().default(false),
  includeArchived: z.boolean().default(false),
  excludeProfileRepo: z.boolean().default(true),
  maxRepos: z.number().int().positive().max(1000).default(300),
  readmeMaxBytes: z.number().int().positive().default(200_000),
})

export const linksSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1).nullable().default(null),
  linkedin: z.string().url().nullable().default(null),
  website: z.string().url().nullable().default(null),
  cvUrl: z.string().url().nullable().default(null),
})

export const careerSchema = z.object({
  start: isoMonth.nullable().default(null),
})

export const storyConfigSchema = z.object({
  autoEvents: z.boolean().default(true),
  includeReleases: z.boolean().default(true),
  maxAutoEvents: z.number().int().min(0).max(50).default(8),
})

export const deploySchema = z.object({
  customDomain: z.string().min(1).nullable().default(null),
})

export const seoSchema = z.object({
  siteName: z.string().min(1).nullable().default(null),
  twitterHandle: z.string().min(1).nullable().default(null),
})

export const siteSchema = z
  .object({
    $schema: z.string().optional(),
    github: githubConfigSchema.prefault({}),
    links: linksSchema,
    career: careerSchema.prefault({}),
    story: storyConfigSchema.prefault({}),
    locales: z.array(localeSchema).min(1, 'Serve almeno una lingua'),
    deploy: deploySchema.prefault({}),
    seo: seoSchema.prefault({}),
  })
  .refine((site) => site.locales.filter((locale) => locale.default).length === 1, {
    message: 'Deve esistere esattamente una lingua con "default": true',
    path: ['locales'],
  })
  .refine(
    (site) => new Set(site.locales.map((locale) => locale.code)).size === site.locales.length,
    {
      message: 'I codici lingua devono essere univoci',
      path: ['locales'],
    },
  )

export type SiteConfig = z.infer<typeof siteSchema>
export type SiteLocale = z.infer<typeof localeSchema>
