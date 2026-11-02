<script setup lang="ts">
import type { Book } from '~~/shared/schemas/profile'

defineProps<{
  book: Book
}>()

const { t } = useI18n()
// Copertina remota: se non carica si torna all'icona, senza loop di onerror.
const coverFailed = ref(false)
</script>

<template>
  <li
    data-testid="book-card"
    class="flex gap-4 rounded-card border border-border bg-surface-raised p-5 shadow-card"
  >
    <div
      class="flex aspect-[2/3] w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted"
    >
      <img
        v-if="book.cover && !coverFailed"
        :src="book.cover"
        alt=""
        width="56"
        height="84"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        class="h-full w-full object-cover"
        @error="coverFailed = true"
      />
      <UIcon
        v-else
        name="i-lucide-book-open"
        class="h-5 w-5 text-foreground-subtle"
        aria-hidden="true"
      />
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <span
        class="self-start rounded-control border px-2 py-0.5 font-mono text-[0.65rem] uppercase"
        :class="
          book.status === 'reading'
            ? 'border-border-strong text-accent'
            : 'border-border text-foreground-subtle'
        "
      >
        {{ t(`reading.status.${book.status}`) }}
      </span>
      <h3 class="mt-2 text-base font-semibold text-foreground wrap-anywhere">{{ book.title }}</h3>
      <p v-if="book.author" class="mt-1 text-sm text-foreground-muted">{{ book.author }}</p>
      <p v-if="book.note" class="mt-2 text-pretty text-sm leading-relaxed text-foreground-muted">
        {{ book.note }}
      </p>
      <AppLink v-if="book.url" :href="book.url" external class="mt-auto self-start pt-3 text-sm">
        {{ t('reading.open') }}
        <span class="sr-only">: {{ book.title }}</span>
        <UIcon name="i-lucide-external-link" class="h-3.5 w-3.5" aria-hidden="true" />
      </AppLink>
    </div>
  </li>
</template>
