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
  () => filters.view.value,
)
const filters = useStoryFilters(story.available)
const { nodes, counts } = story
const { view, views, select } = filters
</script>

<template>
  <SectionShell
    id="experience"
    :eyebrow="t('story.eyebrow')"
    :title="t('story.title')"
    :description="t('story.description')"
  >
    <StoryFilters
      v-if="views.length > 1"
      :views="views"
      :model-value="view"
      :counts="counts"
      @update:model-value="select"
    />

    <div
      id="story-panel"
      :role="views.length > 1 ? 'tabpanel' : undefined"
      :aria-labelledby="views.length > 1 ? `story-tab-${view}` : undefined"
      class="mt-6"
    >
      <ol v-if="nodes.length > 0" class="space-y-3">
        <StoryNode v-for="node in nodes" :key="`${node.source}-${node.id}`" :node="node" />
      </ol>
      <EmptyState v-else :title="t('story.empty')" />
    </div>
  </SectionShell>
</template>
