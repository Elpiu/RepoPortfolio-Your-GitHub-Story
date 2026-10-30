import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const OUTPUT_DIR = resolve('.output/public')
const BUDGETS = {
  js: 180 * 1024,
  css: 40 * 1024,
  fonts: 100 * 1024,
  payload: 80 * 1024,
}

function fail(message) {
  console.error(`[check-budget] ${message}`)
  process.exit(1)
}

function gzipSize(filePath) {
  return gzipSync(readFileSync(filePath), { level: 9 }).length
}

function walk(directory) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(fullPath))
    else files.push(fullPath)
  }
  return files
}

function assetPathFromUrl(url) {
  const normalized = url.split('?')[0].split('#')[0]
  const marker = normalized.indexOf('_nuxt/')
  return marker === -1 ? null : normalized.slice(marker)
}

function initialAssets(html) {
  const assets = new Set()
  const pattern = /<(?:script|link)\b[^>]*?(?:src|href)="([^"]+)"[^>]*>/gi
  for (const match of html.matchAll(pattern)) {
    const path = assetPathFromUrl(match[1])
    if (path && (path.endsWith('.js') || path.endsWith('.css'))) assets.add(path)
  }
  return [...assets]
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

try {
  statSync(OUTPUT_DIR)
} catch {
  fail('Output non trovato. Esegui prima "pnpm generate".')
}

const indexHtml = readFileSync(join(OUTPUT_DIR, 'index.html'), 'utf8')
const initial = initialAssets(indexHtml)
const jsBytes = initial
  .filter((path) => path.endsWith('.js'))
  .reduce((total, path) => total + gzipSize(join(OUTPUT_DIR, path)), 0)
const cssBytes = initial
  .filter((path) => path.endsWith('.css'))
  .reduce((total, path) => total + gzipSize(join(OUTPUT_DIR, path)), 0)

const allFiles = walk(OUTPUT_DIR)
const fontBytes = allFiles
  .filter((file) => /\.(woff2?|ttf|otf)$/i.test(file))
  .reduce((total, file) => total + statSync(file).size, 0)

const payloadFiles = allFiles.filter((file) => file.endsWith('_payload.json'))
const payloadBytes = payloadFiles.reduce((largest, file) => Math.max(largest, gzipSize(file)), 0)

const measured = {
  js: jsBytes,
  css: cssBytes,
  fonts: fontBytes,
  payload: payloadBytes,
}

console.log('[check-budget] Budget in byte (gzip salvo dove indicato):')
let failed = false
for (const [key, budget] of Object.entries(BUDGETS)) {
  const value = measured[key]
  const status = value <= budget ? 'ok' : 'FAIL'
  if (value > budget) failed = true
  console.log(
    `  ${key.padEnd(8)} ${formatKb(value).padStart(9)} / ${formatKb(budget).padStart(9)}  ${status}`,
  )
}

if (initial.length === 0) {
  fail('Nessun asset iniziale trovato in index.html.')
}

if (payloadFiles.length === 0) {
  console.warn('[check-budget] Nessun _payload.json trovato: payload non misurato.')
}

if (failed) {
  fail(`Budget superato. File: ${relative(process.cwd(), OUTPUT_DIR)}`)
}

console.log('[check-budget] Tutti i budget rispettati.')
