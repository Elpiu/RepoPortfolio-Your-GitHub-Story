<script setup lang="ts">
const props = defineProps<{
  value: string
}>()

const { t } = useI18n()
const copied = ref(false)
const failed = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

async function onCopy() {
  if (!navigator.clipboard?.writeText) {
    failed.value = true
    return
  }

  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    failed.value = false
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
    failed.value = true
  }
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <AppButton intent="secondary" :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" @click="onCopy">
    {{ copied ? t('bento.copied') : t('bento.copyEmail') }}
  </AppButton>
  <span class="sr-only" aria-live="polite">
    {{ copied ? t('bento.copied') : failed ? t('bento.copyUnavailable') : '' }}
  </span>
</template>
