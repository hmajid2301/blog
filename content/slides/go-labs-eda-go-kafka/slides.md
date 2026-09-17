---
theme: default
title: "Building Resilient Event-Driven Architectures (EDA) with Go and Kafka"
author: Haseeb Majid
presenter: true
browserExporter: dev
record: dev
wakeLock: true
overviewSnapshots: true
download: false
lineNumbers: true
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

# Building Resilient Event-Driven Architectures with Go and Kafka

<div class="mt-6 text-lg opacity-80">Haseeb Majid · Go Labs</div>


---

## Introduction

- Haseeb Majid
  - Backend Software Engineer at [Nala](https://www.nala.com/)
  - <https://haseebmajid.dev>
- Loves cats 🐱
- Avid cricketer 🏏 #BazBall

<!--
-->

---

## Why EDA?

```mermaid
flowchart LR
    A["Order Service"] -- Calls --> B["Inventory Service"]
    B -- Calls --> C["Email Service"]

    classDef svcA fill:#89b4fa,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    classDef svcB fill:#fab387,stroke:#f9e2af,stroke-width:4px,color:#1e1e2e;
    classDef svcC fill:#cba6f7,stroke:#b4befe,stroke-width:4px,color:#1e1e2e;

    class A svcA;
    class B svcB;
    class C svcC;
```

<!--
-->

---

<img src="/fail.jpeg" class="w-full h-90 object-contain rounded shadow-lg" />

<!--
-->

---
layout: two-cols-header
---

::left::

<div class="text-center text-2xl font-bold mb-2">HTTP</div>

```mermaid
flowchart LR
    API["Order API"] -- "create order" --> S1["Order service"]
    S1 -- "request" --> S2["Inventory service"]
    S2 -- "response" --> S1
    S1 -- "response" --> API

    classDef svcA fill:#89b4fa,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    classDef svcB fill:#fab387,stroke:#f9e2af,stroke-width:4px,color:#1e1e2e;
    classDef client fill:#cdd6f4,stroke:#9399b2,stroke-width:4px,color:#1e1e2e;

    class S1 svcA;
    class S2 svcB;
    class API client;
```

::right::

<div class="text-center text-2xl font-bold mb-2">Kafka</div>

```mermaid
flowchart LR
    P["Order API"] -->|"orders.created.v1"| T[("orders topic")]
    T --> C1["Inventory consumer"]
    T --> C2["Email consumer"]

    classDef producer fill:#89b4fa,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    classDef topic fill:#f9e2af,stroke:#fab387,stroke-width:4px,color:#1e1e2e;
    classDef consumer1 fill:#94e2d5,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    classDef consumer2 fill:#cba6f7,stroke:#b4befe,stroke-width:4px,color:#1e1e2e;

    class P producer;
    class T topic;
    class C1 consumer1;
    class C2 consumer2;
```

<!--
-->

---

## Kafka Basics

- Events: basic units of data
- Topics: events are organized into topics
- Partitions: allow us to scale topics

---

- Producer: publishes event to topic
- Consumer: subscribes to topic and receives events

<!--
Kafka is a distributed event-streaming platform. It stores events durably in topics, which are split into partitions for scale. Producers publish events; consumers read them. The name comes from writer Franz Kafka.
-->

---

```mermaid
flowchart LR
    subgraph T["Topic: orders"]
      direction TB
      P0["Partition 0"]
      P1["Partition 1"]
      P2["Partition 2"]
    end

    subgraph G["Consumer Group: inventory"]
      direction TB
      C1["Consumer A"]
      C2["Consumer B"]
    end

    P0 -->|assigned| C1
    P2 -->|assigned| C1
    P1 -->|assigned| C2

    classDef topic fill:#2b2633,stroke:#fab387,stroke-width:3px,color:#e6e9f7;
    classDef group fill:#242938,stroke:#b4befe,stroke-width:3px,color:#e6e9f7;
    classDef a fill:#243047,stroke:#89b4fa,stroke-width:4px,color:#e6e9f7;
    classDef b fill:#33283a,stroke:#f5c2e7,stroke-width:4px,color:#e6e9f7;

    class T topic;
    class G group;
    class P0,P2,C1 a;
    class P1,C2 b;
    linkStyle 0,1 stroke:#89b4fa,stroke-width:4px;
    linkStyle 2 stroke:#94e2d5,stroke-width:4px;
```

<!--
One consumer group splits the partitions. A partition is assigned to exactly one consumer in the group, but one consumer can handle multiple partitions.
-->

---

```mermaid
flowchart LR
    subgraph P0["orders topic · partition 0"]
      direction LR
      O0["offset 0"] --> O1["offset 1"] --> O2["offset 2"] --> O3["offset 3"] --> O4["offset 4"]
    end

    EMAIL["Email consumer\nnext = 1"] -.-> O1
    INV["Inventory consumer\nnext = 3"] -.-> O3

    classDef topic fill:#242938,stroke:#fab387,stroke-width:3px,color:#e6e9f7;
    classDef old fill:#243047,stroke:#89b4fa,stroke-width:3px,color:#e6e9f7;
    classDef inventory fill:#243047,stroke:#89b4fa,stroke-width:4px,color:#e6e9f7;
    classDef email fill:#33283a,stroke:#f5c2e7,stroke-width:4px,color:#e6e9f7;
    classDef future fill:#2b2633,stroke:#fab387,stroke-width:3px,color:#e6e9f7;

    class P0 topic;
    class O0,O2 old;
    class O3,INV inventory;
    class O1,EMAIL email;
    class O4 future;
```

<!--
Each consumer group tracks its own committed offset. Inventory can be at offset 3 while email is still at offset 1. Kafka keeps the same log; each group records a different read position. Lag is unread events after that group's committed offset.
-->

---

```mermaid
flowchart LR
    subgraph T["Topic: orders"]
      direction LR
      subgraph P0["Partition 0"]
        direction TB
        P0S0["000.log\nEvent 1\nEvent 4\n..."] --> P0S1["001.log\n..."]
      end
      subgraph P1["Partition 1"]
        direction TB
        P1S0["000.log\nEvent 2\nEvent 5\n..."] --> P1S1["001.log\n..."]
      end
      subgraph P2["Partition 2"]
        direction TB
        P2S0["000.log\nEvent 3\nEvent 6\n..."] --> P2S1["001.log\n..."]
      end
      P0 ~~~ P1
      P1 ~~~ P2
    end

    style T fill:#2b3040,stroke:#fab387,stroke-width:4px,color:#f9e2af;
    style P0 fill:#45475a,stroke:#89b4fa,stroke-width:2px,color:#e6e9f7;
    style P1 fill:#45475a,stroke:#a6e3a1,stroke-width:2px,color:#e6e9f7;
    style P2 fill:#45475a,stroke:#f5c2e7,stroke-width:2px,color:#e6e9f7;

    classDef p0 fill:#bfe3ff,stroke:#74c7ec,stroke-width:3px,color:#11111b;
    classDef p1 fill:#b9f6ca,stroke:#94e2d5,stroke-width:3px,color:#11111b;
    classDef p2 fill:#ffd6f7,stroke:#cba6f7,stroke-width:3px,color:#11111b;

    class P0S0,P0S1 p0;
    class P1S0,P1S1 p1;
    class P2S0,P2S1 p2;

    linkStyle 0,1,2 stroke:#9399b2,stroke-width:2px;
    linkStyle 3,4 stroke:#00000000,stroke-width:0px;
```


<!--
-->

---

## Delivery semantics

* At most once: may lose records, avoids duplicates
* At least once: retries records, duplicates are possible
* Exactly once: conditional on Kafka transactions

> Exactly-once Kafka delivery does not make external DB writes idempotent.

<!--
-->

---

# Kafka and Go

---

## One producer, many consumers

```mermaid
flowchart LR
    A["Service A"] -->|"order.created"| T[("orders topic")]
    T --> B["Service B: inventory"]
    T --> C["Service C: email"]

    classDef producer fill:#89b4fa,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    classDef topic fill:#f9e2af,stroke:#fab387,stroke-width:4px,color:#1e1e2e;
    classDef inventory fill:#94e2d5,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    classDef email fill:#cba6f7,stroke:#b4befe,stroke-width:4px,color:#1e1e2e;

    class A producer;
    class T topic;
    class B inventory;
    class C email;
```

<!--
-->

---
class: code-lg
---

## Event envelope

```go {1-9|all}
type Event struct {
    ID            uuid.UUID       `json:"id"`
    Type          string          `json:"type"`
    Source        string          `json:"source"`
    CorrelationID string          `json:"correlation_id"`
    Time          time.Time       `json:"time"`
    SchemaVersion int             `json:"schema_version"`
    Payload       json.RawMessage `json:"payload"`
}

const (
    TypeOrderCreated    = "orders.created.v1"
    TypeInventoryDeduct = "orders.inventory-deducted.v1"
)
```

<!--
* Switch to Protobuf when you need smaller payloads and a schema registry.
* Payload as `json.RawMessage` / `[]byte` keeps the envelope format-agnostic.
-->

---

## Envelope vs payload

```mermaid
flowchart LR
    RAW["Kafka record<br/>JSON bytes"] --> ENV["Event envelope<br/>stable metadata"]
    ENV --> META["id · type · source<br/>time · version"]
    ENV --> PAYLOAD["payload<br/>event-specific JSON"]

    classDef raw fill:#243047,stroke:#89b4fa,stroke-width:7px,color:#e6e9f7;
    classDef env fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef meta fill:#322842,stroke:#cba6f7,stroke-width:7px,color:#e6e9f7;
    classDef payload fill:#213d3b,stroke:#94e2d5,stroke-width:7px,color:#e6e9f7;

    class RAW raw;
    class ENV env;
    class META meta;
    class PAYLOAD payload;
```

```json
{
  "type": "orders.created.v1",
  "payload": { "order_id": "ord_123", "total": 4200 }
}
```

<!--
* The envelope is the part every event shares.
* The payload is the part that changes depending on what happened.
* JSON is useful here because it is easy to inspect in logs, CLI tools, and demos.
* `json.RawMessage` delays decoding. First decode the envelope, then decode the payload after you know the event type.
* This avoids a giant Go struct containing fields for every possible event.
-->

---
class: code-lg
---

## Decode by event type

```go {1-5|7-10|12-16|all}
type OrderCreated struct {
    OrderID string `json:"order_id"`
    UserID  string `json:"user_id"`
    Total   int64  `json:"total"`
}

var e Event
if err := json.Unmarshal(data, &e); err != nil { return err }

switch e.Type {
case TypeOrderCreated:
    var p OrderCreated
    if err := json.Unmarshal(e.Payload, &p); err != nil { return err }
    return handleOrderCreated(e, p)
}
```

<!--
* Consumers should not guess the payload shape from field names.
* The `type` is the routing key inside the message: `orders.created.v1`, `orders.cancelled.v1`, `orders.shipped.v1`.
* The version suffix matters because events are long-lived contracts.
* Producers and consumers deploy independently. New consumers may replay old events; old consumers may see new messages.
* Adding optional fields is usually safe. Removing fields, renaming fields, or changing meaning is a breaking change.
* For breaking changes, publish a new event type such as `orders.created.v2` and let consumers migrate deliberately.
-->

---
class: code-lg
---

## franz-go: handle records

```go {1-5|7-12|13-16|all}
client, _ := kgo.NewClient(
    kgo.SeedBrokers("localhost:9092"),
    kgo.ConsumerGroup("inventory-service"),
    kgo.ConsumeTopics("orders"),
    kgo.DisableAutoCommit(),
)

fetches := client.PollFetches(ctx)
fetches.EachRecord(func(r *kgo.Record) {
    if err := handle(r.Value); err != nil {
        log.Printf("handle failed: %v", err)
        return // no commit; Kafka will redeliver
    }

    if err := client.CommitRecords(ctx, r); err != nil {
        log.Printf("commit failed: %v", err)
    }
})
```

<!--
* `r.Value` is the raw bytes from Kafka. In our case those bytes are the JSON event envelope.
* The `handle` function from the previous slide decodes the envelope, switches on `e.Type`, and decodes the payload into the right struct.
* Disable auto-commit when you want explicit at-least-once processing.
* Process the message first, then commit the offset.
* If `handle` fails, we return without committing. Kafka can deliver the record again later.
* If processing succeeds but commit fails, the message may be processed again. That is why idempotent consumers matter.
-->

---
class: code-lg
---

## Producer setup

```go {1-8|4|5|6-8|all}
client, err := kgo.NewClient(
    kgo.SeedBrokers("localhost:9092"),
    kgo.DefaultProduceTopic("orders"),
    kgo.RequiredAcks(kgo.AllISRAcks()),
    kgo.ProducerBatchCompression(kgo.ZstdCompression()),
    kgo.RetryBackoffFn(func(_ int) time.Duration {
        return 100 * time.Millisecond
    }),
)
if err != nil { return err }

defer func() {
    client.Flush(ctx) // flush pending records first
    client.Close()
}()
```

<!--
Required acknowledgements, retries, compression, and graceful shutdown are the important producer choices here.
-->

---
class: code-lg
---

## Consume and commit

```go {1-4|6-11|all}
client, _ := kgo.NewClient(
    kgo.ConsumerGroup("inventory-service"),
    kgo.ConsumeTopics("orders"),
    kgo.DisableAutoCommit(),
)

for {
    fetches := client.PollFetches(ctx)
    if errs := fetches.Errors(); len(errs) > 0 { logErrors(errs); continue }

    fetches.EachRecord(func(r *kgo.Record) {
        if err := handle(ctx, r); err != nil { return } // retry; do not commit
        if err := client.CommitRecords(ctx, []*kgo.Record{r}); err != nil {
            logErrors([]error{err})
        }
    })
}
```

<!--
At-least-once processing: handle the record first, then commit its offset.
-->

---

## Cooperative rebalancing

```mermaid
flowchart LR
    subgraph before["Before rebalance"]
        direction TB
        A["Consumer A<br/>P0 · P1"]
        B["Consumer B<br/>P2 · P3"]
    end

    subgraph after["Revoke only what moves"]
        direction TB
        A2["Consumer A<br/>P0 · P1"]
        B2["Consumer B<br/>P3"]
        C["Consumer C<br/>P2"]
    end

    A --> A2
    B --> B2
    B -. "P2 moves" .-> C

    classDef consumer fill:#243047,stroke:#89b4fa,stroke-width:7px,color:#e6e9f7;
    classDef moved fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef newc fill:#213d3b,stroke:#94e2d5,stroke-width:7px,color:#e6e9f7;
    classDef group fill:#181825,stroke:#6c7086,stroke-width:5px,color:#cdd6f4;

    class A,A2,B,B2 consumer;
    class C newc;
    class before,after group;
```

<!--
-->

---
class: diagram-compact
---

## Retry and DLQ topics

```mermaid
flowchart LR
    ORD[("orders
topic")] --> CON["Consumer
handle event"]
    CON -->|"success"| COMMIT["Commit
offset"]
    CON -->|"retryable error"| RETRY[("orders.retry
topic")]
    RETRY -->|"later"| CON
    CON -->|"max attempts"| DLQ[("orders.dlq
topic")]
    DLQ --> OPS["Inspect
fix / replay"]
    RETRY --> RCOMMIT["Commit
original"]
    DLQ --> DCOMMIT["Commit
original"]

    classDef topic fill:#403820,stroke:#f9e2af,stroke-width:7px,color:#e6e9f7;
    classDef consumer fill:#243047,stroke:#89b4fa,stroke-width:7px,color:#e6e9f7;
    classDef retry fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef dlq fill:#3a2430,stroke:#f38ba8,stroke-width:7px,color:#e6e9f7;
    classDef commit fill:#322842,stroke:#cba6f7,stroke-width:7px,color:#e6e9f7;
    classDef ops fill:#213d3b,stroke:#94e2d5,stroke-width:7px,color:#e6e9f7;

    class ORD topic;
    class RETRY retry;
    class CON consumer;
    class DLQ dlq;
    class COMMIT,RCOMMIT,DCOMMIT commit;
    class OPS ops;
```

<!--
* This shows retries as topics, not just a loop inside one consumer.
* The normal path is `orders topic -> consumer -> commit`.
* On a retryable error, publish to `orders.retry`, then commit the original offset. That prevents one bad message from blocking the partition forever.
* Keep the main picture linear: normal topic, retry topic, DLQ topic.
* A retry worker can do the delay and send records back to the normal handler.
* After max attempts, publish to `orders.dlq` and commit the original offset.
* The DLQ is not the end of the story. It should be monitored, inspected, fixed, and sometimes replayed.
* If publishing to retry/DLQ fails, do not commit the original record. Otherwise the failure disappears.
-->

---
class: diagram-compact
---

```mermaid
flowchart LR
    CON["Consumer\nhandle event"] -->|"error"| HDR["Add headers\nretry-count: 3\nretry-after: 12:05"]
    HDR --> RETRY[("orders.retry\ntopic")]
    RETRY --> WORKER["Retry worker\nwait until retry-after"]
    WORKER -->|"ready"| ORD[("orders\ntopic")]
    WORKER -->|"too many"| DLQ[("orders.dlq\ntopic")]

    classDef consumer fill:#243047,stroke:#89b4fa,stroke-width:7px,color:#e6e9f7;
    classDef header fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef retry fill:#403820,stroke:#f9e2af,stroke-width:7px,color:#e6e9f7;
    classDef worker fill:#322842,stroke:#cba6f7,stroke-width:7px,color:#e6e9f7;
    classDef dlq fill:#3a2430,stroke:#f38ba8,stroke-width:7px,color:#e6e9f7;

    class CON consumer;
    class HDR header;
    class RETRY,ORD retry;
    class WORKER worker;
    class DLQ dlq;
```

<!--
* The simple version can use a fixed delay. Exponential backoff just changes how we calculate the next `retry-after` timestamp.
* Example: attempt 1 waits 100ms, attempt 2 waits 200ms, attempt 3 waits 400ms, then cap at a max delay.
* Add jitter so all retries do not fire at the same time.
* The retry worker should not process messages before `retry-after`.
* If you keep one retry topic, the worker may need to requeue messages that are not ready yet.
* Another design is retry buckets: `orders.retry.1m`, `orders.retry.5m`, `orders.retry.30m`.
* The slide stays simple; the important idea is that the delay lives in metadata, not in the main consumer loop.
-->

---
class: code-fit
---

## Retry headers in code

```go {1-4|6-11|13-18|all}
attempt := retryCount(r) + 1
retryAt := time.Now().Add(backoff(attempt))
if attempt >= maxAttempts {
    return publishDLQ(ctx, client, r, handleErr)
}

headers := append(r.Headers,
    header("retry-count", strconv.Itoa(attempt)),
    header("retry-after", retryAt.Format(time.RFC3339)),
)

err := client.ProduceSync(ctx, &kgo.Record{
    Topic:   "orders.retry",
    Key:     r.Key,
    Value:   r.Value,
    Headers: headers,
}).FirstErr()
if err != nil { return err } // do not commit if retry publish failed
return client.CommitRecords(ctx, r)
```

<!--
-->

---

## Outbox

---

```mermaid
flowchart LR
    API["Order API"] -->|"1. write order"| DB[("Orders DB")]
    API -->|"2. publish orders.created.v1"| KAFKA[("Kafka")]
    DB -. "committed" .-> API
    KAFKA -. "network error" .-> API

    classDef app fill:#89b4fa,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    classDef db fill:#a6e3a1,stroke:#94e2d5,stroke-width:4px,color:#1e1e2e;
    classDef kafka fill:#f38ba8,stroke:#fab387,stroke-width:4px,color:#1e1e2e;

    class API app;
    class DB db;
    class KAFKA kafka;
```


<!--
* Two independent writes: database commit + Kafka publish.
* If the publish fails, the database changed but the event is never sent.
* The outbox makes the event part of the same transaction as the state change.
-->
---

## Outbox pattern

```mermaid
flowchart LR
    API["Order API<br/>create order"] --> TX["write order<br/>+ outbox event"]
    TX --> DB[("Orders DB")]
    TX --> OUT["Outbox"]
    OUT --> PUB["Publisher<br/>poll + publish"]
    PUB --> T[("Kafka<br/>orders topic")]
    T --> CON["Inventory<br/>consumer"]

    classDef app fill:#243047,stroke:#89b4fa,stroke-width:7px,color:#e6e9f7;
    classDef tx fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef db fill:#263a2a,stroke:#a6e3a1,stroke-width:7px,color:#e6e9f7;
    classDef storage fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef publisher fill:#322842,stroke:#cba6f7,stroke-width:7px,color:#e6e9f7;
    classDef kafka fill:#403820,stroke:#f9e2af,stroke-width:7px,color:#e6e9f7;
    classDef consumer fill:#213d3b,stroke:#94e2d5,stroke-width:7px,color:#e6e9f7;

    class API app;
    class TX tx;
    class DB db;
    class OUT storage;
    class PUB publisher;
    class T kafka;
    class CON consumer;
```

<!--
-->

---

```mermaid
flowchart LR
    API["Order API<br/>create order"] --> TX["write order<br/>+ outbox event"]
    TX --> DB[("Orders DB")]
    TX --> OUT["Outbox"]
    OUT --> PUB["Publisher<br/>poll + publish"]
    PUB --> K[("Kafka<br/>orders topic")]
    K --> INV["Inventory<br/>consumer"]
    K --> EMAIL["Email<br/>consumer"]
    INV --> IDB[("Inventory DB<br/>+ dedupe")]
    EMAIL --> EDB[("Email DB<br/>+ dedupe")]

    classDef api fill:#243047,stroke:#89b4fa,stroke-width:7px,color:#e6e9f7;
    classDef tx fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef db fill:#263a2a,stroke:#a6e3a1,stroke-width:7px,color:#e6e9f7;
    classDef out fill:#3a2d22,stroke:#fab387,stroke-width:7px,color:#e6e9f7;
    classDef publisher fill:#322842,stroke:#cba6f7,stroke-width:7px,color:#e6e9f7;
    classDef kafka fill:#403820,stroke:#f9e2af,stroke-width:7px,color:#e6e9f7;
    classDef consumer fill:#213d3b,stroke:#94e2d5,stroke-width:7px,color:#e6e9f7;

    class API api;
    class TX tx;
    class DB,IDB,EDB db;
    class OUT out;
    class PUB publisher;
    class K kafka;
    class INV,EMAIL consumer;
```


<!--
* Orders DB and outbox row commit together.
* Publisher retries until Kafka accepts event.
* Consumers process idempotently, then commit offsets.
-->

---
class: code-fit
---

## Outbox: atomic write

```sql
CREATE TABLE outbox (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topic      text NOT NULL,
    key        text NOT NULL,
    value      jsonb NOT NULL,
    headers    jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

```go {1-7|8-11|all}
err := db.BeginFunc(ctx, func(tx pgx.Tx) error {
    if _, err := tx.Exec(ctx,
        "INSERT INTO orders (id, total) VALUES ($1, $2)",
        order.ID, order.Total); err != nil { return err }

    _, err := tx.Exec(ctx,
        "INSERT INTO outbox (topic, key, value) VALUES ($1, $2, $3)",
        "orders", order.ID, orderJSON)
    return err
})
```

<!--
-->

---

```mermaid
flowchart LR
    OUT["Committed<br/>outbox row"] --> CLAIM["Begin DB tx<br/>claim batch"]
    CLAIM --> PUB["Publish event<br/>to Kafka"]
    PUB -->|success| DELETE["Delete<br/>outbox row"]
    DELETE --> COMMIT["Commit<br/>DB tx"]
    PUB -->|failure| KEEP["Rollback<br/>row remains"]
    PUB -. "crash" .-> DUP["Row remains<br/>may publish again"]

    classDef source fill:#fab387,stroke:#f9e2af,stroke-width:4px,color:#1e1e2e;
    classDef tx fill:#cba6f7,stroke:#b4befe,stroke-width:4px,color:#1e1e2e;
    classDef kafka fill:#f9e2af,stroke:#fab387,stroke-width:4px,color:#1e1e2e;
    classDef success fill:#a6e3a1,stroke:#94e2d5,stroke-width:4px,color:#1e1e2e;
    classDef failure fill:#f38ba8,stroke:#fab387,stroke-width:4px,color:#1e1e2e;

    class OUT source;
    class CLAIM tx;
    class PUB kafka;
    class DELETE,COMMIT success;
    class KEEP,DUP failure;
```

<!--
The forwarder drains durable outbox rows. It locks a batch, publishes each event, deletes successful rows, and commits. If Kafka fails, rollback leaves the row for retry. If the process crashes after Kafka accepts the event but before the delete commits, the row is published again. This is at-least-once delivery, so consumers need idempotency.
-->

---
class: code-fit
---

## Outbox: forwarder

```go {1-4|6-12|all}
const pollOutbox = `SELECT id, topic, key, value, headers
FROM outbox ORDER BY created_at
LIMIT $1 FOR UPDATE SKIP LOCKED`

for {
    tx, _ := db.Begin(ctx)
    rows, _ := tx.Query(ctx, pollOutbox, 100)
    for rows.Next() {
        m := scan(rows)
        if err := publish(ctx, client, m); err != nil { return err }
        tx.Exec(ctx, `DELETE FROM outbox WHERE id=$1`, m.ID)
    }
    tx.Commit(ctx)
}
```

<!--
-->

---

## Operate the system: four signals

```mermaid
flowchart TB
    LAG["Consumer lag<br/>keeping up?"]
    AGE["Outbox age<br/>events delayed?"]
    RETRY["Retry count<br/>repeating failures?"]
    DLQ["DLQ depth<br/>needs attention?"]

    classDef signal fill:#89b4fa,stroke:#74c7ec,stroke-width:4px,color:#1e1e2e;
    class LAG,AGE,RETRY,DLQ signal;
```

<!--
Consumer lag shows whether consumers keep up. Outbox age shows whether publishing is delayed. Retry count shows recurring downstream failures. DLQ depth and age show failures that need human action. These metrics turn delayed event failures into visible operational signals.
-->

---

## Where EDA bites

* Poison messages
* Out-of-order events
* Duplicate processing
* Schema drift

<!--
-->

---

## When not to use Kafka

- Simple request/response fits HTTP better.
- Low traffic?
  - Postgres (Watermill)

<!--
- Eventually consisten
- Harder to debug
- Postgres
-->

---

## Summary

* EDA can decouple services

<!--
-->

---

## Thanks!

* Slides: <https://haseebmajid.dev/slides/go-labs-eda-go-kafka>
* Repo: <https://gitlab.com/hmajid2301/blog>
* Questions?

<!--
-->
