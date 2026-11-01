/**
 * Icone dei dati (es. competenze) come albero SVG serializzabile: arrivano nel
 * payload della pagina invece che nel bundle JS e si disegnano senza v-html.
 */

export type SvgNode = {
  tag: SvgTag
  attrs: Record<string, string>
  children: SvgNode[]
}

export type SvgIcon = {
  viewBox: string
  nodes: SvgNode[]
}

const SVG_TAGS = ['g', 'path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon'] as const
export type SvgTag = (typeof SVG_TAGS)[number]

const ALLOWED_ATTRIBUTES = new Set([
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
  'points',
  'fill',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'transform',
])

const TOKEN = /<(\/?)([a-z]+)((?:\s+[a-z-]+="[^"]*")*)\s*(\/?)>/g
const ATTRIBUTE = /([a-z-]+)="([^"]*)"/g

function isSvgTag(tag: string): tag is SvgTag {
  return (SVG_TAGS as readonly string[]).includes(tag)
}

/**
 * Converte il `body` di un'icona Iconify in nodi. Accetta solo elementi di forma e
 * attributi geometrici: ogni altro contenuto rende il body non valido (null).
 */
export function parseIconBody(body: string): SvgNode[] | null {
  const root: SvgNode[] = []
  const stack: SvgNode[] = []
  let cursor = 0

  for (const match of body.matchAll(TOKEN)) {
    if (body.slice(cursor, match.index).trim() !== '') return null
    cursor = match.index + match[0].length

    const [, closing, tag = '', rawAttributes = '', selfClosing] = match
    if (!isSvgTag(tag)) return null

    if (closing) {
      if (stack.pop()?.tag !== tag) return null
      continue
    }

    const attrs: Record<string, string> = {}
    for (const [, name = '', value = ''] of rawAttributes.matchAll(ATTRIBUTE)) {
      if (!ALLOWED_ATTRIBUTES.has(name)) return null
      attrs[name] = value
    }

    const node: SvgNode = { tag, attrs, children: [] }
    const parent = stack.at(-1)
    if (parent) parent.children.push(node)
    else root.push(node)
    if (!selfClosing) stack.push(node)
  }

  if (body.slice(cursor).trim() !== '' || stack.length > 0) return null
  return root
}

/** "simple-icons:typescript" → { prefix, name }; i nomi "i-lucide-x" non sono ammessi nei dati. */
export function splitIconName(icon: string): { prefix: string; name: string } | null {
  const match = icon.match(/^([a-z0-9-]+):([a-z0-9-]+)$/)
  return match ? { prefix: match[1]!, name: match[2]! } : null
}
