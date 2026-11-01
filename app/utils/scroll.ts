import type { LocationQueryRaw, RouteLocationNormalizedLoaded, Router } from 'vue-router'

let skipNext = false

/** Letto da router.options: true una sola volta dopo una navigazione "sul posto". */
export function consumeSkipScroll(): boolean {
  const value = skipNext
  skipNext = false
  return value
}

/**
 * Aggiorna la query string (filtri) senza muovere la pagina e senza perdere
 * l'hash corrente. Senza questo, Nuxt torna in cima quando l'hash sparisce.
 */
export function replaceQueryInPlace(
  router: Router,
  route: RouteLocationNormalizedLoaded,
  query: LocationQueryRaw,
): void {
  const target = router.resolve({ path: route.path, query, hash: route.hash })
  if (target.fullPath === route.fullPath) return
  skipNext = true
  void router.replace(target)
}

/**
 * Porta a una sezione della pagina corrente: scroll nativo (rispetta
 * scroll-padding-top e prefers-reduced-motion) e hash aggiornato senza un
 * secondo scroll. Funziona anche ricliccando la sezione già nell'URL.
 */
export function scrollToSectionInPlace(
  router: Router,
  route: RouteLocationNormalizedLoaded,
  id: string,
): void {
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
  const hash = `#${id}`
  if (route.hash === hash) return
  skipNext = true
  void router.replace({ path: route.path, query: route.query, hash })
}
