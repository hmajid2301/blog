---
title: "Observability Made Painless: Go, OTel & LGTM Stack"
canonicalURL: https://haseebmajid.dev/talks/gophercon-otel/
date: 2024-12-15
cover:
  image: images/cover.png
ShowToc: false
ShowReadingTime: false
ShowWordCount: false
hideMeta: false
---

Transform your Go web service and instrument it using OpenTelemetry and the LGTM stack. Learn why observability is critical in microservices and how OpenTelemetry (otel) solves vendor lock-in. We'll instrument a Go application to generate traces (HTTP, Postgres, Redis), metrics, and structured logs (using slog), then visualize them in Grafana with the LGTM stack (Loki, Grafana, Tempo, Mimir), with a bit of otel-collector on the side.

By the end, you'll understand:
- When to use traces vs. metrics vs. logs
- How to instrument Go services pragmatically
- Why context.Context is essential for observability
- Best practices for scalable telemetry

No PhD required

{{< youtube id="TBD" >}}

- [Abstract](https://www.gophercon.com/agenda/session/1234567)
- [Related Code](examples/)
- [Slides](https://haseebmajid.dev/slides/gophercon-otel/)
- [PDF](https://gitlab.com/hmajid2301/blog/-/blob/main/content/slides/gophercon-otel/slides.pdf)

## Photo from conference

![GopherCon OTEL Talk](images/talk.jpg)
