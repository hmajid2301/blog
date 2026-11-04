<script setup lang="ts">
// The talk's agenda as a timed route: real minute boundaries from the
// speaker-note windows, five stops with their own accent colors.
const stops = [
  { num: '01', title: 'Mental model', detail: 'goroutines, channels, the GIL', at: '09:00', color: '#94e2d5' },
  { num: '02', title: 'Channels & ownership', detail: 'the checker takes shape', at: '15:30', color: '#89b4fa' },
  { num: '03', title: 'A safe worker pool', detail: 'context, cancellation, live demo', at: '24:30', color: '#b4befe' },
  { num: '04', title: 'Under load', detail: 'backpressure, locks, shared state', at: '26:30', color: '#fab387' },
  { num: '05', title: 'Pitfalls & recap', detail: 'a take-home checklist', at: '28:30', color: '#a6e3a1' },
]
// Track spans 00:00–28:30 (28.5 min) mapped onto a 1080px viewBox.
const scale = 1080 / 28.5
const at = (min: number) => min * scale
const ticks = [
  { label: '00:00', x: at(0), anchor: 'start' },
  { label: '09:00', x: at(9), anchor: 'middle' },
  { label: '15:30', x: at(15.5), anchor: 'middle' },
  { label: '24:30', x: at(24.5), anchor: 'middle' },
  { label: '26:30', x: at(26.5), anchor: 'middle' },
  { label: '28:30', x: at(28.5), anchor: 'end' },
]
</script>

<template>
  <section class="timeline-agenda" aria-label="Talk roadmap">
    <div class="eyebrow">Today · 28½ minutes · one URL checker</div>
    <h2>Five stops. One story.</h2>
    <svg class="track" viewBox="0 0 1080 60" aria-hidden="true">
      <path d="M 0 40 H 1080" class="track-line" />
      <g v-for="tick in ticks" :key="tick.label">
        <path :d="`M ${tick.x} 32 V 48`" class="tick" />
        <text :x="tick.x" y="18" :text-anchor="tick.anchor" class="tick-label">{{ tick.label }}</text>
      </g>
    </svg>
    <div class="stops">
      <div v-for="stop in stops" :key="stop.num" class="stop" :style="{ '--accent': stop.color }">
        <span class="stop-num">{{ stop.num }}</span>
        <h3>{{ stop.title }}</h3>
        <p>{{ stop.detail }}</p>
      </div>
    </div>
    <p class="tail">then 90 seconds of questions · six appendices to browse later</p>
  </section>
</template>

<style scoped>
.timeline-agenda { width: 1100px; text-align: left; color: #cdd6f4; }
.eyebrow { color: #a6adc8; font-size: 17px; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 14px; }
h2 { font-size: 58px; letter-spacing: -0.035em; margin: 0; line-height: 1.12; }
.track { width: 1100px; height: 62px; margin: 26px 0 8px; overflow: visible; }
.track-line { stroke: #313244; stroke-width: 3; fill: none; }
.tick { stroke: #585b70; stroke-width: 2; }
.tick-label { fill: #a6adc8; font-family: 'MonoLisa', 'Noto Sans Mono', 'Liberation Mono', monospace; font-size: 15px; }
.stops { display: grid; grid-template-columns: repeat(5, 1fr); gap: 28px; margin-top: 22px; }
.stop { position: relative; padding-top: 18px; }
.stop::before { content: ''; position: absolute; top: 0; left: 0; width: 34px; height: 3px; background: var(--accent); opacity: 0.7; }
.stop-num { color: var(--accent); font-family: 'MonoLisa', 'Noto Sans Mono', 'Liberation Mono', monospace; font-size: 22px; }
.stop h3 { font-size: 25px; font-weight: 400; margin: 8px 0 0; line-height: 1.25; }
.stop p { color: #a6adc8; font-size: 17px; line-height: 1.45; margin: 10px 0 0; }
.tail { color: #7f849c; font-size: 18px; margin: 30px 0 0; }
</style>