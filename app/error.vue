<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const currentLocale = computed(
  () => locales.value.find((entry) => entry.code === locale.value) ?? locales.value[0],
)
const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() =>
  isNotFound.value ? t('error.notFoundTitle') : t('error.genericTitle'),
)
const description = computed(() =>
  isNotFound.value ? t('error.notFoundDescription') : t('error.genericDescription'),
)

useSeoMeta({
  title,
  description,
  robots: 'noindex',
})

useHead({
  htmlAttrs: {
    lang: currentLocale.value?.language ?? locale.value,
  },
})
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto flex max-w-6xl flex-col items-start px-4 py-24 sm:px-6 lg:px-8">
      <p class="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        {{ error.statusCode }}
      </p>
      <h1
        class="mt-4 text-balance text-4xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl"
      >
        {{ title }}
      </h1>
      <p class="mt-4 max-w-[55ch] text-pretty text-base text-foreground-muted">
        {{ description }}
      </p>
      <AppButton :to="localePath('/')" icon="i-lucide-arrow-left" class="mt-8">
        {{ t('error.backHome') }}
      </AppButton>
    </div>
  </NuxtLayout>
</template>
