export type RepoRef = {
  owner: string
  repo: string
  branch: string
}

export const CONVENTION_FOLDERS = ['.github/', '', 'docs/'] as const
export const CONVENTION_NAMES = [
  'preview',
  'screenshot',
  'cover',
  'hero',
  'banner',
  'social-preview',
] as const
export const CONVENTION_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif'] as const
export const LEGACY_PREVIEW_PATH = '.github/RepoPortfolio-Your-GitHub-Story/index.png'

const ALLOWED_IMAGE_HOSTS = new Set([
  'raw.githubusercontent.com',
  'user-images.githubusercontent.com',
  'private-user-images.githubusercontent.com',
  'avatars.githubusercontent.com',
])

const BADGE_HOSTS = [
  'img.shields.io',
  'shields.io',
  'badgen.net',
  'badge.fury.io',
  'codecov.io',
  'coveralls.io',
  'travis-ci.org',
  'travis-ci.com',
  'circleci.com',
]

export function encodePath(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function rawUrl(ref: RepoRef, path: string): string {
  return `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${ref.branch}/${encodePath(path)}`
}

export function conventionCandidates(): string[] {
  const candidates: string[] = []
  for (const folder of CONVENTION_FOLDERS) {
    for (const name of CONVENTION_NAMES) {
      for (const extension of CONVENTION_EXTENSIONS) {
        candidates.push(`${folder}${name}.${extension}`)
      }
    }
  }
  candidates.push(LEGACY_PREVIEW_PATH)
  return candidates
}

export function isAllowedImageHost(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    if (ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) return true
    return parsed.hostname === 'github.com' && parsed.pathname.startsWith('/user-attachments/')
  } catch {
    return false
  }
}

export function isBadgeImage(url: string): boolean {
  const lower = url.toLowerCase()
  if (lower.startsWith('data:')) return true
  if (lower.split('?')[0]!.endsWith('.svg')) return true
  if (BADGE_HOSTS.some((host) => lower.includes(host))) return true
  if (lower.includes('/actions/workflows/') && lower.includes('badge')) return true
  if (lower.includes('/badge.')) return true
  return false
}

export function resolveReadmeImage(rawImageUrl: string, ref: RepoRef): string | null {
  const url = rawImageUrl.trim()
  if (!url || url.startsWith('#') || url.startsWith('data:')) return null
  if (isBadgeImage(url)) return null

  if (url.startsWith('https://')) {
    return isAllowedImageHost(url) ? url : null
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return null

  const path = url.replace(/^\.\//, '').replace(/^\//, '').split('?')[0]!.split('#')[0]!
  if (!path) return null

  return rawUrl(ref, path)
}

function stripCodeFences(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '')
}

export function extractReadmeImage(markdown: string, ref: RepoRef): string | null {
  const content = stripCodeFences(markdown)
  const pattern =
    /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>|!\[[^\]]*]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/gi

  for (const match of content.matchAll(pattern)) {
    const candidate = match[1] ?? match[2]
    if (!candidate) continue
    const resolved = resolveReadmeImage(candidate, ref)
    if (resolved) return resolved
  }
  return null
}

export function blobUrl(ref: RepoRef, path: string): string {
  return `https://github.com/${ref.owner}/${ref.repo}/blob/${ref.branch}/${encodePath(path)}`
}

export function resolveReadmeLink(rawLink: string, ref: RepoRef): string | null {
  const url = rawLink.trim()
  if (!url) return null
  if (url.startsWith('#')) return url
  if (/^(https?:\/\/|mailto:)/i.test(url)) return url
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return null

  const path = url.replace(/^\.\//, '').replace(/^\//, '').split('?')[0]!.split('#')[0]!
  if (!path) return null
  return blobUrl(ref, path)
}
