---
src: ./slides.md
theme: default
title: "From Python to Go · theme and animation preview"
colorSchema: dark
routerMode: hash
canvasWidth: 1280
aspectRatio: 16/9
transition: slide-left
clickAnimation: fade
lineNumbers: false
monaco: false
twoslash: false
fonts:
  provider: none
  sans: 'Poppins, Noto Sans, sans-serif'
  mono: 'MonoLisa, Noto Sans Mono, Liberation Mono, monospace'
  local: MonoLisa
defaults:
  layout: default
  class: px-8 py-6
---

---
layout: default
class: px-8 py-6
---

## Animation lab · reveal and annotate

<p>A goroutine starts work. <span class="motion-mark" v-mark="{ at: 1, type: 'underline', color: 'var(--ctp-blue)', padding: 3 }">You own its lifetime.</span></p>

<v-clicks>

- Start only the work you can bound.
- Give every blocking operation a stop path.
- Join the work before returning.

</v-clicks>

<div class="small mt-6">Kafka pattern: grouped click reveals + hand-drawn emphasis.</div>

<!--
Preview-only motion lab. Not part of the timed talk.
Click through all three statements. The underline draws on the first click.
Switch themes mid-reveal: the click index should stay put.
-->

---
layout: default
class: px-8 py-6
---

## Animation lab · code evolves

````md magic-move {at:1, duration:500}
```go
report(url)
```
```go
go report(url)
```
```go {2,4-5}
wg.Add(1)
go func() {
    defer wg.Done()
    report(url)
}()
wg.Wait()
```
````

<div class="small mt-6">Kafka pattern: stable tokens move; new code appears in place.</div>

<!--
Preview-only. Click one adds concurrency; click two adds explicit joining.
The snippet is a teaching excerpt, not a standalone service.
Check both dark and light code highlighting while the tokens move.
-->

---
layout: default
class: px-8 py-6
clicks: 3
---

## Animation lab · staged ownership

<PoolDiagram :step="$clicks" />

<v-switch>
<template #0><p class="small">The producer owns the input stream.</p></template>
<template #1><p class="small">A fixed number of workers receives jobs.</p></template>
<template #2><p class="small">One collector owns the results.</p></template>
<template #3><p class="small">Cancellation reaches every blocking boundary.</p></template>
</v-switch>

<!--
Preview-only. Existing pool drawing with Kafka's staged-caption pattern.
Replay returns to stage zero without changing the chosen theme.
-->

---
layout: default
class: px-8 py-6
clicks: 2
---

## Animation lab · move the checkpoint

<div class="checkpoint-track">
  <div class="checkpoint-labels"><span>received</span><span>processed</span><span>joined</span></div>
  <div v-motion :initial="{ x: 0 }" :enter="{ x: 0 }" :click-1="{ x: 360, transition: { duration: 550 } }" :click-2="{ x: 720, transition: { duration: 550 } }" class="checkpoint-token">work</div>
</div>

<div class="small mt-6">Kafka pattern: a moving marker explains a state change—not decoration.</div>

<style>
.checkpoint-track { position:relative; height:180px; border-bottom:2px solid var(--ctp-blue); }
.checkpoint-labels { display:flex; justify-content:space-between; color:var(--ctp-subtext1); font-size:24px; }
.checkpoint-token { position:absolute; left:0; bottom:24px; width:180px; padding:16px; text-align:center; color:var(--ctp-text); border:2px solid var(--ctp-blue); background:var(--ctp-surface0); }
</style>

<!--
Preview-only. Two clicks move the marker across three states.
The 550ms timing matches the Kafka offset-marker example.
-->
