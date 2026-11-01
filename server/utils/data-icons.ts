import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { consola } from 'consola'
import type { Profile } from '~~/shared/schemas/profile'
import { parseIconBody, splitIconName, type SvgIcon } from '~~/shared/utils/svg-icon'

type IconifyCollection = {
  width?: number
  height?: number
  icons: Record<string, { body: string; width?: number; height?: number }>
  aliases?: Record<string, { parent: string }>
}

const logger = consola.withTag('icons')
const collections = new Map<string, IconifyCollection | null>()
const require = createRequire(join(process.cwd(), 'package.json'))

function loadCollection(prefix: string): IconifyCollection | null {
  if (!collections.has(prefix)) {
    try {
      const file = require.resolve(`@iconify-json/${prefix}/icons.json`)
      collections.set(prefix, JSON.parse(readFileSync(file, 'utf8')) as IconifyCollection)
    } catch {
      logger.warn(`collezione "${prefix}" non installata (@iconify-json/${prefix})`)
      collections.set(prefix, null)
    }
  }
  return collections.get(prefix) ?? null
}

export function resolveDataIcon(icon: string): SvgIcon | null {
  const parts = splitIconName(icon)
  if (!parts) return null
  const collection = loadCollection(parts.prefix)
  if (!collection) return null

  const name = collection.icons[parts.name] ? parts.name : collection.aliases?.[parts.name]?.parent
  const entry = name ? collection.icons[name] : undefined
  if (!entry) return null

  const nodes = parseIconBody(entry.body)
  if (!nodes) return null
  const width = entry.width ?? collection.width ?? 16
  const height = entry.height ?? collection.height ?? 16
  return { viewBox: `0 0 ${width} ${height}`, nodes }
}

/** Tutte le icone citate dalle competenze dei profili, risolte dalle collezioni locali. */
export function resolveProfileIcons(profiles: Record<string, Profile>): Record<string, SvgIcon> {
  const icons: Record<string, SvgIcon> = {}
  for (const profile of Object.values(profiles)) {
    for (const item of profile.skills.groups.flatMap((group) => group.items)) {
      if (!item.icon || item.icon in icons) continue
      const resolved = resolveDataIcon(item.icon)
      if (resolved) icons[item.icon] = resolved
      else logger.warn(`icona "${item.icon}" (${item.name}) non trovata: verrà omessa`)
    }
  }
  return icons
}
