<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const switchPath = (code: string) =>
  switchLocalePath(code as Parameters<typeof switchLocalePath>[0])

async function onChange(event: Event) {
  const code = (event.target as HTMLSelectElement).value
  const path = switchPath(code)
  if (path) await navigateTo(path)
}
</script>

<template>
  <label
    v-if="locales.length > 1"
    class="relative inline-flex items-center gap-1 rounded-control px-2 py-1 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
  >
    <span class="sr-only">{{ t('language.label') }}</span>
    <UIcon name="i-lucide-languages" class="h-4 w-4" aria-hidden="true" />
    <select
      :value="locale"
      class="cursor-pointer appearance-none bg-transparent pr-4 font-mono text-xs uppercase outline-none"
      @change="onChange"
    >
      <option v-for="entry in locales" :key="entry.code" :value="entry.code">
        {{ entry.name }}
      </option>
    </select>
    <UIcon
      name="i-lucide-chevron-down"
      class="pointer-events-none absolute right-1 h-3 w-3"
      aria-hidden="true"
    />
  </label>
</template>
