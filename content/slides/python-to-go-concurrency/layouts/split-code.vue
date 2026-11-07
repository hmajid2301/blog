<script setup lang="ts">
import TalkFrame from './TalkFrame.vue'
</script>

<template>
  <TalkFrame variant="split-code">
    <div class="talk-split">
      <div class="talk-column"><slot /></div>
      <div class="talk-column talk-column-right"><slot name="right" /></div>
    </div>
  </TalkFrame>
</template>
