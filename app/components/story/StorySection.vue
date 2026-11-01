<script setup lang="ts">
import type { Profile } from '~~/shared/schemas/profile'
import type { StoryEvent } from '~~/shared/types'

const props = defineProps<{
  profile: Profile
  storyEvents: StoryEvent[]
  syncedAt: string
}>()

const { t } = useI18n()
const story = useStory(
  () => props.profile,
  () => props.storyEvents,
  () => props.syncedAt,
  () => filters.selected.value,
)
const filters = useStoryFilters(story.available)
const { nodes, counts, available } = story
const { selected, isAll, toggle, selectAll } = filters
</script>

<template>
  <SectionShell
    id="experience"
    :eyebrow="t('story.eyebrow')"
    :title="t('story.title')"
    :description="t('story.description')"
  >
    <StoryFilters
      v-if="available.length > 0"
      :available="available"
      :selected="selected"
      :counts="counts"
      :is-all="isAll"
      @toggle="toggle"
      @all="selectAll"
    />

    <p class="sr-only" aria-live="polite">{{ t('story.shown', { count: nodes.length }) }}</p>

    <ol v-if="nodes.length > 0" class="mt-6 space-y-3">
      <StoryNode v-for="node in nodes" :key="`${node.source}-${node.id}`" :node="node" />
    </ol>
    <EmptyState v-else class="mt-6" :title="t('story.empty')" />
  </SectionShell>
</template>
