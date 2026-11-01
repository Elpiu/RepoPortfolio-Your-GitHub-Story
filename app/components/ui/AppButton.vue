<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string | Record<string, unknown>
    href?: string
    intent?: 'primary' | 'secondary' | 'ghost'
    icon?: string
    external?: boolean
  }>(),
  {
    intent: 'primary',
    to: undefined,
    href: undefined,
    icon: undefined,
    external: false,
  },
)
</script>

<template>
  <UButton
    :to="to"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :color="intent === 'primary' ? 'primary' : 'neutral'"
    :variant="intent === 'primary' ? 'solid' : intent === 'secondary' ? 'outline' : 'ghost'"
    :icon="icon"
    size="sm"
    class="rounded-control"
    :class="intent === 'primary' ? 'hover:bg-accent-hover' : undefined"
  >
    <slot />
  </UButton>
</template>
