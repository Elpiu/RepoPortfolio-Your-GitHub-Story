<script setup lang="ts">
import type { ProjectTab } from '~/composables/useProjectFilters'

const props = defineProps<{
  modelValue: string
  tabs: ProjectTab[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

function select(value: string) {
  emit('update:modelValue', value)
}

function onKeydown(event: KeyboardEvent, index: number) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (!keys.includes(event.key)) return

  event.preventDefault()
  const last = props.tabs.length - 1
  let next = index
  if (event.key === 'ArrowRight') next = index >= last ? 0 : index + 1
  else if (event.key === 'ArrowLeft') next = index <= 0 ? last : index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last

  const target = props.tabs[next]
  if (!target) return
  select(target.value)

  const buttons = (
    event.currentTarget as HTMLElement
  ).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  buttons?.[next]?.focus()
}
</script>

<template>
  <div role="tablist" :aria-label="t('projects.tabs.label')" class="flex flex-wrap gap-2">
    <button
      v-for="(tab, index) in tabs"
      :id="`explore-tab-${index}`"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      :aria-controls="'explore-panel'"
      :tabindex="modelValue === tab.value ? 0 : -1"
      class="rounded-control border px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      :class="
        modelValue === tab.value
          ? 'border-border-strong bg-surface-muted text-foreground'
          : 'border-transparent text-foreground-muted hover:bg-surface-muted hover:text-foreground'
      "
      @click="select(tab.value)"
      @keydown="onKeydown($event, index)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
