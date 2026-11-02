<script setup lang="ts">
const { t } = useI18n()
const details = ref<HTMLDetailsElement | null>(null)

const sections = useHomeSections()

function close() {
  details.value?.removeAttribute('open')
}

onClickOutside(details, close)
</script>

<template>
  <details ref="details" class="relative md:hidden">
    <summary
      class="inline-flex cursor-pointer list-none items-center justify-center rounded-control p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
      @keydown.esc="close"
    >
      <UIcon name="i-lucide-menu" class="h-4 w-4" aria-hidden="true" />
      <span class="sr-only">{{ t('nav.openMenu') }}</span>
    </summary>
    <nav
      :aria-label="t('nav.label')"
      class="absolute right-0 z-50 mt-2 min-w-48 rounded-card border border-border bg-surface-raised p-1 shadow-card"
    >
      <ul>
        <li v-for="section in sections" :key="section">
          <SectionLink
            :section="section"
            class="block rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            @navigate="close"
          >
            {{ t(`nav.${section}`) }}
          </SectionLink>
        </li>
      </ul>
    </nav>
  </details>
</template>
