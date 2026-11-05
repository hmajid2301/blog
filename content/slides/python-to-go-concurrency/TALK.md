# From Python to Go: Concurrency Without the Surprises

- **Author:** Haseeb Majid.
- **Audience:** Python developers, little or no Go experience. Introduce syntax
  immediately before it is needed; no concurrency API knowledge assumed.
- **Thesis:** A Go rewrite is not just `go f()`. Preserve the service contract,
  bound active work, give mutable data one owner, propagate the caller's lifetime,
  and join everything before returning.
- **Guiding questions:** Who owns the data? What bounds the work? How does it
  stop—and who joins it?
- **Story discipline:** One local `POST /checks` service. Concrete problem →
  small code → visible evidence → fix → takeaway. No cross-language speed claim.
  Python already supports overlapping I/O. Examples are loopback teaching services,
  not production templates or an arbitrary-URL proxy.

## Thirty-minute route

| Budget | Purpose |
| --- | --- |
| 00:00–01:30 | Promise and three-chapter roadmap |
| 01:30–25:30 | Service story in `pages/service-story.md` |
| 25:30–26:15 | Three ownership/lifetime questions |
| 26:15–30:00 | Q&A |

Chapters, in order:

1. **01 · the service we have:** observe serial waiting in Python; acknowledge
   threads/async as valid alternatives.
2. **02 · the service we rewrite:** preserve HTTP/JSON behavior, translate
   sequentially, then reveal why spawning/joining alone doesn't protect results.
   One collector and fixed workers make ownership and capacity visible.
3. **03 · the service we can trust:** follow the caller's context into every
   blocking boundary, join before closure, separate URL failure from batch failure,
   show existing race-suite and local service evidence.

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
see README for the inspected license locations and DrawnSvg technique reference.
