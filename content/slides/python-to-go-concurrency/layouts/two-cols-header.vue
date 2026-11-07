<script setup lang="ts">
import TalkFrame from './TalkFrame.vue'
</script>

<template>
  <TalkFrame variant="two-cols-header">
    <div class="talk-column-heading"><slot /></div>
    <div class="talk-split">
      <div class="talk-column"><slot name="left" /></div>
      <div class="talk-column talk-column-right"><slot name="right" /></div>
    </div>
    <slot name="bottom" />
  </TalkFrame>
</template>
