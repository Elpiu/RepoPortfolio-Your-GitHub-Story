import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  defaultStoryView,
  parseStoryView,
  serializeStoryView,
  storyViews,
  type StoryFilter,
  type StoryView,
} from '~~/shared/utils/story-filters'

const QUERY_KEY = 'story'

/** Vista della GitHub Story nella query string (`?story=education`). */
export function useStoryFilters(available: MaybeRefOrGetter<readonly StoryFilter[]>) {
  const route = useRoute()
  const router = useRouter()

  function read(): StoryView {
    const raw = route.query[QUERY_KEY]
    return (
      parseStoryView(typeof raw === 'string' ? raw : '', toValue(available)) ??
      defaultStoryView(toValue(available))
    )
  }

  // Come per Explore: l'HTML statico mostra il default, la query si applica dopo il mount.
  const hydrating = import.meta.client && useNuxtApp().isHydrating
  const view = ref<StoryView>(hydrating ? defaultStoryView(toValue(available)) : read())
  if (hydrating) onMounted(() => (view.value = read()))

  function select(next: StoryView) {
    view.value = next
    const query = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => key !== QUERY_KEY),
    ) as typeof route.query
    const value = serializeStoryView(next, toValue(available))
    if (value) query[QUERY_KEY] = value
    replaceQueryInPlace(router, route, query)
  }

  return {
    view,
    views: computed(() => storyViews(toValue(available))),
    select,
  }
}
