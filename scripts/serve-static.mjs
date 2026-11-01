import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'

/**
 * Server statico minimale per E2E e Lighthouse: serve `.output/public` come
 * GitHub Pages (index.html nelle cartelle, 404.html con status 404).
 * Uso: node scripts/serve-static.mjs [--port 4173] [--dir .output/public] [--base /repo/]
 */

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.xsl': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function argValue(name, fallback) {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback)
}

const port = Number(argValue('--port', '4173'))
const root = resolve(argValue('--dir', '.output/public'))
// Con un project site l'output va servito sotto /{repo}/, come su GitHub Pages.
const base = `/${argValue('--base', '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/')

if (!existsSync(join(root, 'index.html'))) {
  console.error(`[serve-static] ${root} non contiene index.html: esegui prima "pnpm generate".`)
  process.exit(1)
}

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/')
  const candidate = normalize(join(root, decoded))
  if (candidate !== root && !candidate.startsWith(root + sep)) return null

  for (const file of [candidate, join(candidate, 'index.html'), `${candidate}.html`]) {
    if (existsSync(file) && statSync(file).isFile()) return file
  }
  return null
}

function send(response, status, file) {
  response.writeHead(status, {
    'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  })
  createReadStream(file).pipe(response)
}

createServer((request, response) => {
  const url = request.url ?? '/'
  const file = url.startsWith(base) ? resolveFile(`/${url.slice(base.length)}`) : null
  if (file) return send(response, 200, file)

  const notFound = join(root, '404.html')
  if (existsSync(notFound)) return send(response, 404, notFound)
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('Not found')
}).listen(port, () => {
  console.log(`[serve-static] ${root} → http://localhost:${port}${base}`)
})
