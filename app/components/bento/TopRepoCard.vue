<script setup lang="ts">
import type { Repository } from '~~/shared/types'
import { formatCompactNumber } from '~~/shared/utils/format'
import { languageColor } from '~~/shared/utils/language-colors'

const props = defineProps<{
  repository: Repository
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const detailPath = computed(() => localePath(`/projects/${props.repository.slug}`))
</script>

<template>
  <article
    data-testid="top-repo-card"
    class="flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-raised shadow-card"
  >
    <NuxtLink
      :to="detailPath"
      :aria-label="t('projects.openProject', { name: repository.name })"
      class="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ProjectImage :repository="repository" />
    </NuxtLink>

    <div class="flex flex-1 flex-col p-6">
      <p class="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        {{ t('bento.topRepo') }}
      </p>
      <h2 class="mt-2 truncate text-xl font-semibold text-foreground">
        <NuxtLink :to="detailPath" class="underline-offset-4 hover:underline">
          {{ repository.name }}
        </NuxtLink>
      </h2>
      <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-muted">
        {{ repository.description ?? t('projects.noDescription') }}
      </p>

      <div
        class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 font-mono text-xs text-foreground-muted"
      >
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-star" class="h-3.5 w-3.5" aria-hidden="true" />
          {{ formatCompactNumber(repository.stars, locale) }}
          <span class="sr-only">{{ t('projects.stars') }}</span>
        </span>
        <span v-if="repository.language" class="inline-flex items-center gap-1.5">
          <span
            class="h-2 w-2 rounded-full"
            :style="{ backgroundColor: languageColor(repository.language) }"
            aria-hidden="true"
          />
          {{ repository.language }}
        </span>
      </div>
    </div>
  </article>
</template>
