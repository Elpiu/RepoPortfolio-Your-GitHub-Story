import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Profile } from '~~/shared/schemas/profile'
import type { StoryEvent } from '~~/shared/types'
import { layoutStory } from '~~/shared/utils/story-graph'
import {
  STORY_FILTERS,
  countStoryFilters,
  filterStoryInput,
  type StoryFilter,
} from '~~/shared/utils/story-filters'

export function useStory(
  profile: MaybeRefOrGetter<Profile>,
  storyEvents: MaybeRefOrGetter<readonly StoryEvent[]>,
  syncedAt: MaybeRefOrGetter<string>,
  selected: MaybeRefOrGetter<readonly StoryFilter[]>,
) {
  const input = computed(() => ({
    experiences: toValue(profile).experiences,
    milestones: toValue(profile).milestones,
    storyEvents: toValue(storyEvents),
  }))
  const now = computed(() => toValue(syncedAt).slice(0, 7))

  // Conteggi sull'intera storia (dopo la deduplicazione curato/automatico).
  const counts = computed(() => {
    const { experiences, milestones, storyEvents: events } = input.value
    return countStoryFilters(
      layoutStory(experiences, milestones, { now: now.value, storyEvents: events }).nodes,
    )
  })
  const available = computed(() => STORY_FILTERS.filter((filter) => counts.value[filter] > 0))

  const graph = computed(() => {
    const filtered = filterStoryInput(input.value, toValue(selected))
    return layoutStory(filtered.experiences, filtered.milestones, {
      now: now.value,
      storyEvents: filtered.storyEvents,
    })
  })

  return {
    counts,
    available,
    nodes: computed(() => graph.value.nodes),
    laneCount: computed(() => graph.value.laneCount),
  }
}
