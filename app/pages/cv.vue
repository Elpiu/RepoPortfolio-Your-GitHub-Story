<script setup lang="ts">
import { featuredRepositories } from '~~/shared/utils/repo'

definePageMeta({ layout: 'print' })

const { t, locale } = useI18n()
const { site } = useSiteData()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { profile } = useSiteData()
const { data: dataset } = await useProjects()

const projects = computed(() => featuredRepositories(dataset.value?.repositories ?? [], 6))
const username = computed(() => dataset.value?.username ?? '')
const resumeHref = computed(() => {
  const base = config.app.baseURL.endsWith('/') ? config.app.baseURL : `${config.app.baseURL}/`
  const defaultLocale = site.locales.find((entry) => entry.default)?.code ?? 'en'
  const path = locale.value === defaultLocale ? '/resume.json' : `/${locale.value}/resume.json`
  return `${base.replace(/\/$/, '')}${path}`
})

usePageSeo({
  title: `${profile.value.meta.fullName} — CV`,
  description: profile.value.meta.tagline,
  type: 'profile',
})
</script>

<template>
  <div class="cv-page">
    <div
      class="cv-toolbar mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 pt-8 print:hidden"
    >
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center gap-2 text-sm text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" aria-hidden="true" />
        {{ t('cv.backHome') }}
      </NuxtLink>
      <div class="flex flex-wrap items-center gap-3">
        <a
          :href="resumeHref"
          class="font-mono text-xs text-foreground-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          {{ t('cv.resumeJson') }}
        </a>
        <PrintButton />
      </div>
    </div>

    <div class="px-4 py-8 print:p-0">
      <CvDocument :profile="profile" :projects="projects" :username="username" />
    </div>
  </div>
</template>
