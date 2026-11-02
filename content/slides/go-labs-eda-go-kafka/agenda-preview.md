---
theme: default
title: Agenda design previews
colorSchema: dark
routerMode: hash
canvasWidth: 1280
aspectRatio: 16/9
fonts:
  provider: none
  sans: 'Poppins, Noto Sans, sans-serif'
  mono: 'MonoLisa, Noto Sans Mono, Liberation Mono, monospace'
  local: MonoLisa
defaults:
  layout: default
  class: px-8 py-6
---

<AgendaPreview variant="route" />

<style>
/* Unobstructed design previews; use arrow keys to switch options. */
:global(#slide-container nav) { display: none; }
</style>

<!--
Design 1: drawn route. Preview only; not part of the main deck.
Suggested placement: after Introduction, before the payout story.
-->

---

<AgendaPreview variant="editorial" />

<!--
Design 2: editorial chapters. Same content, typography-led layout.
-->

---

<AgendaPreview variant="log" />

<!--
Design 3: Kafka-inspired agenda log. Metaphor only, not a Kafka diagram.
-->

---

<AgendaPreview variant="questions" />

<!--
Design 4: four questions. Large typography, no descriptions or clicks.
-->

---

<AgendaPreview variant="reality" />

<!--
Design 5: happy path to reality. A chapter route, not a processing diagram.
-->

---

<AgendaPreview variant="sketchbook" />

<!--
Design 6: sketchbook panels. Four chapter sketches, all visible at once.
-->

---

<AgendaPreview variant="terminal" />

<!--
Design 7: terminal outline. Static plain-text agenda; no typing animation.
-->

---

<AgendaPreview variant="poster" />

<!--
Design 8: big-number poster. Minimal text, no boxes or connectors.
-->
