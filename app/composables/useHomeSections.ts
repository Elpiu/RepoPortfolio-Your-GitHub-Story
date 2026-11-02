import { hasBooks } from '#site-data'

/** Sezioni della home nell'ordine della pagina; quelle opzionali solo se hanno dati. */
export function useHomeSections() {
  return computed(() => [
    'home',
    'about',
    'skills',
    'experience',
    'projects',
    ...(hasBooks ? ['reading'] : []),
    'contact',
  ])
}
