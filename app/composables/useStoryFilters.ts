import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  STORY_FILTERS,
  defaultStoryFilters,
  parseStoryFilters,
  serializeStoryFilters,
  toggleStoryFilter,
  type StoryFilter,
} from '~~/shared/utils/story-filters'

const QUERY_KEY = 'story'

/** Filtri della GitHub Story nella query string (`?story=work,education`). */
export function useStoryFilters(available: MaybeRefOrGetter<readonly StoryFilter[]>) {
  const route = useRoute()
  const router = useRouter()

  function read(): StoryFilter[] {
    const raw = route.query[QUERY_KEY]
    const value = typeof raw === 'string' ? raw : ''
    return parseStoryFilters(value, toValue(available)) ?? defaultStoryFilters(toValue(available))
  }

  // Come per Explore: l'HTML statico mostra il default, la query si applica dopo il mount.
  const hydrating = import.meta.client && useNuxtApp().isHydrating
  const selected = ref<StoryFilter[]>(hydrating ? defaultStoryFilters(toValue(available)) : read())
  if (hydrating) onMounted(() => (selected.value = read()))

  const isAll = computed(() =>
    toValue(available).every((filter) => selected.value.includes(filter)),
  )

  function apply(next: StoryFilter[]) {
    selected.value = next
    const query = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => key !== QUERY_KEY),
    ) as typeof route.query
    const value = serializeStoryFilters(next, toValue(available))
    if (value) query[QUERY_KEY] = value
    void router.replace({ query })
  }

  return {
    selected,
    isAll,
    toggle: (filter: StoryFilter) => apply(toggleStoryFilter(selected.value, filter)),
    selectAll: () => apply(STORY_FILTERS.filter((filter) => toValue(available).includes(filter))),
  }
}
