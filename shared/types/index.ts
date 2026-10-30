export type PreviewSource = 'manifest' | 'convention' | 'readme' | 'social' | 'placeholder'

export type RepoLanguage = {
  name: string
  color: string
  percent: number
}

export type Repository = {
  id: number
  name: string
  slug: string
  description: string | null
  url: string
  homepage: string | null
  topics: string[]
  language: string | null
  languages: RepoLanguage[]
  stars: number
  forks: number
  sizeKb: number
  license: { spdxId: string; name: string } | null
  createdAt: string
  updatedAt: string
  pushedAt: string | null
  defaultBranch: string
  lastCommit: {
    sha: string
    shortSha: string
    message: string
    date: string
  } | null
  latestRelease: {
    name: string
    tag: string
    date: string
    url: string
  } | null
  isPinned: boolean
  pinnedOrder: number | null
  previewImage: string | null
  previewSource: PreviewSource
  placeholderIndex: number
}

export type LanguageStat = {
  name: string
  color: string
  bytes: number
  percent: number
}

export type Activity = {
  repoName: string
  repoSlug: string
  branch: string
  pushedAt: string | null
  commit: Repository['lastCommit']
}

export type StoryEvent = {
  id: string
  type: 'repo' | 'release'
  date: string
  title: string
  description: string | null
  repoSlug: string
  link: string
  tags: string[]
}

export type GitHubDataset = {
  syncedAt: string
  username: string
  repositories: Repository[]
  languageStats: LanguageStat[]
  activity: Activity | null
  storyEvents: StoryEvent[]
}

export type ProjectDetail = {
  repository: Repository
  readmeHtml: string | null
  readmeTruncated: boolean
  headings: Array<{ id: string; text: string; level: 2 | 3 | 4 }>
}
