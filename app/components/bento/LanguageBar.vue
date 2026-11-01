<script setup lang="ts">
import type { LanguageStat } from '~~/shared/types'

defineProps<{
  stats: LanguageStat[]
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <div
      v-if="stats.length > 0"
      class="flex h-2.5 w-full overflow-hidden rounded-control border border-border bg-surface-muted"
      aria-hidden="true"
    >
      <span
        v-for="stat in stats"
        :key="stat.name"
        :style="{ width: `${stat.percent}%`, backgroundColor: stat.color }"
        :title="`${stat.name} ${stat.percent}%`"
      />
    </div>
    <p v-else class="text-sm text-foreground-muted">
      {{ t('bento.noLanguages') }}
    </p>

    <ul v-if="stats.length > 0" class="mt-4 grid gap-2 sm:grid-cols-2">
      <li
        v-for="stat in stats"
        :key="stat.name"
        class="flex items-center justify-between gap-3 text-sm"
      >
        <span class="inline-flex min-w-0 items-center gap-2 text-foreground-muted">
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :style="{ backgroundColor: stat.color }"
            aria-hidden="true"
          />
          <span class="truncate">{{ stat.name }}</span>
        </span>
        <span class="font-mono text-xs text-foreground-subtle">
          {{ stat.percent }}%
          <span class="sr-only">{{ t('bento.languageRepos', { count: stat.repos }) }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
