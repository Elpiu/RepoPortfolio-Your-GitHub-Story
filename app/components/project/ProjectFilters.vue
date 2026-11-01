<script setup lang="ts">
import type { ProjectSort } from '~~/shared/utils/project-filters'

defineProps<{
  languages: string[]
  language: string | null
  sort: ProjectSort
  query: string
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  'update:language': [value: string | null]
  'update:sort': [value: ProjectSort]
  'update:query': [value: string]
  reset: []
}>()

const { t } = useI18n()

const sortOptions = computed<Array<{ value: ProjectSort; label: string }>>(() => [
  { value: 'relevance', label: t('projects.sort.relevance') },
  { value: 'stars', label: t('projects.sort.stars') },
  { value: 'updated', label: t('projects.sort.updated') },
  { value: 'name', label: t('projects.sort.name') },
])

function onSearch(event: Event) {
  emit('update:query', (event.target as HTMLInputElement).value)
}

function onLanguage(event: Event) {
  emit('update:language', (event.target as HTMLSelectElement).value || null)
}

function onSort(event: Event) {
  emit('update:sort', (event.target as HTMLSelectElement).value as ProjectSort)
}
</script>

<template>
  <div
    class="grid gap-4 rounded-card border border-border bg-surface-muted/40 p-4 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-end"
  >
    <label class="flex flex-col gap-1.5" for="project-search">
      <span class="font-mono text-xs uppercase tracking-[0.14em] text-foreground-subtle">
        {{ t('projects.filters.searchLabel') }}
      </span>
      <input
        id="project-search"
        type="search"
        autocomplete="off"
        :value="query"
        :placeholder="t('projects.filters.searchPlaceholder')"
        class="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        @input="onSearch"
      />
    </label>

    <label class="flex flex-col gap-1.5" for="project-language">
      <span class="font-mono text-xs uppercase tracking-[0.14em] text-foreground-subtle">
        {{ t('projects.filters.languageLabel') }}
      </span>
      <select
        id="project-language"
        :value="language ?? ''"
        class="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        @change="onLanguage"
      >
        <option value="">{{ t('projects.filters.allLanguages') }}</option>
        <option v-for="entry in languages" :key="entry" :value="entry">{{ entry }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1.5" for="project-sort">
      <span class="font-mono text-xs uppercase tracking-[0.14em] text-foreground-subtle">
        {{ t('projects.filters.sortLabel') }}
      </span>
      <select
        id="project-sort"
        :value="sort"
        class="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        @change="onSort"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <AppButton
      v-if="hasActiveFilters"
      intent="ghost"
      icon="i-lucide-x"
      class="justify-self-start md:justify-self-end"
      @click="emit('reset')"
    >
      {{ t('projects.filters.reset') }}
    </AppButton>
  </div>
</template>
