<script setup lang="ts">
import type { Profile } from '~~/shared/schemas/profile'
import type { GitHubDataset } from '~~/shared/types'

defineProps<{
  dataset: GitHubDataset
  profile: Profile
}>()
</script>

<template>
  <section
    id="home"
    aria-labelledby="profile-name"
    class="scroll-mt-24 border-b border-border py-12 md:py-16"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <BentoGrid :dataset="dataset" :profile="profile" />
    </div>
  </section>
</template>
