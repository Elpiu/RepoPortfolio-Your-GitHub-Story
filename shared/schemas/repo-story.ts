import { z } from 'zod'

export const repoStorySchema = z.object({
  $schema: z.string().optional(),
  preview: z.string().min(1).optional(),
  hidden: z.boolean().default(false),
  story: z.boolean().default(true),
})

export type RepoStory = z.infer<typeof repoStorySchema>
