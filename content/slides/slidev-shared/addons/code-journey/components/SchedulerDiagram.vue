<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, unref, useId } from 'vue'

type Scene = 'roles' | 'parallelism' | 'network' | 'syscall' | 'steal'
type Token = { id: string; x: number; y: number; state: 'running' | 'runnable' | 'parked' | 'blocked' | 'new' }
const props = withDefaults(defineProps<{ scene: Scene; step?: number }>(), { step: 0 })
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()
const uid = `scheduler-${useId()}`
const finalStage = { roles: 3, parallelism: 3, network: 4, syscall: 4, steal: 3 }
const stage = computed(() => unref(isPrintMode) || !['slide', 'presenter'].includes(unref($renderContext))
  ? finalStage[props.scene]
  : Math.max(0, Math.min(Math.trunc(props.step), finalStage[props.scene])))
const captions: Record<Scene, string[]> = {
  roles: [
    '0 · G is a goroutine: a schedulable Go task.',
    '1 · M is an OS thread: it executes instructions.',
    '2 · P holds runtime resources and permission to execute user Go code.',
    '3 · An M needs a P to execute a G’s user Go code. P is not a CPU.',
  ],
  parallelism: [
    '0 · GOMAXPROCS = 2: two Ps, four runnable goroutines in this example.',
    '1 · M1 uses P1 to execute G1. The other Gs remain runnable.',
    '2 · Two Ps allow two Gs to execute user Go code at once.',
    '3 · Other Gs get a turn. This limits execution, not total Gs or Ms.',
  ],
  network: [
    '0 · G1 runs until it needs pollable network I/O.',
    '1 · The network wait parks G1; it does not occupy this M/P.',
    '2 · The same M and P execute G2 while G1 waits.',
    '3 · I/O readiness makes G1 runnable, not immediately running.',
    '4 · Later, the scheduler runs G1 again. G2 is now runnable.',
  ],
  syscall: [
    '0 · G1 runs on M1 with P1; G2 is runnable.',
    '1 · A blocking syscall occupies M1. P handoff is not always immediate.',
    '2 · P1 may be handed off or retaken; M1 is still in the syscall.',
    '3 · Here M2 uses P1 to run G2 while M1 remains blocked.',
    '4 · The syscall returns. Here G1 becomes runnable; G2 keeps running.',
  ],
  steal: [
    '0 · P1 has queued work; P2 has no runnable work locally.',
    '1 · The idle scheduler looks for work on another P.',
    '2 · In this example, P2 steals part of P1’s queued work.',
    '3 · P2 runs G5; G6 remains queued. This is one possible schedule.',
  ],
}
const caption = computed(() => captions[props.scene][stage.value])
const twoPs = computed(() => props.scene === 'parallelism' || props.scene === 'steal')
const tokens = computed<Token[]>(() => {
  const s = stage.value
  const g = (id: string, x: number, y: number, state: Token['state']): Token => ({ id, x, y, state })
  switch (props.scene) {
    case 'roles': return [g('G1', s === 3 ? 890 : 170, 174, s === 3 ? 'running' : 'new')]
    case 'parallelism': return [
      g('G1', s === 1 || s === 2 ? 220 : 110, s === 1 || s === 2 ? 185 : 335, s === 1 || s === 2 ? 'running' : 'runnable'),
      g('G2', s === 3 ? 220 : 230, s === 3 ? 185 : 335, s === 3 ? 'running' : 'runnable'),
      g('G3', s === 2 ? 620 : 580, s === 2 ? 185 : 335, s === 2 ? 'running' : 'runnable'),
      g('G4', s === 3 ? 620 : 700, s === 3 ? 185 : 335, s === 3 ? 'running' : 'runnable'),
    ]
    case 'network': return [
      g('G1', s === 0 || s === 4 ? 300 : s === 3 ? 680 : 950, s === 3 ? 335 : 185,
        s === 0 || s === 4 ? 'running' : s === 3 ? 'runnable' : 'parked'),
      g('G2', s === 2 || s === 3 ? 300 : 680, s === 2 || s === 3 ? 185 : 335, s === 2 || s === 3 ? 'running' : 'runnable'),
    ]
    case 'syscall': return [
      g('G1', s === 0 ? 300 : s === 4 ? 680 : 950, s === 4 ? 335 : 185,
        s === 0 ? 'running' : s === 4 ? 'runnable' : 'blocked'),
      g('G2', s >= 3 ? 300 : 680, s >= 3 ? 185 : 335, s >= 3 ? 'running' : 'runnable'),
    ]
    case 'steal': return [
      g('G1', 220, 185, 'running'),
      g('G3', 90, 335, 'runnable'), g('G4', 180, 335, 'runnable'),
      g('G5', s === 3 ? 620 : s === 2 ? 590 : 270, s === 3 ? 185 : 335, s === 3 ? 'running' : 'runnable'),
      g('G6', s >= 2 ? 710 : 360, 335, 'runnable'),
    ]
  }
})
const thread1X = computed(() => props.scene === 'syscall' && stage.value >= 1 ? 950 : 300)
const thread2X = computed(() => stage.value >= 3 ? 300 : 680)
</script>

<template>
  <svg class="scheduler-diagram" :data-stage="stage" viewBox="0 0 1180 420" role="img" :aria-labelledby="`${uid}-title ${uid}-desc`">
    <title :id="`${uid}-title`">Go scheduler · {{ scene }}</title>
    <desc :id="`${uid}-desc`">{{ caption }} Solid accent G tokens are running, outlined tokens runnable, and dashed tokens waiting. P is a runtime execution resource, not a physical CPU. The schedule and queues are illustrative, not exhaustive or guaranteed.</desc>
    <defs>
      <marker :id="`${uid}-arrow`" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1 L8 4.5 L1 8" class="arrow-head" />
      </marker>
    </defs>

    <template v-if="scene === 'roles'">
      <text class="heading" x="170" y="64" text-anchor="middle">G · goroutine</text>
      <g class="reveal" :class="{ shown: stage >= 1 }" :aria-hidden="stage < 1">
        <text class="heading" x="520" y="64" text-anchor="middle">M · OS thread</text>
        <g class="moving" :style="{ transform: `translate(${stage === 3 ? 890 : 520}px, 220px)` }">
          <rect class="thread" x="-135" y="-90" width="270" height="150" rx="10" />
          <text class="label" y="30" text-anchor="middle">M1</text>
        </g>
      </g>
      <g class="reveal" :class="{ shown: stage >= 2 }" :aria-hidden="stage < 2">
        <rect class="p-frame" x="690" y="85" width="440" height="235" rx="12" />
        <text class="heading" x="910" y="64" text-anchor="middle">P · runtime resources</text>
      </g>
      <path v-if="stage === 3" class="arrow" d="M245 174 H735" :marker-end="`url(#${uid}-arrow)`" />
    </template>

    <template v-else-if="twoPs">
      <text class="heading" x="40" y="35">{{ scene === 'parallelism' ? 'GOMAXPROCS = 2' : 'Per-P run queues · simplified' }}</text>
      <g v-for="(x, i) in [40, 440]" :key="i">
        <rect class="p-frame" :x="x" y="68" width="360" height="292" rx="12" />
        <text class="heading" :x="x + 180" y="104" text-anchor="middle">P{{ i + 1 }}</text>
        <rect class="thread" :x="x + 40" y="132" width="280" height="155" rx="10" />
        <text class="label" :x="x + 180" y="268" text-anchor="middle">M{{ i + 1 }} · {{ i === 0 ? (scene === 'steal' || stage >= 1 ? 'executing' : 'idle') : (scene === 'steal' ? (stage === 3 ? 'executing' : 'idle') : (stage >= 2 ? 'executing' : 'idle')) }}</text>
        <text class="detail" :x="x + 20" y="304">local runnable queue</text>
      </g>
      <g class="aside">
        <text x="850" y="154">{{ scene === 'parallelism' ? `${stage === 0 ? 0 : stage === 1 ? 1 : 2} running` : ['local queues', 'seek', 'steal', 'run'][stage] }}</text>
        <text x="850" y="192">{{ scene === 'parallelism' ? `${stage === 0 ? 4 : stage === 1 ? 3 : 2} runnable` : 'queued Gs only' }}</text>
      </g>
      <path v-if="scene === 'steal' && stage >= 1" class="arrow" :d="stage === 1 ? 'M620 52 H220' : 'M270 375 H710'" :marker-end="`url(#${uid}-arrow)`" />
    </template>

    <template v-else>
      <rect class="p-frame" x="40" y="68" width="520" height="240" rx="12" />
      <text class="heading" x="300" y="105" text-anchor="middle">P1{{ scene === 'syscall' && stage === 2 ? ' · available' : '' }}</text>
      <text class="detail" x="40" y="35">{{ scene === 'network' ? 'Pollable network I/O' : 'Blocking syscall' }}</text>
      <rect class="waiting-area" x="830" y="68" width="310" height="240" rx="12" />
      <text class="heading" x="985" y="106" text-anchor="middle">{{ scene === 'network' ? 'network poller' : 'syscall' }}</text>
      <text class="detail" x="985" y="296" text-anchor="middle">{{ scene === 'network' ? (stage >= 3 ? 'I/O ready' : 'waiting for I/O') : (stage === 4 ? 'returned' : 'may block M1') }}</text>
      <text class="detail" x="590" y="305">runnable queue</text>
      <g class="moving" :style="{ transform: `translate(${thread1X}px, 220px)` }">
        <rect class="thread" x="-135" y="-88" width="270" height="150" rx="10" />
        <text class="label" y="47" text-anchor="middle">M1 · {{ scene === 'network' ? (stage === 1 ? 'available' : 'executing') : (stage === 0 ? 'executing' : stage === 4 ? 'returned' : 'blocked') }}</text>
      </g>
      <g v-if="scene === 'syscall'" class="moving reveal" :class="{ shown: stage >= 2 }" :aria-hidden="stage < 2" :style="{ transform: `translate(${thread2X}px, 220px)` }">
        <rect class="thread" x="-125" y="-88" width="250" height="150" rx="10" />
        <text class="label" y="47" text-anchor="middle">M2 · {{ stage >= 3 ? 'executing' : 'available' }}</text>
      </g>
      <path v-if="scene === 'network' && stage === 3" class="arrow" d="M950 321 V360 H740" :marker-end="`url(#${uid}-arrow)`" />
    </template>

    <!-- Stable G identities survive every click, including backward navigation. -->
    <g v-for="token in tokens" :key="`${scene}-${token.id}`" class="moving token" :class="token.state" :style="{ transform: `translate(${token.x}px, ${token.y}px)` }">
      <title>{{ token.id }} · {{ token.state === 'new' ? 'goroutine' : token.state }}</title>
      <rect x="-39" y="-22" width="78" height="44" rx="7" />
      <text class="label" y="8" text-anchor="middle">{{ token.id }}</text>
      <text v-if="token.state === 'parked' || token.state === 'blocked'" class="detail" y="55" text-anchor="middle">{{ token.state }}</text>
    </g>
  </svg>
</template>

<style scoped>
.scheduler-diagram { display: block; width: 100%; height: auto; color: var(--_journey-ink); font-family: inherit; }
.heading { fill: currentColor; font-size: 25px; font-weight: 600; }
.label { fill: currentColor; font-size: 25px; font-weight: 600; }
.detail, .aside { fill: var(--_journey-muted); font-size: 22px; }
.p-frame { fill: none; stroke: currentColor; stroke-width: 2.5; }
.thread { fill: var(--_journey-paper); stroke: var(--_journey-muted); stroke-width: 2; }
.waiting-area { fill: none; stroke: var(--_journey-muted); stroke-width: 2; stroke-dasharray: 7 6; }
.arrow, .arrow-head { fill: none; stroke: var(--_journey-accent); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.moving { transition: transform .65s ease-in-out; }
.reveal { opacity: 0; transition: opacity .25s ease; }
.moving.reveal { transition: transform .65s ease-in-out, opacity .25s ease; }
.reveal.shown { opacity: 1; }
.token rect { fill: var(--_journey-paper); stroke: var(--_journey-accent); stroke-width: 2.5; }
.token text { fill: var(--_journey-accent); }
.token.running rect { fill: var(--_journey-accent); }
.token.running .label { fill: var(--_journey-paper); }
.token.parked rect, .token.blocked rect { stroke-dasharray: 5 4; }
@media (prefers-reduced-motion: reduce) {
  .moving, .reveal, .moving.reveal { transition: none; }
}
@media print {
  .moving, .reveal, .moving.reveal { transition: none; }
}
</style>
