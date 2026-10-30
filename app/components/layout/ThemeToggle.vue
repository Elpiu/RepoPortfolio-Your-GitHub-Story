<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()
const details = ref<HTMLDetailsElement | null>(null)

const modes = [
  { value: 'light', icon: 'i-lucide-sun', label: 'theme.light' },
  { value: 'dark', icon: 'i-lucide-moon', label: 'theme.dark' },
  { value: 'system', icon: 'i-lucide-monitor', label: 'theme.system' },
] as const

const currentMode = computed(
  () => modes.find((mode) => mode.value === colorMode.preference) ?? modes[1],
)

function selectMode(value: string) {
  colorMode.preference = value
  details.value?.removeAttribute('open')
}

function close() {
  details.value?.removeAttribute('open')
}
</script>

<template>
  <details ref="details" class="relative">
    <summary
      class="inline-flex cursor-pointer list-none items-center justify-center rounded-control p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
      @keydown.esc="close"
    >
      <UIcon :name="currentMode.icon" class="h-4 w-4" aria-hidden="true" />
      <span class="sr-only">{{ t('theme.label') }}</span>
    </summary>
    <ul
      class="absolute right-0 z-50 mt-2 min-w-44 rounded-card border border-border bg-surface-raised p-1 shadow-card"
    >
      <li v-for="mode in modes" :key="mode.value">
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          @click="selectMode(mode.value)"
        >
          <UIcon :name="mode.icon" class="h-4 w-4" aria-hidden="true" />
          {{ t(mode.label) }}
          <UIcon
            v-if="colorMode.preference === mode.value"
            name="i-lucide-check"
            class="ml-auto h-4 w-4 text-accent"
            aria-hidden="true"
          />
        </button>
      </li>
    </ul>
  </details>
</template>
