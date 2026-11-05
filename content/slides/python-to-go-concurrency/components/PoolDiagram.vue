<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, unref, useId } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 3 })
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()
const markerId = `pool-arrow-${useId()}`
// Overview, print and export must tell the whole story without playing clicks.
const stage = computed(() => unref(isPrintMode) || !['slide', 'presenter'].includes(unref($renderContext))
  ? 3 : Math.max(0, Math.min(props.step, 3)))
const workers = [112, 202, 292]
const nodes = [
  { label: 'producer', detail: 'owns input', x: 16, y: 202, width: 160, step: 0 },
  { label: 'jobs', detail: 'handoff', x: 240, y: 202, width: 130, step: 0 },
  ...workers.map((y, i) => ({ label: `worker ${i + 1}`, detail: 'HEAD → result', x: 450, y, width: 190, step: 1 })),
  { label: 'results', detail: 'handoff', x: 730, y: 202, width: 140, step: 2 },
  { label: 'collector', detail: 'owns report', x: 960, y: 202, width: 190, step: 2 },
]
const edges = [
  { d: 'M176 202 H230', step: 0 },
  ...workers.map(y => ({ d: `M370 202 H410 V${y} H440`, step: 1 })),
  ...workers.map(y => ({ d: `M640 ${y} H680 V202 H720`, step: 2 })),
  { d: 'M870 202 H950', step: 2 },
]
const captions = [
  '0 · The producer hands off one URL. No growing job queue.',
  '1 · Fixed workers overlap the network waits. Each owns its local result.',
  '2 · Workers send values. Only the collector appends to the report.',
  '3 · Cancel every wait. Join producer + workers. Then close results.',
]
</script>

<template>
  <svg class="pool-diagram" viewBox="0 0 1180 420" role="img" :aria-labelledby="`${markerId}-title ${markerId}-description`">
    <title :id="`${markerId}-title`">Bounded work, one report owner, explicit shutdown</title>
    <desc :id="`${markerId}-description`">{{ captions[stage] }} One producer sends URLs through jobs to three illustrated workers. Workers perform HTTP checks and send results to one collector. Context cancellation reaches job handoff, workers, HTTP and result handoff; the coordinator joins before closing results. The runnable service uses two workers per batch.</desc>
    <defs>
      <marker :id="markerId" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M0 0 L8 4 L0 8" fill="none" stroke="currentColor" stroke-width="2" />
      </marker>
    </defs>

    <g v-for="(edge, i) in edges" :key="i" class="reveal" :class="{ shown: stage >= edge.step }" :aria-hidden="stage < edge.step">
      <path class="ink trace" :d="edge.d" pathLength="1" :marker-end="`url(#${markerId})`" />
    </g>
    <g class="action-labels">
      <text x="202" y="146" text-anchor="middle">send URL</text>
      <text v-if="stage >= 1" x="410" y="72" text-anchor="middle">receive</text>
      <text v-if="stage >= 2" x="685" y="72" text-anchor="middle">send result</text>
      <text v-if="stage >= 2" x="910" y="146" text-anchor="middle">collect</text>
    </g>

    <g v-for="node in nodes" :key="node.label" class="reveal" :class="{ shown: stage >= node.step }" :aria-hidden="stage < node.step">
      <rect class="node" :x="node.x" :y="node.y - 35" :width="node.width" height="70" rx="5" />
      <text class="node-label" :x="node.x + node.width / 2" :y="node.y - 4" text-anchor="middle">{{ node.label }}</text>
      <text class="node-detail" :x="node.x + node.width / 2" :y="node.y + 23" text-anchor="middle">{{ node.detail }}</text>
    </g>

    <!-- Work tokens change position only when the presenter advances a stage. -->
    <g v-if="stage < 3" class="tokens" aria-hidden="true">
      <g v-for="(y, i) in (stage === 1 ? workers : [202])" :key="i" :transform="`translate(${stage === 0 ? 305 : stage === 1 ? 545 : 1055}, ${stage === 1 ? y + 46 : 264})`">
        <rect x="-28" y="-13" width="56" height="26" rx="4" />
        <text y="6" text-anchor="middle">{{ stage === 2 ? '200' : `/${['a', 'b', 'c'][i]}` }}</text>
      </g>
    </g>

    <g class="reveal stop" :class="{ shown: stage >= 3 }" :aria-hidden="stage < 3">
      <text x="590" y="24" text-anchor="middle">request context · cancel</text>
      <rect class="ink" x="438" y="70" width="214" height="264" rx="8" stroke-dasharray="5 6" />
      <path class="ink trace" d="M96 52 H910 M96 52 V157 M305 52 V157 M545 52 V68 M800 52 V157" pathLength="1" />
      <g v-for="x in [96, 305, 545, 800]" :key="x">
        <path class="ink" :d="`M${x - 5} ${x === 545 ? 62 : 151} l5 6 l5 -6`" />
      </g>
      <text x="590" y="368" text-anchor="middle">HTTP observes cancellation · coordinator joins → close(results)</text>
    </g>
    <text class="caption" x="590" y="410" text-anchor="middle">{{ captions[stage] }}</text>
  </svg>
</template>

<style scoped>
.pool-diagram { display: block; width: 100%; height: auto; color: var(--talk-ink, #24211d); font-family: inherit; overflow: visible; }
.ink { fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
.node { fill: var(--talk-paper, #faf8f3); stroke: currentColor; stroke-width: 2.5; }
.node-label { fill: currentColor; font-size: 27px; font-weight: 600; }
.node-detail, .action-labels { fill: var(--talk-muted, #625e56); font-size: 21px; }
.caption { fill: currentColor; font-size: 23px; }
.reveal { opacity: 0; transition: opacity .2s ease; }
.reveal.shown { opacity: 1; }
.trace { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .55s ease; }
.shown .trace { stroke-dashoffset: 0; }
.stop { color: var(--talk-accent, #a9432e); font-size: 23px; fill: currentColor; }
.tokens rect { fill: var(--talk-paper, #faf8f3); stroke: var(--talk-accent, #a9432e); stroke-width: 2; }
.tokens text { fill: var(--talk-accent, #a9432e); font-size: 20px; font-family: monospace; }
@media (prefers-reduced-motion: reduce) {
  .reveal, .trace { transition: none; }
}
@media print {
  .reveal { opacity: 1; }
  .trace { stroke-dashoffset: 0; transition: none; }
}
</style>
