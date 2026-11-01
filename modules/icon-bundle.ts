import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'

function readSources(directory: string): string {
  let text = ''
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) text += readSources(path)
    else if (/\.(vue|ts)$/.test(entry.name)) text += readFileSync(path, 'utf8')
  }
  return text
}

/**
 * Nuxt UI aggiunge al bundle client tutte le icone della propria app config,
 * anche quelle dei componenti che il sito non usa: qui restano solo le icone
 * citate in app/ (budget JS, documento 08). Va registrato dopo @nuxt/ui.
 */
export default defineNuxtModule({
  meta: { name: 'icon-bundle' },
  setup(_options, nuxt) {
    nuxt.hook('icon:clientBundleIcons', (icons) => {
      const sources = readSources(nuxt.options.srcDir)

      for (const icon of [...icons]) {
        const [collection, name] = icon.includes(':') ? icon.split(':') : [null, icon]
        const used =
          sources.includes(icon) ||
          (collection !== null && sources.includes(`i-${collection}-${name}`))
        if (!used) icons.delete(icon)
      }
    })
  },
})
