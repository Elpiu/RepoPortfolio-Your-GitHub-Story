<script setup lang="ts">
defineProps<{
  id: string
  eyebrow?: string
  title: string
  description?: string
  as?: 'h2' | 'h3'
}>()
</script>

<template>
  <div class="mb-8 flex flex-col gap-2">
    <p v-if="eyebrow" class="font-mono text-xs uppercase tracking-[0.18em] text-accent">
      {{ eyebrow }}
    </p>
    <component
      :is="as ?? 'h2'"
      :id="id"
      class="text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-[2rem]"
    >
      {{ title }}
    </component>
    <p
      v-if="description"
      class="max-w-[65ch] text-pretty text-base leading-relaxed text-foreground-muted"
    >
      {{ description }}
    </p>
  </div>
</template>
