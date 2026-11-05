<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { slides } from '#slidev/slides'

defineProps<{ variant?: string }>()

const { $page, $frontmatter } = useSlideContext()
// Use this rendered slide's page, not the live navigation page: exports and
// presenter previews render several different slides at once.
const section = computed(() => slides.value
  .filter(slide => slide.no <= $page.value && slide.meta.slide?.frontmatter.layout === 'section')
  .at(-1)?.meta.slide)
const sectionLabel = computed(() => String(
  $frontmatter.section ?? section.value?.frontmatter.label ?? section.value?.title ?? '',
))
const label = computed(() => $frontmatter.label ?? sectionLabel.value)
const progress = computed(() => `${100 * $page.value / Math.max(1, slides.value.length)}%`)
</script>

<template>
  <div class="slidev-layout talk-layout" :class="variant">
    <header v-if="label" class="talk-kicker">{{ label }}</header>
    <main class="talk-body"><slot /></main>
    <footer class="talk-footer">
      <span class="talk-footer-section" :title="sectionLabel">{{ sectionLabel || 'Python → Go · Haseeb Majid' }}</span>
      <span class="talk-progress" aria-hidden="true"><span :style="{ width: progress }" /></span>
      <span class="talk-page">{{ String($page).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}</span>
    </footer>
  </div>
</template>
