import type { RouterConfig } from 'nuxt/schema'
import { START_LOCATION, type RouteLocationNormalized } from 'vue-router'
import { consumeSkipScroll } from './utils/scroll'

/*
 * Come lo scrollBehavior di default di Nuxt, con due differenze:
 * - le navigazioni "sul posto" (filtri, link di sezione) non muovono la pagina;
 * - l'offset dell'hash è solo scroll-padding-top dell'html (l'altezza
 *   dell'header): Nuxt somma anche scroll-margin e atterrava troppo in alto.
 */

function hashTarget(hash: string, behavior: ScrollBehavior) {
  const offset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
  return { el: hash, top: Number.isFinite(offset) ? offset : 0, behavior }
}

function position(
  to: RouteLocationNormalized,
  savedPosition: { left: number; top: number } | null,
) {
  if (savedPosition) return savedPosition
  if (to.hash) return hashTarget(to.hash, 'auto')
  return { left: 0, top: 0 }
}

export default {
  scrollBehavior(to, from, savedPosition) {
    if (consumeSkipScroll()) return false

    const samePath = to.path.replace(/\/$/, '') === from.path.replace(/\/$/, '')
    if (samePath) {
      if (from.hash && !to.hash) return savedPosition ?? { left: 0, top: 0 }
      return to.hash ? hashTarget(to.hash, 'auto') : false
    }

    if (from === START_LOCATION) return position(to, savedPosition)

    // Su una pagina nuova si scorre solo quando il contenuto è montato.
    const nuxtApp = useNuxtApp()
    const router = useRouter()
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:loading:end', () => {
        requestAnimationFrame(() => {
          const current = router.currentRoute.value.fullPath
          resolve(current === to.fullPath ? position(to, savedPosition) : false)
        })
      })
    })
  },
} satisfies RouterConfig
