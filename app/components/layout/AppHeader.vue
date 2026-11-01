<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { site } = useSiteData()
const activeId = useActiveSection(['home', 'experience', 'projects', 'about', 'skills', 'contact'])

const sections = ['home', 'experience', 'projects', 'about', 'skills', 'contact'] as const
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
    <div
      class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:h-18 lg:px-8"
    >
      <NuxtLink
        :to="localePath('/')"
        class="flex min-w-0 items-center gap-2 font-mono text-sm font-medium tracking-tight text-foreground"
      >
        <span class="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <span class="truncate">{{ site.seo.siteName ?? t('app.name') }}</span>
      </NuxtLink>

      <nav :aria-label="t('nav.label')" class="hidden md:block">
        <ul class="flex items-center gap-1">
          <li v-for="section in sections" :key="section">
            <NuxtLink
              :to="{ path: localePath('/'), hash: `#${section}` }"
              :aria-current="activeId === section ? 'location' : undefined"
              class="rounded-control px-3 py-2 text-sm transition-colors"
              :class="
                activeId === section
                  ? 'bg-surface-muted text-foreground'
                  : 'text-foreground-muted hover:text-foreground'
              "
            >
              {{ t(`nav.${section}`) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <LocaleSwitcher />
        <MobileMenu />
      </div>
    </div>
  </header>
</template>
