<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { profile } = useSiteData()
const { data: dataset } = await useProjects()
const { data: dataIcons } = await useDataIcons()

usePageSeo()

const skillGroups = computed(() => profile.value.skills.groups)
</script>

<template>
  <div>
    <BentoSection v-if="dataset" :dataset="dataset" :profile="profile" />
    <section v-else id="home" aria-labelledby="home-title" class="border-b border-border">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div class="max-w-3xl">
          <h1
            id="home-title"
            class="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground md:text-6xl"
          >
            {{ profile.meta.fullName }}
          </h1>
          <p class="mt-4 text-xl text-foreground-muted md:text-2xl">
            {{ profile.meta.role }}
          </p>
          <p class="mt-6 max-w-[60ch] text-pretty text-lg leading-relaxed text-foreground">
            {{ profile.meta.tagline }}
          </p>
          <AppButton
            :to="{ path: localePath('/'), hash: '#about' }"
            intent="secondary"
            icon="i-lucide-user"
            class="mt-8"
          >
            {{ t('home.readAbout') }}
          </AppButton>
        </div>
      </div>
    </section>

    <!-- Chi sono e cosa so fare subito dopo la Bento; poi storia e progetti. -->
    <SectionShell id="about" :eyebrow="t('home.aboutEyebrow')" :title="t('home.about')">
      <div
        class="max-w-[65ch] space-y-4 text-pretty text-base leading-relaxed text-foreground-muted"
      >
        <p v-for="paragraph in profile.about.paragraphs" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>
    </SectionShell>

    <SectionShell id="skills" :eyebrow="t('home.skillsEyebrow')" :title="t('home.skills')">
      <ul class="grid gap-4 md:grid-cols-2">
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
              <DataIcon
                v-if="item.icon && dataIcons?.[item.icon]"
                :icon="dataIcons[item.icon]!"
                class="h-3.5 w-3.5 shrink-0"
              />
              {{ item.name }}
            </li>
          </ul>
        </li>
      </ul>
    </SectionShell>

    <StorySection
      v-if="dataset"
      :profile="profile"
      :story-events="dataset.storyEvents"
      :synced-at="dataset.syncedAt"
    />

    <ExploreSection v-if="dataset" :repositories="dataset.repositories" />
    <SectionShell
      v-else
      id="projects"
      :eyebrow="t('home.projectsEyebrow')"
      :title="t('home.projects')"
    >
      <ErrorState
        :title="t('projects.error.title')"
        :description="t('projects.error.description')"
      />
    </SectionShell>

    <!-- Opzionale: compare solo se il profilo elenca dei libri. -->
    <ReadingSection v-if="profile.books.length > 0" :books="profile.books" />
  </div>
</template>
