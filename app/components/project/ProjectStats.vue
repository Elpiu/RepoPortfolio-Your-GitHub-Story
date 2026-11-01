<script setup lang="ts">
import type { Repository } from '~~/shared/types'
import { formatCompactNumber, formatSizeKb } from '~~/shared/utils/format'
import { languageColor } from '~~/shared/utils/language-colors'

const props = defineProps<{
  repository: Repository
}>()

const { t, locale } = useI18n()
const color = computed(() =>
  props.repository.language ? languageColor(props.repository.language) : null,
)
</script>

<template>
  <ul class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-foreground-muted">
    <li class="inline-flex items-center gap-1.5">
      <UIcon name="i-lucide-star" class="h-3.5 w-3.5" aria-hidden="true" />
      <span>{{ formatCompactNumber(repository.stars, locale) }}</span>
      <span class="sr-only">{{ t('projects.stars') }}</span>
    </li>
    <li class="inline-flex items-center gap-1.5">
      <UIcon name="i-lucide-git-fork" class="h-3.5 w-3.5" aria-hidden="true" />
      <span>{{ formatCompactNumber(repository.forks, locale) }}</span>
      <span class="sr-only">{{ t('projects.forks') }}</span>
    </li>
    <li v-if="repository.language" class="inline-flex items-center gap-1.5">
      <span
        class="h-2 w-2 rounded-full"
        :style="{ backgroundColor: color ?? undefined }"
        aria-hidden="true"
      />
      <span data-testid="project-language">{{ repository.language }}</span>
    </li>
    <li class="inline-flex items-center gap-1.5">
      <UIcon name="i-lucide-hard-drive" class="h-3.5 w-3.5" aria-hidden="true" />
      <span>{{ formatSizeKb(repository.sizeKb) }}</span>
    </li>
    <li class="inline-flex items-center gap-1.5">
      <span class="sr-only">{{ t('projects.updated') }}</span>
      <TechDate :date="repository.updatedAt" />
    </li>
  </ul>
</template>
