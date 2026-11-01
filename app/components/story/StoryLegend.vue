<script setup lang="ts">
const { t } = useI18n()

const items = [
  { kind: 'work', icon: 'i-lucide-briefcase' },
  { kind: 'education', icon: 'i-lucide-graduation-cap' },
  { kind: 'milestone', icon: 'i-lucide-flag' },
  { kind: 'repo', icon: 'i-lucide-git-branch' },
  { kind: 'release', icon: 'i-lucide-package' },
] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
    <span class="font-mono text-xs uppercase tracking-[0.14em] text-foreground-subtle">
      {{ t('story.legend') }}
    </span>
    <ul class="flex flex-wrap gap-x-4 gap-y-1">
      <li
        v-for="item in items"
        :key="item.kind"
        class="inline-flex items-center gap-1.5 text-xs text-foreground-muted"
      >
        <UIcon :name="item.icon" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t(`story.types.${item.kind}`) }}
      </li>
    </ul>
  </div>
</template>
