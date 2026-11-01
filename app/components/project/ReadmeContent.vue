<script setup lang="ts">
import type { Repository } from '~~/shared/types'

defineProps<{
  html: string
  truncated: boolean
  repository: Repository
}>()

const { t } = useI18n()
</script>

<template>
  <div class="mt-10">
    <p
      v-if="truncated"
      role="status"
      class="mb-6 rounded-card border border-border bg-surface-muted px-4 py-3 text-sm text-foreground-muted"
    >
      {{ t('project.truncated') }}
      <a
        :href="repository.url"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-4 hover:text-foreground"
      >
        {{ t('project.openOnGitHub') }}
      </a>
    </p>

    <!-- HTML già sanificato in build: unico v-html consentito del progetto. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="readme" v-html="html" />
  </div>
</template>
