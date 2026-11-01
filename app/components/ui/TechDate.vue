<script setup lang="ts">
import { formatMonth, formatTechDate } from '~~/shared/utils/format'

const props = withDefaults(
  defineProps<{
    date: string
    format?: 'date' | 'month'
  }>(),
  { format: 'date' },
)

const absolute = computed(() =>
  props.format === 'month' ? formatMonth(props.date.slice(0, 7)) : formatTechDate(props.date),
)
const relative = useRelativeTime(() => props.date)
</script>

<template>
  <time :datetime="date" :title="absolute" class="inline-block min-w-[12ch] font-mono tabular-nums">
    {{ relative ?? absolute }}
  </time>
</template>
