<script setup lang="ts">
import type { Activity } from '~~/shared/types'

const props = defineProps<{
  activity: Activity | null
  syncedAt: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const detailPath = computed(() =>
  props.activity ? localePath(`/projects/${props.activity.repoSlug}`) : null,
)
</script>

<template>
  <article
    data-testid="activity-card"
    class="flex h-full flex-col rounded-card border border-border bg-surface-raised p-6 shadow-card"
  >
    <p class="font-mono text-xs uppercase tracking-[0.18em] text-accent">
      {{ t('bento.activity') }}
    </p>

    <template v-if="activity">
      <h2 class="mt-2 truncate text-xl font-semibold text-foreground">
        <NuxtLink v-if="detailPath" :to="detailPath" class="underline-offset-4 hover:underline">
          {{ activity.repoName }}
        </NuxtLink>
      </h2>
      <dl class="mt-4 grid gap-2 font-mono text-xs text-foreground-muted">
        <div class="flex items-center gap-2">
          <dt class="text-foreground-subtle">{{ t('bento.branch') }}</dt>
          <dd>{{ activity.branch }}</dd>
        </div>
        <div v-if="activity.pushedAt" class="flex items-center gap-2">
          <dt class="text-foreground-subtle">{{ t('bento.lastPush') }}</dt>
          <dd><TechDate :date="activity.pushedAt" /></dd>
        </div>
      </dl>
    </template>
    <p v-else class="mt-3 text-sm text-foreground-muted">
      {{ t('bento.noActivity') }}
    </p>

    <p
      class="mt-auto flex flex-wrap items-center gap-2 pt-6 font-mono text-xs text-foreground-subtle"
    >
      <span>{{ t('bento.lastSynced') }}</span>
      <TechDate :date="syncedAt" />
    </p>
  </article>
</template>
