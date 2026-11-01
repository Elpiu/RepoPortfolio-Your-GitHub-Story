import { execFileSync, spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Anteprima locale identica al deploy: stesso base URL, stesso dataset, stesso
 * output di `pnpm run deploy`, ma senza pubblicare. Poi serve `.output/public`
 * sotto il base URL, come GitHub Pages.
 * Uso: pnpm preview:deploy [-- --data datasets/me] [-- --port 4173]
 */

const args = process.argv.slice(2)
const portIndex = args.indexOf('--port')
const port = portIndex === -1 ? '4173' : (args[portIndex + 1] ?? '4173')
const deployArgs =
  portIndex === -1 ? args : args.filter((_, i) => i !== portIndex && i !== portIndex + 1)

execFileSync(process.execPath, ['scripts/deploy.mjs', '--dry-run', ...deployArgs], {
  stdio: 'inherit',
})

const { siteUrl } = JSON.parse(readFileSync(resolve('.output/public/build.json'), 'utf8'))
const base = new URL(siteUrl).pathname

console.log(`[preview-deploy] canonical e OG puntano a ${siteUrl}; i link interni restano locali.`)
spawn(process.execPath, ['scripts/serve-static.mjs', '--port', port, '--base', base], {
  stdio: 'inherit',
})
