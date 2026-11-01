<script setup lang="ts">
import type { SvgIcon } from '~~/shared/utils/svg-icon'

defineProps<{
  icon: SvgIcon
}>()
</script>

<template>
  <svg :viewBox="icon.viewBox" aria-hidden="true" focusable="false">
    <component :is="node.tag" v-for="(node, index) in icon.nodes" :key="index" v-bind="node.attrs">
      <component
        :is="child.tag"
        v-for="(child, childIndex) in node.children"
        :key="childIndex"
        v-bind="child.attrs"
      />
    </component>
  </svg>
</template>
