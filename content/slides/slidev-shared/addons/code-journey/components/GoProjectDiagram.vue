<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, unref, useId } from 'vue'

const props = defineProps<{ scene: 'packages' | 'run' | 'test' | 'build'; step: number }>()
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()
const id = `go-project-${useId()}`
const stage = computed(() => unref(isPrintMode) || !['slide', 'presenter'].includes(unref($renderContext))
  ? 3 : Math.max(0, Math.min(3, Math.trunc(props.step))))
const files = ['main.go', 'service.go', 'main_test.go']
const descriptions = {
  packages: [
    'Three files in examples/. Go filenames do not define separate packages.',
    'These files declare package main. The test file joins the package during go test.',
    'go.mod identifies the module example.com/python-to-go-concurrency. A module can contain multiple packages; this one needs only one.',
    'service.go imports net/http from the standard library. Imports identify packages, not individual source files. The standard library is outside our module.',
  ],
  run: [
    'Run from examples/. The dot selects the main package in the current directory.',
    'go run compiles the package and its dependencies as needed, rather than interpreting a single file.',
    'The resulting program runs with -serve -sequential. The service listens on loopback port 18081.',
    'go run does not leave a named checker executable in the project. Start the local fixture separately to exercise the endpoint.',
  ],
  test: [
    'go test ./... selects packages under the current directory within this module.',
    'Go compiles a test binary using the package and its _test.go files.',
    'The test runner executes Test functions. These existing tests cover the checker and worker pool, not the HTTP wrapper.',
    'go test -race ./... instruments executed code to detect data races. It needs a supported platform and C compiler; a clean run is not proof of every possible schedule.',
  ],
  build: [
    'Build from examples/. The dot selects this main package.',
    'go build compiles and links the main package and its dependencies as needed.',
    'The -o checker option writes a named executable. Building does not start the service or run tests.',
    'Run ./checker -serve to start the bounded service. The target machine does not need the Go toolchain, but OS, architecture and native dependencies must match.',
  ],
}
const tools = {
  run: { command: 'go run . -serve -sequential', middle: 'compile + link', result: 'running service', detail: '127.0.0.1:18081', next: 'compile → run', footer: 'No named executable left in the project' },
  test: { command: 'go test ./...', middle: 'test binary', result: 'run Test…', detail: 'main_test.go', next: 'compile → test', footer: 'go test -race ./...' },
  build: { command: 'go build -o checker .', middle: 'compile + link', result: './checker', detail: 'executable · not running', next: 'compile → keep', footer: './checker -serve' },
}
const tool = computed(() => props.scene === 'packages' ? tools.run : tools[props.scene])
</script>

<template>
  <svg class="go-project-diagram" :data-stage="stage" :data-scene="scene" viewBox="0 0 1180 420" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
    <title :id="`${id}-title`">{{ scene === 'packages' ? 'Files, package, module' : tool.command }}</title>
    <desc :id="`${id}-desc`">{{ descriptions[scene][stage] }}</desc>
    <defs>
      <marker :id="`${id}-arrow`" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1 L8 5 L1 9" class="arrow-head" />
      </marker>
    </defs>

    <template v-if="scene === 'packages'">
      <rect class="boundary ink" :class="{ drawn: stage >= 2 }" pathLength="1" x="20" y="20" width="740" height="355" rx="14" />
      <g class="reveal" :class="{ shown: stage >= 2 }" :aria-hidden="stage < 2">
        <text class="eyebrow" x="50" y="58">MODULE · go.mod</text>
        <text class="mono module-path" x="50" y="100">example.com/python-to-go-concurrency</text>
      </g>
      <rect class="package ink" :class="{ drawn: stage >= 1 }" pathLength="1" x="50" y="150" width="680" height="195" rx="10" />
      <g class="reveal" :class="{ shown: stage >= 1 }" :aria-hidden="stage < 1">
        <text class="label" x="80" y="190">package main</text>
        <text class="detail" x="705" y="190" text-anchor="end">examples/</text>
      </g>
      <g v-for="(file, i) in files" :key="file" class="moving" :style="{ transform: `translate(${stage >= 1 ? 80 + i * 220 : 55 + i * 350}px, ${stage >= 1 ? 225 : 90}px)` }">
        <rect class="file" width="180" height="74" rx="7" />
        <path class="file-mark" d="M14 16 H27 M14 24 H23" />
        <text class="mono filename" x="90" y="51" text-anchor="middle">{{ file }}</text>
      </g>
      <g class="reveal" :class="{ shown: stage >= 3 }" :aria-hidden="stage < 3">
        <path class="connector ink" :class="{ drawn: stage >= 3 }" pathLength="1" d="M735 250 H835" :marker-end="`url(#${id}-arrow)`" />
        <rect class="file" x="845" y="195" width="300" height="110" rx="10" />
        <text class="eyebrow" x="995" y="166" text-anchor="middle">STANDARD LIBRARY</text>
        <text class="mono" x="995" y="245" text-anchor="middle">net/http</text>
        <text class="detail" x="995" y="280" text-anchor="middle">import a package</text>
      </g>
      <text class="detail" x="50" y="409">{{ ['Files are not packages', 'One directory · one package here', 'One module · can contain many packages', 'Import paths name packages, not files'][stage] }}</text>
    </template>

    <template v-else>
      <rect class="terminal" x="40" y="20" width="1100" height="78" rx="10" />
      <text class="prompt mono" x="65" y="69">$</text>
      <text class="mono command" x="105" y="69">{{ tool.command }}</text>
      <g v-for="(x, i) in [40, 440, 840]" :key="i" class="reveal" :class="{ shown: stage >= i }" :aria-hidden="stage < i">
        <rect class="file" :x="x" y="170" width="300" height="130" rx="10" />
        <text class="eyebrow" :x="x + 24" y="203">{{ ['01 · SOURCE', '02 · BUILD', '03 · RESULT'][i] }}</text>
        <text class="label" :x="x + 150" y="245" text-anchor="middle">{{ ['package main', tool.middle, tool.result][i] }}</text>
        <text class="detail" :x="x + 150" y="279" text-anchor="middle">{{ ['.', scene === 'test' ? '+ _test.go' : 'dependencies too', tool.detail][i] }}</text>
      </g>
      <path v-for="(x, i) in [350, 750]" :key="x" class="connector ink" :class="{ drawn: stage >= i + 1 }" pathLength="1" :d="`M${x} 235 h78`" :marker-end="`url(#${id}-arrow)`" />
      <rect class="focus moving" :style="{ transform: `translate(${40 + Math.min(stage, 2) * 400}px, 170px)` }" width="300" height="130" rx="10" />
      <g class="reveal" :class="{ shown: stage >= 3 }" :aria-hidden="stage < 3">
        <text class="detail" x="40" y="385">{{ tool.next }}</text>
        <text :class="scene === 'run' ? 'detail' : 'mono'" x="1140" y="385" text-anchor="end">{{ tool.footer }}</text>
      </g>
    </template>
  </svg>
</template>

<style scoped>
.go-project-diagram { display: block; width: 100%; height: 380px; color: var(--_journey-ink); font-family: inherit; }
text { fill: currentColor; }
.label { font-size: 27px; font-weight: 600; }
.mono { font-family: var(--_journey-mono); font-size: 26px; }
.module-path { font-size: 24px; }
.filename { font-size: 22px; }
.command { font-size: 30px; }
.eyebrow { fill: var(--_journey-muted); font-size: 20px; letter-spacing: 1.5px; }
.detail { fill: var(--_journey-muted); font-size: 22px; }
.boundary { fill: none; stroke: var(--_journey-muted); stroke-width: 2; }
.package { fill: none; stroke: var(--_journey-accent); stroke-width: 2.5; }
.file { fill: var(--_journey-surface); stroke: var(--_journey-border); stroke-width: 1.5; }
.terminal { fill: var(--_journey-surface); stroke: var(--_journey-border); }
.prompt { fill: var(--_journey-accent); }
.file-mark, .connector, .arrow-head { fill: none; stroke: var(--_journey-accent); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.focus { fill: none; stroke: var(--_journey-accent); stroke-width: 3; }
.ink { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; transition: stroke-dashoffset .65s ease, opacity .2s ease; }
.ink.drawn { stroke-dashoffset: 0; opacity: 1; }
.reveal { opacity: 0; transition: opacity .35s ease .12s; }
.reveal.shown { opacity: 1; }
.moving { transition: transform .65s cubic-bezier(.22, 1, .36, 1); }
@media (prefers-reduced-motion: reduce), print {
  .ink, .reveal, .moving { transition: none; }
}
</style>
