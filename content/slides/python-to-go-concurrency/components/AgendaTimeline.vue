<script setup lang="ts">
const chapters = [
  { number: '01', title: 'the service we have', detail: 'Python works. The caller waits.', proof: 'Observe one occupied slot.' },
  { number: '02', title: 'the service we rewrite', detail: 'Same contract. Explicit ownership.', proof: 'Overlap work without sharing the report.' },
  { number: '03', title: 'the service we can trust', detail: 'Bound it. Cancel it. Join it.', proof: 'Show the evidence, not a speed claim.' },
]
</script>

<template>
  <section class="timeline-agenda" aria-label="Three chapters about one HTTP service">
    <p class="eyebrow">Expanded working talk · one service · room for questions</p>
    <h2>A rewrite, not a syntax tour.</h2>
    <svg class="track" viewBox="0 0 1080 52" role="img" aria-label="Observe, rewrite, verify">
      <path d="M18 26 H1062" />
      <g v-for="(chapter, i) in chapters" :key="chapter.number">
        <circle :cx="18 + i * 360" cy="26" r="8" />
      </g>
      <path d="M1050 17 L1062 26 L1050 35" />
    </svg>
    <div class="chapters">
      <article v-for="chapter in chapters" :key="chapter.number">
        <p class="number">{{ chapter.number }}</p>
        <h3>{{ chapter.title }}</h3>
        <p class="detail">{{ chapter.detail }}</p>
        <p class="proof">{{ chapter.proof }}</p>
      </article>
    </div>
    <p class="tail">Concrete problem → small code → visible evidence → fix → takeaway</p>
  </section>
</template>

<style scoped>
.timeline-agenda { width: 100%; color: var(--talk-ink, #24211d); }
.eyebrow { color: var(--talk-muted, #625e56); font-size: 17px; letter-spacing: .1em; text-transform: uppercase; margin: 0 0 18px; }
h2 { font-size: 54px; line-height: 1.12; letter-spacing: -.03em; margin: 0; }
.track { display: block; width: 100%; height: 52px; margin: 26px 0 12px; }
.track path { fill: none; stroke: var(--talk-ink, #24211d); stroke-width: 2.5; stroke-linecap: round; }
.track circle { fill: var(--talk-paper, #faf8f3); stroke: var(--talk-accent, #a9432e); stroke-width: 3; }
.chapters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 38px; }
.number { color: var(--talk-accent, #a9432e); font-size: 23px; font-family: monospace; margin: 0 0 10px; }
h3 { font-size: 30px; font-weight: 600; line-height: 1.2; margin: 0; }
.detail { font-size: 22px; line-height: 1.35; margin: 18px 0 0; }
.proof { color: var(--talk-muted, #625e56); font-size: 19px; line-height: 1.4; margin: 10px 0 0; }
.tail { color: var(--talk-muted, #625e56); font-size: 19px; margin: 32px 0 0; }
</style>
