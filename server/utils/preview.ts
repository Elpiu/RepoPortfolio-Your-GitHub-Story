import { consola } from 'consola'
import type { GitHubRestRepoNode } from '~~/shared/schemas/github'
import type { RepoStory } from '~~/shared/schemas/repo-story'
import { repoStorySchema } from '~~/shared/schemas/repo-story'
import type { PreviewSource } from '~~/shared/types'
import {
  LEGACY_PREVIEW_PATH,
  extractReadmeImage,
  isAllowedImageHost,
  rawUrl,
  type RepoRef,
} from '~~/shared/utils/preview'
import { headOk, fetchText } from './http'

const MAX_MANIFEST_BYTES = 4_096
const MAX_README_BYTES = 200_000
const README_FILES = ['README.md', 'readme.md', 'README.markdown', 'README.rst'] as const

export const RUNTIME_CONVENTION_PATHS = [
  '.github/preview.png',
  'preview.png',
  'docs/preview.png',
  '.github/screenshot.png',
  'screenshot.png',
  'docs/screenshot.png',
  '.github/cover.png',
  'cover.png',
  'docs/cover.png',
  '.github/banner.png',
  'banner.png',
  'docs/banner.png',
  '.github/hero.png',
  'hero.png',
  'docs/hero.png',
  '.github/social-preview.png',
  'social-preview.png',
  'docs/social-preview.png',
  '.github/preview.jpg',
  'preview.jpg',
  'docs/preview.jpg',
  LEGACY_PREVIEW_PATH,
] as const

export type PreviewResult = {
  previewImage: string | null
  previewSource: PreviewSource
}

export type PreviewResolverOptions = {
  manifest?: RepoStory | null
  readme?: string | null
  featured?: boolean
  conventionPaths?: readonly string[]
  head?: (url: string) => Promise<boolean>
}

function repoRef(node: GitHubRestRepoNode): RepoRef {
  return {
    owner: node.owner.login,
    repo: node.name,
    branch: node.default_branch,
  }
}

function manifestPreviewUrl(node: GitHubRestRepoNode, preview: string): string | null {
  if (/^https:\/\//i.test(preview)) {
    return isAllowedImageHost(preview) ? preview : null
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(preview) || preview.startsWith('//')) return null
  return rawUrl(repoRef(node), preview.replace(/^\.\//, '').replace(/^\//, ''))
}

export async function fetchRepoStory(node: GitHubRestRepoNode): Promise<RepoStory | null> {
  const url = rawUrl(repoRef(node), '.repo-story.json')
  const text = await fetchText(url, { maxBytes: MAX_MANIFEST_BYTES + 1 })
  if (!text) return null
  if (text.length > MAX_MANIFEST_BYTES) {
    consola.warn(
      `[preview] ${node.name}: .repo-story.json oltre ${MAX_MANIFEST_BYTES} byte, ignorato`,
    )
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    consola.warn(
      `[preview] ${node.name}: .repo-story.json non valido (${error instanceof Error ? error.message : String(error)}), ignorato`,
    )
    return null
  }

  const result = repoStorySchema.safeParse(parsed)
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ')
    consola.warn(`[preview] ${node.name}: .repo-story.json non valido (${details}), ignorato`)
    return null
  }
  return result.data
}

export async function fetchReadmeForPreview(node: GitHubRestRepoNode): Promise<string | null> {
  const ref = repoRef(node)
  for (const file of README_FILES) {
    const text = await fetchText(rawUrl(ref, file), { maxBytes: MAX_README_BYTES })
    if (text !== null) return text
  }
  return null
}

export async function resolvePreview(
  node: GitHubRestRepoNode,
  options: PreviewResolverOptions = {},
): Promise<PreviewResult> {
  const head = options.head ?? headOk

  if (options.manifest?.preview) {
    const url = manifestPreviewUrl(node, options.manifest.preview)
    if (url && (await head(url))) {
      return { previewImage: url, previewSource: 'manifest' }
    }
  }

  if (options.featured) {
    const ref = repoRef(node)
    const conventionPaths = options.conventionPaths ?? RUNTIME_CONVENTION_PATHS
    for (const path of conventionPaths) {
      const url = rawUrl(ref, path)
      if (await head(url)) {
        return { previewImage: url, previewSource: 'convention' }
      }
    }
  }

  if (options.readme) {
    const image = extractReadmeImage(options.readme, repoRef(node))
    if (image && (await head(image))) {
      return { previewImage: image, previewSource: 'readme' }
    }
  }

  return { previewImage: null, previewSource: 'placeholder' }
}
