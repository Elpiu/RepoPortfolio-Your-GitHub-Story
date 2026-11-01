import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Profile } from '~~/shared/schemas/profile'
import type { StoryEvent } from '~~/shared/types'
import { layoutStory } from '~~/shared/utils/story-graph'

export function useStory(
  profile: MaybeRefOrGetter<Profile>,
  storyEvents: MaybeRefOrGetter<readonly StoryEvent[]>,
  syncedAt: MaybeRefOrGetter<string>,
) {
  const graph = computed(() =>
    layoutStory(toValue(profile).experiences, toValue(profile).milestones, {
      now: toValue(syncedAt).slice(0, 7),
      storyEvents: toValue(storyEvents),
    }),
  )

  return {
    nodes: computed(() => graph.value.nodes),
    laneCount: computed(() => graph.value.laneCount),
  }
}
