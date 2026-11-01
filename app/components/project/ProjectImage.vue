<script setup lang="ts">
import type { Repository } from '~~/shared/types'
import { placeholderFile } from '~~/shared/utils/placeholder'

const props = defineProps<{
  repository: Repository
}>()

const { t } = useI18n()
const config = useRuntimeConfig()
const failed = ref(false)

const baseURL = computed(() => {
  const value = config.app.baseURL
  return value.endsWith('/') ? value : `${value}/`
})
const fallback = computed(() => `${baseURL.value}${placeholderFile(props.repository.id)}`)
const src = computed(() =>
  failed.value || !props.repository.previewImage ? fallback.value : props.repository.previewImage,
)
const alt = computed(() =>
  props.repository.previewImage
    ? t('projects.previewAlt', { name: props.repository.name })
    : t('projects.placeholderAlt', { name: props.repository.name }),
)

function onError() {
  if (!failed.value) failed.value = true
}
</script>

<template>
  <div class="relative aspect-video overflow-hidden border-b border-border bg-surface-muted">
    <img
      :src="src"
      :alt="alt"
      width="640"
      height="360"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover"
      @error="onError"
    />
  </div>
</template>
