<script setup lang="ts">
import type { Profile } from '~~/shared/schemas/profile'
import type { StoryEvent } from '~~/shared/types'

const props = defineProps<{
  profile: Profile
  storyEvents: StoryEvent[]
  syncedAt: string
}>()

const { t } = useI18n()
const { nodes } = useStory(
  () => props.profile,
  () => props.storyEvents,
  () => props.syncedAt,
)
</script>

<template>
  <SectionShell
    id="experience"
    :eyebrow="t('story.eyebrow')"
    :title="t('story.title')"
    :description="t('story.description')"
  >
    <StoryLegend />

    <ol v-if="nodes.length > 0" class="mt-6 space-y-3">
      <StoryNode v-for="node in nodes" :key="`${node.source}-${node.id}`" :node="node" />
    </ol>
    <EmptyState v-else class="mt-6" :title="t('story.empty')" />
  </SectionShell>
</template>
