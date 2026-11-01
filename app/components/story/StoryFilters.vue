<script setup lang="ts">
import type { StoryFilter } from '~~/shared/utils/story-filters'

defineProps<{
  available: readonly StoryFilter[]
  selected: readonly StoryFilter[]
  counts: Record<StoryFilter, number>
  isAll: boolean
}>()

const emit = defineEmits<{
  toggle: [filter: StoryFilter]
  all: []
}>()

const { t } = useI18n()

// Le icone sono le stesse dei nodi: i filtri fanno anche da legenda.
const ICONS: Record<StoryFilter, string> = {
  work: 'i-lucide-briefcase',
  education: 'i-lucide-graduation-cap',
  projects: 'i-lucide-git-branch',
  milestones: 'i-lucide-flag',
}

const chip =
  'inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
const active = 'border-border-strong bg-surface-muted text-foreground'
const idle = 'border-border text-foreground-muted hover:bg-surface-muted hover:text-foreground'
</script>

<template>
  <div
    role="group"
    :aria-label="t('story.filters.label')"
    class="flex flex-wrap items-center gap-2"
  >
    <button
      v-for="filter in available"
      :key="filter"
      type="button"
      :aria-pressed="selected.includes(filter)"
      :class="[chip, selected.includes(filter) ? active : idle]"
      @click="emit('toggle', filter)"
    >
      <UIcon :name="ICONS[filter]" class="h-3.5 w-3.5" aria-hidden="true" />
      {{ t(`story.filters.${filter}`) }}
      <span class="font-mono text-xs text-foreground-subtle">{{ counts[filter] }}</span>
    </button>
    <button
      v-if="available.length > 1"
      type="button"
      :aria-pressed="isAll"
      :class="[chip, isAll ? active : idle]"
      @click="emit('all')"
    >
      {{ t('story.filters.all') }}
    </button>
  </div>
</template>
