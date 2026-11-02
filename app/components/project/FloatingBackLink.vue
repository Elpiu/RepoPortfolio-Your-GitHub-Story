<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { y } = useWindowScroll()
const { height } = useWindowSize()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

// Visibile oltre metà della parte scorrevole: il link in alto non si vede più.
// L'altezza si rilegge a ogni scroll perché immagini del README la cambiano.
const visible = computed(() => {
  if (!mounted.value) return false
  const scrollable = document.documentElement.scrollHeight - height.value
  return scrollable > 0 && y.value > scrollable / 2
})
</script>

<template>
  <NuxtLink
    v-if="visible"
    data-testid="floating-back"
    :to="{ path: localePath('/'), hash: '#projects' }"
    class="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-control border border-border-strong bg-surface-raised px-4 py-2.5 text-sm font-medium text-foreground shadow-card-hover transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-6 sm:bottom-6 print:hidden"
  >
    <UIcon name="i-lucide-arrow-left" class="h-4 w-4" aria-hidden="true" />
    {{ t('project.backToProjects') }}
  </NuxtLink>
</template>
