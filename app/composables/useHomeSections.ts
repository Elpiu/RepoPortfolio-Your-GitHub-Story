/** Sezioni della home nell'ordine della pagina; quelle opzionali solo se hanno dati. */
export function useHomeSections() {
  const { profile } = useSiteData()

  return computed(() => [
    'home',
    'about',
    'skills',
    'experience',
    'projects',
    ...(profile.value.books.length > 0 ? ['reading'] : []),
    'contact',
  ])
}
