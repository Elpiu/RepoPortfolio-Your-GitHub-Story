import MarkdownIt from 'markdown-it'
import type { Token } from 'markdown-it'
import markdownItShiki from '@shikijs/markdown-it'
import sanitizeHtml from 'sanitize-html'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { consola } from 'consola'
import type { ProjectDetail, Repository } from '~~/shared/types'
import {
  rawUrl,
  resolveReadmeImage,
  resolveReadmeLink,
  type RepoRef,
} from '~~/shared/utils/preview'
import { slugify } from '~~/shared/utils/repo'
import { fetchText } from './http'

type MarkdownItInstance = InstanceType<typeof MarkdownIt>

const README_FILES = ['README.md', 'readme.md', 'README.markdown', 'README.rst'] as const
const FIXTURE_READMES = resolve('tests/fixtures/readmes.json')
const logger = consola.withTag('readme')

type ReadmeSource = {
  markdown: string
  truncated: boolean
}

type RenderResult = {
  html: string
  headings: ProjectDetail['headings']
}

async function readOfflineReadme(repository: Repository): Promise<string | null> {
  try {
    const payload = JSON.parse(await readFile(FIXTURE_READMES, 'utf8')) as Record<string, unknown>
    const value = payload[repository.name]
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}
const sourceCache = new Map<string, Promise<ReadmeSource | null>>()
let markdownPromise: Promise<MarkdownItInstance> | null = null

async function getMarkdown(): Promise<MarkdownItInstance> {
  if (!markdownPromise) {
    markdownPromise = (async () => {
      const markdown = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: false,
      })
      markdown.use(
        await markdownItShiki({
          themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
          defaultColor: false,
        }),
      )
      return markdown
    })().catch((error) => {
      markdownPromise = null
      throw error
    })
  }
  return markdownPromise
}

function repoRef(repository: Repository, owner: string): RepoRef {
  return {
    owner,
    repo: repository.name,
    branch: repository.defaultBranch,
  }
}

export function fetchReadmeSource(
  repository: Repository,
  owner: string,
  maxBytes: number,
): Promise<ReadmeSource | null> {
  const key = `${owner}/${repository.name}@${repository.defaultBranch}:${maxBytes}`
  const cached = sourceCache.get(key)
  if (cached) return cached

  const promise = (async () => {
    const ref = repoRef(repository, owner)
    if (process.env.GITHUB_OFFLINE === '1') {
      const markdown = await readOfflineReadme(repository)
      return markdown === null ? null : { markdown, truncated: false }
    }
    for (const file of README_FILES) {
      const text = await fetchText(rawUrl(ref, file), { maxBytes: maxBytes + 1 })
      if (text === null) continue
      const truncated = text.length > maxBytes
      return {
        markdown: truncated ? text.slice(0, maxBytes) : text,
        truncated,
      }
    }
    return null
  })()

  sourceCache.set(key, promise)
  return promise
}

function processHeadings(
  markdown: MarkdownItInstance,
  source: string,
): { tokens: Token[]; headings: ProjectDetail['headings'] } {
  const tokens = markdown.parse(source, {})
  const headings: ProjectDetail['headings'] = []
  const used = new Set<string>()

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!
    if (token.type !== 'heading_open') continue

    const originalLevel = Number(token.tag.slice(1))
    const level = Math.min(6, originalLevel + 1)
    token.tag = `h${level}`
    const close = tokens[index + 2]
    if (close?.type === 'heading_close') close.tag = `h${level}`

    const inline = tokens[index + 1]
    if (!inline || inline.type !== 'inline') continue

    const text = inline.content.replace(/[`*_~]/g, '').trim()
    const base = slugify(text) || 'section'
    let id = base
    let suffix = 2
    while (used.has(id)) {
      id = `${base}-${suffix}`
      suffix += 1
    }
    used.add(id)
    token.attrSet('id', id)

    if (originalLevel > 1 && level >= 2 && level <= 4) {
      headings.push({ id, text, level: level as 2 | 3 | 4 })
    }
  }

  return { tokens, headings }
}

function sanitizeReadme(html: string, ref: RepoRef): string {
  const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'details',
    'summary',
    'del',
    'ins',
    'sup',
    'sub',
    'kbd',
    'mark',
    'figure',
    'figcaption',
    'picture',
    'source',
  ])

  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      '*': ['id', 'class'],
      a: ['href', 'name', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      pre: ['class', 'style', 'tabindex'],
      code: ['class', 'style'],
      span: ['style', 'class'],
      th: ['align'],
      td: ['align'],
      source: ['srcset', 'type', 'media'],
    },
    allowedClasses: {
      pre: ['shiki', 'shiki-themes', 'github-light-high-contrast', 'github-dark-high-contrast'],
      code: [/^language-/],
      span: ['line'],
    },
    allowedStyles: {
      '*': {
        color: [/^#(?:[0-9a-f]{3,8})$/i, /^rgba?\(/],
        'background-color': [/^#(?:[0-9a-f]{3,8})$/i, /^rgba?\(/],
        '--shiki-light': [/^#(?:[0-9a-f]{3,8})$/i],
        '--shiki-dark': [/^#(?:[0-9a-f]{3,8})$/i],
        '--shiki-light-bg': [/^#(?:[0-9a-f]{3,8})$/i],
        '--shiki-dark-bg': [/^#(?:[0-9a-f]{3,8})$/i],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      img: (tagName, attribs) => {
        const src = resolveReadmeImage(attribs.src ?? '', ref)
        if (!src) return { tagName: 'span', attribs: {} }
        return {
          tagName,
          attribs: {
            ...attribs,
            src,
            loading: 'lazy',
            decoding: 'async',
          },
        }
      },
      a: (tagName, attribs) => {
        const href = resolveReadmeLink(attribs.href ?? '', ref)
        if (!href) return { tagName: 'span', attribs: {} }
        const external = /^https?:\/\//i.test(href)
        return {
          tagName,
          attribs: {
            ...attribs,
            href,
            ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        }
      },
    },
  })
}

export async function renderReadme(
  source: string,
  repository: Repository,
  owner: string,
): Promise<RenderResult> {
  const markdown = await getMarkdown()
  const { tokens, headings } = processHeadings(markdown, source)
  const html = markdown.renderer.render(tokens, markdown.options, {})
  return {
    html: sanitizeReadme(html, repoRef(repository, owner)),
    headings,
  }
}

export async function getProjectDetail(
  repository: Repository,
  owner: string,
  maxBytes: number,
): Promise<ProjectDetail> {
  try {
    const source = await fetchReadmeSource(repository, owner, maxBytes)
    if (!source) {
      return {
        repository,
        readmeHtml: null,
        readmeTruncated: false,
        headings: [],
      }
    }

    const rendered = await renderReadme(source.markdown, repository, owner)
    return {
      repository,
      readmeHtml: rendered.html,
      readmeTruncated: source.truncated,
      headings: rendered.headings,
    }
  } catch (error) {
    logger.warn(
      `README non renderizzato per ${repository.name}: ${error instanceof Error ? error.message : String(error)}`,
    )
    return {
      repository,
      readmeHtml: null,
      readmeTruncated: false,
      headings: [],
    }
  }
}
