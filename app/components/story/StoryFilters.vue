<script setup lang="ts">
import type { StoryFilter, StoryView } from '~~/shared/utils/story-filters'

const props = defineProps<{
  views: readonly StoryView[]
  modelValue: StoryView
  counts: Record<StoryFilter, number>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StoryView]
}>()

const { t } = useI18n()

// Stesse icone dei nodi: i tab fanno anche da legenda.
const ICONS: Record<StoryView, string> = {
  work: 'i-lucide-briefcase',
  education: 'i-lucide-graduation-cap',
  projects: 'i-lucide-git-branch',
  milestones: 'i-lucide-flag',
  all: 'i-lucide-git-graph',
}

function count(view: StoryView): number {
  return view === 'all'
    ? Object.values(props.counts).reduce((total, value) => total + value, 0)
    : props.counts[view]
}

// Pattern ARIA tabs, come ExploreTabs: frecce, Home ed End spostano la selezione.
function onKeydown(event: KeyboardEvent, index: number) {
  const last = props.views.length - 1
  const next =
    event.key === 'ArrowRight'
      ? index >= last
        ? 0
        : index + 1
      : event.key === 'ArrowLeft'
        ? index <= 0
          ? last
          : index - 1
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : null
  if (next === null) return
  event.preventDefault()
  const target = props.views[next]
  if (!target) return
  emit('update:modelValue', target)
  const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>(
    '[role="tab"]',
  )
  tabs?.[next]?.focus()
}
</script>

<template>
  <div role="tablist" :aria-label="t('story.filters.label')" class="flex flex-wrap gap-2">
    <button
      v-for="(view, index) in views"
      :id="`story-tab-${view}`"
      :key="view"
      type="button"
      role="tab"
      aria-controls="story-panel"
      :aria-selected="modelValue === view"
      :tabindex="modelValue === view ? 0 : -1"
      class="inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      :class="
        modelValue === view
          ? 'border-border-strong bg-surface-muted text-foreground'
          : 'border-transparent text-foreground-muted hover:bg-surface-muted hover:text-foreground'
      "
      @click="emit('update:modelValue', view)"
      @keydown="onKeydown($event, index)"
    >
      <UIcon :name="ICONS[view]" class="h-3.5 w-3.5" aria-hidden="true" />
      {{ t(`story.filters.${view}`) }}
      <span class="font-mono text-xs text-foreground-subtle">{{ count(view) }}</span>
    </button>
  </div>
</template>
