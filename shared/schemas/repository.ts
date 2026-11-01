import { z } from 'zod'

export const previewSourceSchema = z.enum([
  'manifest',
  'convention',
  'readme',
  'social',
  'placeholder',
])

export const repoLanguageSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  percent: z.number().min(0).max(100),
})

export const commitSchema = z.object({
  sha: z.string().min(1),
  shortSha: z.string().min(1),
  message: z.string(),
  date: z.string().datetime(),
})

export const repositorySchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  url: z.string().url(),
  homepage: z.string().url().nullable(),
  topics: z.array(z.string()),
  language: z.string().nullable(),
  languages: z.array(repoLanguageSchema),
  stars: z.number().int().min(0),
  forks: z.number().int().min(0),
  sizeKb: z.number().int().min(0),
  license: z
    .object({
      spdxId: z.string().min(1),
      name: z.string().min(1),
    })
    .nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  pushedAt: z.string().datetime().nullable(),
  defaultBranch: z.string().min(1),
  lastCommit: commitSchema.nullable(),
  latestRelease: z
    .object({
      name: z.string().min(1),
      tag: z.string().min(1),
      date: z.string().datetime(),
      url: z.string().url(),
    })
    .nullable(),
  isPinned: z.boolean(),
  pinnedOrder: z.number().int().min(0).nullable(),
  previewImage: z.string().url().nullable(),
  previewSource: previewSourceSchema,
  placeholderIndex: z.number().int().min(0).max(7),
})

export const languageStatSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  repos: z.number().int().min(0),
  percent: z.number().min(0).max(100),
})

export const activitySchema = z.object({
  repoName: z.string().min(1),
  repoSlug: z.string().min(1),
  branch: z.string().min(1),
  pushedAt: z.string().datetime().nullable(),
  commit: commitSchema.nullable(),
})

export const storyEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['repo', 'release']),
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  title: z.string().min(1),
  description: z.string().nullable(),
  repoSlug: z.string().min(1),
  link: z.string().url(),
  tags: z.array(z.string()),
})

export const githubDatasetSchema = z.object({
  syncedAt: z.string().datetime(),
  username: z.string().min(1),
  repositories: z.array(repositorySchema),
  languageStats: z.array(languageStatSchema),
  activity: activitySchema.nullable(),
  storyEvents: z.array(storyEventSchema),
})

export type GitHubDatasetSchema = z.infer<typeof githubDatasetSchema>
