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
      <!-- Niente gap tra le righe: lo spazio è padding, così i binari restano continui. -->
      <ol v-if="nodes.length > 0">
        <StoryNode
          v-for="(node, index) in nodes"
          :key="`${node.source}-${node.id}`"
          :node="node"
          :first="index === 0"
          :last="index === nodes.length - 1"
        />
      </ol>
      <EmptyState v-else :title="t('story.empty')" />
    </div>
  </SectionShell>
</template>
