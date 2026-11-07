# From Python to Go: Concurrency Without the Surprises

- **Author:** Haseeb Majid.
- **Audience:** Python developers, little or no Go experience. Introduce syntax
  immediately before it is needed; no concurrency API knowledge assumed.
- **Thesis:** Teach core Go through the story of rewriting a working Python
  service. Introduce packages, types, errors and tooling as the rewrite needs them;
  use diagrams to explain goroutines, scheduling and channel communication.
- **Takeaway:** Understand how Go's pieces fit together well enough to use them
  in a service, rather than memorizing syntax or a worker-pool recipe.
- **Guiding questions:** How do we express this service in Go, run it, understand
  its concurrent work, test its behavior and build an executable? Ownership,
  bounds, cancellation and joining make that rewrite complete.
- **Story discipline:** One local `POST /checks` service. Concrete problem →
  small code → visible evidence → fix → takeaway. No cross-language speed claim.
  Python already supports overlapping I/O. Examples are loopback teaching services,
  not production templates or an arbitrary-URL proxy.

## Expanded working route (~52 minutes; trim after rehearsal)

| Budget | Purpose |
| --- | --- |
| 00:00–01:30 | Promise and three-chapter roadmap |
| 01:30–47:30 | Expanded service story in `pages/service-story.md` |
| 47:30–48:15 | Ownership/lifetime recap |
| 48:15–52:00 | Q&A |

This is a provisional working budget, not a claim that the expanded material
still fits 30 minutes. The author asked to expand first and cut later.

Chapters, in order:

1. **01 · the service we have:** observe serial waiting in Python; acknowledge
   threads/async as valid alternatives.
2. **02 · the service we rewrite:** open the project in a Neovim-style view,
   group files into a package and module,
   connect an import, preserve HTTP/JSON behavior, and translate sequentially.
   Trace `go run . -serve -sequential` from source to a running service before
   revealing why spawning/joining alone doesn't protect results.
   Five animated runtime scenes explain G/M/P, GOMAXPROCS, pollable I/O,
   blocking syscalls and illustrative work stealing. Channel rendezvous and
   buffered-backpressure scenes connect the runtime model to ownership and bounds.
   One collector and fixed workers make ownership and capacity visible.
3. **03 · the service we can trust:** follow the caller's context into every
   blocking boundary, animate channel close-and-drain and select readiness,
   join before closure, separate URL failure from batch failure, and show existing
   race-suite and local service evidence. Introduce `go test ./...` before the
   evidence, then trace `go build -o checker .` to a named executable and explicitly
   start it with `./checker -serve`. Tooling is part of the service story, not a
   separate command-reference lecture.

The runtime drawings are teaching schedules, not measurements or ordering
promises. P means runtime execution resources, not CPU core. GOMAXPROCS limits
simultaneous user Go execution, not total threads/goroutines. Network readiness
makes a parked G runnable, not guaranteed to execute next. A blocking syscall
may occupy an M while its P is handed off/retaken; not every syscall does so
immediately. Work stealing is illustrative, not the complete scheduler.

The service still uses unbuffered jobs/results. A buffered queue is explicitly
an alternative. A handoff doesn't mean processing finished; closing doesn't
discard buffered values or cancel/join work; select doesn't prioritize cancellation.
Authoritative references accompany each animated slide's notes.

Leave the six appendix slides untimed. If behind, the body's final ownership slide
can replace the closing recap; keep at least three minutes for questions.

## Demo and fallback

From `examples/`, `python3 demo.py` builds and runs all three service stages using
only local fixtures. Requirements: Go 1.22+, Python 3, free loopback ports 9099,
18080 and 18081. Rehearse once; do not depend on public targets or conference Wi-Fi.

Fallback: open `examples/demo-output.txt` and `examples/verification-output.txt`,
or use the slides' explicitly normalized excerpts. Do not invent timings. The
measured fixture peak demonstrates overlapping waits, not general throughput.
The existing suite tests the pool/checker, not the new HTTP boundary.

Keep limitations explicit: two workers per incoming batch, not globally; O(n)
finite inputs/results; no rate limiter; cooperative cancellation; Python baseline
has no batch/disconnect guarantee. A remote server may keep working after our
request is cancelled. New service Go deadlines are a deliberate improvement,
not an assertion that every lifecycle behavior is identical.

## Structural reference

Davide Imola's [securing-go/TALK.md](https://github.com/davideimola/presentations/blob/main/securing-go/TALK.md)
and [src/slides.md](https://github.com/davideimola/presentations/blob/main/securing-go/src/slides.md)
are references for story/evidence rhythm and three-chapter pacing, not a source of
copied personal identity, claims or artwork. The SVG implementation is original;
see `THEME-NOTES.md` for the inspected license locations. The upstream
[DrawnSvg.vue](https://github.com/davideimola/presentations/blob/main/theme-brand/components/DrawnSvg.vue)
informed click-linked drawing techniques; no upstream artwork or implementation
is redistributed.
