<script setup lang="ts">
import type { StoryNode } from '~~/shared/utils/story-graph'
import { formatMonth } from '~~/shared/utils/format'

const props = defineProps<{
  node: StoryNode
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const detailPath = computed(() =>
  props.node.repoSlug ? localePath(`/projects/${props.node.repoSlug}`) : null,
)
const typeIcon = computed(() => {
  switch (props.node.kind) {
    case 'work':
      return 'i-lucide-briefcase'
    case 'education':
      return 'i-lucide-graduation-cap'
    case 'milestone':
      return 'i-lucide-flag'
    case 'release':
      return 'i-lucide-package'
    default:
      return 'i-lucide-git-branch'
  }
})
const laneX = computed(() => 8 + props.node.lane * 16)
const endLabel = computed(() => {
  if (!props.node.end) return props.node.current ? t('story.present') : null
  return formatMonth(props.node.end)
})
</script>

<template>
  <li class="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
    <svg viewBox="0 0 56 72" class="h-full min-h-28 w-14" aria-hidden="true">
      <line x1="8" y1="0" x2="8" y2="72" stroke="var(--color-border-strong)" stroke-width="1.5" />
      <path
        v-if="node.lane > 0"
        :d="`M8 0 V36 H${laneX}`"
        fill="none"
        stroke="var(--color-border-strong)"
        stroke-width="1.5"
      />
      <path
        v-if="node.lane > 0 && node.end"
        :d="`M${laneX} 36 V72 H8`"
        fill="none"
        stroke="var(--color-border-strong)"
        stroke-width="1.5"
      />
      <polygon
        v-if="node.kind === 'milestone'"
        :points="`${laneX},29 ${laneX + 7},36 ${laneX},43 ${laneX - 7},36`"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        stroke-width="1.5"
      />
      <circle
        v-else
        :cx="laneX"
        cy="36"
        r="4.5"
        :fill="
          node.current
            ? 'var(--color-accent)'
            : node.kind === 'repo' || node.kind === 'release'
              ? 'var(--color-surface)'
              : 'var(--color-foreground)'
        "
        :stroke="node.current ? 'var(--color-accent)' : 'var(--color-border-strong)'"
        stroke-width="1.5"
      />
    </svg>

    <details class="group rounded-card border border-border bg-surface-raised shadow-card">
      <summary
        class="list-none cursor-pointer p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
      >
        <div
          class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-foreground-subtle"
        >
          <time :datetime="node.date">{{ formatMonth(node.date) }}</time>
          <span v-if="endLabel" aria-hidden="true">—</span>
          <span v-if="endLabel">{{ endLabel }}</span>
          <span class="inline-flex items-center gap-1 text-foreground-muted">
            <UIcon :name="typeIcon" class="h-3.5 w-3.5" aria-hidden="true" />
            {{ t(`story.types.${node.kind}`) }}
          </span>
          <span v-if="node.source === 'github'" class="text-accent">
            {{ t('story.fromGithub') }}
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="ml-auto h-4 w-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </div>

        <h3 class="mt-2 text-lg font-semibold text-foreground wrap-anywhere">{{ node.title }}</h3>
        <p v-if="node.organization" class="mt-1 text-sm text-foreground-muted">
          {{ node.organization }}<span v-if="node.location"> · {{ node.location }}</span>
        </p>
      </summary>

      <div class="border-t border-border p-5 pt-4">
        <p
          v-if="node.description"
          class="max-w-[75ch] text-pretty text-sm leading-relaxed text-foreground-muted"
        >
          {{ node.description }}
        </p>
        <ul
          v-if="node.highlights.length > 0"
          class="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground-muted"
        >
          <li v-for="highlight in node.highlights" :key="highlight">{{ highlight }}</li>
        </ul>
        <ul v-if="node.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
          <li
            v-for="tag in node.tags"
            :key="tag"
            class="rounded-control border border-border px-2 py-0.5 font-mono text-xs text-foreground-subtle"
          >
            {{ tag }}
          </li>
        </ul>
        <div class="mt-4 flex flex-wrap gap-3">
          <AppLink v-if="detailPath" :to="detailPath" class="text-accent hover:text-accent-hover">
            {{ t('story.openProject') }}
          </AppLink>
          <AppLink v-else-if="node.link" :href="node.link" external>
            {{ t('story.openLink') }}
          </AppLink>
        </div>
      </div>
    </details>
  </li>
</template>
