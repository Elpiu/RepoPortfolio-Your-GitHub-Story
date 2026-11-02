<script setup lang="ts">
import type { Book } from '~~/shared/schemas/profile'

const props = defineProps<{
  books: Book[]
}>()

const { t } = useI18n()

// Prima le letture in corso, poi l'ordine scelto nel JSON.
const ordered = computed(() => [
  ...props.books.filter((book) => book.status === 'reading'),
  ...props.books.filter((book) => book.status === 'read'),
])
</script>

<template>
  <SectionShell id="reading" :eyebrow="t('home.readingEyebrow')" :title="t('home.reading')">
    <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BookCard v-for="book in ordered" :key="book.id" :book="book" />
    </ul>
  </SectionShell>
</template>
