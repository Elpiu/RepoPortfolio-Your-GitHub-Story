import type { GitHubDataset } from '~~/shared/types'

export function useProjects() {
  return useAsyncData<GitHubDataset>('github-dataset', () =>
    $fetch<GitHubDataset>('/api/repositories'),
  )
}
