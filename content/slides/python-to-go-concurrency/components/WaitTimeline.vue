<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, unref, useId } from 'vue'

const props = defineProps<{ step: number }>()
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()
const id = `waits-${useId()}`
const stage = computed(() => unref(isPrintMode) || !['slide', 'presenter'].includes(unref($renderContext))
  ? 2 : Math.max(0, Math.min(2, Math.trunc(props.step))))
const urls = ['A', 'B', 'C', 'D', 'E', 'F']
const descriptions = [
  'Six equal illustrative network waits run one after another. Python and Go sequential versions both have one active check.',
  'The same six checks move into two worker lanes. Each worker still handles one check at a time; the network waits overlap.',
  'The two-worker batch finishes earlier in this equal-wait illustration. Same work, overlapping waits; not a measured speedup or CPU benchmark.',
]
</script>

<template>
  <svg class="wait-timeline" :data-stage="stage" viewBox="0 0 1180 420" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
    <title :id="`${id}-title`">Same six checks, overlapping waits</title>
    <desc :id="`${id}-desc`">{{ descriptions[stage] }}</desc>
    <text class="label" x="40" y="40">Python / Go sequential</text>
    <text class="detail" x="1130" y="40" text-anchor="end">peak 1</text>
    <path class="axis" d="M230 117 H1130" />
    <text class="detail" x="40" y="102">one slot</text>
    <g class="reference" :class="{ shown: stage >= 1 }" :aria-hidden="stage < 1">
      <rect v-for="(_, i) in urls" :key="i" :x="240 + i * 145" y="70" width="130" height="48" rx="5" />
    </g>
    <g class="lanes" :class="{ shown: stage >= 1 }" :aria-hidden="stage < 1">
      <text class="label" x="40" y="191">Go pool</text>
      <text class="detail" x="1130" y="191" text-anchor="end">peak 2</text>
      <path class="axis" d="M230 262 H1130 M230 332 H1130" />
      <text class="detail" x="40" y="247">worker 1</text>
      <text class="detail" x="40" y="317">worker 2</text>
    </g>
    <!-- Keep URL identities: the comparison rearranges the same work, not new requests. -->
    <g v-for="(url, i) in urls" :key="url" class="wait" :style="{ transform: `translate(${240 + (stage === 0 ? i : Math.floor(i / 2)) * 145}px, ${stage === 0 ? 70 : 214 + (i % 2) * 70}px)` }">
      <rect width="130" height="48" rx="5" />
      <path d="M9 12 V36" />
      <text x="65" y="32" text-anchor="middle">{{ url }}</text>
    </g>
    <g class="payoff" :class="{ shown: stage >= 2 }" :aria-hidden="stage < 2">
      <path pathLength="1" d="M240 349 V361 H660 V349" />
      <text class="label" x="450" y="403" text-anchor="middle">Same work. Overlapping waits.</text>
      <text class="detail" x="1130" y="403" text-anchor="end">time →</text>
    </g>
  </svg>
</template>

<style scoped>
.wait-timeline { display: block; width: 100%; height: 380px; color: var(--talk-ink); font-family: inherit; }
text { fill: currentColor; }
.label { font-size: 27px; font-weight: 600; }
.detail { font-size: 23px; fill: var(--talk-muted); }
.axis { fill: none; stroke: var(--talk-border); stroke-width: 1.5; }
.reference rect { fill: none; stroke: var(--talk-border); stroke-width: 2; stroke-dasharray: 5 5; }
.wait { transition: transform .8s cubic-bezier(.22, .8, .25, 1); }
.wait rect { fill: var(--talk-accent-soft); stroke: var(--talk-accent); stroke-width: 2; }
.wait path { stroke: var(--talk-accent); stroke-width: 4; }
.wait text { font-size: 26px; font-weight: 600; }
.reference, .lanes, .payoff { opacity: 0; transition: opacity .3s ease; }
.shown { opacity: 1; }
.payoff path { fill: none; stroke: var(--talk-accent); stroke-width: 2.5; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .65s ease; }
.payoff.shown path { stroke-dashoffset: 0; }
@media (prefers-reduced-motion: reduce), print {
  .wait, .reference, .lanes, .payoff, .payoff path { transition: none; }
}
</style>
