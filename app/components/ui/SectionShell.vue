<script setup lang="ts">
defineProps<{
  id: string
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <section :id="id" :aria-labelledby="`${id}-title`" class="py-16 md:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        :id="`${id}-title`"
        :eyebrow="eyebrow"
        :title="title"
        :description="description"
      />
      <slot />
    </div>
  </section>
</template>
