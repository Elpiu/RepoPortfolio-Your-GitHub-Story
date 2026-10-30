<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface-muted/50 px-6 py-12 text-center"
  >
    <UIcon name="i-lucide-folder-open" class="h-6 w-6 text-foreground-subtle" aria-hidden="true" />
    <p class="text-base font-medium text-foreground">{{ title }}</p>
    <p v-if="description" class="max-w-[55ch] text-sm text-foreground-muted">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
