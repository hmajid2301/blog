<script setup lang="ts">
import { computed } from 'vue'
import ReviewSketch from './ReviewSketch.vue'

type Example = 'partition-order' | 'quarantine' | 'deadline'
const props = defineProps<{ example: Example; step: number }>()
const stories = {
  'partition-order': {
    number: 26,
    titles: ['Two partitions.', 'B moves first.', 'B finishes first.', 'A keeps its order.'],
    descriptions: [
      'Two independent partition logs. A starts at offset 42; B starts at 7. Records stay in place.',
      'A sequential reader handles B created at offset 7. Its next position becomes 8; A has not progressed.',
      'B updated at offset 8 completes next. B reaches next 9 while A still waits at 42. There is no cross-partition ordering guarantee.',
      'A created at offset 42 completes; next becomes 43. A updated is still waiting. Each partition retains its own record order.',
    ],
  },
  quarantine: {
    number: 27,
    titles: ['Saved. Not solved.', 'Find the cause.', 'Fix the cause.', 'Replay a copy.'],
    descriptions: [
      'An acknowledged DLQ copy preserves evt-a. The payout is unresolved; quarantine is not business success.',
      'Investigation reveals a handler bug. Preserve the original payload and diagnostic evidence.',
      'Deploy a handler fix. No record is edited or deleted, and the customer has not yet been paid.',
      'Publish a replay copy using the same logical bank payment key. Keep the DLQ evidence retained. Publication ACK is shown; payment success is not claimed.',
    ],
  },
  deadline: {
    number: 28,
    titles: ['Thirty seconds.', 'Stop taking work.', 'Finish what can finish.', 'Never fake progress.'],
    descriptions: [
      'Two alternative workers each have record 42 in flight when termination starts. Both have a 30-second grace period.',
      'At five seconds, both have stopped polling new work. Their current handlers are still running.',
      'At twenty seconds, worker A completes its current work. Worker B remains unfinished.',
      'Before the deadline A commits next 43 and closes. B cannot safely advance its checkpoint: next stays 42 when its process ends. Replay must reuse the stable bank key because the remote effect may be uncertain.',
    ],
  },
}
const story = computed(() => stories[props.example])
const phase = computed(() => Math.max(0, Math.min(3, props.step)))
const clock = computed(() => [0, 5, 20, 30][phase.value])
</script>

<template>
  <section class="sparse-story" :data-example="example" :data-step="phase">
    <header><span class="tag">REVIEW · {{ story.number }}</span><h2>{{ story.titles[phase] }}</h2></header>
    <svg viewBox="0 0 1100 450" role="img" :aria-label="story.descriptions[phase]">
      <template v-if="example === 'partition-order'">
        <g v-for="(key, row) in ['A', 'B']" :key="key" :transform="`translate(0, ${row * 225})`">
          <text x="40" y="55" :class="row ? 'pending' : 'accent'">P{{ row }} · key {{ key }}</text>
          <ReviewSketch x="215" y="15" width="850" height="145" outline :class="row ? 'pending' : 'accent'" />
          <g v-for="(event, i) in ['created', 'updated']" :key="event">
            <ReviewSketch :x="245 + i * 270" y="45" width="220" height="85" :class="(row === 0 ? phase >= 3 && i === 0 : phase >= i + 1) ? 'success' : row ? 'pending' : 'accent'" />
            <text :x="355 + i * 270" y="80" text-anchor="middle">{{ (row ? 7 : 42) + i }}</text>
            <text :x="355 + i * 270" y="112" text-anchor="middle">{{ event }}{{ (row === 0 ? phase >= 3 && i === 0 : phase >= i + 1) ? ' ✓' : '' }}</text>
          </g>
          <g class="move" :style="{ transform: `translate(${355 + (row ? Math.min(phase, 2) : phase >= 3 ? 1 : 0) * 270}px, 173px)` }">
            <ReviewSketch d="M -12 12 L 0 0 L 12 12" :class="row ? 'pending' : 'accent'" />
            <text y="42" text-anchor="middle" :class="row ? 'pending' : 'accent'">next {{ (row ? 7 + Math.min(phase, 2) : phase >= 3 ? 43 : 42) }}</text>
          </g>
        </g>
      </template>

      <template v-else-if="example === 'quarantine'">
        <ReviewSketch x="90" y="30" width="420" height="340" outline class="danger" />
        <ReviewSketch x="225" y="13" width="150" height="40" class="danger" /><text x="300" y="41" text-anchor="middle">DLQ</text>
        <text x="300" y="110" text-anchor="middle" class="large">evt-a</text>
        <text x="300" y="151" text-anchor="middle">collection-a</text>
        <text x="300" y="334" text-anchor="middle" class="muted">retained</text>
        <g v-if="phase >= 1" class="reveal">
          <ReviewSketch x="135" y="185" width="330" height="65" class="danger" /><text x="300" y="226" text-anchor="middle">handler bug</text>
        </g>
        <g v-if="phase >= 2" class="reveal">
          <ReviewSketch d="M 575 112 L 608 145 L 668 72" class="success" /><text x="805" y="126" text-anchor="middle" class="success large">fix deployed</text>
        </g>
        <g v-if="phase >= 3" class="reveal">
          <ReviewSketch d="M 510 275 H 690 L 676 264 M 690 275 L 676 286" class="pending" />
          <ReviewSketch x="700" y="220" width="300" height="125" queue class="pending" /><text x="850" y="266" text-anchor="middle">retry · evt-a</text><text x="850" y="305" text-anchor="middle" class="success">ACK ✓</text>
        </g>
        <text x="550" y="426" text-anchor="middle" :class="phase >= 3 ? 'pending' : 'danger'">{{ phase >= 3 ? 'unresolved: 1 · bank key: collection-a' : 'unresolved: 1' }}</text>
      </template>

      <template v-else-if="example === 'deadline'">
        <text x="275" y="37" class="muted">0s</text><text x="995" y="37" text-anchor="middle" class="danger">30s</text>
        <ReviewSketch d="M 275 62 H 995 M 995 55 V 355" class="danger" />
        <g class="move" :style="{ transform: `translate(${275 + clock * 24}px, 65px)` }"><ReviewSketch r="8" class="pending" /><text v-if="phase === 1 || phase === 2" y="40" text-anchor="middle" class="pending">{{ clock }}s</text></g>
        <g v-for="(worker, row) in ['Worker A', 'Worker B']" :key="worker" :transform="`translate(0, ${row * 170})`">
          <text x="45" y="159">{{ worker }}</text>
          <ReviewSketch x="275" y="120" :width="row === 0 && phase >= 2 ? 480 : phase === 3 ? 720 : phase === 2 ? 480 : phase === 1 ? 120 : 55" height="65" :class="row === 0 && phase >= 2 ? 'success' : row === 1 && phase === 3 ? 'danger' : 'pending'" />
          <text :x="phase < 2 ? (phase === 0 ? 302 : 335) : row === 0 ? 515 : 650" y="161" text-anchor="middle">{{ phase < 2 ? '42' : row === 0 ? 'done ✓' : 'unfinished' }}</text>
          <text v-if="phase === 3" x="890" :y="row ? 221 : 162" text-anchor="middle" :class="row ? 'pending' : 'success'">next {{ row ? 42 : 43 }}</text>
        </g>
        <text v-if="phase === 3" x="550" y="437" text-anchor="middle" class="pending">same bank key: collection-a</text>
      </template>
    </svg>
    <div class="beats" role="progressbar" aria-label="Story beat" :aria-valuenow="phase" :aria-valuemin="0" :aria-valuemax="3">
      <span v-for="i in 4" :key="i" :class="{ current: phase === i - 1, prior: phase > i - 1 }" />
    </div>
  </section>
</template>

<style scoped>
.sparse-story { width: 1100px; text-align: left; color: #cdd6f4; }
header { height: 125px; }
.tag { font: 14px 'Poppins', sans-serif; letter-spacing: .14em; color: #f9e2af; }
.sparse-story h2 { font-size: 48px; margin: 14px 0 0; }
svg { display: block; width: 1100px; height: 450px; overflow: hidden; font: 28px 'Patrick Hand', 'Poppins', sans-serif; }
text { fill: currentColor; }
.large { font-size: 42px; }
.accent { color: #89b4fa; }
.success { color: #a6e3a1; }
.pending { color: #f9e2af; }
.danger { color: #f38ba8; }
.muted { color: #a6adc8; }
.move { transition: transform 750ms cubic-bezier(.2,.7,.2,1); }
.reveal { animation: sparse-reveal 250ms ease-out both; }
@keyframes sparse-reveal { from { opacity: 0; } to { opacity: 1; } }
.beats { display: flex; gap: 12px; margin-top: 30px; }
.beats span { width: 8px; height: 8px; border: 1px solid #7f849c; border-radius: 50%; }
.beats .current { background: #89b4fa; border-color: #89b4fa; }
.beats .prior { background: #45475a; }
@media (prefers-reduced-motion: reduce) { .sparse-story * { animation: none !important; transition: none !important; } }
</style>
