<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-start gap-3 rounded-card border border-border bg-surface-muted/50 p-6"
  >
    <UIcon name="i-lucide-triangle-alert" class="h-6 w-6 text-accent" aria-hidden="true" />
    <p class="text-base font-medium text-foreground">{{ title }}</p>
    <p v-if="description" class="max-w-[65ch] text-sm text-foreground-muted">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
