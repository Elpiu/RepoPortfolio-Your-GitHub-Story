<script setup lang="ts">
const { t } = useI18n()
const { site, profile, githubUrl } = useSiteData()
const config = useRuntimeConfig()
const version = config.public.version
</script>

<template>
  <footer
    id="contact"
    aria-labelledby="contact-title"
    class="scroll-mt-24 border-t border-border bg-surface-muted/40"
  >
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 id="contact-title" class="sr-only">{{ t('nav.contact') }}</h2>

      <div class="grid gap-10 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {{ t('home.contactEyebrow') }}
          </p>
          <p
            class="mt-3 text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-3xl"
          >
            {{ t('home.contact') }}
          </p>
          <p class="mt-3 max-w-[55ch] text-pretty text-base text-foreground-muted">
            {{ t('home.contactDescription') }}
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <AppButton :href="`mailto:${site.links.email}`" icon="i-lucide-mail">
              {{ t('home.email') }}
            </AppButton>
            <AppButton
              v-if="githubUrl"
              :href="githubUrl"
              external
              intent="secondary"
              icon="i-lucide-github"
            >
              {{ t('home.github') }}
            </AppButton>
          </div>
        </div>

        <div class="flex flex-col gap-1 text-sm text-foreground-muted">
          <p class="font-medium text-foreground">{{ profile.meta.fullName }}</p>
          <p v-if="profile.meta.location">{{ profile.meta.location }}</p>
          <a
            :href="`mailto:${site.links.email}`"
            class="w-fit underline-offset-4 hover:text-foreground hover:underline"
          >
            {{ site.links.email }}
          </a>
          <a
            v-if="site.links.linkedin"
            :href="site.links.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="w-fit underline-offset-4 hover:text-foreground hover:underline"
          >
            LinkedIn
          </a>
          <p class="mt-6 font-mono text-xs text-foreground-subtle">
            {{ t('footer.credit') }}
          </p>
          <p class="font-mono text-xs text-foreground-subtle">
            {{ t('footer.version') }} v{{ version }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
