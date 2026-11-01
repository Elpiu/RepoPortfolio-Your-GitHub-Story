<script setup lang="ts">
import type { Repository } from '~~/shared/types'

defineProps<{
  projects: Repository[]
}>()

const { container } = useSpotlight()
</script>

<template>
  <div ref="container" class="grid gap-4 sm:grid-cols-2 md:gap-6">
    <ProjectCard v-for="project in projects" :key="project.id" :repository="project" />
  </div>
</template>
