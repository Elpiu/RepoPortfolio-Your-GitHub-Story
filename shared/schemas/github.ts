import { z } from 'zod'

const licenseSchema = z
  .object({
    spdx_id: z.string().nullable(),
    name: z.string().nullable(),
  })
  .nullable()

export const githubRestRepoNodeSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  full_name: z.string().min(1),
  owner: z.object({
    login: z.string().min(1),
  }),
  description: z.string().nullable(),
  html_url: z.string().url(),
  homepage: z.string().nullable(),
  fork: z.boolean(),
  archived: z.boolean(),
  stargazers_count: z.number().int().min(0),
  forks_count: z.number().int().min(0),
  size: z.number().int().min(0),
  language: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  license: licenseSchema,
  default_branch: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  pushed_at: z.string().datetime().nullable(),
})

export const githubRestRepoListSchema = z.array(githubRestRepoNodeSchema)

export type GitHubRestRepoNode = z.infer<typeof githubRestRepoNodeSchema>
