import { toValue, type MaybeRefOrGetter } from 'vue'
import type { Repository } from '~~/shared/types'
import {
  ALL_TAB,
  DEFAULT_FILTER_STATE,
  OPEN_SOURCE_TAB,
  filterProjects,
  getLanguageTabs,
  getLanguages,
  languageFromTab,
  paginate,
  type LanguageTab,
  type ProjectFilterState,
  type ProjectSort,
} from '~~/shared/utils/project-filters'

const SORT_VALUES: readonly ProjectSort[] = ['relevance', 'stars', 'updated', 'name']

export type ProjectTab = LanguageTab & {
  value: string
  label: string
}

function queryValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}

function readState(query: Record<string, unknown>): ProjectFilterState {
  const sort = queryValue(query.sort) as ProjectSort
  const page = Number.parseInt(queryValue(query.page), 10)
  return {
    q: queryValue(query.q),
    lang: queryValue(query.lang) || null,
    tab: queryValue(query.tab) || DEFAULT_FILTER_STATE.tab,
    sort: SORT_VALUES.includes(sort) ? sort : DEFAULT_FILTER_STATE.sort,
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_FILTER_STATE.page,
  }
}

export function useProjectFilters(repositories: MaybeRefOrGetter<readonly Repository[]>) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  // L'HTML statico contiene la griglia senza filtri: durante l'idratazione si parte
  // dallo stato di default (DOM identico) e la query string si applica dopo il mount.
  const hydrating = import.meta.client && useNuxtApp().isHydrating
  const initial = hydrating ? { ...DEFAULT_FILTER_STATE } : readState(route.query)

  const searchInput = ref(initial.q)
  const q = ref(initial.q)
  const lang = ref<string | null>(initial.lang)
  const tab = ref(initial.tab)
  const sort = ref<ProjectSort>(initial.sort)
  const page = ref(initial.page)
  const projects = computed(() => toValue(repositories))

  const languageTabs = computed(() => getLanguageTabs(projects.value))
  const tabs = computed<ProjectTab[]>(() => {
    const list: ProjectTab[] = [
      { value: ALL_TAB, label: t('projects.tabs.all') },
      ...languageTabs.value,
    ]
    if (projects.value.some((repository) => repository.license)) {
      list.push({ value: OPEN_SOURCE_TAB, label: t('projects.tabs.openSource') })
    }
    return list
  })
  const knownTabs = computed(() => new Set(tabs.value.map((entry) => entry.value)))

  const activeTab = computed(() => {
    if (tab.value === OPEN_SOURCE_TAB && knownTabs.value.has(OPEN_SOURCE_TAB)) {
      return OPEN_SOURCE_TAB
    }
    return knownTabs.value.has(tab.value) ? tab.value : ALL_TAB
  })

  const activeLanguage = computed(() => {
    const language = languageFromTab(tab.value)
    if (language && !knownTabs.value.has(tab.value)) return language
    return lang.value
  })

  const effectiveState = computed<ProjectFilterState>(() => ({
    q: q.value,
    lang: activeLanguage.value,
    tab: activeTab.value,
    sort: sort.value,
    page: page.value,
  }))

  const filtered = computed(() => filterProjects(projects.value, effectiveState.value))
  const visible = computed(() => paginate(filtered.value, page.value))
  const hasMore = computed(() => visible.value.length < filtered.value.length)
  const languages = computed(() => getLanguages(projects.value))
  const hasActiveFilters = computed(
    () =>
      q.value.trim() !== '' ||
      activeLanguage.value !== null ||
      activeTab.value !== ALL_TAB ||
      sort.value !== 'relevance',
  )

  const applySearch = useDebounceFn((value: string) => {
    q.value = value
    page.value = 1
  }, 200)

  function updateSearch(value: string) {
    searchInput.value = value
    applySearch(value)
  }

  function setTab(value: string) {
    tab.value = value
    lang.value = null
    page.value = 1
  }

  function setLanguage(value: string | null) {
    lang.value = value || null
    tab.value = ALL_TAB
    page.value = 1
  }

  function setSort(value: ProjectSort) {
    sort.value = value
    page.value = 1
  }

  function reset() {
    searchInput.value = ''
    q.value = ''
    lang.value = null
    tab.value = ALL_TAB
    sort.value = 'relevance'
    page.value = 1
  }

  function loadMore() {
    page.value += 1
  }

  function syncQuery() {
    const query: Record<string, string> = {}
    if (q.value.trim()) query.q = q.value.trim()
    if (activeLanguage.value) query.lang = activeLanguage.value
    if (activeTab.value !== ALL_TAB) query.tab = activeTab.value
    if (sort.value !== 'relevance') query.sort = sort.value
    if (page.value > 1) query.page = String(page.value)
    void router.replace({ query })
  }

  watch([q, lang, tab, sort, page], syncQuery)

  if (hydrating) {
    onMounted(() => {
      const state = readState(route.query)
      searchInput.value = state.q
      q.value = state.q
      lang.value = state.lang
      tab.value = state.tab
      sort.value = state.sort
      page.value = state.page
    })
  }

  return {
    searchInput,
    q,
    lang,
    tab,
    sort,
    page,
    projects,
    tabs,
    activeTab,
    activeLanguage,
    languages,
    filtered,
    visible,
    hasMore,
    hasActiveFilters,
    resultsCount: computed(() => filtered.value.length),
    updateSearch,
    setTab,
    setLanguage,
    setSort,
    reset,
    loadMore,
  }
}
