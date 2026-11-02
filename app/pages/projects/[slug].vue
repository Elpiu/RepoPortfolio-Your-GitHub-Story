<script setup lang="ts">
import type { ProjectDetail } from '~~/shared/types'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { profile } = useSiteData()
const slug = String(route.params.slug ?? '')

const { data: detail } = await useAsyncData<ProjectDetail>(`project-${slug}`, () =>
  $fetch<ProjectDetail>(`/api/repositories/${slug}`),
)

if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: t('project.notFound') })
}

const repository = computed(() => detail.value!.repository)

usePageSeo({
  title: `${repository.value.name} — ${profile.value.meta.fullName}`,
  description: repository.value.description ?? profile.value.meta.tagline,
  type: 'article',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: repository.value.name,
    description: repository.value.description ?? undefined,
    codeRepository: repository.value.url,
    programmingLanguage: repository.value.language ?? undefined,
    dateCreated: repository.value.createdAt,
    dateModified: repository.value.updatedAt,
    license: repository.value.license?.spdxId ?? undefined,
    keywords: repository.value.topics.join(', ') || undefined,
  },
})
</script>

<template>
  <div v-if="detail">
    <section aria-labelledby="project-title" class="py-12 md:py-16">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav :aria-label="t('project.breadcrumb')" class="mb-8">
          <NuxtLink
            :to="{ path: localePath('/'), hash: '#projects' }"
            class="inline-flex items-center gap-2 text-sm text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <UIcon name="i-lucide-arrow-left" class="h-4 w-4" aria-hidden="true" />
            {{ t('project.backToProjects') }}
          </NuxtLink>
        </nav>

        <ProjectHero :repository="detail.repository" :headings="detail.headings" />

        <ReadmeContent
          v-if="detail.readmeHtml"
          :html="detail.readmeHtml"
          :truncated="detail.readmeTruncated"
          :repository="detail.repository"
        />
        <EmptyState
          v-else
          class="mt-10"
          :title="t('project.readmeUnavailable')"
          :description="t('project.readmeUnavailableDescription')"
        >
          <AppButton
            :href="detail.repository.url"
            external
            intent="secondary"
            icon="i-lucide-github"
          >
            {{ t('project.openOnGitHub') }}
          </AppButton>
        </EmptyState>
      </div>
    </section>

    <FloatingBackLink />
  </div>
</template>
