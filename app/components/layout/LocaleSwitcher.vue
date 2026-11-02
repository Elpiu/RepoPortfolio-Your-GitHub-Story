<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const details = ref<HTMLDetailsElement | null>(null)

// Link veri invece di una <select>: funzionano senza JS, seguono i token del tema
// (le opzioni native restano bianche su Windows) e portano alla pagina equivalente.
const entries = computed(() =>
  locales.value.map((entry) => ({
    code: entry.code,
    name: entry.name ?? entry.code,
    language: entry.language ?? entry.code,
    path: switchLocalePath(entry.code) || '/',
  })),
)

function close() {
  details.value?.removeAttribute('open')
}

onClickOutside(details, close)
</script>

<template>
  <details v-if="entries.length > 1" ref="details" class="relative" @keydown.esc="close">
    <summary
      class="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-control px-2 py-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
    >
      <UIcon name="i-lucide-languages" class="h-4 w-4" aria-hidden="true" />
      <span class="font-mono text-xs uppercase" aria-hidden="true">{{ locale }}</span>
      <span class="sr-only">{{ t('language.label') }}</span>
      <UIcon name="i-lucide-chevron-down" class="h-3 w-3" aria-hidden="true" />
    </summary>
    <ul
      :aria-label="t('language.label')"
      class="absolute right-0 z-50 mt-2 min-w-40 rounded-card border border-border bg-surface-raised p-1 shadow-card"
    >
      <li v-for="entry in entries" :key="entry.code">
        <NuxtLink
          :to="entry.path"
          :lang="entry.language"
          :hreflang="entry.language"
          :aria-current="entry.code === locale ? 'true' : undefined"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface-muted hover:text-foreground"
          :class="entry.code === locale ? 'text-foreground' : 'text-foreground-muted'"
          @click="close"
        >
          {{ entry.name }}
          <UIcon
            v-if="entry.code === locale"
            name="i-lucide-check"
            class="ml-auto h-4 w-4 text-accent"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
    </ul>
  </details>
</template>
