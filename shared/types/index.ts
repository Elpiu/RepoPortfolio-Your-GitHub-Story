import type { z } from 'zod'
import type {
  activitySchema,
  commitSchema,
  githubDatasetSchema,
  languageStatSchema,
  repositorySchema,
  repoLanguageSchema,
  previewSourceSchema,
  storyEventSchema,
} from '../schemas/repository'

export type PreviewSource = z.infer<typeof previewSourceSchema>
export type RepoLanguage = z.infer<typeof repoLanguageSchema>
export type Repository = z.infer<typeof repositorySchema>
export type LanguageStat = z.infer<typeof languageStatSchema>
export type Activity = z.infer<typeof activitySchema>
export type StoryEvent = z.infer<typeof storyEventSchema>
export type GitHubDataset = z.infer<typeof githubDatasetSchema>
export type Commit = z.infer<typeof commitSchema>

export type ProjectDetail = {
  repository: Repository
  readmeHtml: string | null
  readmeTruncated: boolean
  headings: Array<{ id: string; text: string; level: 2 | 3 | 4 }>
}
