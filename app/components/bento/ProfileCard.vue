<script setup lang="ts">
import type { Profile } from '~~/shared/schemas/profile'
import { yearsOfExperience } from '~~/shared/utils/experience'
import { githubProfileUrl, profileAvatarUrl } from '~~/shared/utils/profile'

const props = defineProps<{
  profile: Profile
  username: string
  syncedAt: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { site } = useSiteData()

const years = computed(() => yearsOfExperience(site.career.start, props.syncedAt))
const avatarUrl = computed(() => profileAvatarUrl(props.profile.meta.avatarUrl, props.username))
const githubProfile = computed(() => githubProfileUrl(props.username))
const phoneHref = computed(() =>
  site.links.phone ? `tel:${site.links.phone.replace(/\s+/g, '')}` : null,
)
const availability = computed(
  () =>
    props.profile.meta.availability ??
    (props.profile.meta.available ? t('home.available') : t('home.unavailable')),
)
</script>

<template>
  <article
    data-testid="profile-card"
    class="flex h-full flex-col rounded-card border border-border bg-surface-raised p-6 shadow-card md:p-8"
  >
    <div class="flex flex-wrap items-start gap-5">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="profile.meta.fullName"
        width="96"
        height="96"
        class="h-20 w-20 rounded-card border border-border object-cover md:h-24 md:w-24"
        decoding="async"
      />
      <div class="min-w-0 flex-1">
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {{ t('bento.eyebrow') }}
        </p>
        <h1
          id="profile-name"
          class="mt-2 text-balance text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl"
        >
          {{ profile.meta.fullName }}
        </h1>
        <p class="mt-1 text-lg text-foreground-muted">{{ profile.meta.role }}</p>
        <p v-if="profile.meta.location" class="mt-1 font-mono text-xs text-foreground-subtle">
          {{ profile.meta.location }}
        </p>
      </div>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
      <StatusDot :available="profile.meta.available" :text="availability" />
      <span v-if="years !== null" class="font-mono text-xs text-foreground-subtle">
        {{ t('bento.years', { count: years }) }}
      </span>
    </div>

    <p class="mt-4 max-w-[65ch] text-pretty text-sm leading-relaxed text-foreground-muted">
      {{ profile.meta.tagline }}
    </p>

    <p class="mt-3 font-mono text-xs text-foreground-subtle">
      <a
        :href="`mailto:${site.links.email}`"
        class="underline-offset-4 hover:text-foreground hover:underline"
      >
        {{ site.links.email }}
      </a>
      <span v-if="site.links.phone"> · {{ site.links.phone }}</span>
    </p>

    <div class="mt-auto flex flex-wrap gap-2 pt-6">
      <AppButton :href="`mailto:${site.links.email}`" icon="i-lucide-mail">
        {{ t('bento.email') }}
      </AppButton>
      <CopyButton :value="site.links.email" />
      <AppButton v-if="phoneHref" :href="phoneHref" intent="secondary" icon="i-lucide-phone">
        {{ t('bento.call') }}
      </AppButton>
      <AppButton
        v-if="githubProfile"
        :href="githubProfile"
        external
        intent="secondary"
        icon="i-lucide-github"
      >
        {{ t('bento.github') }}
      </AppButton>
      <AppButton
        v-if="site.links.linkedin"
        :href="site.links.linkedin"
        external
        intent="secondary"
        icon="i-lucide-linkedin"
      >
        {{ t('bento.linkedin') }}
      </AppButton>
      <AppButton
        v-if="site.links.cvUrl"
        :href="site.links.cvUrl"
        external
        intent="secondary"
        icon="i-lucide-file-text"
      >
        {{ t('bento.cv') }}
      </AppButton>
      <AppButton v-else :to="localePath('/cv')" intent="secondary" icon="i-lucide-file-text">
        {{ t('bento.cv') }}
      </AppButton>
      <AppButton
        :to="{ path: localePath('/'), hash: '#projects' }"
        intent="ghost"
        icon="i-lucide-arrow-down"
      >
        {{ t('bento.viewProjects') }}
      </AppButton>
    </div>
  </article>
</template>
