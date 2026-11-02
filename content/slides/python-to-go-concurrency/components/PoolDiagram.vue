<script setup lang="ts">
import { computed } from 'vue'
import rough from 'roughjs'

// Inline SVG font sizes and opacity avoid UnoCSS attributify collisions.
const props = withDefaults(defineProps<{ step?: number }>(), { step: 3 })
const generator = rough.generator()
const nodes = [
  { label: 'URL producer', x: 20, y: 145, color: '#89b4fa', stage: 0 },
  { label: 'jobs', x: 250, y: 145, color: '#fab387', stage: 0 },
  ...[55, 145, 235].map((y, i) => ({ label: `worker ${i + 1}`, x: 480, y, color: '#94e2d5', stage: 1 })),
  { label: 'results', x: 710, y: 145, color: '#cba6f7', stage: 2 },
  { label: 'collector', x: 940, y: 145, color: '#a6e3a1', stage: 2 },
]
const boxes = nodes.map((node, i) => ({ ...node, paths: generator.toPaths(generator.rectangle(node.x, node.y, 180, 64, {
  seed: i + 7, stroke: node.color, fill: node.color, fillStyle: 'hachure', fillWeight: 1, hachureGap: 12, roughness: 1.3, strokeWidth: 2.5,
})) }))
const edges = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5], [5, 6]].map(([a, b]) => {
  const from = nodes[a], to = nodes[b]
  return { points: `${from.x + 180},${from.y + 32} ${to.x - 8},${to.y + 32}`, stage: Math.max(from.stage, to.stage) }
})
const visible = computed(() => Math.min(props.step, 3))
</script>

<template>
  <svg class="pool-diagram" viewBox="0 0 1140 355" role="img" aria-label="One producer feeds a jobs channel; three workers send to a results channel owned by one collector.">
    <defs><marker id="pool-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#bac2de" /></marker></defs>
    <g v-for="(edge, i) in edges" :key="i" :style="{ opacity: visible >= edge.stage ? 1 : 0.12 }">
      <polyline :points="edge.points" fill="none" stroke="#bac2de" stroke-width="2" marker-end="url(#pool-arrow)" />
    </g>
    <g v-for="box in boxes" :key="box.label" :style="{ opacity: visible >= box.stage ? 1 : 0.12 }">
      <path v-for="(path, i) in box.paths" :key="i" :d="path.d" :fill="path.fill" :stroke="path.stroke" :stroke-width="path.strokeWidth" />
      <text :x="box.x + 90" :y="box.y + 40" text-anchor="middle" :fill="box.color" style="font-family: 'Patrick Hand', Poppins, sans-serif; font-size: 28px">{{ box.label }}</text>
    </g>
    <text x="570" y="340" text-anchor="middle" fill="#a6adc8" style="font-size: 23px">{{ visible >= 3 ? 'context cancellation reaches producer, workers, and HTTP requests' : 'Bound the workers. Make ownership explicit.' }}</text>
  </svg>
</template>
