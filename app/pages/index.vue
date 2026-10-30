<script setup lang="ts">
import { formatMonth } from '~~/shared/utils/format'

const { t } = useI18n()
const localePath = useLocalePath()
const { profile, githubUrl } = useSiteData()

usePageSeo()

const experiences = computed(() =>
  [...profile.value.experiences].sort((left, right) => right.start.localeCompare(left.start)),
)

const skillGroups = computed(() => profile.value.skills.groups)
</script>

<template>
  <div>
    <section id="home" aria-labelledby="home-title" class="scroll-mt-24 border-b border-border">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div class="max-w-3xl">
          <div class="flex flex-wrap items-center gap-3">
            <UBadge
              v-if="profile.meta.available"
              color="primary"
              variant="subtle"
              class="rounded-control"
            >
              <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-available" aria-hidden="true" />
              {{ profile.meta.availability ?? t('home.available') }}
            </UBadge>
            <UBadge v-else color="neutral" variant="subtle" class="rounded-control">
              {{ t('home.unavailable') }}
            </UBadge>
            <p
              v-if="profile.meta.location"
              class="font-mono text-xs uppercase tracking-[0.16em] text-foreground-subtle"
            >
              {{ profile.meta.location }}
            </p>
          </div>

          <h1
            id="home-title"
            class="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground md:text-6xl lg:text-7xl"
          >
            {{ profile.meta.fullName }}
          </h1>
          <p class="mt-4 text-xl text-foreground-muted md:text-2xl">
            {{ profile.meta.role }}
          </p>
          <p class="mt-6 max-w-[60ch] text-pretty text-lg leading-relaxed text-foreground">
            {{ profile.meta.tagline }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <AppButton
              :to="{ path: localePath('/'), hash: '#projects' }"
              icon="i-lucide-arrow-down"
            >
              {{ t('home.viewProjects') }}
            </AppButton>
            <AppButton
              :to="{ path: localePath('/'), hash: '#about' }"
              intent="secondary"
              icon="i-lucide-user"
            >
              {{ t('home.readAbout') }}
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <SectionShell id="about" :eyebrow="t('home.aboutEyebrow')" :title="t('home.about')">
      <div class="grid gap-8 md:grid-cols-[1.6fr_1fr]">
        <div class="space-y-4 text-pretty text-base leading-relaxed text-foreground-muted">
          <p v-for="paragraph in profile.about.paragraphs" :key="paragraph">
            {{ paragraph }}
          </p>
        </div>
        <div class="rounded-card border border-border bg-surface-raised p-6 shadow-card">
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-foreground-subtle">
            {{ t('home.skillsEyebrow') }}
          </p>
          <ul class="mt-4 flex flex-wrap gap-2">
            <li v-for="group in skillGroups" :key="group.id">
              <UBadge color="neutral" variant="subtle" class="rounded-control">
                {{ group.label }}
              </UBadge>
            </li>
          </ul>
        </div>
      </div>
    </SectionShell>

    <SectionShell id="projects" :eyebrow="t('home.projectsEyebrow')" :title="t('home.projects')">
      <EmptyState :title="t('home.projects')" :description="t('home.projectsEmpty')">
        <AppButton
          v-if="githubUrl"
          :href="githubUrl"
          external
          intent="secondary"
          icon="i-lucide-github"
        >
          {{ t('home.github') }}
        </AppButton>
      </EmptyState>
    </SectionShell>

    <SectionShell id="skills" :eyebrow="t('home.skillsEyebrow')" :title="t('home.skills')">
      <ul class="grid gap-4 md:grid-cols-3">
        <li
          v-for="group in skillGroups"
          :key="group.id"
          class="rounded-card border border-border bg-surface-raised p-5 shadow-card"
        >
          <h3 class="font-mono text-xs uppercase tracking-[0.16em] text-foreground-subtle">
            {{ group.label }}
          </h3>
          <ul class="mt-4 flex flex-wrap gap-2">
            <li
              v-for="item in group.items"
              :key="item.name"
              class="inline-flex items-center gap-2 rounded-control border border-border px-3 py-1 text-xs text-foreground-muted"
            >
              <UIcon v-if="item.icon" :name="item.icon" class="h-3.5 w-3.5" aria-hidden="true" />
              {{ item.name }}
            </li>
          </ul>
        </li>
      </ul>
    </SectionShell>

    <SectionShell
      id="experience"
      :eyebrow="t('home.experienceEyebrow')"
      :title="t('home.experience')"
    >
      <p
        v-if="experiences.length === 0"
        class="rounded-card border border-dashed border-border bg-surface-muted/50 px-6 py-12 text-center text-sm text-foreground-muted"
      >
        {{ t('home.experienceEmpty') }}
      </p>
      <ol v-else class="space-y-4">
        <li
          v-for="experience in experiences"
          :key="experience.id"
          class="rounded-card border border-border bg-surface-raised p-6 shadow-card"
        >
          <div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 class="text-lg font-semibold text-foreground">
              {{ experience.title }}
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
          <p class="mt-1 text-sm text-foreground-muted">
            {{ experience.organization }} · {{ experience.location }}
          </p>
          <p class="mt-3 text-sm leading-relaxed text-foreground-muted">
            {{ experience.description }}
          </p>
          <ul
            v-if="experience.highlights.length > 0"
            class="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground-muted"
          >
            <li v-for="highlight in experience.highlights" :key="highlight">
              {{ highlight }}
            </li>
          </ul>
        </li>
      </ol>
    </SectionShell>
  </div>
</template>
