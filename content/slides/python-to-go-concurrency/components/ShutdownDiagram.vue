<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, unref, useId } from 'vue'

const props = defineProps<{ step: number }>()
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()
const id = `shutdown-${useId()}`
const stage = computed(() => unref(isPrintMode) || !['slide', 'presenter'].includes(unref($renderContext))
  ? 5 : Math.max(0, Math.min(5, Math.trunc(props.step))))
const tasks = [
  { name: 'producer', wait: 'job handoff' },
  { name: 'worker 1', wait: 'HTTP wait' },
  { name: 'worker 2', wait: 'result send' },
]
const descriptions = [
  'The request is active. A producer and two workers are waiting at different boundaries. The collector receives while they run.',
  'The caller disconnects and the request context is canceled. The signal reaches every blocking boundary, but work is not joined yet.',
  'In this illustrative path, all three goroutines observe cancellation and exit. The HTTP client operation returns; this does not prove the remote server stopped.',
  'The coordinator has joined the workers and producer. No result sender remains.',
  'The coordinator closes results. The collector drains any delivered results and its range ends.',
  'Only after joining and collection does Run return with a partial report and the context error. The disconnected caller cannot receive a response.',
]
</script>

<template>
  <svg class="shutdown-diagram" :data-stage="stage" viewBox="0 0 1180 420" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
    <title :id="`${id}-title`">Cancellation is a signal, not completion</title>
    <desc :id="`${id}-desc`">{{ descriptions[stage] }}</desc>
    <text class="context" x="40" y="32">request context · {{ stage === 0 ? 'active' : 'canceled' }}</text>
    <g class="signal" :class="{ sent: stage >= 1 }" :aria-hidden="stage < 1">
      <path pathLength="1" d="M40 50 H620 M140 50 V97 M380 50 V97 M620 50 V97" />
    </g>
    <g v-for="(task, i) in tasks" :key="task.name" :transform="`translate(${40 + i * 240}, 100)`">
      <rect class="task" :class="{ stopped: stage >= 2 }" width="200" height="115" rx="9" />
      <text class="label" x="100" y="36" text-anchor="middle">{{ task.name }}</text>
      <text class="detail" x="100" y="76" text-anchor="middle">{{ stage >= 2 ? 'exited' : task.wait }}</text>
      <g class="completion" :class="{ done: stage >= 2 }" :style="{ transform: `translate(100px, ${stage >= 2 ? 170 : 115}px)` }">
        <circle r="15" />
        <path d="M-7 0 L-2 5 L8 -6" />
      </g>
    </g>
    <path class="join-line" :class="{ ready: stage >= 2 }" d="M140 270 H750 V142 H795" />
    <g class="join-gate" :class="{ joined: stage >= 3 }">
      <rect x="800" y="100" width="340" height="85" rx="9" pathLength="1" />
      <text class="label" x="970" y="133" text-anchor="middle">join producer + workers</text>
      <text class="detail" x="970" y="167" text-anchor="middle">{{ stage >= 3 ? 'complete · no senders remain' : 'waiting' }}</text>
    </g>
    <path class="connector" :class="{ ready: stage >= 4 }" d="M970 190 V220" />
    <rect class="result-box" x="800" y="225" width="340" height="75" rx="9" />
    <g class="closed-wipe" :class="{ closed: stage >= 4 }" :aria-hidden="stage < 4">
      <rect x="800" y="225" width="340" height="75" rx="9" />
    </g>
    <text class="label" x="970" y="251" text-anchor="middle">results</text>
    <text class="detail" x="970" y="290" text-anchor="middle">{{ stage >= 4 ? 'closed → drained' : 'open' }}</text>
    <text class="detail" x="40" y="335">collector · receives while workers run</text>
    <path class="collector-line" d="M40 352 H750 V285 H790" />
    <path class="connector" :class="{ ready: stage >= 5 }" d="M970 305 V335" />
    <g class="return-card" :class="{ returned: stage >= 5 }" :aria-hidden="stage < 5">
      <rect x="800" y="340" width="340" height="65" rx="9" />
      <text class="label" x="970" y="381" text-anchor="middle">Run returns</text>
    </g>
    <text class="takeaway" x="40" y="404">{{ stage < 3 ? 'Stop requested ≠ work finished' : stage < 5 ? 'Joined. Collected. Then return.' : 'No goroutine left behind.' }}</text>
  </svg>
</template>

<style scoped>
.shutdown-diagram { display: block; width: 100%; height: 380px; color: var(--talk-ink); font-family: inherit; }
text { fill: currentColor; }
.context, .label { font-size: 25px; font-weight: 600; }
.detail { fill: var(--talk-muted); font-size: 21px; }
.takeaway { font-size: 27px; font-weight: 600; }
.task, .result-box { fill: var(--talk-surface); stroke: var(--talk-border); stroke-width: 2; }
.task { transition: opacity .35s ease; }
.task.stopped { opacity: .4; }
.signal path { fill: none; stroke: var(--talk-accent); stroke-width: 3; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; transition: stroke-dashoffset .7s linear, opacity .2s; }
.signal.sent path { stroke-dashoffset: 0; opacity: 1; }
.completion { opacity: 0; transition: transform .55s cubic-bezier(.4, 0, .2, 1), opacity .25s; }
.completion.done { opacity: 1; }
.completion circle { fill: var(--talk-paper); stroke: var(--talk-accent); stroke-width: 2; }
.completion path { fill: none; stroke: var(--talk-accent); stroke-width: 2.5; }
.join-line, .connector { fill: none; stroke: var(--talk-border); stroke-width: 2; transition: stroke .3s ease; }
.ready { stroke: var(--talk-accent); }
.join-gate rect { fill: none; stroke: var(--talk-border); stroke-width: 2; stroke-dasharray: .025 .025; transition: stroke .25s, stroke-dasharray .4s; }
.join-gate.joined rect { stroke: var(--talk-accent); stroke-width: 3; stroke-dasharray: 1 0; }
.closed-wipe { clip-path: inset(0 100% 0 0); transition: clip-path .55s cubic-bezier(.22, 1, .36, 1); }
.closed-wipe.closed { clip-path: inset(0); }
.closed-wipe rect { fill: var(--talk-accent-soft); stroke: var(--talk-accent); stroke-width: 2; }
.collector-line { fill: none; stroke: var(--talk-muted); stroke-width: 2; stroke-dasharray: 6 5; }
.return-card { opacity: 0; transform: translateY(8px); transition: opacity .3s, transform .4s cubic-bezier(.16, 1, .3, 1); }
.return-card.returned { opacity: 1; transform: translateY(0); }
.return-card rect { fill: var(--talk-accent); }
.return-card text { fill: var(--talk-paper); }
@media (prefers-reduced-motion: reduce), print {
  .task, .signal path, .completion, .join-line, .connector, .join-gate rect, .closed-wipe, .return-card { transition: none; }
}
</style>
