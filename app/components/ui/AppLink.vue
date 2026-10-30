<script setup lang="ts">
defineProps<{
  to?: string | Record<string, unknown>
  href?: string
  external?: boolean
}>()
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
  >
    <slot />
  </NuxtLink>
  <a
    v-else
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    class="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
  >
    <slot />
  </a>
</template>
