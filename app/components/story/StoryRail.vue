<script setup lang="ts">
import type { StoryNode } from '~~/shared/utils/story-graph'

const props = defineProps<{
  node: StoryNode
  first: boolean
  last: boolean
}>()

// Geometria in px: colonna 3.5rem, binario n in x = 12 + 16n, nodo all'altezza
// della riga della data nella card, curve alte 18 px.
const DOT_Y = 34
const CURVE = 18
const laneX = (lane: number) => 12 + lane * 16
const X0 = laneX(0)

const x = computed(() => laneX(props.node.lane))
const ownLane = computed(() => (props.node.lane > 0 ? props.node.lane : null))

// Linee verticali: { x, top, bottom } con bottom null = fino in fondo alla riga.
const lines = computed(() => {
  const list: Array<{ x: number; top: number; height: number | null }> = []
  list.push({
    x: X0,
    top: props.first ? DOT_Y : 0,
    height: props.last ? (props.first ? 0 : DOT_Y) : null,
  })
  for (const lane of props.node.rails.through) list.push({ x: laneX(lane), top: 0, height: null })
  // Il ramo che rientra nel nodo di questa riga arriva dal basso.
  for (const lane of props.node.rails.mergeTop) {
    list.push({ x: laneX(lane), top: DOT_Y + CURVE, height: null })
  }
  if (ownLane.value !== null) {
    const top = props.node.rails.own === 'merge' && !props.first ? CURVE : 0
    list.push({ x: x.value, top, height: DOT_Y - top })
  }
  return list
})

function lineStyle(line: { x: number; top: number; height: number | null }) {
  return {
    left: `${line.x - 0.75}px`,
    top: `${line.top}px`,
    ...(line.height === null ? { bottom: '0px' } : { height: `${line.height}px` }),
  }
}

const curve = (from: number, to: number) =>
  `M${from} 0 C${from} ${CURVE / 2}, ${to} ${CURVE / 2}, ${to} ${CURVE}`
</script>

<template>
  <div class="pointer-events-none absolute inset-y-0 left-0 w-14" aria-hidden="true">
    <span
      v-for="(line, index) in lines"
      :key="index"
      class="absolute w-[1.5px] bg-border-strong"
      :style="lineStyle(line)"
    />

    <svg
      v-for="lane in node.rails.mergeTop"
      :key="`merge-${lane}`"
      class="absolute left-0 overflow-visible"
      :style="{ top: `${DOT_Y}px` }"
      width="56"
      :height="CURVE"
    >
      <path
        :d="curve(X0, laneX(lane))"
        fill="none"
        stroke="var(--color-border-strong)"
        stroke-width="1.5"
      />
    </svg>

    <template v-if="ownLane !== null">
      <svg
        v-if="node.rails.own === 'merge' && !first"
        class="absolute top-0 left-0 overflow-visible"
        width="56"
        :height="CURVE"
      >
        <path
          :d="curve(X0, x)"
          fill="none"
          stroke="var(--color-border-strong)"
          stroke-width="1.5"
        />
      </svg>
      <svg
        class="absolute left-0 overflow-visible"
        :style="{ top: `${DOT_Y}px` }"
        width="56"
        :height="CURVE"
      >
        <path
          :d="curve(x, X0)"
          fill="none"
          stroke="var(--color-border-strong)"
          stroke-width="1.5"
        />
      </svg>
    </template>

    <svg
      class="absolute overflow-visible"
      :style="{ left: `${x - 8}px`, top: `${DOT_Y - 8}px` }"
      width="16"
      height="16"
    >
      <polygon
        v-if="node.kind === 'milestone'"
        points="8,1 15,8 8,15 1,8"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        stroke-width="1.5"
      />
      <circle
        v-else
        cx="8"
        cy="8"
        r="4.5"
        :fill="
          node.current
            ? 'var(--color-accent)'
            : node.kind === 'repo' || node.kind === 'release'
              ? 'var(--color-surface)'
              : 'var(--color-foreground)'
        "
        :stroke="node.current ? 'var(--color-accent)' : 'var(--color-border-strong)'"
        stroke-width="1.5"
      />
    </svg>
  </div>
</template>
