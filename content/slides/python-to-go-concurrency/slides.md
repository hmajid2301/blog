---
theme: default
addons:
  - '@/../slidev-shared/addons/code-journey'
title: "From Python to Go: Concurrency Without the Surprises"
author: Haseeb Majid
presenter: true
duration: 52min
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
transition: fade
clickAnimation: fade
fonts:
  provider: none
  sans: 'Radio Canada Big, sans-serif'
  serif: 'Source Serif 4, Georgia, serif'
  mono: 'Geist Mono, monospace'
drawings:
  enabled: true
  persist: true
  presenterOnly: true
  syncAll: false
defaults:
  layout: default
---

# From Python to Go

## Concurrency without the surprises

One HTTP service. A rewrite we can explain.

Haseeb Majid · [haseebmajid.dev](https://haseebmajid.dev)

<!--
00:00–00:30. Audience: Python developers, no Go concurrency knowledge assumed.
The service already works. The hard part is not starting more work: it is owning the results and knowing when every task has stopped.
Not a Python-versus-Go benchmark. Python already overlaps I/O well; we are learning Go through one concrete rewrite.
-->

---

<AgendaTimeline />

<!--
00:30–01:30. One application, three chapters. First observe serial waiting in a working Python HTTP service. Translate it sequentially into Go. Then add bounded work, explicit ownership and cancellation, with visible local evidence.
Promise: learn core Go by rewriting this service, from packages and the first go run through goroutines, channels, testing and a built executable. Ownership and lifetime make the rewrite complete.
Expanded working version: allow about 46 minutes for the body, 45 seconds for closing, and 3 minutes 45 seconds for questions. The 52-minute timer is a rehearsal placeholder; the author will cut later. Appendix remains untimed.
-->

---
src: ./pages/service-story.md
---

---
layout: statement
section: 'takeaways'
---

# Before you write `go`…

Who owns the data?<br>
What bounds the work?<br>
How does it stop—and who joins it?

<!--
Expanded route: roughly 47:30–48:15, pending rehearsal and trimming. A bare go statement answers none of these questions.
Our service gives us a concrete answer: a fixed per-batch pool, one collector, a request-derived context reaching every wait, and a coordinator that joins before closing results.
The model transfers back to Python: executor/TaskGroup lifetimes, bounded queues, explicit shared-state synchronization. No language superiority claim.
If the body runs long, use its last ownership slide as the recap and move straight to questions. Protect at least 3 minutes of Q&A.
-->

---
layout: statement
section: 'questions'
---

# Questions?

What would you change in your service?

[Haseeb Majid · haseebmajid.dev](https://haseebmajid.dev)

<!--
Expanded route: roughly 48:15–52:00. Q&A, not more prepared material. Restore a tighter timing only after content is cut.
If quiet: ask whether two workers means a global service limit. No: each inbound batch has its own pool. Ask how to preserve order: attach an input index and collect by index without worker-side mutation.
Other prompts: context doesn't join or force a remote server to stop; rate limiting is different from active-call limits; a finished report can contain failed URLs.
Everything after this is an untimed appendix. Local demo fallback is examples/demo-output.txt; existing verification output is examples/verification-output.txt.
-->

---
class: resources
section: 'appendix'
---

# Appendix · authoritative reading

- [Python threading and the GIL](https://docs.python.org/3/library/threading.html#gil-and-performance-considerations)
- [Free-threaded CPython: support and extension caveats](https://docs.python.org/3/howto/free-threading-python.html)
- [asyncio tasks, cancellation, and TaskGroup](https://docs.python.org/3/library/asyncio-task.html)
- [A Tour of Go: concurrency](https://go.dev/tour/concurrency/1)
- [Runtime G/M/P model](https://go.dev/src/runtime/HACKING.md) · [GOMAXPROCS](https://pkg.go.dev/runtime#GOMAXPROCS)
- [Channel, close, and select semantics](https://go.dev/ref/spec#Channel_types)
- [Go context: cancellation, deadlines, and cleanup](https://pkg.go.dev/context)
- [Go pipelines: cancellation and stopping short](https://go.dev/blog/pipelines)
- [Go race detector](https://go.dev/doc/articles/race_detector)
- [Go memory model](https://go.dev/ref/mem)
- [os/signal: NotifyContext](https://pkg.go.dev/os/signal#NotifyContext)
- [x/time/rate: request rate limiting](https://pkg.go.dev/golang.org/x/time/rate)

<!--
Untimed. These are specifications and authoritative guidance, not merely Python/Go analogies.
The incoming HTTP request supplies the service's parent context; signal.NotifyContext is used by the original standalone CLI. Graceful HTTP server shutdown is a separate process-lifetime concern.
-->

---
layout: code-hero
section: 'appendix'
---

# Appendix · day one: a basic HTTP API

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /urls/{id}", showURL)
srv := &http.Server{
    Addr: ":8080", Handler: mux,
    ReadHeaderTimeout: 5 * time.Second,
}
err := srv.ListenAndServe()
if err != nil && !errors.Is(err, http.ErrServerClosed) {
    log.Fatal(err)
}
```

`net/http` routes · `log/slog` logs · `go build` packages

<!--
Untimed. Preserves the basic API bridge from the original deck. Method/wildcard patterns require Go 1.22+; r.PathValue("id") reads the parameter. showURL is an ordinary func(http.ResponseWriter, *http.Request).
This is a teaching excerpt, not a complete production server: pair process signals with srv.Shutdown(ctx), set other limits/timeouts for your workload, and choose deployment policy.
go.mod/go.sum describe module dependencies; they are not a virtual environment. With CGO_ENABLED=0, suitable Go programs can ship as a fully static binary; cgo/native dependencies change that claim. No portable binary-size comparison.
Structured logging is stdlib since Go 1.21. sqlc generates types from SQL; small consumer-owned interfaces support hand-written fakes, or mockery can generate mocks. Neither is a requirement for this service.
-->

---
layout: code-hero
section: 'appendix'
---

# Appendix · defer: your `with` block

```go
defer resp.Body.Close() // Cleanup at function exit.
defer cancel()         // Last scheduled, first executed.
```

- Function-scoped, not block-scoped
- Arguments evaluated now; call runs at return
- Normal panic unwinding also runs defers
- Pool cleanup: `wg.Done()`, `close(jobs)`

<!--
Untimed. Python bridge: with / try-finally, with different scoping. Defer inside a loop accumulates until the enclosing function returns. os.Exit and fatal runtime failures do not provide ordinary panic unwinding.
Close a response body only after checking client.Do's error. Always release context timers even if work finishes early. Defers are cleanup, not synchronization by themselves.
-->

---
layout: code-hero
section: 'appendix'
---

# Appendix · interfaces: static duck typing

```go
type Stringer interface {
    String() string
}

// No implements keyword: the method set is the contract.
func (u URL) String() string { return u.name }
```

Python's `typing.Protocol` is a useful bridge.

Small interfaces make ownership—and fakes—easier to explain.

<!--
Untimed. Illustrative URL type; it is not the service's string URL field. fmt.Println uses fmt.Stringer, much like __str__ but statically checked. A pointer receiver normally means only the pointer satisfies that method requirement.
Accept interfaces where variation is actually needed; return concrete types. Prefer one or two consumer-owned methods, not speculative abstraction. error is itself an interface; errors.Is and errors.As inspect errors without parsing text.
-->

---
layout: two-cols-header
section: 'appendix'
---

# Appendix · the same questions, at Kafka scale

::left::

### Our URL checker

- Fixed workers per batch
- One owner of the report
- Producer stops input
- Cancel, then join

::right::

### A consumer group

- Partitions bound useful parallelism
- One group member owns each partition
- Rebalance changes ownership
- Finish processing before acknowledging

<!--
Untimed conceptual analogy, not an implementation recipe. Clients such as franz-go own polling, heartbeats and rebalance protocols. Local worker concurrency and per-partition ordering need their own design.
Committing an offset after processing commonly gives at-least-once delivery: a crash between processing and commit can replay work, so side effects need idempotency or transactional design. Never commit past unfinished earlier work in a partition. A channel handoff is not a durable Kafka acknowledgement.
-->

---
layout: code-hero
section: 'appendix'
---

# Appendix · run the complete story

```sh
cd content/slides/python-to-go-concurrency/examples
python3 demo.py          # All three service stages + local fixtures.
# Or choose one server, with fixtures running separately:
python3 service.py       # Sequential Python, :18080.
go run . -serve -sequential # Sequential Go, :18081.
go run . -serve          # Bounded Go, :18081.
```

Setup and HTTP requests: `examples/README.md`<br>
Offline fallback: `examples/demo-output.txt`

<!--
Untimed. Manual services are alternatives, not three commands to run simultaneously: the two Go stages share a port. Start fixtures with python3 demo.py fixtures in another terminal for the manual route.
No flags: go run . still runs the original standalone checker demo; checker.py remains the original threaded CLI. main.go contains the reused bounded Run/check implementation and main_test.go its existing tests. service.go adds the HTTP boundary; service.py is the Python starting point.
Trusted loopback teaching targets only. Public arbitrary URLs require a deliberate SSRF model, global admission, limits and deployment hardening. No new test infrastructure was added.
-->
