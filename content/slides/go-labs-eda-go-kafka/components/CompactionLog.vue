<script setup lang="ts">
import { computed } from 'vue'
import ReviewSketch from './ReviewSketch.vue'

const props = defineProps<{ step: number }>()
const phase = computed(() => Math.max(0, Math.min(3, props.step)))
const records = [
  { event: 'created', key: 'collection-a:evt-1', value: 'pending' },
  { event: 'updated', key: 'collection-a:evt-2', value: 'pending' },
  { event: 'completed', key: 'collection-a:evt-3', value: 'pending' },
  { event: 'created', key: 'collection-a:evt-1', value: 'null' },
]
const captions = [
  'Collection A · three pending events.',
  'Created succeeds → append null.',
  'Old created entry removed; null stays. Offsets stay.',
  'Created’s null expires. Updated and completed stay pending.',
]
function visible(index: number) {
  return index === 1 || index === 2 || (index === 0 && phase.value < 2) || (index === 3 && phase.value >= 1 && phase.value < 3)
}
function opacity(index: number) {
  if (!visible(index)) return 0
  if (phase.value === 1 && index !== 0 && index !== 3) return .3
  return 1
}
</script>

<template>
  <section class="compaction-log" data-compaction="cleanup" :data-phase="phase">
    <svg viewBox="0 0 1100 470" role="img" :aria-label="captions[phase]">
      <text x="550" y="75" text-anchor="middle" class="small">Collection A</text>
      <g v-if="phase === 1" class="annotation blue">
        <ReviewSketch d="M 115 165 V 120 H 760 V 165 M 750 155 L 760 165 L 770 155" />
        <text x="437" y="150" text-anchor="middle" class="small">same key</text>
      </g>
      <g v-for="(record, index) in records" :key="index" :transform="`translate(${20 + index * 215}, 170)`">
        <g
          class="record" :data-record="index" :aria-hidden="!visible(index)"
          :style="{ opacity: opacity(index), color: record.value === 'null' ? '#f38ba8' : '#89b4fa', transform: visible(index) ? 'translateY(0)' : 'translateY(-20px)' }"
        >
          <ReviewSketch width="190" height="115" />
          <text x="95" y="25" text-anchor="middle">{{ record.event }}</text>
          <text x="95" y="50" text-anchor="middle" class="record-key">
            <tspan>collection-a:</tspan>
            <tspan x="95" dy="26" class="event-id">{{ record.key.split(':')[1] }}</tspan>
          </text>
          <text v-if="record.value === 'null'" x="95" y="106" text-anchor="middle" class="small">null</text>
        </g>
        <g v-if="visible(index) && phase >= 2" class="keep annotation">
          <ReviewSketch d="M 78 134 L 89 146 L 112 122" />
        </g>
      </g>
      <g class="offsets">
        <text x="20" y="395" class="small">offset</text>
        <g v-for="index in (phase === 0 ? 3 : 4)" :key="index">
          <ReviewSketch :d="`M ${115 + (index - 1) * 215} 335 V 345`" />
          <text :x="115 + (index - 1) * 215" y="380" text-anchor="middle" class="small">{{ index - 1 }}</text>
        </g>
      </g>
    </svg>
  </section>
</template>

<style scoped>
.compaction-log { width: 1100px; color: #cdd6f4; }
svg { display: block; width: 1100px; height: 470px; overflow: hidden; font: 32px 'Patrick Hand', 'Poppins', sans-serif; }
text { fill: currentColor; }
.small { font-size: 28px; }
.record-key { font: 18px 'MonoLisa', monospace; }
.event-id { font-size: 26px; font-weight: 700; }
.record { transition: opacity 650ms ease, transform 650ms ease; }
.blue { color: #89b4fa; }
.keep { color: #a6e3a1; }
.offsets { color: #7f849c; }
.offsets > text { font-size: 22px; }
.annotation { animation: reveal 300ms ease-out both; }
@keyframes reveal { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .record, .annotation { transition: none; animation: none; } }
</style>
