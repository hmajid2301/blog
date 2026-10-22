---
theme: default
title: "Beyond the Happy Path: Failure Recovery with Go and Kafka"
author: Haseeb Majid
presenter: true
duration: 35min
timer: countdown
browserExporter: dev
record: dev
wakeLock: true
overviewSnapshots: true
download: false
lineNumbers: false
monaco: false
twoslash: false
colorSchema: dark
routerMode: hash
canvasWidth: 1280
aspectRatio: 16/9
transition: slide-left
clickAnimation: fade
themeConfig:
  primary: '#89b4fa'
fonts:
  provider: none
  sans: 'Poppins, Noto Sans, sans-serif'
  mono: 'MonoLisa, Noto Sans Mono, Liberation Mono, monospace'
  local: MonoLisa
drawings:
  enabled: true
  persist: true
  presenterOnly: true
  syncAll: false
defaults:
  layout: default
  class: px-8 py-6
---

# Beyond the Happy Path: Failure Recovery with Go and Kafka

<div class="mt-6 text-lg opacity-80">Haseeb Majid · Go Labs</div>

---

## Introduction

- Haseeb Majid
  - Backend Software Engineer at [Nala](https://www.nala.com/)
  - <https://haseebmajid.dev>
- Loves cats 🐱
- Avid cricketer 🏏
- 🌱 Amateur Gardener

<!--
-->

---

<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: center; gap: 32px;">

<RoughDiagram diagram="happy-path" :step="$clicks" talk />

<div class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div v-click.fade-in="1" class="transfer-step" style="font-size: 32px; font-weight: 700; color: #94e2d5;">1. Charge</div>
  <div v-click.fade-in="1" class="transfer-detail" style="margin: 8px 0 28px;">Collections charges the customer.</div>
  <div v-click.fade-in="2" class="transfer-step" style="font-size: 32px; font-weight: 700; color: #cba6f7;">2. Payout</div>
  <div v-click.fade-in="2" class="transfer-detail" style="margin: 8px 0 28px;">Disbursements requests the bank payout.</div>
  <div v-click.fade-in="3" class="transfer-step" style="font-size: 32px; font-weight: 700; color: #a6e3a1;">3. Receipt</div>
  <div v-click.fade-in="3" class="transfer-detail" style="margin-top: 8px;">Notifications sends the receipt.</div>
</div>

</div>

<!--
- Happy path

[click]
- Charge

[click]
- Payout; caller waits

[click]
- Receipt
- Coupling, timeouts, retry storms
-->

---
layout: statement
---

# 🎄 Holiday rush

Imagine 1,000 payouts waiting.

Same synchronous chain.

<!--
- Holiday rush
- Bank down?
-->

---

<img src="./images/failure.jpg" style="height: 65vh; width: auto; max-width: 100%; object-fit: contain; display: block; margin: 0 auto;" class="rounded shadow-lg" />

---

<v-switch>
<template #0>

<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: center; gap: 32px;">

<RoughDiagram diagram="slow-bank" :step="0" talk />

<div class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div class="transfer-step" style="font-size: 32px; font-weight: 700; color: #89b4fa;">Synchronous chain</div>
  <div class="transfer-detail" style="margin-top: 8px;">More holiday transfers. Every caller still waits on downstream work.</div>
</div>

</div>

</template>
<template #1>

<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: center; gap: 32px;">

<RoughDiagram diagram="slow-bank" :step="1" talk />

<div class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div class="transfer-step" style="font-size: 32px; font-weight: 700; color: #f38ba8;">1. Bank failure</div>
  <div class="transfer-detail" style="margin-top: 8px;">The partner bank is slow or unavailable.</div>
</div>

</div>

</template>
<template #2>

<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: center; gap: 32px;">

<RoughDiagram diagram="slow-bank" :step="2" talk />

<div class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div class="transfer-step" style="font-size: 32px; font-weight: 700; color: #fab387;">2. Timeouts</div>
  <div class="transfer-detail" style="margin-top: 8px;">Waiting upstream calls time out. Downstream failure spreads through the chain.</div>
</div>

</div>

</template>
<template #3>

<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: center; gap: 32px;">

<RoughDiagram diagram="slow-bank" :step="3" talk />

<div class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div class="transfer-step" style="font-size: 32px; font-weight: 700; color: #fab387;">3. Retry storm</div>
  <div class="transfer-detail" style="margin-top: 8px;">Client retries add load and can repeat the same payment request.</div>
</div>

</div>

</template>
</v-switch>

<p v-show="$clicks > 0" style="text-align: center; font-size: 18px; color: #a6adc8;">Illustrative waiting-request counts</p>

<!--
- Counts illustrative; overlapping, not additive

[click]
- Bank timeout → unknown outcome; receipts wait

[click]
- Timeouts spread upstream

[click]
- Retries amplify load; duplicate-payment risk
-->

---

## Event-driven architecture

---
zoom: 0.8
---

<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: center; gap: 32px;">

<RoughDiagram diagram="event-flow" :step="$clicks" talk />

<div v-show="$clicks < 4" class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div v-click.fade-in="1" class="transfer-step" style="font-size: 32px; font-weight: 700; color: #94e2d5;">1. Publish completion</div>
  <div v-click.fade-in="1" class="transfer-detail" style="margin: 8px 0 28px;">Collections publishes completion.</div>
  <div v-click.fade-in="2" class="transfer-step" style="font-size: 32px; font-weight: 700; color: #cba6f7;">2. Request payout</div>
  <div v-click.fade-in="2" class="transfer-detail" style="margin: 8px 0 28px;">Disbursements calls the bank.</div>
  <div v-click.fade-in="3" class="transfer-step" style="font-size: 32px; font-weight: 700; color: #a6e3a1;">3. Send receipt</div>
  <div v-click.fade-in="3" class="transfer-detail" style="margin-top: 8px;">Notifications sends the receipt.</div>
</div>

<div v-click="4" v-show="$clicks >= 4" class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div class="transfer-step" style="font-size: 32px; font-weight: 700; color: #f38ba8;">4. Bank down</div>
  <div class="transfer-detail" style="margin-top: 8px;">Collections keeps working. Payouts and receipts wait.</div>
</div>

</div>

<!--
- Decouple services

[click]
- Charge confirmed → publish

[click]
- Consume → bank payout

[click]
- Payout confirmed → receipt

[click]
- Bank down: collections continues
- Payout backlog grows; receipts wait
-->

---

# Kafka Crash Course

<p class="slide-subtitle">without Otters 🦦</p>


---

<p v-click="1"><strong style="color: #f9e2af;">Event</strong>: a <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 1, type: 'underline', color: '#f9e2af', padding: 2 }">fact</span> that happened in the past.</p>

<!--
[click] A fact that happened
-->

---
class: code-fit
---

<div class="code-focus code-reserve-tall focus-lines-3" :class="$clicks >= 4 ? 'focus-start-10' : 'focus-start-6'">

````md magic-move {at:1, duration:500}
```go
type Event struct {
    Payload       json.RawMessage `json:"payload"`
}
```
```go
type Event struct {
    ID            uuid.UUID       `json:"id"`
    Payload       json.RawMessage `json:"payload"`
}
```
```go {7-9}
type Event struct {
    ID            uuid.UUID       `json:"id"`
    Type          string          `json:"type"`
    Payload       json.RawMessage `json:"payload"`
}

const (
    TypeCollectionCompleted = "collections.completed.v1"
)
```
````

</div>

<div v-click.fade-in="4" class="event-name-breakdown mt-4 text-center">
  <span class="inline-block" v-mark="{ at: 3, type: 'box', color: '#94e2d5', padding: 3 }">collections</span>.<span class="inline-block" v-mark="{ at: 4, type: 'underline', color: '#a6e3a1', padding: 2 }">completed</span>.<span class="inline-block" v-mark="{ at: 4, type: 'circle', color: '#b4befe', padding: 3 }">v1</span>
</div>

<style>
.event-name-breakdown {
  font-family: 'MonoLisa', monospace;
  font-size: 28px;
  line-height: 1.5;
  white-space: nowrap;
  transition: opacity 220ms ease;
}
.event-name-breakdown.slidev-vclick-hidden { transform: none; filter: none; }
</style>

<!--
- Payload

[click]
- Stable event ID

[click]
- Type ≠ topic

[click]
- Metadata; correlation = workflow

[click]
- Domain · fact · version
-->

---
class: code-fit
---

```json
{
  "id": "92bf4e5a-3a1e-4d6f-8db8-1f7d865bd46a",
  "type": "collections.completed.v1",
  "source": "collections",
  "correlation_id": "transfer-a",
  "time": "2026-06-01T10:30:00Z",
  "schema_version": 1,
  "payload": {
    "collection_id": "collection-42",
    "amount_minor": 10000,
    "currency": "GBP"
  }
}
```

<!--
- GBP 100; minor units
- Collection complete ≠ payout complete
-->

---

<p v-click="1"><strong style="color: #94e2d5;">Producer</strong>: <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 1, type: 'circle', color: '#94e2d5', padding: 4 }">publishes</span> event to topic</p>

<p v-click="2"><strong style="color: #cba6f7;">Consumer</strong>: <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 2, type: 'box', color: '#cba6f7', padding: 4 }">receives events</span> from a topic</p>

<style>
.slidev-vclick-target {
  transition: opacity 220ms ease;
}
.slidev-vclick-hidden {
  transform: none;
  filter: none;
}
</style>

<!--
[click] Collections publishes
[click] Disbursements consumes
-->

---
class: diagram-preview-slide
clicks: 2
---

<RoughDiagram diagram="producer-consumer" :step="$clicks" talk />

<!--
- Collections produces; Disbursements consumes

[click]
- Publish to collections

[click]
- Consume; Kafka keeps the record
-->

---

<p v-click="1"><strong style="color: #fab387;">Topics</strong>: How <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 1, type: 'circle', color: '#fab387', padding: 3 }">events</span> are organised</p>

<style>
.slidev-vclick-target { transition: opacity 220ms ease; }
.slidev-vclick-hidden { transform: none; filter: none; }
</style>

<!--
[click] collections topic; type ≠ topic
-->

---
class: diagram-preview-slide
---

<RoughDiagram diagram="topic-overview" :step="$clicks" talk />

<!--
Same topic, different event types
-->

---
class: code-lg
---


<div class="code-focus" :style="{ '--focus-start': $clicks < 2 ? 2 : 1, '--focus-lines': $clicks < 2 ? 1 : 3 }">

````md magic-move {at:1, duration:500}
```go {all|3}
client, err := kgo.NewClient(
    kgo.SeedBrokers("localhost:9092"),
    kgo.DefaultProduceTopic("collections"),
)
if err != nil { return err }
defer client.Close()
```
```go {all|2-4}
err := client.ProduceSync(ctx, &kgo.Record{
    Topic: "collections",
    Key:   []byte(collection.ID.String()),
    Value: eventJSON,
}).FirstErr()
```
````

</div>

<!--
- franz-go client

[click]
- collections topic

[click]
- Publish

[click]
- Key; event; ack/error
-->

---
class: code-fit
---

````md magic-move {at:1, duration:500}
```go {3}
client, err := kgo.NewClient(
    kgo.SeedBrokers("localhost:9092"),
    kgo.ConsumeTopics("collections"),
)
if err != nil { return err }
defer client.Close()
```
```go {2|7-10}
for {
    fetches := client.PollFetches(ctx)
    if errs := fetches.Errors(); len(errs) > 0 {
        return errs[0].Err
    }
    for _, r := range fetches.Records() {
        var event Event
        if err := json.Unmarshal(r.Value, &event); err != nil {
            return err
        }
    }
}
```
```go {7-11}
for _, r := range fetches.Records() {
    var event Event
    if err := json.Unmarshal(r.Value, &event); err != nil {
        return err
    }

    switch event.Type {
    case TypeCollectionCompleted:
        if err := handleCollectionCompleted(ctx, r); err != nil {
            return err
        }
    }
}
```
````

<!--
- Subscribe; no group yet
[click] Poll for records
[click] Decode each Event
[click] Zoom into loop; route by type; commits + bank safety later
-->

---
class: diagram-preview-slide
clicks: 4
---

<RoughDiagram diagram="poll-batch" :step="$clicks" talk />

<!--
- Poll can return multiple records; not always three
[click] Returned together; Kafka retains originals
[click] Handle A
[click] Handle B
[click] Handle C; sequential in this loop, not global topic order
-->

---

<p v-click="1"><strong style="color: #89b4fa;">Partition</strong>: an <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 1, type: 'underline', color: '#89b4fa', padding: 2 }">ordered</span>, append-only log within a topic.</p>

<style>
.slidev-vclick-target { transition: opacity 220ms ease; }
.slidev-vclick-hidden { transform: none; filter: none; }
</style>

<!--
[click] Ordered within each partition
-->

---
class: diagram-compact
clicks: 6
---

<RoughDiagram diagram="partition-log" :step="$clicks" talk />


<!--
- Independent logs; illustrative partition assignment
- Segment-file detail on next slide

[click]
- P0: offset 4

[click]
- P1: independent offset 4

[click]
- P2: offset 4; no global order

[click]
- P0: offset 5; earlier record stays

[click]
- P1: offset 5

[click]
- P2: offset 5
- Same key → same partition; replay within retention
-->

---
class: diagram-compact
---

<RoughDiagram diagram="partition-segments" :step="6" talk />

<!--
- Partition logs split into segment files
- Closed 000.log → active 001.log; earlier records stay
-->

---

<img src="./images/always_has_been.jpg" alt="Two astronauts: Wait, Kafka is just logs? It always has been." style="height: 65vh; width: auto; max-width: 100%; object-fit: contain; display: block; margin: 0 auto;" />

---

<v-clicks at="1">

- <strong style="color: #74c7ec;">ISR (In-Sync Replicas)</strong>: replicas of a partition that are <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 1, type: 'underline', color: '#74c7ec', padding: 2 }">caught up</span> with its leader

</v-clicks>

<!--
[click] Leader included; lagging followers leave ISR
-->

---
class: diagram-preview-slide
clicks: 3
---

<RoughDiagram diagram="isr-overview" :step="$clicks" talk />

<!--
- One partition; three replicas; acks=all

[click] All ISR store record → ACK
[click] B3 falls behind, leaves ISR; writes continue
[click] B2 leaves; ISR < 2 → reject writes
-->

---
class: code-fit
---

````md magic-move {at:1, duration:500}
```go {4}
client, err := kgo.NewClient(
    kgo.SeedBrokers("localhost:9092"),
    kgo.DefaultProduceTopic("collections"),
    kgo.RequiredAcks(kgo.AllISRAcks()), // acks=all
)
if err != nil { return err }
defer client.Close()
```
```go
admin := kadm.NewClient(client)
minISR := "2"
_, err = admin.CreateTopic(ctx,
    3, // partitions
    3, // replication factor
    map[string]*string{"min.insync.replicas": &minISR},
    "collections",
)
if err != nil { return err }
```
````

<!--
- All current ISR must acknowledge

[click]
- franz-go/pkg/kadm; needs three brokers
- RF=3; min ISR=2; below two → write errors
- Kafka durability ≠ exactly-once bank payment
-->

---

<p v-click="1"><strong style="color: #b4befe;">Consumer Group</strong>: a set of consumers that <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 1, type: 'box', color: '#b4befe', padding: 3 }">share</span> a topic’s <span style="display: inline-block; white-space: nowrap;" v-mark="{ at: 1, type: 'highlight', color: 'rgba(180,190,254,0.25)', padding: 2 }">partitions</span>.</p>

<style>
.slidev-vclick-target { transition: opacity 220ms ease; }
.slidev-vclick-hidden { transform: none; filter: none; }
</style>

<!--
[click] One consumer per partition within a group
-->

---
class: diagram-compact
clicks: 3
---

<RoughDiagram diagram="consumer-scaling" :step="$clicks" talk />

<!--
- One owner per partition/group
- One consumer; three partitions

[click]
- Consumer 2 → P1

[click]
- Consumer 3 → P2

[click]
- Consumer 4 idle; partition limit
-->

---
clicks: 2
---

<div class="offset-board">
  <div class="offset-log">
    <strong class="offset-topic">collections · partition 0</strong>
    <span v-click="2" class="offset-log-end">log end = 5</span>
    <div v-click="2" class="offset-lag-selection"><span>Lag</span></div>
    <div class="offset-records">
      <div
        v-for="(event, offset) in ['created', 'completed', 'updated', 'completed', 'created']"
        :key="offset"
        class="offset-record"
        :class="{
          'is-disbursement': offset === 1,
          'is-reconciliation': offset === ($clicks >= 1 ? 4 : 3),
          'is-lag': $clicks >= 2 && offset >= 1,
        }"
      >
        <div class="offset-node" v-mark="{ at: true, type: 'box', color: 'var(--node-color)', padding: 0, strokeWidth: 2.5, animationDuration: 1 }">
          <strong>offset {{ offset }}</strong>
          <span>{{ event }}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="offset-bookmark offset-bookmark-disbursements">
    <div class="offset-bookmark-tip"></div>
    <div class="offset-bookmark-stem"></div>
    <div class="offset-bookmark-label offset-node" v-mark="{ at: true, type: 'box', color: 'var(--bookmark-color)', padding: 0, strokeWidth: 2.5, animationDuration: 1 }">
      <strong>Disbursements</strong>
      <span>committed next = 1</span>
    </div>
  </div>
  <div
    v-motion
    :initial="{ x: 0 }"
    :enter="{ x: 0 }"
    :click-1="{ x: 220, transition: { duration: 550 } }"
    :click-2="{ x: 220 }"
    class="offset-bookmark offset-bookmark-reconciliation"
  >
    <div class="offset-bookmark-tip"></div>
    <div class="offset-bookmark-stem"></div>
    <div class="offset-bookmark-label offset-node" v-mark="{ at: true, type: 'box', color: 'var(--bookmark-color)', padding: 0, strokeWidth: 2.5, animationDuration: 1 }">
      <strong>Reconciliation</strong>
      <span>committed next = {{ $clicks >= 1 ? 4 : 3 }}</span>
    </div>
  </div>
</div>

<style>
.offset-board { position: relative; width: 1100px; height: 395px; margin: 45px auto 0; font-family: 'Patrick Hand', 'Poppins', sans-serif; letter-spacing: 0.02em; }
.offset-log { position: absolute; inset: 0 0 auto; height: 220px; border: 3px solid #fab387; background: rgba(30,30,46,.9); }
.offset-topic { position: absolute; top: 18px; left: 20px; font-size: 24px; font-weight: 500; color: #cdd6f4; }
.offset-log-end { position: absolute; top: 20px; right: 20px; font-size: 24px; color: #f5c2e7; }
.offset-records { position: absolute; top: 96px; left: -3px; display: grid; grid-template-columns: repeat(5, 220px); }
.offset-record { position: relative; width: 190px; height: 90px; margin: 0 15px; --node-color: #7f849c; --node-hatch: rgba(127,132,156,.16); }
.offset-node { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 190px; height: 90px; color: #e6e9f7; background: repeating-linear-gradient(135deg, transparent 0 6px, var(--node-hatch) 6px 7.5px, transparent 7.5px 13px); line-height: 1.1; }
.offset-node strong { font-size: 24px; font-weight: 500; }
.offset-node span { font-size: 22px; }
.offset-record.is-disbursement { --node-color: #b4befe; --node-hatch: rgba(203,166,247,.22); }
.offset-record.is-reconciliation { --node-color: #89b4fa; --node-hatch: rgba(137,180,250,.22); }
.offset-record.is-lag { --node-color: #f5c2e7; --node-hatch: rgba(245,194,231,.22); }
.offset-lag-selection { position: absolute; top: 75px; left: 222px; right: 2px; height: 125px; border: 3px dashed #f5c2e7; }
.offset-lag-selection span { position: absolute; top: -19px; left: 50%; translate: -50% 0; padding: 0 12px; background: #1e1e2e; color: #f5c2e7; font-size: 24px; font-weight: 500; }
.offset-bookmark { position: absolute; top: 235px; width: 190px; color: var(--bookmark-color); }
.offset-bookmark-disbursements { left: 235px; --bookmark-color: #b4befe; --node-hatch: rgba(203,166,247,.22); }
.offset-bookmark-reconciliation { left: 675px; --bookmark-color: #89b4fa; --node-hatch: rgba(137,180,250,.22); }
.offset-bookmark-tip { width: 0; height: 0; margin: 0 auto; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 12px solid var(--bookmark-color); }
.offset-bookmark-stem { width: 0; height: 28px; margin: 0 auto; border-left: 2px dashed var(--bookmark-color); }
.offset-bookmark-label { width: 190px; }
</style>

<!--
- Offset = bookmark, not event ID
- Independent group checkpoints

[click]
- Reconciliation → 4; Disbursements stuck
- Fetched ≠ committed

[click]
- Disbursements lag: 5 − 1 = 4
- Offsets 1–4 pending
-->

---
class: code-fit
---

````md magic-move {at:1, duration:500}
```go {2-4}
for _, r := range fetches.Records() {
    if err := handleCollectionCompleted(ctx, r); err != nil {
        return err
    }
}
```
```go {6-8}
for _, r := range fetches.Records() {
    if err := handleCollectionCompleted(ctx, r); err != nil {
        return err
    }

    if err := client.CommitRecords(ctx, r); err != nil {
        return err
    }
}
```
````

<!--
- Handle first; failure → stop
[click] Commit r.Offset + 1; auto-commit off; group configured
- Commit failure → stop; replay possible
-->

---

# What if a consumer dies?

---
clicks: 3
---

<RoughDiagram diagram="consumer-failure" :step="$clicks" talk />

<!--
- One group; one partition each
- Transfer A in flight; committed next = 42

[click]
- Consumer 1 dies; P0 waits

[click]
- P0 → Consumer 2; P1/P2 stay put

[click]
- Resume at 42 → Transfer A replayed
- Side effect may already exist: idempotency
-->

---
class: diagram-compact
clicks: 3
---

<RoughDiagram diagram="rebalance" :step="$clicks" talk />

<style>
.slidev-vclick-target { transition: opacity 220ms ease; }
.slidev-vclick-hidden { transform: none; filter: none; }
</style>

<!--
- Two consumers; three partitions
- Slow handlers still risk ownership loss/replay
- Coordinate revocation; blocked polling: work < RebalanceTimeout

[click]
- Consumer 3 joins; assignments initially stay

[click]
- Release P2; P0/P1 continue

[click]
- P2 → Consumer 3
- Cooperative-sticky: fewer moves, not slow-handler safety
-->

---
class: code-lg
---

<div class="group-balancer-example code-focus focus-start-5 focus-lines-1">

````md magic-move {at:1, duration:500}
```go {6}
client, err := kgo.NewClient(
    kgo.SeedBrokers("localhost:9092"),
    kgo.ConsumerGroup("disbursements"),
    kgo.ConsumeTopics("collections"),
    kgo.DisableAutoCommit(),
    kgo.Balancers(kgo.RoundRobinBalancer()),
)
```
```go {6}
client, err := kgo.NewClient(
    kgo.SeedBrokers("localhost:9092"),
    kgo.ConsumerGroup("disbursements"),
    kgo.ConsumeTopics("collections"),
    kgo.DisableAutoCommit(),
    kgo.Balancers(kgo.CooperativeStickyBalancer()),
)
```
````

</div>

<!--
- Round robin: eager

[click]
- Cooperative sticky: fewer moves; default
-->


---
class: diagram-preview-slide
clicks: 5
---

<RoughDiagram diagram="shutdown-service" :step="$clicks" talk />

<!--
- Independent contexts; manual commits; coordinated ownership
[click] Batch fetched: A processing; B/C waiting
[click] SIGTERM cancels pollCtx, not workCtx
[click] A payout succeeds
[click] Commit next 43; B/C remain uncommitted
[click] Close; B/C replay on restart
- Work + commit fit 10s/grace period; failure → replay
-->

---
class: code-lg
---

````md magic-move {at:1, duration:500}
```go {1-3}
// Poll with this context.
pollCtx, stop := signal.NotifyContext(context.Background(),
    os.Interrupt, syscall.SIGTERM)
defer stop()
defer client.Close()
```
```go {1-3|5-7|all}
// Finish the already-polled record independently.
workCtx, cancel := context.WithTimeout(
    context.Background(), 10*time.Second)
err := handleCollectionCompleted(workCtx, r)
if err == nil {
    err = client.CommitRecords(workCtx, r)
}
cancel()
if err != nil { return err }
```
````

<!--
- Excerpts: signal setup once; current record inside loop
- Cancellation → no new poll

[click]
- workCtx: independent root; survives SIGTERM

[click]
- Handle succeeds → commit; auto-commit off

[click]
- 10s illustrative; fit shutdown grace; replay still possible
- Ownership: OnPartitionsRevoked OR BlockRebalanceOnPoll + AllowRebalance
- If blocking: work < RebalanceTimeout; exit via CloseAllowingRebalance
-->

---
clicks: 3
---

<RoughDiagram diagram="bank-crash" :step="$clicks" talk />

<div class="transfer-captions" style="text-align: left; font-size: 24px; line-height: 1.4;">
  <div class="transfer-step" style="font-size: 32px; font-weight: 700;" :style="{ color: ['#a6e3a1', '#f38ba8', '#f38ba8', '#a6e3a1'][Math.min($clicks, 3)] }">{{ ['Bank paid', '1. Crash before commit', '2. Replay without a key', '3. With a stable key'][Math.min($clicks, 3)] }}</div>
  <div class="transfer-detail" style="margin-top: 8px;">{{ ['Payment succeeded. The offset is not committed yet.', 'Disbursements crashes. Kafka still has offset 42 as the next record to read.', 'After restart, Kafka delivers Transfer A again. The bank pays twice.', 'Use the same key on the original call and replay. The bank returns the original result; then commit.'][Math.min($clicks, 3)] }}</div>
</div>

<!--
- Bank paid; commit pending

[click]
- Crash → restart at 42 → replay A

[click]
- No bank-enforced key → paid twice

[click]
- Original + replay: same Transfer A key
- Bank returns original result → commit
- Prevents duplicates; cannot undo one
-->

---
class: diagram-preview-slide
clicks: 4
---

<RoughDiagram diagram="bank-response-lost" :step="$clicks" talk />

<!--
- Separate scenario; stable bank key from first request
[click] Bank pays once
[click] Response lost; timeout ≠ unpaid
[click] Retry same key
[click] Bank returns original result; no second payout
- Requires bank-enforced idempotency, not just a status check
-->

---
class: code-fit
---

<div class="code-focus" :class="$clicks < 2 ? 'focus-start-2 focus-lines-1' : 'focus-start-1 focus-lines-1'">

````md magic-move {at:1, duration:500}
```go {all|2}
// Stable bank payment reference, not the Kafka event ID.
status, err := bank.PaymentStatus(ctx, transferID)
if err != nil {
    return err
}
```
```go {all|2}
if status == "paid" {
    return nil // already paid — skip another payout
}
```
````

</div>


<!--
- Bank API example; payment reference

[click]
- Check bank; error → stop

[click]
- Paid?

[click]
- Paid → skip, commit
- Unknown → reconcile
- Check ≠ atomic; same bank key
-->

---

## What if the bank stays down?

<!--
- Transient → retry; permanent → DLQ
- Timeout: unknown outcome; same bank key
-->

---

<img src="./images/this-is-fine.webp" alt="This is fine: a dog sitting in a burning room" class="retry-meme" />

<!--
- Buffering ≠ recovery
-->

---
class: diagram-compact
---

<div class="retry-overview">

<RoughDiagram diagram="retry" :step="$clicks" talk />

<div class="retry-captions">
  <div v-click.fade-in="1" class="retry-step retry-failure">
    <strong>1. Handling fails</strong>
    <p>Payment unfinished.</p>
  </div>
  <div v-click.fade-in="2" class="retry-step retry-publish">
    <strong>2. Publish retry</strong>
    <p>Wait for acknowledgement.</p>
  </div>
  <div v-click.fade-in="3" class="retry-step retry-commit">
    <strong>3. Commit offset</strong>
    <p>Advance the original checkpoint.</p>
  </div>
  <div v-click.fade-in="4" class="retry-step retry-publish">
    <strong>4. Retry when due</strong>
    <p>A scheduler releases due events.</p>
  </div>
</div>

</div>

<!--
- Backoff + randomized due times; tiers alone ≠ jitter
- Retention > delay + outage + catch-up + margin

[click]
- Handler fails

[click]
- Publish retry; wait for ack

[click]
- Ack → commit original

[click]
- Scheduler releases due records; same handler/IDs
- Retries can reorder; dependent steps wait
-->

---
class: diagram-preview-slide
clicks: 3
---

<RoughDiagram diagram="delayed-retry" :step="$clicks" style="flex-shrink: 0;" talk />

<!--
- Fail 10:00; due 10:05

[click]
- 10:02: Go retry worker sleeps; not Kafka

[click]
- 10:05: eligible

[click]
- Same handler/IDs; main consumer unaffected
-->

---
class: diagram-preview-slide
clicks: 6
---

<RoughDiagram diagram="unordered-retry" :step="$clicks" />

<!--
- Independent transfers; completed events, not same-key ordering
[click] A fails
[click] Publish A to retry → ack → commit; move on
[click] B handled
[click] C handled
[click] D handled
[click] A succeeds on retry
- Next: same-key ordering needs redirect
-->

---
class: code-lg
---

## What travels with a retry?

```yaml {all|4|5-6|7-8|9|all}
topic: disbursements.retry.30m
key:   transfer-a
headers:
  retry-count:     "2"
  original-topic:  disbursements
  original-offset: "1842"
  error:           "bank timeout after 30s"
  retry-at:        "2026-12-18T09:44:03Z"
  traceparent:     "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
```

<!--
- Same key/value; headers change
- Full envelope; code below only updates retry-count/copies headers
- Set origin once; populate error/retry-at/trace explicitly
[click] Count → next tier / attempt cap
[click] Original topic + offset → provenance
[click] Error → investigation; retry-at → due time
[click] Trace → connect retry hops
-->

---
class: diagram-preview-slide
clicks: 5
---

<RoughDiagram diagram="retry-handoff" :step="$clicks" talk />

<!--
- Source next offset stays 42
[click] Publish retry copy
[click] Kafka acknowledges
[click] Crash before source commit
[click] Restart; source replays 42
[click] Republish; two copies, same event ID/payment key
- Publish ACK → source commit is not atomic here
-->

---
class: code-fit
---

````md magic-move {at:1, duration:500}
```go
kgo.ConsumerGroup("disbursements"),
kgo.ConsumeTopics(
    "disbursements.retry.5m",
    "disbursements.retry.30m",
),
kgo.DisableAutoCommit(),
```
````

<!--
- Separate retry group
- Due-time → same handler
- Success → commit; failure → route
-->


---

## What about ordered retries?

---
class: diagram-preview-slide
clicks: 8
---

<RoughDiagram diagram="ordered-retry" :step="$clicks" />

<!--
- Failed key queues; other keys flow
[click] A created fails
[click] Park: retry + `.redirect` entry per event
[click] A updated queues
[click] B handled immediately
[click] A completed queues
[click] Retry: created succeeds
[click] updated handled
[click] completed handled → last tombstone → unpark A
-->

---
clicks: 3
---

<RoughDiagram diagram="redirect-compaction" :step="$clicks" />

<!--
- Parked-key state: all consumers need it
- Time-based deletion loses state; keep-all grows forever
[click] Record key = transfer + event; tombstone each entry
[click] Compaction keeps latest; tombstones eventually expire
[click] Restart/rebalance → rebuild from topic
- State ≈ currently waiting events
-->

---
layout: statement
---

# Need per-key order?

Redirect. Otherwise, plain retry.

---
class: diagram-preview-slide
clicks: 3
---

<RoughDiagram diagram="trace-propagation" :step="$clicks" talk />

<!--
- One trace; different spans; IDs illustrative

[click]
- Inject traceparent into Kafka headers

[click]
- Extract → consumer child span

[click]
- Pass ctx → bank client span
- No bank-side instrumentation assumed
-->

---
class: diagram-preview-slide
clicks: 4
---

<RoughDiagram diagram="trace-waterfall" :step="$clicks" talk />

<!--
- Illustrative timing

[click]
- Bank timeout; attempt ends

[click]
- Five minutes; no open span

[click]
- New trace links failed attempt

[click]
- Bank succeeds; same payment key
- Links need backend support
-->

---
class: code-fit
---

````md magic-move {at:1, duration:500}
```go
// Producer
headers := propagation.MapCarrier{}
propagation.TraceContext{}.Inject(ctx, headers)
for key, value := range headers {
    r.Headers = setHeader(r.Headers, key, value)
}
```
```go
// Consumer
headers := propagation.MapCarrier{}
for _, h := range r.Headers {
    headers[h.Key] = string(h.Value)
}
ctx = propagation.TraceContext{}.Extract(ctx, headers)
```
````

<!--
- Active span; inject → headers

[click]
- Headers → extract; use ctx for consumer span
-->

---
class: diagram-compact
---

<div class="retry-overview dlq-flow">

<RoughDiagram diagram="dlq" :step="$clicks" talk />

<div class="retry-captions" style="grid-template-columns: repeat(4, minmax(0, 1fr));">
  <div v-click.fade-in="1" class="retry-step retry-publish">
    <strong>1. Next retry tier</strong>
    <p>5m fails → count 2 → 30m.</p>
  </div>
  <div v-click.fade-in="2" class="retry-step retry-failure">
    <strong>2. Retries exhausted</strong>
    <p>30m fails → count 3. Stop retrying.</p>
  </div>
  <div v-click.fade-in="3" class="retry-step retry-failure">
    <strong>3. Publish to DLQ</strong>
    <p>Keep Transfer A for investigation.</p>
  </div>
  <div v-click.fade-in="4" class="retry-step retry-commit">
    <strong>4. Commit retry offset</strong>
    <p>After DLQ acknowledgement.</p>
  </div>
</div>

</div>

<!--
- A: .retry.5m, count 1; budget 3

[click]
- 5m fails → count 2 → .retry.30m
- Ack → commit 5m source

[click]
- 30m fails → count 3; budget exhausted

[click]
- Publish DLQ; preserve key/context

[click]
- DLQ ack → commit 30m source
- Inspect → fix → replay
-->

---
class: diagram-preview-slide
clicks: 4
---

<RoughDiagram diagram="dlq-recovery" :step="$clicks" style="flex-shrink: 0;" talk />

<!--
- DLQ ≠ resolved

[click]
- Investigate; event stays parked

[click]
- Fix + deploy

[click]
- Approve + audit replay; same IDs

[click]
- Same handler/bank key
- Success → resolve; respect parked-key order
-->

---
class: code-fit
---

````md magic-move {at:1, duration:500}
```go
if isPermanent(handleErr) {
    return publishDLQAndCommit(ctx, client, r, handleErr)
}

attempt := retryCount(r) + 1
if attempt >= maxAttempts {
    return publishDLQAndCommit(ctx, client, r, handleErr)
}
```
```go
// Replace the retry-count header.
headers := setHeader(r.Headers, "retry-count", strconv.Itoa(attempt))
```
```go
// In reality this isn't hardcoded
topic := "disbursements.retry.5m"
err := client.ProduceSync(ctx, &kgo.Record{
    Topic:   topic,
    Key:     r.Key,
    Value:   r.Value,
    Headers: headers,
}).FirstErr()
```
```go
// do not commit if retry publish failed
if err != nil { return err }
return client.CommitRecords(ctx, r)
```
````

<!--
- Permanent/exhausted → DLQ; transient → retry
- Bad JSON: permanent; wrapped errors: errors.As
- Timeout: unknown outcome; same bank key
- Poison-pill panic: replay loop; capture stack + alert
- DLQ by explicit policy, not every panic
- Count → tier; publish ack → commit; preserve IDs
-->

---

## What if we lose the event?

<!--
- State saved, event lost?
- State + event: one transaction
-->

---
clicks: 3
---

<div class="diagram-explanation">

<RoughDiagram diagram="dual-write" :step="$clicks" talk />

<div class="retry-captions">
  <div v-click.fade-in="1" v-show="$clicks < 3" class="retry-step retry-commit">
    <strong>1. DB committed</strong>
    <p>Collection completion is saved.</p>
  </div>
  <div v-click.fade-in="2" v-show="$clicks < 3" class="retry-step retry-failure">
    <strong>2. Publication fails</strong>
    <p>Event not published.</p>
  </div>
  <div v-show="$clicks >= 3" class="retry-step retry-failure">
    <strong>3. Publish first?</strong>
    <p>DB write fails → ghost event.</p>
    <p>Either order breaks.</p>
  </div>
</div>

</div>

<!--
- Two independent writes

[click]
- DB commits

[click]
- Kafka fails → missing event

[click]
- Publish first + DB fails → ghost event
- Neither order safe → outbox
-->
---
class: diagram-compact
clicks: 4
---

<div class="diagram-explanation">

<RoughDiagram diagram="outbox" :step="$clicks" talk />

<div class="retry-captions">
  <div v-if="$clicks === 0" class="retry-step retry-commit">
    <strong>Save state + event together</strong>
    <p>One DB transaction, then relay to Kafka.</p>
  </div>
  <div v-else-if="$clicks === 1" class="retry-step retry-commit">
    <strong>1. Commit together</strong>
    <p>State and the Transfer A outbox row are saved atomically.</p>
  </div>
  <div v-else-if="$clicks === 2" class="retry-step retry-failure">
    <strong>2. Relay crashes</strong>
    <p>Nothing published yet. The outbox row is still there.</p>
  </div>
  <div v-else-if="$clicks === 3" class="retry-step retry-commit">
    <strong>3. Restart and publish</strong>
    <p>The relay reads the saved row and publishes Transfer A.</p>
  </div>
  <div v-else class="retry-step retry-commit">
    <strong>4. Handle the event</strong>
    <p>Disbursements handles Transfer A. The event survived the crash.</p>
  </div>
</div>

</div>

<!--
- DB: state + event atomic; Kafka publish separate

[click]
- Both commit, or neither

[click]
- Relay crashes; outbox row survives

[click]
- Restart → publish saved event
- Crash after publish can duplicate

[click]
- Disbursements handles A
- No lost-event gap; still need idempotency
-->

---
class: code-fit
---

````md magic-move {at:1, duration:500}
```go
err := pgx.BeginFunc(ctx, db, func(tx pgx.Tx) error {
    tag, err := tx.Exec(ctx,
        `UPDATE collections SET status='completed'
         WHERE id=$1`,
        collection.ID,
    )
    _, err = tx.Exec(ctx,
        `INSERT INTO outbox (topic, key, value)
         VALUES ($1, $2, $3)`,
        "collections",
        collection.ID.String(),
        collectionCompletedJSON,
    )
}
```
````

<!--
- Charge already confirmed
- Update + insert: commit/rollback together
-->

---

<div class="retry-overview">

<RoughDiagram diagram="relay-shapes" :step="$clicks" talk />

<div class="retry-captions">
  <div v-click.fade-in="1" class="retry-step retry-publish">
    <strong>1. Publish</strong>
    <p>Poll durable outbox rows.</p>
  </div>
  <div v-click.fade-in="2" class="retry-step retry-commit">
    <strong>2. Delete + commit</strong>
    <p>After Kafka acknowledgement.</p>
  </div>
  <div v-click.fade-in="3" class="retry-step retry-failure">
    <strong>3. Keep + retry</strong>
    <p>Publish fails: keep the row.</p>
  </div>
  <div v-click.fade-in="4" class="retry-step retry-failure">
    <strong>4. Duplicate risk</strong>
    <p>Crash before commit: may publish twice.</p>
  </div>
</div>

</div>

<!--
- Outbox relay

[click]
- Lock → publish

[click]
- Delete → commit

[click]
- Failure → rollback/retry

[click]
- Crash after publish → duplicate
-->

---
class: code-lg
---

<div class="code-focus" :style="{ '--focus-start': [5, 1, 1, 2, 8][Math.min($clicks, 4)], '--focus-lines': 1 }">

````md magic-move {at:1, duration:500}
```go {6}
const pollOutbox = `
SELECT id, topic, key, value, headers
FROM outbox
ORDER BY created_at
LIMIT $1
FOR UPDATE SKIP LOCKED`
```
```go {2}
// Inside pgx.BeginFunc: errors roll back the transaction.
rows, err := tx.Query(ctx, pollOutbox, 100)
if err != nil {
    return err
}

messages, err := pgx.CollectRows(rows, scan)
if err != nil {
    return err
}
```
```go {2}
// For each message, inside the same transaction.
if err := publish(ctx, client, m); err != nil {
    return err
}
```
```go {3}
// After Kafka acknowledges this message.
if _, err := tx.Exec(ctx,
    `DELETE FROM outbox WHERE id=$1`, m.ID,
); err != nil {
    return err
}

// After the loop: return nil from the transaction callback.
return nil // BeginFunc commits
```
```go {9}
for {
    if err := drainBatch(ctx); err != nil {
        logErrs(err)
    }

    select {
    case <-ctx.Done():
        return ctx.Err()
    case <-time.After(time.Second):
    }
}
```
````

</div>

<!--
- Excerpts: batch inside pgx.BeginFunc
- SKIP LOCKED: relays claim different rows

[click]
- Transaction: lock + read; error → rollback

[click]
- Each row: publish → wait for ack
- Publish fails → keep row

[click]
- Delete after ack; nil → DB commit
- Crash before DB commit → duplicate risk

[click]
- Poll delay; cancellation exits
- Concurrent relays can reorder
-->

---
layout: statement
---

# Is recovery working?

---
clicks: 3
---

<h2>{{ ['Consumer lag', 'Outbox age', 'Retry backlog', 'Unresolved DLQ'][Math.min($clicks, 3)] }}</h2>

<RoughDiagram diagram="metric-overview" :step="$clicks" talk />

<p style="text-align: center; font-size: 28px;">{{ ['47 − 42 = 5 records behind.', 'Oldest unpublished row: 09:00 → 09:05 = 5 minutes.', '12 events waiting to retry.', '12 unresolved events need investigation.'][Math.min($clicks, 3)] }}</p>

<!--
- Illustrative metrics
- Lag: exclusive log end 47 − committed next 42 = 5
- Includes in-flight / commit-pending work

[click]
- Oldest unpublished: 09:00 → 09:05 = 5m
- Rising age → relay trouble

[click]
- Backlog 12 ≠ retry-count header
- Due times; arrival/drain + routing rates

[click]
- DLQ: unresolved work, not retained topic size
- Inspect → fix → deliberate replay
-->

---

## Takeaways

- Idempotent consumers
- Retries and DLQ
- Order in partitions
- Monitor key metrics

---

## Thanks!

<img class="thanks-qr" src="./images/qrcode.jpeg" alt="Presentation QR code" />


<!--
-->

---


* Slides: <https://haseebmajid.dev/slides/go-labs-eda-go-kafka>
* Repo: <https://gitlab.com/hmajid2301/blog>

---

## Appendix

* <https://www.gentlydownthe.stream/> — Kafka, illustrated


