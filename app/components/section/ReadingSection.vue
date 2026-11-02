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
      <li
        v-for="book in ordered"
        :key="book.id"
        data-testid="book-card"
        class="flex flex-col rounded-card border border-border bg-surface-raised p-5 shadow-card"
      >
        <div class="flex items-start justify-between gap-3">
          <UIcon
            name="i-lucide-book-open"
            class="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted"
            aria-hidden="true"
          />
          <span
            class="rounded-control border px-2 py-0.5 font-mono text-[0.65rem] uppercase"
            :class="
              book.status === 'reading'
                ? 'border-border-strong text-accent'
                : 'border-border text-foreground-subtle'
            "
          >
            {{ t(`reading.status.${book.status}`) }}
          </span>
        </div>
        <h3 class="mt-3 text-base font-semibold text-foreground wrap-anywhere">
          <a
            v-if="book.url"
            :href="book.url"
            target="_blank"
            rel="noopener noreferrer"
            class="underline-offset-4 hover:underline"
          >
            {{ book.title }}
          </a>
          <template v-else>{{ book.title }}</template>
        </h3>
        <p v-if="book.author" class="mt-1 text-sm text-foreground-muted">{{ book.author }}</p>
        <p v-if="book.note" class="mt-3 text-pretty text-sm leading-relaxed text-foreground-muted">
          {{ book.note }}
        </p>
      </li>
    </ul>
  </SectionShell>
</template>
