<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import TalkFrame from './TalkFrame.vue'

const { $frontmatter } = useSlideContext()
// `title` is reserved by Slidev and is not passed as a layout prop.
// `command` supports slides that keep a descriptive title for the outline.
const command = computed(() => $frontmatter.command || $frontmatter.title || 'Local evidence')
</script>

<template>
  <TalkFrame variant="terminal">
    <div class="talk-terminal-command"><span aria-hidden="true">$</span> {{ command }}</div>
    <slot />
  </TalkFrame>
</template>
