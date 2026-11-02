<script setup lang="ts">
import { computed } from 'vue'
import ReviewSketch from './ReviewSketch.vue'

type Example = 'sequence' | 'timeline' | 'comparison' | 'checkpoint' | 'focus' | 'backlog' | 'draw' | 'branch' | 'ordered' | 'failure-wave' | 'replay' | 'jitter' | 'dedup' | 'circuit' | 'retention'
const props = defineProps<{ example: Example; step: number; talk?: boolean }>()
const examples: Record<Example, { title: string; fit: string; beats: string[] }> = {
  sequence: {
    title: '01 · Sequence diagram', fit: 'Try instead of the bank-crash diagram · time runs downward',
    beats: ['Same payment key throughout; no payment yet.', 'Request reaches the bank. The bank pays once.', 'The response is lost—not the payment.', 'The caller times out. Its outcome is unknown.', 'Retry with the same key; the bank does not pay again.', 'Return payment-7, the original result. Payment count stays at one.'],
  },
  timeline: {
    title: '02 · Timeline + eligibility gate', fit: 'Try for delayed retries; the same style can show a shutdown deadline',
    beats: ['Failure at 10:00. Retry is due at 10:05.', 'Two and a half minutes later: the worker still waits.', 'At 10:05 the event becomes eligible; it has not run yet.', 'The Go worker invokes the handler. Kafka did not supply the delay.'],
  },
  comparison: {
    title: '03 · Synchronized comparison', fit: 'Try instead of separate eager and cooperative slides',
    beats: ['Identical ownership: C1 owns P0 + P2; C2 owns P1.', 'Consumer 3 joins both groups.', 'Eager pauses all three partitions. Cooperative pauses only P2.', 'Reassign: only P2 changes owner; the other owners stay the same.', 'All resume. Unchanged eager owners still suffered a pause.'],
  },
  checkpoint: {
    title: '04 · Finite action + checkpoint cursor', fit: 'Try for retry and DLQ handoffs · one action per click',
    beats: ['Record 42 was fetched. Committed next is still 42.', 'Publish a retry copy. The original log record stays put.', 'Retry publication is acknowledged. The checkpoint still has not moved.', 'Only after ACK: commit next 43. Commit does not delete record 42.'],
  },
  focus: {
    title: '05 · Focus and context', fit: 'Try when moving from system architecture into handler code',
    beats: ['Begin with the system map.', 'Focus on Disbursements; keep its neighbours as context.', 'Open the handler: call the bank using a stable key.', 'After success, commit the next offset. Then return to the system view.', 'Back to the overview, with the completed boundary highlighted.'],
  },
  backlog: {
    title: '06 · Accumulation and recovery', fit: 'Try for the opening bank outage and the monitoring section · illustrative counts',
    beats: ['Both systems are healthy.', 'Bank unavailable: synchronous callers wait; Kafka buffers payout work.', 'More arrivals: synchronous pressure spreads; Collections still accepts work asynchronously.', 'Bank recovers. The backlog starts draining—not instantly disappearing.', 'Caught up: waiting work reaches zero.'],
  },
  draw: {
    title: '07 · Draw-on emphasis', fit: 'Try for transaction boundaries and the ACK-to-delete crash window',
    beats: ['Keep the architecture still. Animate only the important annotation.', 'Draw one boundary around the state update and outbox insert.', 'Underline the invariant: both writes commit or neither does.', 'Mark the separate crash window: Kafka ACK is not the DB delete commit.'],
  },
  branch: {
    title: '08 · Explicit alternative timelines', fit: 'Try instead of restoring a deleted outbox row in the same timeline',
    beats: ['Shared starting point: Kafka ACK received; outbox row still pending.', 'Normal branch: delete + DB commit. Outbox row is gone.', 'Alternative branch from the SAME starting point: crash before DB commit.', 'Restart republishes the pending row. Kafka can now contain two copies.', 'The copies share an event ID; downstream bank calls must reuse the payment key.'],
  },
  ordered: {
    title: '09 · Routed cards + parked-key payoff', fit: 'Try for ordered retries · travel above the cards, never across their labels',
    beats: ['A is parked with created, updated and completed queued. B is independent.', 'B can complete while A remains parked.', 'A created completes; its redirect entry gets a tombstone.', 'A updated completes next; its redirect entry gets a tombstone.', 'A completed finishes last. No waiting A events remain: release A.'],
  },
  'failure-wave': {
    title: '10 · The failure wave', fit: 'Show the blast radius, not just a bank turning red',
    beats: ['Two architectures. The same bank dependency.', 'The bank fails in both systems.', 'Synchronous Disbursements blocks; Kafka buffers asynchronous payout work.', 'The synchronous failure reaches Collections. In the event-driven flow, it stops at the buffer.'],
  },
  replay: {
    title: '11 · Rewind the reader, not the log', fit: 'A visible replay cursor makes persistence and idempotency tangible',
    beats: ['The reader reached offset 45. Collection A has already been paid.', 'With the consumer stopped, an operator resets this group to 42, within retention.', 'Replay 42: the bank sees the same Collection A key and returns the existing payment.', 'Read 43 next. Earlier records remain in the log.', 'Back at next offset 45. Re-reading never erased or recreated the log.'],
  },
  jitter: {
    title: '12 · Unbunch the retries', fit: 'A visual rhythm change: fixed delay versus randomized due times',
    beats: ['Six failures happen together. Compare their next retry times.', 'With the same fixed delay, all six become due together: another burst.', 'With jitter, each due time is spread across a window after the minimum delay.', 'The worker releases due work gradually. Jitter spreads load; it does not add capacity.'],
  },
  dedup: {
    title: '13 · Two attempts, one payment', fit: 'A fork-and-merge animation for bank-enforced idempotency',
    beats: ['Two copies of the same logical payout can arrive concurrently.', 'Both requests carry the SAME bank payment key: collection-a.', 'The bank atomically reserves the key. The duplicate waits for or retrieves the same operation.', 'One payment completes. Both attempts can receive payment-7, not two payouts.'],
  },
  circuit: {
    title: '14 · A circuit breaker you can see', fit: 'New topic candidate · protect the bank without throwing away payout work',
    beats: ['CLOSED: ordinary requests may call the bank.', 'Failures reach the configured threshold. OPEN: stop ordinary bank calls.', 'During cooldown, defer work durably; commit only after a safe handoff.', 'After cooldown: HALF-OPEN permits a limited probe, not the full backlog.', 'A successful probe closes the breaker. Resume gradually; a failed probe would reopen it.'],
  },
  retention: {
    title: '15 · The retention window', fit: 'New topic candidate · make the recovery deadline physically visible',
    beats: ['Committed next is 42. It is still in a retained closed segment.', 'At 10:15, with 1h time retention, the closed segment ending at 09:10 is eligible for deletion.', 'The broker deletes that CLOSED SEGMENT, including unread record 42. Lag does not protect it.', '42 is now outside the retained range. Recovery needs an explicit reset or restore policy—not a blind retry.'],
  },
}
const phase = computed(() => Math.max(0, Math.min(props.step, examples[props.example].beats.length - 1)))
const spec = computed(() => examples[props.example])
const waiting = computed(() => [0, 3, 6, 3, 0][phase.value])
const partitions = ['P0', 'P1', 'P2']
function partitionPosition(index: number, cooperative: boolean) {
  const s = phase.value
  if (s === 2 && (!cooperative || index === 2)) return `translate(${35 + index * 160}px, 270px)`
  const owner = index === 0 ? 0 : index === 1 ? 1 : s >= 3 ? 2 : 0
  return `translate(${35 + owner * 160 + (index === 2 && owner === 0 ? 65 : 0)}px, 160px)`
}
</script>

<template>
  <section class="animation-suggestion" :data-example="example">
    <header v-if="!talk">
      <span class="review-tag">ANIMATION IDEAS · REVIEW ONLY</span>
      <h2>{{ spec.title }}</h2>
      <p>{{ spec.fit }}</p>
    </header>
    <svg viewBox="0 0 1100 410" role="img" :aria-label="`${spec.title}. ${spec.beats[phase]}`">
      <template v-if="example === 'sequence'">
        <g v-for="(label, i) in ['Disbursements', 'Bank API', 'Bank ledger']" :key="label">
          <ReviewSketch :x="70 + i * 365" y="10" width="270" height="48" class="box" />
          <text :x="205 + i * 365" y="41" text-anchor="middle">{{ label }}</text>
          <ReviewSketch :d="`M ${205 + i * 365} 58 V 350`" class="lifeline" />
        </g>
        <g v-for="(message, i) in [
          { from: 205, to: 570, label: 'Payout · key: collection-a', at: 1 },
          { from: 570, to: 935, label: 'Save payment-7 · paid once', at: 1 },
          { from: 570, to: 360, label: 'Response lost ✕', at: 2 },
          { from: 205, to: 570, label: 'Retry · SAME key', at: 4 },
          { from: 570, to: 205, label: 'Original result: payment-7', at: 5 },
        ]" :key="i">
          <g v-if="phase >= message.at" :class="i === 2 ? 'danger' : i === 4 ? 'success' : 'accent'">
            <ReviewSketch :d="`M ${message.from} ${95 + i * 52} H ${message.to}`" class="message draw-on" />
            <ReviewSketch :d="`M ${message.to + (message.to > message.from ? -10 : 10)} ${89 + i * 52} L ${message.to} ${95 + i * 52} l ${message.to > message.from ? -10 : 10} 6`" class="message" />
            <text :x="(message.from + message.to) / 2" :y="85 + i * 52" text-anchor="middle" class="small">{{ message.label }}</text>
          </g>
        </g>
        <text v-if="phase >= 3" x="205" y="383" text-anchor="middle" class="small danger">Timeout · outcome unknown</text>
        <text x="935" y="383" text-anchor="middle" class="success">Payments: {{ phase >= 1 ? 1 : 0 }}</text>
      </template>

      <template v-else-if="example === 'timeline'">
        <text x="70" y="60">Retry due: 10:05:00</text>
        <text x="1030" y="60" text-anchor="end" :class="phase >= 2 ? 'success' : 'accent'">Now: {{ ['10:00:00', '10:02:30', '10:05:00', '10:05:00'][phase] }}</text>
        <ReviewSketch d="M 90 155 H 1010" class="wire" />
        <g v-for="(label, i) in ['10:00 · failed', '10:02:30', '10:05 · due']" :key="label">
          <ReviewSketch :d="`M ${90 + i * 460} 145 V 165`" class="wire" />
          <text :x="90 + i * 460" y="205" :text-anchor="i === 0 ? 'start' : i === 2 ? 'end' : 'middle'">{{ label }}</text>
        </g>
        <g class="move" :style="{ transform: `translate(${90 + Math.min(phase, 2) * 460}px, 155px)` }">
          <ReviewSketch r="12" class="accent" /><text y="-28" text-anchor="middle" class="small">now</text>
        </g>
        <g class="timeline-stage" :class="{ 'is-current': phase === 0 }">
          <ReviewSketch x="10" y="270" width="190" height="115" class="box danger" />
          <text x="105" y="308" text-anchor="middle" class="danger">Bank call fails</text>
          <text x="105" y="348" text-anchor="middle" class="small">Collection A</text>
        </g>

        <g class="timeline-stage" :class="{ 'is-current': phase === 0 }">
          <ReviewSketch x="290" y="270" width="230" height="115" class="box pending" />
          <text x="405" y="300" text-anchor="middle">disbursements</text>
          <text x="405" y="327" text-anchor="middle">.retry.5m</text>
          <text x="405" y="363" text-anchor="middle" class="small pending">retry-at: 10:05</text>
        </g>

        <g class="timeline-stage" :class="{ 'is-current': phase === 1 || phase === 2 }">
          <ReviewSketch x="610" y="270" width="230" height="115" :class="phase >= 2 ? 'box success' : 'box pending'" />
          <text x="725" y="308" text-anchor="middle">Go retry worker</text>
          <text x="725" y="348" text-anchor="middle" class="small" :class="phase >= 2 ? 'success' : 'pending'">{{ phase >= 2 ? 'Due ✓' : phase === 0 ? 'Not read yet' : 'Sleeping until 10:05' }}</text>
        </g>

        <g class="timeline-stage" :class="{ 'is-current': phase >= 3 }">
          <ReviewSketch x="930" y="270" width="160" height="115" :class="phase >= 3 ? 'box success' : 'box muted'" />
          <text x="1010" y="308" text-anchor="middle">Handler</text>
          <text x="1010" y="348" text-anchor="middle" class="small">{{ phase >= 3 ? 'Retry A ✓' : 'Not invoked' }}</text>
        </g>
        <ReviewSketch
          :x="phase === 0 ? 290 : phase < 3 ? 610 : 930" y="270"
          :width="phase < 3 ? 230 : 160" height="115" outline
          class="timeline-focus" :class="phase >= 2 ? 'success' : 'pending'"
        />

        <g v-for="(edge, index) in [
          { from: 200, to: 290, label: 'publish' },
          { from: 520, to: 610, label: 'read' },
          { from: 840, to: 930, label: 'invoke' },
        ]" :key="edge.label" class="timeline-edge" :class="[
          index === 2 ? (phase >= 3 ? 'success' : 'muted') : 'orange',
          { 'is-current': phase === [0, 1, 3][index] },
        ]">
          <ReviewSketch :d="`M ${edge.from} 327 H ${edge.to}`" :class="index === 2 && phase < 3 ? 'lifeline' : 'wire'" />
          <path v-if="phase === [0, 1, 3][index]" :d="`M ${edge.from} 327 H ${edge.to}`" class="timeline-flow" />
          <ReviewSketch :d="`M ${edge.to - 10} 321 L ${edge.to} 327 l -10 6`" class="wire" />
          <text :x="(edge.from + edge.to) / 2" y="306" text-anchor="middle" class="small">{{ edge.label }}</text>
        </g>
        <text v-if="!talk" x="550" y="399" text-anchor="middle" class="small muted">Time is compressed for illustration; the Go worker enforces the due time.</text>
      </template>

      <template v-else-if="example === 'comparison'">
        <g v-for="(cooperative, panel) in [false, true]" :key="panel" :transform="`translate(${panel * 560}, 0)`">
          <text x="260" y="38" text-anchor="middle">{{ cooperative ? 'Cooperative-sticky' : 'Eager' }}</text>
          <text x="260" y="78" text-anchor="middle" :class="phase === 2 ? (cooperative ? 'pending' : 'danger') : 'muted'">Paused now: {{ phase === 2 ? (cooperative ? 1 : 3) : 0 }} / 3</text>
          <g v-for="owner in 3" :key="owner" :style="{ opacity: owner === 3 && phase === 0 ? .18 : 1 }">
            <ReviewSketch :x="20 + (owner - 1) * 160" y="115" width="150" height="120" outline class="box lavender" />
            <text :x="95 + (owner - 1) * 160" y="145" text-anchor="middle" class="small">Consumer {{ owner }}</text>
          </g>
          <g v-for="(partition, index) in partitions" :key="partition" class="move" :style="{ transform: partitionPosition(index, cooperative) }">
            <ReviewSketch width="60" height="55" :class="phase === 2 && (!cooperative || index === 2) ? 'box danger' : 'box success'" />
            <text x="30" y="35" text-anchor="middle" class="small">{{ partition }}</text>
          </g>
          <text x="260" y="360" text-anchor="middle" class="small">{{ phase === 2 ? 'Revoked partitions wait below their owners' : phase === 3 ? 'Reassigning ownership…' : phase === 4 ? (cooperative ? 'P0 / P1 never paused' : 'P0 / P1 paused despite keeping their owners') : 'Same starting layout and joining event' }}</text>
        </g>
      </template>

      <template v-else-if="example === 'checkpoint'">
        <text x="70" y="40">collections · Partition 0 · durable log</text>
        <g v-for="(offset, i) in [41, 42, 43, 44]" :key="offset">
          <ReviewSketch :x="80 + i * 240" y="80" width="210" height="70" :class="offset === 42 ? 'box pending' : 'box'" />
          <text :x="185 + i * 240" y="122" text-anchor="middle">offset {{ offset }}</text>
        </g>
        <g class="move" :style="{ transform: `translate(${phase >= 3 ? 665 : 425}px, 165px)` }">
          <ReviewSketch d="M -12 15 L 0 0 L 12 15" class="wire accent" />
          <text y="44" text-anchor="middle" class="accent">committed next: {{ phase >= 3 ? 43 : 42 }}</text>
        </g>
        <ReviewSketch x="70" y="270" width="260" height="90" class="box lavender" /><text x="200" y="323" text-anchor="middle">Disbursements</text>
        <ReviewSketch x="770" y="250" width="260" height="130" outline class="box pending" /><text x="900" y="280" text-anchor="middle">retry.5m</text>
        <ReviewSketch d="M 330 315 H 770" class="lifeline" />
        <g class="move" :style="{ transform: `translate(${phase >= 1 ? 800 : 100}px, 300px)` }">
          <ReviewSketch width="200" height="55" class="box pending" /><text x="100" y="35" text-anchor="middle" class="small">evt-a · copy</text>
        </g>
        <g v-if="phase >= 2" class="success"><ReviewSketch d="M 770 245 H 330 L 342 237 M 330 245 L 342 253" class="message draw-on" /><text x="550" y="235" text-anchor="middle">ACK ✓</text></g>
        <text x="550" y="402" text-anchor="middle" class="small muted">Identity: evt-a · original offset: 42 · payment key: collection-a</text>
      </template>

      <template v-else-if="example === 'focus'">
        <g class="camera" :style="{ transform: phase >= 1 && phase <= 3 ? 'translate(-10px, -10px) scale(1.1)' : 'translate(0px, 0px) scale(1)' }">
          <ReviewSketch d="M 190 105 H 890" class="lifeline" />
          <g v-for="(label, i) in ['Collections', 'Kafka', 'Disbursements', 'Bank']" :key="label" :class="{ dim: phase >= 1 && phase <= 3 && i !== 2 }">
            <ReviewSketch :x="20 + i * 250" y="65" width="220" height="85" :queue="i === 1" :class="i === 2 && phase > 0 ? 'box success' : 'box'" />
            <text :x="130 + i * 250" y="115" text-anchor="middle">{{ label }}</text>
          </g>
        </g>
        <g v-if="phase >= 1 && phase <= 3" class="reveal">
          <ReviewSketch x="260" y="225" width="770" height="155" outline class="box lavender" />
          <text x="290" y="259" class="small muted">Inside Disbursements · same boundary, more detail</text>
          <g v-for="(label, i) in ['Decode event', 'Bank · stable key', 'Commit next']" :key="label">
            <ReviewSketch :x="285 + i * 245" y="285" width="220" height="65" :class="phase >= i + 1 ? 'box success' : 'box'" />
            <text :x="395 + i * 245" y="324" text-anchor="middle" class="small">{{ label }}</text>
          </g>
        </g>
        <text v-else x="550" y="300" text-anchor="middle" class="muted">{{ phase === 4 ? 'Return to the architecture without losing the audience’s place.' : 'Next: inspect one service, not a completely new diagram.' }}</text>
      </template>

      <template v-else-if="example === 'backlog'">
        <g v-for="(async, row) in [false, true]" :key="row" :transform="`translate(0, ${row * 185})`">
          <text x="35" y="35">{{ async ? 'Event-driven' : 'Synchronous' }}</text>
          <ReviewSketch x="35" y="65" width="220" height="75" :class="!async && phase >= 1 && phase <= 2 ? 'box danger' : 'box success'" />
          <text x="145" y="109" text-anchor="middle">{{ async ? 'Collections ✓' : phase >= 1 && phase <= 2 ? 'Callers waiting' : 'Callers ✓' }}</text>
          <ReviewSketch x="300" y="65" width="500" height="100" outline class="box orange" />
          <text x="550" y="91" text-anchor="middle" class="small">{{ async ? 'Kafka payout backlog' : 'Waiting requests' }}: {{ waiting }}</text>
          <g v-for="i in 6" :key="i" class="token" :style="{ opacity: i <= waiting ? 1 : .08, transform: `translate(${320 + (i - 1) * 77}px, 111px)` }">
            <ReviewSketch width="60" height="36" :class="async ? 'box pending' : 'box danger'" />
          </g>
          <ReviewSketch x="850" y="65" width="215" height="75" :class="phase >= 1 && phase <= 2 ? 'box danger' : 'box success'" />
          <text x="957" y="109" text-anchor="middle">{{ phase >= 1 && phase <= 2 ? 'Bank down ✕' : 'Bank healthy ✓' }}</text>
        </g>
        <text x="550" y="395" text-anchor="middle" class="small muted">Buffering isolates upstream work; recovery still needs retries, idempotency and capacity.</text>
      </template>

      <template v-else-if="example === 'draw'">
        <ReviewSketch x="80" y="95" width="520" height="240" outline class="box" />
        <text x="340" y="131" text-anchor="middle">Collections DB</text>
        <ReviewSketch x="115" y="165" width="200" height="90" class="box" /><text x="215" y="218" text-anchor="middle">State update</text>
        <ReviewSketch x="360" y="165" width="200" height="90" class="box" /><text x="460" y="218" text-anchor="middle">Outbox insert</text>
        <ReviewSketch x="800" y="165" width="220" height="90" queue class="box orange" /><text x="910" y="218" text-anchor="middle">Kafka</text>
        <ReviewSketch d="M 600 210 H 800" class="wire" />
        <g v-if="phase >= 1" class="success"><ReviewSketch d="M 100 151 Q 330 142 578 153 L 580 277 Q 330 286 101 276 Z" class="annotation draw-on" /><text x="340" y="310" text-anchor="middle" class="small">One DB transaction</text></g>
        <g v-if="phase >= 2" class="success"><text x="340" y="375" text-anchor="middle">Both commit—or neither does.</text><ReviewSketch d="M 145 388 Q 345 399 535 388" class="annotation draw-on" /></g>
        <g v-if="phase >= 3" class="danger"><ReviewSketch d="M 665 150 L 740 270 M 740 150 L 665 270" class="annotation draw-on" /><text x="805" y="75" text-anchor="middle" class="small">ACK ≠ delete commit · duplicate window</text></g>
      </template>

      <template v-else-if="example === 'branch'">
        <ReviewSketch x="250" y="10" width="600" height="65" class="box pending" /><text x="550" y="50" text-anchor="middle">Kafka ACK ✓ · outbox row still pending</text>
        <ReviewSketch d="M 550 75 V 100 H 265 V 130 M 550 100 H 835 V 130" class="wire" />
        <text x="265" y="119" text-anchor="middle" class="small success">Normal path</text><text x="835" y="119" text-anchor="middle" class="small danger">Alternative from the SAME point</text>
        <ReviewSketch x="35" y="135" width="460" height="240" outline class="box success" /><ReviewSketch x="605" y="135" width="460" height="240" outline class="box danger" />
        <g v-if="phase >= 1" class="reveal"><text x="265" y="190" text-anchor="middle" class="success">Delete + DB commit ✓</text><text x="265" y="245" text-anchor="middle">Outbox: empty</text><text x="265" y="300" text-anchor="middle">Kafka: 1 copy · evt-a</text></g>
        <g v-if="phase >= 2" class="reveal"><text x="835" y="185" text-anchor="middle" class="danger">Crash before DB commit ✕</text><text x="835" y="230" text-anchor="middle">Outbox: row still pending</text></g>
        <g v-if="phase >= 3" class="reveal"><text x="835" y="280" text-anchor="middle" class="pending">Restart → republish evt-a</text><text x="835" y="325" text-anchor="middle">Kafka: 2 copies · same event ID</text></g>
        <text v-if="phase >= 4" x="550" y="398" text-anchor="middle" class="success small">Both paths: reuse payment key collection-a → bank pays once.</text>
      </template>

      <template v-else-if="example === 'ordered'">
        <text x="45" y="40" :class="phase >= 4 ? 'success' : 'pending'">A {{ phase >= 4 ? 'released ✓' : 'parked · blocked' }} · waiting: {{ Math.max(0, 3 - Math.max(0, phase - 1)) }}</text>
        <text x="1040" y="40" text-anchor="end" class="small muted">A keeps its blue identity stripe</text>
        <ReviewSketch d="M 130 230 V 110 H 970 V 185" class="lifeline" />
        <text x="550" y="98" text-anchor="middle" class="small muted">Dedicated transit lane · cards do not cross other labels</text>
        <ReviewSketch x="30" y="190" width="720" height="150" outline class="box pending" /><text x="55" y="223" class="small">A · retry queue</text>
        <ReviewSketch x="810" y="160" width="260" height="230" outline class="box success" /><text x="940" y="195" text-anchor="middle">Handled</text>
        <text v-if="phase >= 1" x="940" y="232" text-anchor="middle" class="success small">B ✓ · did not wait for A</text>
        <g v-for="(label, i) in ['created', 'updated', 'completed']" :key="label">
          <g class="routed-card" :style="{ '--travel-x': `${880 - (65 + i * 225)}px`, '--travel-y': `${-6 + i * 45}px`, '--lane-y': `${110 - (252 + i * 45)}px`, transform: phase >= i + 2 ? `translate(${880}px, ${252 + i * 45}px)` : `translate(${65 + i * 225}px, 258px)` }" :class="{ 'is-handled': phase >= i + 2, 'just-handled': phase === i + 2 }">
            <ReviewSketch width="155" height="43" :class="phase >= i + 2 ? 'box success' : 'box'" /><ReviewSketch d="M 5 5 V 38" class="identity" /><text x="80" y="28" text-anchor="middle" class="small">{{ label }}{{ phase >= i + 2 ? ' ✓' : '' }}</text>
          </g>
        </g>
        <text x="390" y="370" text-anchor="middle" class="small muted">Redirect tombstones written: {{ Math.max(0, phase - 1) }} / 3</text>
        <text v-if="phase >= 4" x="550" y="400" text-anchor="middle" class="success small">A: created → updated → completed. B continued independently.</text>
      </template>

      <template v-else-if="example === 'failure-wave'">
        <g v-for="(async, row) in [false, true]" :key="row" :transform="`translate(0, ${row * 190})`">
          <text x="25" y="30" :class="async ? 'success' : 'muted'">{{ async ? 'Event-driven · failure is contained' : 'Synchronous · failure travels upstream' }}</text>
          <ReviewSketch d="M 220 115 H 880" class="lifeline" />
          <g v-for="(label, i) in (async ? ['Collections', 'Kafka', 'Disbursements', 'Bank'] : ['Customer', 'Collections', 'Disbursements', 'Bank'])" :key="label">
            <ReviewSketch :x="25 + i * 285" y="70" width="195" height="90" :queue="async && i === 1" :class="i === 3 && phase >= 1 || !async && i === 2 && phase >= 2 || !async && i === 1 && phase >= 3 ? 'box danger' : (async && i > 0 && i < 3 && phase >= 2) || (!async && i === 0 && phase >= 3) ? 'box pending' : 'box success'" />
            <text :x="122 + i * 285" y="108" text-anchor="middle">{{ label }}</text>
            <text :x="122 + i * 285" y="140" text-anchor="middle" class="small">{{ i === 3 && phase >= 1 ? 'unavailable' : i === 2 && phase >= 2 ? (async ? 'payouts wait' : 'blocked') : i === 1 && phase >= 3 ? (async ? 'work retained' : 'timeouts') : async && i === 0 ? 'keeps charging' : !async && i === 0 && phase >= 3 ? 'waiting' : 'healthy' }}</text>
          </g>
          <ReviewSketch v-if="phase >= 2" d="M 880 115 H 790 L 803 106 M 790 115 L 803 124" class="danger draw-on" />
          <ReviewSketch v-if="phase >= 3 && !async" d="M 595 115 H 505 L 518 106 M 505 115 L 518 124" class="danger draw-on" />
          <ReviewSketch v-if="phase >= 3 && async" d="M 295 60 H 520 V 175 H 295 Z" class="pending draw-on" />
        </g>
        <text v-if="phase >= 3" x="550" y="402" text-anchor="middle" class="success">The bank still matters. Its outage no longer blocks Collections.</text>
      </template>

      <template v-else-if="example === 'replay'">
        <text x="40" y="35" class="orange">collections · Partition 0 · records stay fixed</text>
        <ReviewSketch x="25" y="70" width="1050" height="160" outline class="box orange" />
        <g v-for="(offset, i) in [42, 43, 44, 45]" :key="offset">
          <ReviewSketch :x="65 + i * 260" y="112" width="210" height="80" :class="phase >= 2 && i < phase - 1 ? 'box success' : 'box'" />
          <text :x="170 + i * 260" y="145" text-anchor="middle">offset {{ offset }}</text>
          <text :x="170 + i * 260" y="176" text-anchor="middle" class="small">{{ i === 0 ? 'Collection A' : 'retained record' }}</text>
        </g>
        <g class="move" :style="{ transform: `translate(${phase === 0 ? 950 : 170 + Math.max(0, phase - 1) * 260}px, 245px)` }">
          <ReviewSketch d="M -12 12 L 0 0 L 12 12" class="accent" />
          <text y="43" text-anchor="middle" class="accent">{{ phase === 0 ? 'next: 45' : `replay cursor: ${41 + phase}` }}</text>
        </g>
        <ReviewSketch x="210" y="325" width="680" height="65" class="box success" />
        <text x="550" y="366" text-anchor="middle">Collection A payouts: 1 · same bank key, even on replay</text>
      </template>

      <template v-else-if="example === 'jitter'">
        <g v-for="(jitter, row) in [false, true]" :key="row" :transform="`translate(0, ${row * 190})`">
          <text x="30" y="32" :class="jitter ? 'success' : 'danger'">{{ jitter ? 'Minimum delay + jitter' : 'Identical fixed delay' }}</text>
          <ReviewSketch d="M 90 125 H 1030" class="lifeline" />
          <ReviewSketch d="M 410 65 V 145" class="muted" />
          <text x="410" y="173" text-anchor="middle" class="small muted">minimum delay</text>
          <text x="1000" y="173" text-anchor="end" class="small muted">later →</text>
          <g v-for="i in 6" :key="i" class="move" :class="{ 'jitter-release': jitter && phase >= 3 }" :style="{ '--release-delay': `${(i - 1) * 160}ms`, transform: `translate(${phase === 0 || jitter && phase < 2 ? 70 + i * 42 : jitter ? 430 + (i - 1) * 110 : 410}px, ${jitter && phase >= 2 ? 96 : phase >= 1 && !jitter ? 63 + (i - 1) * 13 : 96}px)` }">
            <ReviewSketch width="34" height="25" :class="phase >= 3 && jitter ? 'box success' : jitter ? 'box pending' : 'box danger'" />
          </g>
          <text v-if="phase >= 1 && !jitter" x="470" y="55" class="small danger">6 due together</text>
          <text v-if="phase >= 2 && jitter" x="710" y="68" text-anchor="middle" class="small success">{{ phase >= 3 ? 'Released in due-time order →' : '6 distinct due times' }}</text>
        </g>
        <text v-if="phase >= 3" x="550" y="402" text-anchor="middle" class="small success">Spread the next burst. Still respect rate limits and bank capacity.</text>
      </template>

      <template v-else-if="example === 'dedup'">
        <g v-for="i in 2" :key="i">
          <ReviewSketch x="30" :y="65 + (i - 1) * 190" width="250" height="100" class="box pending" />
          <text x="155" :y="105 + (i - 1) * 190" text-anchor="middle">Attempt {{ i }} · evt-a</text>
          <text x="155" :y="140 + (i - 1) * 190" text-anchor="middle" class="small">key: collection-a</text>
          <ReviewSketch v-if="phase >= 1" :d="`M 280 ${115 + (i - 1) * 190} H 370 V 210 H 450`" class="pending draw-on" />
        </g>
        <ReviewSketch x="450" y="100" width="260" height="220" class="box lavender" />
        <text x="580" y="145" text-anchor="middle">Bank's atomic key gate</text>
        <text x="580" y="193" text-anchor="middle" :class="phase >= 2 ? 'success' : 'muted'">{{ phase >= 2 ? 'collection-a · reserved' : 'not reserved yet' }}</text>
        <text x="580" y="245" text-anchor="middle" class="small">{{ phase >= 3 ? 'payment-7 · paid ✓' : phase >= 2 ? 'duplicate waits / looks up' : 'one logical operation' }}</text>
        <ReviewSketch v-if="phase >= 3" d="M 710 210 H 830 L 818 202 M 830 210 L 818 218" class="success draw-on" />
        <ReviewSketch x="830" y="155" width="240" height="110" :class="phase >= 3 ? 'box success' : 'box'" />
        <text x="950" y="200" text-anchor="middle">Actual payments</text>
        <text x="950" y="245" text-anchor="middle" class="big success">{{ phase >= 3 ? 1 : 0 }}</text>
        <text v-if="phase >= 3" x="550" y="385" text-anchor="middle" class="success">Two deliveries ≠ two side effects.</text>
      </template>

      <template v-else-if="example === 'circuit'">
        <ReviewSketch x="30" y="130" width="240" height="110" class="box lavender" />
        <text x="150" y="172" text-anchor="middle">Disbursements</text><text x="150" y="210" text-anchor="middle" class="small">{{ phase === 1 || phase === 2 ? 'durable deferral' : phase === 3 ? 'one limited probe' : 'normal traffic' }}</text>
        <ReviewSketch x="830" y="130" width="240" height="110" :class="phase === 1 || phase === 2 ? 'box danger' : 'box success'" />
        <text x="950" y="195" text-anchor="middle">Bank</text>
        <ReviewSketch d="M 270 185 H 470 M 640 185 H 830" class="wire" />
        <g class="breaker-arm" :style="{ transform: `rotate(${phase === 1 || phase === 2 ? -30 : phase === 3 ? -14 : 0}deg)` }">
          <ReviewSketch d="M 470 185 L 640 185" :class="phase === 1 || phase === 2 ? 'danger' : phase === 3 ? 'pending' : 'success'" />
        </g>
        <ReviewSketch r="8" cx="470" cy="185" class="accent" /><ReviewSketch r="8" cx="640" cy="185" class="accent" />
        <text x="550" y="55" text-anchor="middle" :class="phase === 1 || phase === 2 ? 'danger' : phase === 3 ? 'pending' : 'success'">{{ phase === 1 || phase === 2 ? 'OPEN · calls blocked' : phase === 3 ? 'HALF-OPEN · probe only' : 'CLOSED · calls allowed' }}</text>
        <g v-if="phase >= 1 && phase <= 3" class="reveal">
          <ReviewSketch x="340" y="295" width="420" height="85" class="box pending" />
          <text x="550" y="332" text-anchor="middle">{{ phase === 3 ? 'Other payouts remain deferred' : 'Work stays in retry storage' }}</text>
          <text x="550" y="363" text-anchor="middle" class="small">{{ phase === 2 ? 'Cooldown · do not hammer the bank' : 'Not dropped; released later by policy' }}</text>
        </g>
        <ReviewSketch v-if="phase === 3" d="M 295 105 H 795 L 782 97 M 795 105 L 782 113" class="pending draw-on" />
        <text v-if="phase === 4" x="550" y="345" text-anchor="middle" class="success">Probe succeeded → close → recover at a controlled rate.</text>
      </template>

      <template v-else-if="example === 'retention'">
        <text x="30" y="35" class="orange">1h retention · now {{ phase >= 1 ? '10:15' : '09:50' }}</text>
        <text x="1070" y="35" text-anchor="end" class="small muted">Time retention deletes eligible closed segments.</text>
        <g :class="{ 'expired-segment': phase >= 2 }">
          <ReviewSketch x="30" y="80" width="510" height="180" outline :class="phase >= 1 ? 'box danger' : 'box'" />
          <text x="285" y="115" text-anchor="middle">000.log · closed · last record 09:10</text>
          <g v-for="(offset, i) in [40, 41, 42]" :key="offset">
            <ReviewSketch :x="55 + i * 160" y="150" width="140" height="75" :class="offset === 42 ? 'box pending' : 'box'" />
            <text :x="125 + i * 160" y="195" text-anchor="middle">offset {{ offset }}</text>
          </g>
        </g>
        <ReviewSketch x="580" y="80" width="490" height="180" outline class="box orange" />
        <text x="825" y="115" text-anchor="middle">001.log · active · retained</text>
        <g v-for="(offset, i) in [43, 44, 45]" :key="offset">
          <ReviewSketch :x="600 + i * 155" y="150" width="140" height="75" class="box" />
          <text :x="670 + i * 155" y="195" text-anchor="middle">offset {{ offset }}</text>
        </g>
        <ReviewSketch v-if="phase >= 2" d="M 50 90 L 525 250 M 525 90 L 50 250" class="danger draw-on" />
        <g transform="translate(445, 280)">
          <ReviewSketch d="M -12 12 L 0 0 L 12 12" :class="phase >= 2 ? 'danger' : 'pending'" />
          <text y="45" text-anchor="middle" :class="phase >= 2 ? 'danger' : 'pending'">committed next: 42</text>
        </g>
        <text v-if="phase === 1" x="550" y="385" text-anchor="middle" class="danger">Cutoff 09:15: the closed segment is eligible—not necessarily deleted immediately.</text>
        <text v-if="phase >= 2" x="550" y="385" text-anchor="middle" class="danger">{{ phase === 2 ? 'Record 42 is gone even though it was unread.' : 'Requested 42; earliest retained is 43. Offset out of range.' }}</text>
      </template>
    </svg>
    <footer v-if="!talk" aria-live="polite"><span>{{ phase }} / {{ spec.beats.length - 1 }}</span>{{ spec.beats[phase] }}</footer>
  </section>
</template>

<style scoped>
.animation-suggestion { width: 1100px; text-align: left; color: #cdd6f4; }
.animation-suggestion header { height: 140px; }
.animation-suggestion .review-tag { font: 14px 'Poppins', sans-serif; letter-spacing: .14em; color: #f9e2af; }
.animation-suggestion h2 { font-size: 36px; margin: 10px 0 6px; }
.animation-suggestion header p { font-size: 19px; margin: 0; color: #a6adc8; }
.animation-suggestion svg { display: block; width: 1100px; height: 410px; overflow: hidden; font: 25px 'Patrick Hand', 'Poppins', sans-serif; }
.animation-suggestion text { fill: currentColor; }
.box { color: #89b4fa; }
.wire, .message, .annotation { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.lifeline { color: #7f849c; stroke-dasharray: 7 7; }
.accent { color: #89b4fa; }
.success { color: #a6e3a1; }
.pending { color: #f9e2af; }
.danger { color: #f38ba8; }
.box.success { color: #a6e3a1; }
.box.pending { color: #f9e2af; }
.box.danger { color: #f38ba8; }
.lavender { color: #b4befe; }
.orange { color: #fab387; }
.muted { color: #a6adc8; }
.small { font-size: 21px; }
.big { font-size: 44px; }
.expired-segment { opacity: .16; transition: opacity 600ms ease; }
.jitter-release { opacity: .22; animation: suggestion-release 300ms ease var(--release-delay) both; }
@keyframes suggestion-release { from { opacity: 1; } to { opacity: .22; } }
.timeline-stage, .timeline-edge { opacity: .4; transition: opacity 250ms ease; }
.timeline-stage.is-current, .timeline-edge.is-current { opacity: 1; }
.timeline-focus { animation: timeline-pulse 1.5s ease-in-out infinite; }
.timeline-flow { fill: none; stroke: currentColor; stroke-width: 4; stroke-dasharray: 10 8; animation: timeline-flow 650ms linear infinite; }
@keyframes timeline-flow { to { stroke-dashoffset: -18; } }
@keyframes timeline-pulse { 50% { opacity: .4; } }
.move, .camera { transition: transform 650ms cubic-bezier(.2,.7,.2,1); }
.camera { transition-duration: 750ms; }
.breaker-arm { transform-origin: 470px 185px; transition: transform 650ms cubic-bezier(.2,.7,.2,1); }
.dim { opacity: .25; transition: opacity 250ms ease; }
.token { transition: opacity 500ms ease; }
.reveal { animation: suggestion-reveal 220ms ease-out both; }
.draw-on { stroke-dasharray: 1500; stroke-dashoffset: 0; animation: suggestion-draw 700ms ease-out both; }
.annotation { stroke-width: 4; }
.identity { color: #89b4fa; }
.is-handled { color: #a6e3a1; }
.routed-card { transition: transform 850ms ease-in-out; }
/* The completed card is drawn in place; an additive offset routes it through the empty lane. */
.just-handled { transition: none; animation: suggestion-route 850ms ease-in-out both; }
@keyframes suggestion-route { from { translate: calc(-1 * var(--travel-x)) calc(-1 * var(--travel-y)); } 40% { translate: calc(-1 * var(--travel-x)) var(--lane-y); } 75% { translate: 0 var(--lane-y); } to { translate: 0 0; } }
@keyframes suggestion-draw { from { stroke-dashoffset: 1500; } to { stroke-dashoffset: 0; } }
@keyframes suggestion-reveal { from { opacity: 0; } to { opacity: 1; } }
.animation-suggestion footer { display: flex; align-items: baseline; gap: 18px; min-height: 62px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #45475a; font-size: 21px; line-height: 1.35; }
.animation-suggestion footer span { flex-shrink: 0; color: #89b4fa; font-size: 17px; }
@media (prefers-reduced-motion: reduce) {
  .animation-suggestion *, .animation-suggestion *::before, .animation-suggestion *::after { animation: none !important; transition: none !important; }
}
</style>
