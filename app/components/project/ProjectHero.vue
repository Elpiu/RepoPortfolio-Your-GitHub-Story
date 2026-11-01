<script setup lang="ts">
import type { Repository } from '~~/shared/types'
import { formatCompactNumber, formatSizeKb } from '~~/shared/utils/format'
import { languageColor } from '~~/shared/utils/language-colors'

defineProps<{
  repository: Repository
  headings: Array<{ id: string; text: string; level: 2 | 3 | 4 }>
}>()

const { t, locale } = useI18n()
</script>

<template>
  <header class="border-b border-border pb-10">
    <div
      class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-foreground-muted"
    >
      <span v-if="repository.language" class="inline-flex items-center gap-1.5">
        <span
          class="h-2 w-2 rounded-full"
          :style="{ backgroundColor: languageColor(repository.language) }"
          aria-hidden="true"
        />
        {{ repository.language }}
      </span>
      <span v-if="repository.license">{{ repository.license.name }}</span>
      <span class="inline-flex items-center gap-1.5">
        <UIcon name="i-lucide-star" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ formatCompactNumber(repository.stars, locale) }}
        <span class="sr-only">{{ t('projects.stars') }}</span>
      </span>
      <span class="inline-flex items-center gap-1.5">
        <UIcon name="i-lucide-git-fork" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ formatCompactNumber(repository.forks, locale) }}
        <span class="sr-only">{{ t('projects.forks') }}</span>
      </span>
      <span class="inline-flex items-center gap-1.5">
        <UIcon name="i-lucide-hard-drive" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ formatSizeKb(repository.sizeKb) }}
      </span>
      <span v-if="repository.pushedAt" class="inline-flex items-center gap-1.5">
        {{ t('project.lastPush') }}
        <TechDate :date="repository.pushedAt" />
      </span>
    </div>

    <h1
      id="project-title"
      class="mt-4 text-balance text-4xl font-semibold tracking-[-0.03em] text-foreground wrap-anywhere md:text-5xl"
    >
      {{ repository.name }}
    </h1>
    <p class="mt-3 max-w-[65ch] text-pretty text-base leading-relaxed text-foreground-muted">
      {{ repository.description ?? t('projects.noDescription') }}
    </p>

    <ul v-if="repository.topics.length > 0" class="mt-5 flex flex-wrap gap-2">
      <li
        v-for="topic in repository.topics"
        :key="topic"
        class="rounded-control border border-border px-2.5 py-1 font-mono text-xs text-foreground-subtle"
      >
        {{ topic }}
      </li>
    </ul>

    <div class="mt-7 flex flex-wrap gap-3">
      <AppButton :href="repository.url" external icon="i-lucide-github">
        {{ t('project.openOnGitHub') }}
      </AppButton>
      <AppButton
        v-if="repository.homepage"
        :href="repository.homepage"
        external
        intent="secondary"
        icon="i-lucide-external-link"
      >
        {{ t('project.openDemo') }}
      </AppButton>
    </div>

    <nav
      v-if="headings.length > 0"
      :aria-label="t('project.onThisPage')"
      class="mt-10 rounded-card border border-border bg-surface-muted/40 p-5"
    >
      <h2 class="font-mono text-xs uppercase tracking-[0.16em] text-foreground-subtle">
        {{ t('project.onThisPage') }}
      </h2>
      <ol class="mt-3 space-y-1.5 text-sm">
        <li
          v-for="heading in headings"
          :key="heading.id"
          :class="heading.level === 3 ? 'pl-4' : heading.level === 4 ? 'pl-8' : ''"
        >
          <a
            :href="`#${heading.id}`"
            class="text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {{ heading.text }}
          </a>
        </li>
      </ol>
    </nav>
  </header>
</template>
