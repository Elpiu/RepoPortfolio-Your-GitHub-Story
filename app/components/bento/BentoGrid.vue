<script setup lang="ts">
import type { Profile } from '~~/shared/schemas/profile'
import type { GitHubDataset } from '~~/shared/types'
import { featuredRepositories } from '~~/shared/utils/repo'

const props = defineProps<{
  dataset: GitHubDataset
  profile: Profile
}>()

const { t } = useI18n()
const topRepository = computed(() => featuredRepositories(props.dataset.repositories)[0] ?? null)
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <ProfileCard
      class="md:col-span-2"
      :profile="profile"
      :username="dataset.username"
      :synced-at="dataset.syncedAt"
    />

    <TopRepoCard v-if="topRepository" class="md:col-span-2" :repository="topRepository" />
    <article
      v-else
      class="flex items-center rounded-card border border-dashed border-border bg-surface-muted/50 p-6 text-sm text-foreground-muted md:col-span-2"
    >
      {{ t('bento.noTopRepo') }}
    </article>

    <article
      class="rounded-card border border-border bg-surface-raised p-6 shadow-card md:col-span-1 lg:col-span-2"
    >
      <p class="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        {{ t('bento.language') }}
      </p>
      <h2 class="mt-2 text-xl font-semibold text-foreground">
        {{ t('bento.languages') }}
      </h2>
      <div class="mt-5">
        <LanguageBar :stats="dataset.languageStats" />
      </div>
    </article>

    <ActivityCard
      class="md:col-span-1 lg:col-span-2"
      :activity="dataset.activity"
      :synced-at="dataset.syncedAt"
    />
  </div>
</template>
