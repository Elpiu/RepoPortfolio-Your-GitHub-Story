<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <a
    href="#main"
    class="sr-only z-50 rounded-control bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
  >
    {{ t('app.skipToContent') }}
  </a>
</template>
