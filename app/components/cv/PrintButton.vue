<script setup lang="ts">
const { t } = useI18n()

function printPage() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <AppButton icon="i-lucide-printer" @click="printPage">
    {{ t('cv.downloadPdf') }}
  </AppButton>
</template>
