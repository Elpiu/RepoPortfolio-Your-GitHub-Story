<script setup lang="ts">
import type { Repository } from '~~/shared/types'
import { languageIconName } from '~~/shared/utils/language-icons'

const props = defineProps<{
  repository: Repository
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const detailPath = computed(() => localePath(`/projects/${props.repository.slug}`))

// L'icona di marca arriva dal payload (/api/data-icons), non dal bundle JS.
const dataIcons = useLoadedDataIcons()
const brandIcon = computed(() => {
  const name = languageIconName(props.repository.language)
  return name ? (dataIcons.value?.[name] ?? null) : null
})
const fallbackIcon = computed(() =>
  props.repository.language ? 'i-lucide-code' : 'i-lucide-folder-git-2',
)
const topics = computed(() => props.repository.topics.slice(0, 5))
const extraTopics = computed(() =>
  Math.max(0, props.repository.topics.length - topics.value.length),
)
</script>

<template>
  <article
    data-testid="project-card"
    data-spotlight
    class="spotlight group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-raised shadow-card transition-[transform,box-shadow,border-color] duration-150 ease-out motion-safe:hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
  >
    <NuxtLink
      :to="detailPath"
      :aria-label="t('projects.openProject', { name: repository.name })"
      class="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ProjectImage :repository="repository" />
    </NuxtLink>

    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <DataIcon
            v-if="brandIcon"
            :icon="brandIcon"
            class="h-4 w-4 shrink-0 text-foreground-muted"
          />
          <UIcon
            v-else
            :name="fallbackIcon"
            class="h-4 w-4 shrink-0 text-foreground-muted"
            aria-hidden="true"
          />
          <h3 class="truncate text-base font-semibold text-foreground">
            <NuxtLink :to="detailPath" class="underline-offset-4 hover:underline">
              {{ repository.name }}
            </NuxtLink>
          </h3>
          <span
            v-if="repository.isPinned"
            class="shrink-0 rounded-control border border-border px-2 py-0.5 font-mono text-[0.65rem] uppercase text-foreground-muted"
          >
            {{ t('projects.pinned') }}
          </span>
        </div>

        <a
          v-if="repository.homepage"
          :href="repository.homepage"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('projects.openDemo', { name: repository.name })"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <UIcon name="i-lucide-external-link" class="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
        {{ repository.description ?? t('projects.noDescription') }}
      </p>

      <ul v-if="topics.length > 0" class="mt-4 flex flex-wrap gap-1.5">
        <li
          v-for="topic in topics"
          :key="topic"
          class="rounded-control border border-border px-2 py-0.5 font-mono text-[0.65rem] text-foreground-subtle"
        >
          {{ topic }}
        </li>
        <li
          v-if="extraTopics > 0"
          class="rounded-control border border-border px-2 py-0.5 font-mono text-[0.65rem] text-foreground-subtle"
        >
          {{ t('projects.topicsMore', { count: extraTopics }) }}
        </li>
      </ul>

      <div class="mt-auto pt-5">
        <ProjectStats :repository="repository" />
      </div>
    </div>
  </article>
</template>
