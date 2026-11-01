<script setup lang="ts">
defineProps<{
  available: boolean
  text: string
}>()
</script>

<template>
  <span class="inline-flex items-center gap-2 text-sm text-foreground-muted">
    <span class="relative flex h-2 w-2" aria-hidden="true">
      <span
        v-if="available"
        class="absolute inline-flex h-full w-full rounded-full bg-available opacity-60 motion-safe:animate-ping"
      />
      <span
        class="relative inline-flex h-2 w-2 rounded-full"
        :class="available ? 'bg-available' : 'bg-foreground-subtle'"
      />
    </span>
    {{ text }}
  </span>
</template>
