<script setup>
// Chapter footer: the five agenda stops, shown on content slides only.
// Ranges are 1-based slide numbers; keep in sync with the agenda slide.
const chapters = [
  'Mental model',
  'Channels & ownership',
  'A safe worker pool',
  'Under load',
  'Pitfalls & recap',
]
const ranges = [
  [3, 9],
  [10, 14],
  [15, 21],
  [22, 23],
  [24, 25],
]
function chapterIndexAt(page) {
  const i = ranges.findIndex(([a, b]) => page >= a && page <= b)
  return i === -1 ? null : i + 1
}
</script>

<template>
  <div class="slidev-layout default">
    <slot />
    <footer v-if="chapterIndexAt($slidev.nav.currentPage)" class="chapter-footer">
      <span
        v-for="n in 5"
        :key="n"
        class="dot"
        :class="{ on: n <= chapterIndexAt($slidev.nav.currentPage) }"
      />
      <span class="chapter-label">
        {{ String(chapterIndexAt($slidev.nav.currentPage)).padStart(2, '0') }}
        · {{ chapters[chapterIndexAt($slidev.nav.currentPage) - 1] }}
      </span>
    </footer>
  </div>
</template>