<script setup lang="ts">
import type { Profile } from '~~/shared/schemas/profile'
import type { Repository } from '~~/shared/types'
import { formatMonth } from '~~/shared/utils/format'
import { githubProfileUrl } from '~~/shared/utils/profile'

const props = defineProps<{
  profile: Profile
  projects: Repository[]
  username: string
}>()

const { t } = useI18n()
const { site } = useSiteData()

const work = computed(() =>
  props.profile.experiences
    .filter((experience) => experience.type === 'work')
    .sort((left, right) => right.start.localeCompare(left.start)),
)
const education = computed(() =>
  props.profile.experiences
    .filter((experience) => experience.type === 'education')
    .sort((left, right) => right.start.localeCompare(left.start)),
)
const githubUrl = computed(() => githubProfileUrl(props.username))
const phoneHref = computed(() =>
  site.links.phone ? `tel:${site.links.phone.replace(/\s+/g, '')}` : null,
)
</script>

<template>
  <article
    class="cv-document mx-auto max-w-[210mm] rounded-card border border-border bg-surface p-8 shadow-card md:p-12 print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none"
  >
    <header class="cv-header border-b border-border pb-6">
      <h1 class="text-4xl font-semibold tracking-[-0.03em] text-foreground">
        {{ profile.meta.fullName }}
      </h1>
      <p class="mt-1 text-lg text-foreground-muted">{{ profile.meta.role }}</p>
      <ul class="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-foreground-subtle">
        <li v-if="profile.meta.location">{{ profile.meta.location }}</li>
        <li>
          <a :href="`mailto:${site.links.email}`">{{ site.links.email }}</a>
        </li>
        <li v-if="phoneHref">
          <a :href="phoneHref">{{ site.links.phone }}</a>
        </li>
        <li v-if="githubUrl">
          <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
        </li>
        <li v-if="site.links.linkedin">
          <a :href="site.links.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </li>
        <li v-if="site.links.website">
          <a :href="site.links.website" target="_blank" rel="noopener noreferrer">
            {{ t('cv.website') }}
          </a>
        </li>
      </ul>
    </header>

    <section class="cv-section mt-8" aria-labelledby="cv-about">
      <h2 id="cv-about" class="cv-section-title">{{ t('cv.about') }}</h2>
      <p
        v-for="paragraph in profile.about.paragraphs"
        :key="paragraph"
        class="mt-2 max-w-[75ch] text-pretty text-sm leading-relaxed text-foreground-muted"
      >
        {{ paragraph }}
      </p>
    </section>

    <section v-if="work.length > 0" class="cv-section mt-8" aria-labelledby="cv-experience">
      <h2 id="cv-experience" class="cv-section-title">{{ t('cv.experience') }}</h2>
      <ol class="mt-3 space-y-5">
        <li v-for="experience in work" :key="experience.id" class="cv-entry">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 class="text-base font-semibold text-foreground">
              {{ experience.title }} · {{ experience.organization }}
            </h3>
            <p class="font-mono text-xs text-foreground-subtle">
              <time :datetime="experience.start">{{ formatMonth(experience.start) }}</time>
              <span aria-hidden="true"> — </span>
              <time v-if="experience.end" :datetime="experience.end">{{
                formatMonth(experience.end)
              }}</time>
              <span v-else>{{ t('home.present') }}</span>
            </p>
          </div>
          <p class="mt-0.5 font-mono text-xs text-foreground-subtle">
            {{ experience.location }}
          </p>
          <p class="mt-2 max-w-[75ch] text-sm leading-relaxed text-foreground-muted">
            {{ experience.description }}
          </p>
          <ul
            v-if="experience.highlights.length > 0"
            class="mt-2 list-disc space-y-0.5 pl-5 text-sm text-foreground-muted"
          >
            <li v-for="highlight in experience.highlights" :key="highlight">{{ highlight }}</li>
          </ul>
        </li>
      </ol>
    </section>

    <section v-if="education.length > 0" class="cv-section mt-8" aria-labelledby="cv-education">
      <h2 id="cv-education" class="cv-section-title">{{ t('cv.education') }}</h2>
      <ol class="mt-3 space-y-5">
        <li v-for="experience in education" :key="experience.id" class="cv-entry">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 class="text-base font-semibold text-foreground">
              {{ experience.title }} · {{ experience.organization }}
            </h3>
            <p class="font-mono text-xs text-foreground-subtle">
              <time :datetime="experience.start">{{ formatMonth(experience.start) }}</time>
              <span aria-hidden="true"> — </span>
              <time v-if="experience.end" :datetime="experience.end">{{
                formatMonth(experience.end)
              }}</time>
              <span v-else>{{ t('home.present') }}</span>
            </p>
          </div>
          <p class="mt-0.5 font-mono text-xs text-foreground-subtle">
            {{ experience.location }}
          </p>
          <p class="mt-2 max-w-[75ch] text-sm leading-relaxed text-foreground-muted">
            {{ experience.description }}
          </p>
        </li>
      </ol>
    </section>

    <section
      v-if="profile.skills.groups.length > 0"
      class="cv-section mt-8"
      aria-labelledby="cv-skills"
    >
      <h2 id="cv-skills" class="cv-section-title">{{ t('cv.skills') }}</h2>
      <ul class="mt-3 grid gap-3 sm:grid-cols-2">
        <li v-for="group in profile.skills.groups" :key="group.id" class="cv-entry">
          <h3 class="font-mono text-xs uppercase tracking-[0.12em] text-foreground-subtle">
            {{ group.label }}
          </h3>
          <p class="mt-1 text-sm text-foreground-muted">
            {{ group.items.map((item) => item.name).join(' · ') }}
          </p>
        </li>
      </ul>
    </section>

    <section v-if="projects.length > 0" class="cv-section mt-8" aria-labelledby="cv-projects">
      <h2 id="cv-projects" class="cv-section-title">{{ t('cv.projects') }}</h2>
      <ul class="mt-3 space-y-3">
        <li v-for="project in projects" :key="project.id" class="cv-entry">
          <h3 class="text-base font-semibold text-foreground">
            <a :href="project.url" target="_blank" rel="noopener noreferrer">
              {{ project.name }}
            </a>
          </h3>
          <p class="mt-0.5 text-sm text-foreground-muted">
            {{ project.description ?? t('projects.noDescription') }}
          </p>
          <p class="mt-0.5 font-mono text-xs text-foreground-subtle">
            <span v-if="project.language">{{ project.language }} · </span>
            {{ project.stars }} ★
          </p>
        </li>
      </ul>
    </section>
  </article>
</template>
