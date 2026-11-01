<script setup lang="ts">
import type { Repository } from '~~/shared/types'

const props = defineProps<{
  repositories: Repository[]
}>()

const { t } = useI18n()
const {
  searchInput,
  tabs,
  activeTab,
  activeLanguage,
  languages,
  visible,
  hasMore,
  hasActiveFilters,
  resultsCount,
  sort,
  updateSearch,
  setTab,
  setLanguage,
  setSort,
  reset,
  loadMore,
} = useProjectFilters(() => props.repositories)

const activeTabIndex = computed(() =>
  Math.max(
    0,
    tabs.value.findIndex((tab) => tab.value === activeTab.value),
  ),
)
const resultsLabel = computed(() =>
  resultsCount.value === 1
    ? t('projects.resultOne')
    : t('projects.results', { count: resultsCount.value }),
)
const isEmptyDataset = computed(() => props.repositories.length === 0)
</script>

<template>
  <SectionShell id="projects" :eyebrow="t('home.projectsEyebrow')" :title="t('home.projects')">
    <div class="space-y-6">
      <ExploreTabs :model-value="activeTab" :tabs="tabs" @update:model-value="setTab" />

      <ProjectFilters
        :languages="languages"
        :language="activeLanguage"
        :sort="sort"
        :query="searchInput"
        :has-active-filters="hasActiveFilters"
        @update:query="updateSearch"
        @update:language="setLanguage"
        @update:sort="setSort"
        @reset="reset"
      />

      <p aria-live="polite" class="text-sm text-foreground-muted">
        {{ resultsLabel }}
      </p>

      <div
        id="explore-panel"
        role="tabpanel"
        :aria-labelledby="`explore-tab-${activeTabIndex}`"
        tabindex="0"
        class="rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <ProjectGrid v-if="visible.length > 0" :projects="visible" />
        <EmptyState
          v-else
          :title="isEmptyDataset ? t('projects.noProjects.title') : t('projects.empty.title')"
          :description="
            isEmptyDataset ? t('projects.noProjects.description') : t('projects.empty.description')
          "
        >
          <AppButton v-if="hasActiveFilters" intent="secondary" @click="reset">
            {{ t('projects.filters.reset') }}
          </AppButton>
        </EmptyState>
      </div>

      <div v-if="hasMore" class="flex justify-center">
        <AppButton intent="secondary" icon="i-lucide-plus" @click="loadMore">
          {{ t('projects.loadMore') }}
        </AppButton>
      </div>
    </div>
  </SectionShell>
</template>
