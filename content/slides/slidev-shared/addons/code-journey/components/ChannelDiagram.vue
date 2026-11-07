<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, unref, useId } from 'vue'

type Scene = 'rendezvous' | 'buffer' | 'close' | 'select'
const props = defineProps<{ scene: Scene; step?: number }>()
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()
const id = `channel-${useId()}`
const finalStages = { rendezvous: 3, buffer: 4, close: 4, select: 3 }
const stage = computed(() => {
  const last = finalStages[props.scene]
  return unref(isPrintMode) || !['slide', 'presenter'].includes(unref($renderContext))
    ? last : Math.max(0, Math.min(Math.floor(props.step ?? last), last))
})
const captions: Record<Scene, string[]> = {
  rendezvous: [
    '0 · Unbuffered: the sender has a value; no receiver is ready yet.',
    '1 · The send parks the goroutine, not an entire OS thread.',
    '2 · A matching receive transfers the value and makes the parked sender runnable.',
    '3 · The sender resumes. The receiver need not have finished processing.',
  ],
  buffer: [
    '0 · Buffered alternative: two active workers + three queued values.',
    '1 · D cannot enter a full buffer. Its sender parks.',
    '2 · Worker 1 completes its current job; the queue is still full.',
    '3 · Worker 1 receives A; the runtime puts D in the buffer and readies its sender.',
    '4 · The sender resumes; its send returns. D was already queued.',
  ],
  close: [
    '0 · A and B are buffered. The sending owner still has the channel open.',
    '1 · The owner closes the channel. Buffered A and B are preserved.',
    '2 · Receive A with ok=true, even though the channel is closed.',
    '3 · Receive B with ok=true. The closed buffer is now empty.',
    '4 · Next receive returns the element type’s zero value with ok=false.',
  ],
  select: [
    '0 · Neither case is ready: this select waits.',
    '1 · Both the send and ctx.Done() are ready. Neither has priority.',
    '2 · One possible choice: cancellation. This select does not send.',
    '3 · From that same readiness, sending was also possible. Cancel ≠ join.',
  ],
}
const caption = computed(() => captions[props.scene][stage.value])
// Stable value keys keep the same SVG nodes while their CSS positions change.
const tokens = computed(() => {
  const s = stage.value
  switch (props.scene) {
    case 'rendezvous':
      return [{ key: 'value', label: 'URL', x: [180, 180, 955, 955][s], y: 205, visible: true }]
    case 'buffer':
      return [
        { key: 'X', label: 'X', x: s >= 2 ? 1030 : 875, y: s >= 2 ? 98 : 165, visible: true },
        { key: 'Y', label: 'Y', x: 875, y: 280, visible: true },
        { key: 'A', label: 'A', x: s >= 3 ? 875 : 450, y: s >= 3 ? 165 : 205, visible: true },
        { key: 'B', label: 'B', x: s >= 3 ? 450 : 550, y: 205, visible: true },
        { key: 'C', label: 'C', x: s >= 3 ? 550 : 650, y: 205, visible: true },
        { key: 'D', label: 'D', x: s >= 3 ? 650 : s >= 1 ? 295 : 140, y: 205, visible: true },
      ]
    case 'close':
      return [
        { key: 'A', label: 'A', x: s >= 2 ? 860 : 385, y: s >= 2 ? 165 : 200, visible: true },
        { key: 'B', label: 'B', x: s >= 3 ? 1010 : 495, y: s >= 3 ? 165 : 200, visible: true },
        { key: 'zero', label: 'zero', x: 935, y: 270, visible: s >= 4 },
      ]
    case 'select':
      return [{ key: 'value', label: 'URL', x: s >= 3 ? 965 : 175, y: s >= 3 ? 334 : 165, visible: true }]
  }
})
</script>

<template>
  <svg class="channel-diagram" :data-stage="stage" viewBox="0 0 1180 420" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
    <title :id="`${id}-title`">Channel semantics · {{ scene }}</title>
    <desc :id="`${id}-desc`">{{ caption }}</desc>
    <defs>
      <marker :id="`${id}-arrow`" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1 L8 5 L1 9" class="line" />
      </marker>
    </defs>

    <g v-if="scene === 'rendezvous'">
      <text class="heading" x="40" y="40">capacity 0</text>
      <rect class="box" :class="{ parked: stage === 1 }" x="40" y="105" width="280" height="185" rx="8" />
      <rect class="box" x="800" y="105" width="340" height="185" rx="8" />
      <text class="label" x="180" y="142" text-anchor="middle">sender</text>
      <text class="label" x="970" y="142" text-anchor="middle">receiver</text>
      <path class="line" d="M330 205 H790" :marker-end="`url(#${id}-arrow)`" />
      <text class="status" x="180" y="268" text-anchor="middle">{{ ['ready to send', 'parked on send', 'runnable', 'send completed'][stage] }}</text>
      <text class="status" x="970" y="268" text-anchor="middle">{{ ['not receiving', 'not receiving', 'value received', 'processing value'][stage] }}</text>
    </g>

    <g v-else-if="scene === 'buffer'">
      <text class="heading" x="40" y="36">buffered alternative</text>
      <rect class="box" :class="{ chosen: stage === 4, ready: stage === 4 }" x="40" y="130" width="200" height="150" rx="8" />
      <text class="label" x="140" y="165" text-anchor="middle">sender</text>
      <text class="status" x="140" y="260" text-anchor="middle">{{ ['ready', 'parked', 'parked', 'runnable', 'send complete'][stage] }}</text>
      <path class="line" d="M245 205 H380" :marker-end="`url(#${id}-arrow)`" />
      <text class="detail" x="550" y="109" text-anchor="middle">queue · capacity 3</text>
      <rect class="box" x="390" y="145" width="320" height="120" rx="8" />
      <path class="slot" d="M500 145 V265 M600 145 V265" />
      <text class="status" x="550" y="303" text-anchor="middle">3 / 3 queued</text>
      <path class="line" d="M720 205 H760 V165 H790" :marker-end="`url(#${id}-arrow)`" />
      <rect class="box" x="795" y="115" width="160" height="90" rx="8" />
      <rect class="box" x="795" y="230" width="160" height="90" rx="8" />
      <text class="detail" x="875" y="100" text-anchor="middle">worker 1</text>
      <text class="detail" x="875" y="350" text-anchor="middle">worker 2 · active</text>
      <text v-if="stage === 2" class="status" x="875" y="173" text-anchor="middle">idle</text>
      <text class="detail" x="1030" y="62" text-anchor="middle">completed</text>
    </g>

    <g v-else-if="scene === 'close'">
      <text class="heading" x="40" y="36">buffered values survive close</text>
      <text class="label" x="440" y="101" text-anchor="middle">{{ stage === 0 ? 'open · sending owner' : 'closed by sending owner' }}</text>
      <rect class="box" :class="{ closed: stage >= 1 }" x="310" y="140" width="260" height="120" rx="8" />
      <path class="slot" d="M440 140 V260" />
      <text class="status" x="440" y="301" text-anchor="middle">{{ stage < 2 ? '2 buffered' : stage === 2 ? '1 buffered' : 'empty' }}</text>
      <path class="line" d="M585 200 H755" :marker-end="`url(#${id}-arrow)`" />
      <text class="detail" x="665" y="171" text-anchor="middle">receive</text>
      <rect class="box" x="770" y="107" width="360" height="210" rx="8" />
      <text class="label" x="950" y="139" text-anchor="middle">receiver</text>
      <text v-if="stage >= 2" class="status" x="860" y="211" text-anchor="middle">ok=true</text>
      <text v-if="stage >= 3" class="status" x="1010" y="211" text-anchor="middle">ok=true</text>
      <text v-if="stage >= 4" class="status" x="935" y="308" text-anchor="middle">ok=false</text>
      <text class="detail" x="165" y="166" text-anchor="middle">send after close</text>
      <text class="warning" x="165" y="202" text-anchor="middle">panic</text>
    </g>

    <g v-else>
      <text class="heading" x="40" y="36">one ready case</text>
      <rect class="box" x="40" y="110" width="270" height="120" rx="8" />
      <text class="label" x="175" y="142" text-anchor="middle">select</text>
      <text class="status" x="175" y="212" text-anchor="middle">{{ stage === 0 ? 'waiting' : stage === 1 ? 'two ready cases' : 'cancel chosen' }}</text>
      <path class="line" d="M320 165 H470 V123 H600 M470 165 V238 H600" :marker-end="`url(#${id}-arrow)`" />
      <rect class="box" :class="{ ready: stage >= 1 }" x="610" y="83" width="520" height="80" rx="8" />
      <rect class="box" :class="{ ready: stage >= 1, chosen: stage >= 2 }" x="610" y="198" width="520" height="80" rx="8" />
      <text class="label" x="635" y="115">case jobs &lt;- url</text>
      <text class="detail" x="635" y="146">{{ stage === 0 ? 'no receiver · not ready' : 'receiver waiting · send ready' }}</text>
      <text class="label" x="635" y="230">case &lt;-ctx.Done()</text>
      <text class="detail" x="635" y="261">{{ stage === 0 ? 'context live · not ready' : stage === 1 ? 'context canceled · receive ready' : 'chosen → return' }}</text>
      <g v-if="stage >= 3">
        <path class="alternative" d="M320 305 H1130 V363 H320 Z" />
        <text class="detail" x="340" y="331">Alternative (same readiness)</text>
        <text class="detail" x="340" y="355">send URL</text>
      </g>
    </g>

    <g aria-hidden="true">
      <g v-for="token in tokens" :key="`${scene}-${token.key}`" class="token" :style="{ transform: `translate(${token.x}px, ${token.y}px)`, opacity: token.visible ? 1 : 0 }">
        <rect x="-39" y="-23" width="78" height="46" rx="5" />
        <text y="8" text-anchor="middle">{{ token.label }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.channel-diagram { display: block; width: 100%; height: auto; color: var(--_journey-ink); font-family: inherit; }
.channel-diagram text { fill: currentColor; }
.heading, .label { font-size: 26px; font-weight: 600; }
.detail { font-size: 22px; fill: var(--_journey-muted) !important; }
.status { font-size: 23px; }
.box { fill: var(--_journey-paper); stroke: currentColor; stroke-width: 2.5; }
.line, .slot, .alternative { fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.slot { stroke: var(--_journey-muted); stroke-width: 1.5; }
.closed, .alternative, .parked { stroke-dasharray: 7 6; }
.ready { stroke: var(--_journey-accent); }
.chosen { stroke-width: 4; }
.warning { fill: var(--_journey-accent) !important; font-size: 27px; font-weight: 600; }
.token { transition: transform .55s ease, opacity .2s ease; }
.token rect { fill: var(--_journey-paper); stroke: var(--_journey-accent); stroke-width: 2.5; }
.token text { fill: var(--_journey-accent); font-size: 25px; font-weight: 600; }
@media (prefers-reduced-motion: reduce) {
  .token { transition: none; }
}
@media print {
  .token { transition: none; }
}
</style>
