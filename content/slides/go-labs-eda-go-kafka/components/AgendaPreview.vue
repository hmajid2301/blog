<script setup lang="ts">
defineProps<{ variant: 'route' | 'editorial' | 'log' | 'questions' | 'reality' | 'sketchbook' | 'terminal' | 'poster' }>()

const chapters = [
  { title: 'Why events?', detail: 'A payout. A slow bank. A queue.', color: '#94e2d5', tag: 'The story' },
  { title: 'Kafka + Go', detail: 'Topics, partitions, consumers.', color: '#89b4fa', tag: 'The foundations' },
  { title: 'When things fail', detail: 'Crashes, duplicates, retries.', color: '#fab387', tag: 'The hard part' },
  { title: 'Recover for real', detail: 'Dead letters, replay, visibility.', color: '#cba6f7', tag: 'The way back' },
]

const questions = ['Why events?', 'How does Kafka work?', 'What breaks?', 'How do we recover?']
const realityStops = [
  { title: 'Events', x: 110, y: 100 },
  { title: 'Kafka + Go', x: 395, y: 100 },
  { title: 'Failure', x: 680, y: 245 },
  { title: 'Recovery', x: 980, y: 350 },
]
</script>

<template>
  <section class="agenda" :class="`agenda-${variant}`" aria-label="Talk roadmap">
    <template v-if="variant === 'route'">
      <div class="eyebrow">Today's route</div>
      <div class="route">
        <svg class="route-line" viewBox="0 0 1080 80" aria-hidden="true">
          <path d="M 135 41 C 250 32, 300 48, 405 40 S 570 31, 675 40 S 840 49, 945 40" />
          <path d="M 135 44 C 250 36, 300 51, 405 43 S 570 34, 675 43 S 840 52, 945 43" class="echo" />
        </svg>
        <div v-for="(chapter, i) in chapters" :key="chapter.title" class="stop" :style="{ '--accent': chapter.color }">
          <span class="route-tag">{{ chapter.tag }}</span>
          <span class="station">{{ i + 1 }}</span>
          <h3>{{ chapter.title }}</h3>
          <p>{{ chapter.detail }}</p>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'editorial'">
      <header>
        <div class="eyebrow">The next 35 minutes</div>
        <h2>The happy<br>path is<br><span>just the start.</span></h2>
        <p>Here's where we're going.</p>
      </header>
      <div class="chapters">
        <div v-for="(chapter, i) in chapters" :key="chapter.title" class="chapter" :style="{ '--accent': chapter.color }">
          <span class="chapter-number">0{{ i + 1 }}</span>
          <div><h3>{{ chapter.title }}</h3><p>{{ chapter.detail }}</p></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'questions'">
      <div class="eyebrow">The plan</div>
      <h2>Four questions. One payout.</h2>
      <div class="questions">
        <div v-for="(question, i) in questions" :key="question" class="question" :style="{ '--accent': chapters[i].color }">
          <span class="question-number">0{{ i + 1 }}</span>
          <h3>{{ question }}</h3>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'reality'">
      <div class="eyebrow">Today's journey</div>
      <h2>The happy path. Then, reality.</h2>
      <div class="reality-canvas">
        <svg viewBox="0 0 1100 440" class="reality-line" aria-hidden="true">
          <path d="M 395 100 L 1020 100" class="imagined-path" />
          <path d="M 1011 92 L 1022 100 L 1011 108" class="imagined-path" />
          <path d="M 110 100 L 395 100 C 560 100, 515 245, 680 245 S 815 350, 980 350" class="actual-path" />
          <path d="M 110 103 L 395 103 C 555 103, 520 248, 680 248 S 820 353, 980 353" class="actual-echo" />
        </svg>
        <span class="imagined-label">if nothing went wrong…</span>
        <div v-for="(stop, i) in realityStops" :key="stop.title" class="reality-stop" :style="{ left: `${stop.x}px`, top: `${stop.y}px`, '--accent': chapters[i].color }">
          <span class="reality-number">{{ i + 1 }}</span>
          <h3>{{ stop.title }}</h3>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'sketchbook'">
      <div class="eyebrow">A quick sketch of the plan</div>
      <h2>One story. Four chapters.</h2>
      <div class="sketch-panels">
        <div v-for="(chapter, i) in chapters" :key="chapter.title" class="sketch-panel" :style="{ '--accent': chapter.color }">
          <svg class="panel-frame" viewBox="0 0 530 190" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 5 8 L 523 4 L 526 181 L 8 186 Z M 8 6 L 521 8 L 523 184" />
          </svg>
          <svg class="chapter-sketch" viewBox="0 0 100 100" aria-hidden="true">
            <g v-if="i === 0"><path d="M 10 29 L 32 27 L 33 68 L 10 70 Z M 39 28 L 60 29 L 61 69 L 39 68 Z M 68 28 L 90 27 L 89 69 L 68 70 Z M 9 83 Q 48 87 89 82 M 81 77 L 90 82 L 82 89" /></g>
            <g v-else-if="i === 1"><path d="M 33 25 L 10 48 L 33 72 M 67 25 L 90 48 L 67 72 M 59 16 L 43 82" /></g>
            <g v-else-if="i === 2"><path d="M 8 48 L 33 48 L 40 36 M 61 61 L 68 48 L 92 48 M 57 13 L 42 46 L 60 43 L 43 85" /></g>
            <g v-else><path d="M 77 31 A 35 35 0 1 0 83 64 M 60 31 L 80 33 L 79 12 M 33 51 L 46 65 L 68 41" /></g>
          </svg>
          <div><span class="panel-tag">{{ chapter.tag }}</span><h3>{{ chapter.title }}</h3></div>
          <span class="panel-number">0{{ i + 1 }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'terminal'">
      <div class="eyebrow">The outline</div>
      <h2>Let's walk through it.</h2>
      <div class="terminal-outline">
        <div class="terminal-prompt"><span>~/go-labs</span> $ cat agenda.txt</div>
        <div class="terminal-root">beyond-the-happy-path/</div>
        <div v-for="(chapter, i) in chapters" :key="chapter.title" class="terminal-row" :style="{ '--accent': chapter.color }">
          <span class="tree-branch" aria-hidden="true">{{ i === 3 ? '└──' : '├──' }}</span>
          <span class="terminal-number">0{{ i + 1 }}</span>
          <div><h3>{{ chapter.title }}</h3><p># {{ chapter.detail }}</p></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'poster'">
      <div class="eyebrow">35 minutes · four chapters</div>
      <h2>From “it works” to “it recovers”.</h2>
      <div class="poster-chapters">
        <div v-for="(chapter, i) in chapters" :key="chapter.title" class="poster-chapter" :style="{ '--accent': chapter.color }">
          <span class="poster-number">0{{ i + 1 }}</span>
          <span class="poster-rule" aria-hidden="true"></span>
          <h3>{{ chapter.title }}</h3>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="log-heading"><div><div class="eyebrow">The agenda, appended</div><h2>Follow the recovery.</h2></div><span class="log-topic">talk.roadmap</span></div>
      <div class="log">
        <div class="log-labels"><span>Chapter</span><span>What we'll explore</span><span>Focus</span></div>
        <div v-for="(chapter, i) in chapters" :key="chapter.title" class="record" :style="{ '--accent': chapter.color }">
          <span class="offset">0{{ i + 1 }}</span>
          <div><h3>{{ chapter.title }}</h3><p>{{ chapter.detail }}</p></div>
          <span class="record-tag">{{ chapter.tag }}</span>
        </div>
      </div>
      <div class="log-footer"><span>START →</span><span>One event, all the way through.</span><span>→ RECOVERY</span></div>
    </template>
  </section>
</template>

<style scoped>
.agenda { width: 1100px; text-align: left; color: #cdd6f4; }
.agenda .eyebrow { color: #a6adc8; font-size: 17px; letter-spacing: .16em; text-transform: uppercase; margin-bottom: 20px; }
.agenda h2 { font-size: 58px; letter-spacing: -.035em; margin: 0; line-height: 1.12; }
.agenda h3 { font-family: 'Poppins', sans-serif; font-size: 27px; font-weight: 400; margin: 0; line-height: 1.25; }
.agenda p { color: #a6adc8; font-size: 19px; line-height: 1.55; margin: 10px 0 0; }
/* A drawn route, echoing the talk's existing diagrams. */
.agenda-route { padding: 30px 10px; }
.route { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 65px; }
.route-line { position: absolute; top: 38px; left: 0; width: 100%; height: 80px; overflow: visible; }
.route-line path { fill: none; stroke: #585b70; stroke-width: 3; }
.route-line .echo { opacity: .4; stroke-width: 1; }
.stop { position: relative; padding: 0 12px; text-align: center; }
.route-tag { display: block; font-family: 'Patrick Hand', cursive; font-size: 25px; color: var(--accent); margin-bottom: 20px; }
.station { position: relative; display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; margin: 0 auto 30px; border: 3px solid var(--accent); border-radius: 48% 52% 46% 54%; background: #11111b; color: var(--accent); font-family: 'Patrick Hand', cursive; font-size: 32px; }
.stop h3 { font-size: 25px; }
.stop p { max-width: 230px; margin: 12px auto 0; font-size: 18px; }
/* Typography first, without boxes. */
.agenda-editorial { display: grid; grid-template-columns: 1fr 1.3fr; gap: 65px; align-items: center; }
.agenda-editorial h2 { font-size: 66px; line-height: 1.15; }
.agenda-editorial h2 span { color: #94e2d5; }
.agenda-editorial header > p { margin-top: 28px; font-size: 20px; }
.chapter { display: grid; grid-template-columns: 60px 1fr; gap: 25px; padding: 26px 0; border-bottom: 1px solid #313244; align-items: start; }
.chapter:first-child { padding-top: 0; }
.chapter:last-child { border-bottom: 0; padding-bottom: 0; }
.chapter-number { color: var(--accent); font-size: 32px; line-height: 1.2; font-family: 'MonoLisa', monospace; }
.chapter h3 { font-size: 29px; }
.chapter p { font-size: 18px; margin-top: 6px; }
/* A log-shaped agenda, not an extra architecture diagram. */
.log-heading { display: flex; justify-content: space-between; align-items: end; margin-bottom: 28px; }
.log-heading .eyebrow { margin-bottom: 12px; }
.log-topic { color: #94e2d5; font-family: 'MonoLisa', monospace; font-size: 18px; padding-bottom: 6px; }
.log-labels, .record { display: grid; grid-template-columns: 100px 1fr 210px; gap: 24px; align-items: center; }
.log-labels { color: #6c7086; font-size: 15px; padding: 0 28px 14px; text-transform: uppercase; letter-spacing: .08em; }
.record { position: relative; background: #181825; border: 1px solid #313244; border-left: 4px solid var(--accent); padding: 12px 26px; margin-bottom: 8px; }
.offset { color: var(--accent); font-family: 'MonoLisa', monospace; font-size: 29px; }
.record h3 { font-size: 24px; }
.record p { font-size: 17px; margin-top: 5px; }
.record-tag { color: var(--accent); font-family: 'Patrick Hand', cursive; font-size: 25px; }
.log-footer { display: flex; justify-content: space-between; color: #a6adc8; margin-top: 25px; font-size: 18px; }
.log-footer > :first-child, .log-footer > :last-child { color: #6c7086; font-family: 'MonoLisa', monospace; font-size: 14px; }
/* Four questions, readable at a glance from the back row. */
.agenda-questions { padding: 10px 0; }
.questions { margin-top: 40px; }
.question { display: grid; grid-template-columns: 80px 1fr; align-items: center; gap: 20px; padding: 22px 0; border-bottom: 1px solid #313244; }
.question:last-child { border-bottom: 0; }
.question-number { color: var(--accent); font-family: 'MonoLisa', monospace; font-size: 27px; }
.question h3 { font-size: 43px; letter-spacing: -.025em; }
/* An abstract chapter route, not a Kafka processing diagram. */
.reality-canvas { position: relative; width: 1100px; height: 440px; margin-top: 22px; }
.reality-line { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.reality-line path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.imagined-path { stroke: #45475a; stroke-width: 2; stroke-dasharray: 7 9; }
.actual-path { stroke: #bac2de; stroke-width: 3; }
.actual-echo { stroke: #bac2de; stroke-width: 1; opacity: .35; }
.imagined-label { position: absolute; left: 685px; top: 46px; color: #6c7086; font-family: 'Patrick Hand', cursive; font-size: 27px; transform: rotate(-2deg); }
.reality-stop { position: absolute; width: 0; height: 0; }
.reality-number { display: flex; justify-content: center; align-items: center; position: absolute; left: -28px; top: -28px; width: 56px; height: 56px; border: 3px solid var(--accent); border-radius: 47% 53% 49% 51%; background: #11111b; color: var(--accent); font-family: 'Patrick Hand', cursive; font-size: 32px; }
.reality-stop h3 { position: absolute; top: 45px; left: -115px; width: 230px; text-align: center; font-size: 31px; color: var(--accent); }
/* Four small sketches, matching the hand-drawn diagrams. */
.sketch-panels { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px 26px; margin-top: 35px; }
.sketch-panel { position: relative; display: grid; grid-template-columns: 100px 1fr; gap: 26px; align-items: center; min-height: 190px; padding: 25px 32px; }
.panel-frame { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; stroke: var(--accent); stroke-width: 1.5; opacity: .45; }
.chapter-sketch { width: 100px; height: 100px; fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.panel-tag { display: block; color: #a6adc8; font-family: 'Patrick Hand', cursive; font-size: 24px; margin-bottom: 10px; }
.sketch-panel h3 { font-size: 29px; }
.panel-number { position: absolute; top: 15px; right: 22px; color: var(--accent); font-family: 'MonoLisa', monospace; font-size: 15px; }
/* Plain-text tree, without a fake app window or typing animation. */
.terminal-outline { margin-top: 35px; padding: 0 0 0 32px; border-left: 3px solid #313244; font-family: 'MonoLisa', 'Noto Sans Mono', monospace; }
.terminal-prompt { font-size: 23px; color: #bac2de; margin-bottom: 25px; }
.terminal-prompt span { color: #94e2d5; }
.terminal-root { font-size: 28px; color: #bac2de; margin-bottom: 16px; }
.terminal-row { display: grid; grid-template-columns: 72px 54px 1fr; gap: 16px; align-items: start; padding: 10px 0; }
.tree-branch { color: #585b70; font-size: 28px; line-height: 1.3; }
.terminal-number { color: var(--accent); font-size: 25px; line-height: 1.5; }
.terminal-row h3 { font-family: inherit; font-size: 29px; color: var(--accent); }
.terminal-row p { font-family: inherit; font-size: 18px; margin-top: 6px; }
/* Poster-like chapter numbers: no boxes, descriptions, or connectors. */
.poster-chapters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 65px; }
.poster-number { display: block; font-family: 'Roboto', sans-serif; font-weight: 700; font-size: 140px; letter-spacing: -.07em; line-height: 1; color: var(--accent); }
.poster-rule { display: block; height: 3px; background: var(--accent); margin: 30px 0 24px; opacity: .6; }
.poster-chapter h3 { font-size: 34px; line-height: 1.3; max-width: 230px; }
</style>
