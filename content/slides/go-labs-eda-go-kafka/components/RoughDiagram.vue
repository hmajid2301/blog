<script setup lang="ts">
import { computed } from 'vue'
import { previews, palette, type DiagramNode } from './diagram-previews'
import { roughDrawing } from './rough-drawing'
import { talkDiagram } from './main-diagrams'

const props = defineProps<{ diagram: string; step: number; talk?: boolean }>()
const diagram = computed(() => props.talk
  ? talkDiagram(props.diagram, props.step)
  : previews[props.diagram](props.step))
const drawing = computed(() => roughDrawing(diagram.value))

function transferLabel(text: string) {
  return text.replace(/\bcollection-[a-z]\b/g, match => `Collection ${match.slice(-1).toUpperCase()}`)
}

function arrivalStyle(node: DiagramNode) {
  if (!node.arrival) return {}
  return {
    '--arrival-from-x': `${node.arrival.from[0]}px`,
    '--arrival-from-y': `${node.arrival.from[1]}px`,
    '--arrival-via-x': `${node.arrival.via[0]}px`,
    '--arrival-via-y': `${node.arrival.via[1]}px`,
    '--arrival-to-x': `${node.x}px`,
    '--arrival-to-y': `${node.y}px`,
  }
}
</script>

<template>
  <div
    class="rough-diagram"
    :style="{ height: `${diagram.height ?? 500}px`, width: `${diagram.width ?? 1100}px` }"
    role="img"
    :aria-label="`${transferLabel(diagram.title)}, click ${step}`"
    :data-diagram="props.diagram"
    :data-talk="props.talk ? 'true' : undefined"
  >
    <p v-if="diagram.caption" class="rough-caption" aria-live="polite">{{ transferLabel(diagram.caption) }}</p>
    <svg :width="diagram.width ?? 1100" :height="diagram.height ?? 500" aria-hidden="true">
      <g v-for="group in drawing.groups" :key="group.id">
        <path v-for="(path, i) in group.paths" :key="i" :d="path.d" :stroke="path.stroke" :stroke-width="path.strokeWidth" :fill="path.fill" />
      </g>
      <g v-for="(edge, i) in drawing.edges" :key="i">
        <template v-if="!edge.active">
          <path v-for="(path, j) in edge.paths" :key="j" :d="path.d" :stroke="path.stroke" :stroke-width="path.strokeWidth" :fill="path.fill" :stroke-dasharray="edge.dashed ? '12 10' : undefined" />
        </template>
        <path v-else class="rough-flow" :d="edge.path" :style="{ stroke: edge.color }" />
        <path v-for="(path, j) in edge.arrow" :key="`arrow-${j}`" :d="path.d" :stroke="path.stroke" :stroke-width="path.strokeWidth" :fill="path.fill" />
      </g>
      <svg
        v-for="node in drawing.nodes.filter(node => !node.arrival)"
        :key="node.id"
        :data-node-id="node.id"
        :class="{ 'rough-moving-node': node.motion }"
        :x="node.motion ? 0 : node.x"
        :y="node.motion ? 0 : node.y"
        :style="node.motion ? { transform: `translate(${node.x}px, ${node.y}px)` } : undefined"
        :width="node.w"
        :height="node.h"
        :viewBox="node.shape ? '0 0 190 130' : `0 0 ${node.w} ${node.h}`"
        overflow="visible"
        preserveAspectRatio="none"
      >
        <path v-for="(path, i) in node.paths" :key="i" :d="path.d" :stroke="path.stroke" :stroke-width="path.strokeWidth" :fill="path.fill" />
      </svg>
    </svg>
    <strong
      v-for="group in drawing.groups"
      :key="group.id"
      class="rough-group-label"
      :style="{ left: `${group.x + 18}px`, top: `${group.y + 10}px` }"
    >{{ transferLabel(group.label) }}</strong>
    <div
      v-for="node in drawing.nodes"
      :key="node.id"
      :data-node-id="node.id"
      class="rough-node"
      :class="{
        'is-small': node.small,
        'is-database': node.shape === 'database',
        'is-queue': node.shape === 'queue',
        'has-motion': node.motion,
        'rough-arrival': node.arrival,
        'has-offset': node.offset !== undefined,
        'rough-enter': node.enter,
      }"
      :style="{
        ...arrivalStyle(node),
        left: `${node.arrival ? 0 : node.x}px`,
        top: `${node.arrival ? 0 : node.y}px`,
        width: `${node.w}px`,
        height: `${node.h}px`,
        '--node-color': palette[node.tone][0],
      }"
    >
      <svg v-if="node.arrival" class="rough-record-art" :data-node-id="node.id" :width="node.w" :height="node.h" :viewBox="`0 0 ${node.w} ${node.h}`" overflow="visible" aria-hidden="true">
        <rect :width="node.w" :height="node.h" fill="#11111b" />
        <path v-for="(path, i) in node.paths" :key="i" :d="path.d" :stroke="path.stroke" :stroke-width="path.strokeWidth" :fill="path.fill" />
      </svg>
      <span v-if="node.markBox" class="rough-node-mark" v-mark="{ at: node.markBox[0], type: 'box', color: node.markBox[1], padding: 8, strokeWidth: 3 }"></span>
      <span v-if="node.crossAt" class="rough-node-mark" v-mark="{ at: node.crossAt, type: 'crossed-off', color: '#f38ba8', strokeWidth: 4 }"></span>
      <strong>{{ transferLabel(node.label) }}</strong>
      <span v-if="node.detail && node.markDetail" v-mark="{ at: node.markDetail, type: 'box', color: 'var(--node-color)', padding: 4, strokeWidth: 2, animationDuration: 1 }">{{ transferLabel(node.detail) }}</span>
      <span v-else-if="node.detail">{{ transferLabel(node.detail) }}</span>
      <small v-if="node.offset !== undefined" class="rough-record-offset">offset {{ node.offset }}</small>
    </div>
    <template v-for="(edge, i) in drawing.edges" :key="i">
      <div
        v-if="edge.label"
        class="rough-label"
        :class="{ 'is-crash': edge.crash, 'is-active': edge.active }"
        :style="{
          left: `${edge.labelAt[0]}px`,
          top: `${edge.labelAt[1]}px`,
          color: (edge.active || edge.crash) && edge.tone !== 'muted' ? edge.color : '#cdd6f4',
        }"
      >{{ transferLabel(edge.label) }}</div>
    </template>
  </div>
</template>

<style scoped>
:global(.diagram-preview-slide h2) { font-size: 42px; line-height: 1.15; }
.rough-diagram { position: relative; width: 1100px; margin: 24px auto 0; font-family: 'Patrick Hand', 'Poppins', sans-serif; letter-spacing: .02em; }
.rough-diagram > svg { position: absolute; inset: 0; overflow: visible; }
.rough-caption { position: absolute; top: 0; left: 0; width: 100%; margin: 0; color: #89b4fa; font-size: 26px; line-height: 1.2; text-align: center; }
.rough-node.has-motion { transition: left .65s ease, top .65s ease; animation: rough-appear .25s ease-out; }
.rough-moving-node { transition: transform .65s ease; animation: rough-appear .25s ease-out; }
.rough-arrival { transform: translate(var(--arrival-to-x), var(--arrival-to-y)); animation: rough-arrive .95s ease-in-out both; }
.rough-node.rough-arrival { z-index: 1; }
.rough-record-art { position: absolute; inset: 0; z-index: -1; }
.rough-node.has-offset { gap: 4px; }
.rough-node-mark { position: absolute; inset: 0; display: block; pointer-events: none; }
.rough-record-offset { color: #a6adc8; font-size: 18px; line-height: 1.1; }
.rough-arrival .rough-record-offset { animation: rough-offset .1s linear .95s both; }
@keyframes rough-arrive {
  from { transform: translate(var(--arrival-from-x), var(--arrival-from-y)); }
  45% { transform: translate(var(--arrival-via-x), var(--arrival-via-y)); }
  to { transform: translate(var(--arrival-to-x), var(--arrival-to-y)); }
}
@keyframes rough-offset { from { opacity: 0; } to { opacity: 1; } }
@keyframes rough-appear { from { opacity: 0; } to { opacity: 1; } }
.rough-enter { animation: rough-enter .8s cubic-bezier(.2, .8, .2, 1) both; }
@keyframes rough-enter { from { opacity: 0; transform: translateX(160px); } to { opacity: 1; transform: none; } }
.rough-node { position: absolute; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 10px 8px; color: #e6e9f7; line-height: 1.1; text-align: center; white-space: pre-line; }
.rough-node strong, .rough-group-label { font-size: 24px; font-weight: 500; }
.rough-node span { max-width: 100%; font-size: 22px; }
.rough-node.is-database { padding: 30px 16px 14px; }
.rough-node.is-queue { padding: 12px 26px 32px; gap: 4px; }
.rough-node.is-small span, .rough-node.is-queue span { font-size: 18px; }
.rough-group-label { position: absolute; padding: 0 6px; background: #11111b; color: #cdd6f4; }
.rough-label { position: absolute; translate: -50% -50%; padding: 2px 8px; background: #11111b; font-size: 20px; line-height: 1.1; white-space: nowrap; }
.rough-label.is-crash { rotate: -12deg; border: 3px solid #f38ba8; font-size: 36px; }
.rough-flow { fill: none; stroke: #bac2de; stroke-width: 4px; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 9 5; animation: rough-flow .7s linear infinite; }
@keyframes rough-flow { to { stroke-dashoffset: -14; } }
@media (prefers-reduced-motion: reduce) { .rough-flow { animation: none; } .rough-node.has-motion, .rough-moving-node, .rough-arrival, .rough-arrival .rough-record-offset { transition: none; animation: none; } }
</style>
