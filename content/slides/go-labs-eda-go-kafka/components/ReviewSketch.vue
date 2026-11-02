<script setup lang="ts">
import { computed } from 'vue'
import rough from 'roughjs'

// Same pencil weight, seeded outlines and hatching as the main talk's roughDrawing.
const props = defineProps<{
  x?: number | string; y?: number | string; width?: number | string; height?: number | string
  d?: string; r?: number | string; cx?: number | string; cy?: number | string; outline?: boolean; queue?: boolean
}>()
const generator = rough.generator()
const drawing = computed(() => {
  const w = Number(props.width ?? 0)
  const h = Number(props.height ?? 0)
  const identity = props.d ?? `${w}:${h}:${props.r ?? ''}`
  const seed = [...identity].reduce((value, char) => (value * 31 + char.charCodeAt(0)) & 0x7fffffff, 1) || 1
  const options = {
    seed, roughness: 1.3, strokeWidth: 2.5, stroke: 'currentColor',
    fill: props.d || props.outline ? undefined : 'currentColor',
    fillStyle: 'hachure', hachureGap: 13, fillWeight: 2,
  }
  const shape = props.d ? generator.path(props.d, options)
    : props.r ? generator.circle(Number(props.cx ?? 0), Number(props.cy ?? 0), Number(props.r) * 2, options)
      : props.queue ? generator.path('M 24 3 L 166 4 C 194 5 195 126 166 127 L 24 126 C -4 125 -3 3 24 3 Z', options)
        : generator.rectangle(0, 0, w, h, options)
  const detail = props.queue ? generator.toPaths(generator.path(
    'M 53 103 L 72 104 L 72 117 L 52 116 Z M 86 104 L 105 103 L 106 117 L 86 117 Z M 119 103 L 139 104 L 138 118 L 119 117 Z',
    { ...options, fill: undefined },
  )) : []
  return [...generator.toPaths(shape), ...detail]
})
</script>

<template>
  <g :transform="`translate(${x ?? 0}, ${y ?? 0})`" data-review-sketch>
    <rect v-if="!d && !r && !outline" :width="width" :height="height" fill="#11111b" stroke="none" />
    <g :transform="queue ? `scale(${Number(width) / 190}, ${Number(height) / 130})` : undefined">
      <!-- Inline opacity avoids UnoCSS interpreting the SVG opacity="1" attribute as 1%. -->
      <path
        v-for="(path, index) in drawing" :key="index"
        :d="path.d" :stroke="path.stroke" :stroke-width="path.strokeWidth" :fill="path.fill"
        :style="{ opacity: !d && !outline && drawing.length > 1 && index === 0 ? .22 : 1 }"
      />
    </g>
  </g>
</template>
