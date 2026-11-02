---
theme: default
title: "From Python to Go: Concurrency Without the Surprises"
author: Haseeb Majid
presenter: true
duration: 30min
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

# From Python to Go

## Concurrency without the surprises

<div class="mt-6 text-lg opacity-80">Haseeb Majid · 30 minutes · Python experience, Go curiosity</div>

<!--
00:00–00:45 · 45 seconds
Promise: by the end you can explain who starts work, who owns data, and how every goroutine stops.
This is not a Python-versus-Go benchmark. We are translating concurrency habits, not ranking languages.
Use a URL status checker throughout. No live internet or audience Go setup required.
-->

---

## One job. Three constraints.

Check a batch of service URLs.

<v-clicks>

- Overlap network waiting.
- Never overwhelm the remote services.
- Stop when the caller no longer cares.

</v-clicks>

<div class="small mt-6">Sequential → concurrent → bounded → cancellable</div>

<!--
00:45–01:30 · 45 seconds
Say: your Python health-check script now needs to check hundreds of internal URLs.
Success is a report with individual failures, not an all-or-nothing transaction.
Reveal the three constraints. They are our acceptance criteria, not optional polish.
Roadmap: mental model to minute 9; channels and ownership to 15:30; a safe pool to 24:30; what happens under load to 25:30; pitfalls and recap to 28:30; 90 seconds for questions.
-->

---

## First, make it work

```python
from urllib.request import Request, urlopen

def check(url):
    with urlopen(Request(url, method="HEAD"), timeout=0.5) as r:
        return r.status

for url in urls:
    try:
        print(url, check(url))
    except Exception as exc:
        print(url, exc)  # Report this URL; keep going.
```

<div class="small">Most elapsed time is waiting for the network.</div>

<!--
01:30–02:30 · 60 seconds
urls is our input list, omitted here. urllib is standard library; no requests dependency needed.
HEAD asks for headers, not the response body. Some servers do not support HEAD: a production checker may need a deliberate GET fallback.
The broad catch is at this small script's reporting boundary, not a recommendation to swallow errors deep in a library.
Python urllib raises HTTPError for 4xx/5xx. Go net/http does not; we will explicitly restore that policy.
A Python socket timeout is not necessarily a strict end-to-end wall-clock deadline. Don't equate it exactly with the Go batch deadline later.
-->

---

## Concurrency ≠ parallelism

<div class="columns">
<div>

### Concurrency

Multiple tasks in progress.

A waits for a socket; B can run.

</div>
<div>

### Parallelism

Multiple tasks executing at once.

A and B compute on different cores.

</div>
</div>

<p class="accent">Our URL checker needs overlapping waits.</p>

<!--
02:30–04:00 · 90 seconds
Draw a short timeline: A sends, A waits; B sends while A waits. One CPU can orchestrate both.
Then draw two CPU lanes for parallel execution. Concurrent structure permits but does not guarantee parallel execution.
Ask the room: if all URLs wait 200 ms, what is the serial cost for 100 URLs? About 20 seconds, ignoring overhead.
With 10 slots an idealized estimate is about 2 seconds. This is a model, not a benchmark: latency distribution, connection reuse, DNS, and remote throttling matter.
CPU-bound work needs a separate throughput experiment. Adding goroutines cannot conjure CPU cores or remove contention.
-->

---

## Python already has concurrency

| Tool | Where it fits | Important limit |
| --- | --- | --- |
| Threads | Blocking I/O libraries | GIL-enabled CPython limits Python-bytecode parallelism |
| `asyncio` | Many cooperative I/O tasks | Blocking code stalls that event-loop thread |
| Processes | CPU-heavy Python work | IPC, serialization, process costs |

<div class="small mt-6">Optional free-threaded CPython builds exist since 3.13.<br>Native extensions may release the GIL. Measure your actual stack.</div>

<!--
04:00–05:30 · 90 seconds
Qualify the implementation: CPython with the GIL enabled, not all Python implementations and not all work.
Many blocking I/O operations release the GIL, so threads can be very effective for this exact URL checker.
Native numeric libraries can release the GIL and run work in parallel too.
Optional free-threaded builds from 3.13 allow parallel Python threads. This is not the default build; extension compatibility matters and an incompatible extension can re-enable the GIL.
The GIL is not an application lock. Compound operations and invariants still require synchronization; free-threading makes this especially visible.
Do not say that Go is always faster. I/O throughput may be dominated by the same remote server regardless of language.
-->

---

## The threaded Python version

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=8) as pool:
    futures = {pool.submit(check, url): url for url in urls}
    for future in as_completed(futures):
        url = futures[future]
        try:
            print(url, future.result())
        except Exception as exc:
            print(url, exc)
```

<div class="small">Eight active calls, but this submits the whole batch.</div>

<!--
05:30–06:30 · 60 seconds
Same check function and same per-URL error policy. as_completed reports in completion order, not input order.
The executor bounds active threads, but the futures dictionary and queued submissions grow with the batch. For a huge stream, bound submission as well.
Exiting the with block waits for running work. future.result(timeout=...) limits the caller's wait; it does not forcibly stop a running thread.
This is a perfectly reasonable solution in Python. Our Go implementation should preserve the good parts: bounded active work, explicit result handling, and joining.
-->

---

## The `asyncio` mental model

```python
# Inside an async function; session is an aiohttp ClientSession.
limit = asyncio.Semaphore(8)

async def check_async(url):
    async with limit:
        async with session.head(url, timeout=0.5) as r:
            r.raise_for_status()
            return r.status

results = await asyncio.gather(
    *(check_async(url) for url in urls), return_exceptions=True
)
```

<div class="small">Use an async HTTP library; don't call blocking <code>urlopen</code> here.</div>

<!--
06:30–07:45 · 75 seconds
Conceptual translation, not an additional dependency for this deck. Assume import asyncio and an open aiohttp session; see appendix for complete Python standard-library thread example.
await yields control when the awaited operation suspends. Calling a blocking library inside async def does not make it asynchronous; asyncio.to_thread is one bridge for blocking I/O.
The semaphore bounds active requests, not the number of tasks gather creates. Very large inputs still need bounded queue consumers.
gather returns in input order, unlike as_completed. return_exceptions=True makes ordinary URL errors data for this report; cancellation still needs deliberate handling.
asyncio TaskGroup offers structured lifetime and sibling cancellation on error. A bare go statement will not provide that structure automatically.
-->

---

## Go: ordinary functions, concurrent execution

<div class="columns">
<div>

```go
func report(url string) {
    fmt.Println(url)
}

report(url)    // This goroutine.
go report(url) // A new goroutine.
```

</div>
<div>

- Runtime schedules goroutines on OS threads.
- Network waits can park a goroutine.
- CPU work can run across cores.

</div>
</div>

<div class="small">Not one thread per goroutine. Not zero cost.</div>

<!--
07:45–09:00 · 75 seconds
Tiny syntax tour: func, named parameter then type, curly braces, package-qualified calls. := declares and infers a local type; var declares a zero value. We will use both.
A goroutine is an execution of a function, not an async-colored function. No await at each network call.
Network I/O uses runtime polling where supported; blocking syscalls and cgo may occupy threads. Avoid claiming every blocking operation is free.
GOMAXPROCS limits how many threads execute Go code simultaneously; CPU quotas and available cores matter.
The scheduler can preempt Go work; the scheduling model is not asyncio's explicit await model. Data races are therefore possible even when you don't see a yield.
-->

---

## Starting is easy. Joining is your job.

```go
var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1) // Before launching, not inside the goroutine.
    go func(url string) {
        defer wg.Done()
        fmt.Println(url)
    }(url)
}
wg.Wait()
```

<div class="small">A WaitGroup counts completion. It does not carry results or errors.</div>

<!--
09:00–10:00 · 60 seconds
defer runs when this function returns; like a cleanup action in finally, but not identical in every language detail.
Passing url explicitly makes ownership clear. Go 1.22+ gives fresh per-iteration variables for variables declared by the loop in modules using the new semantics; don't teach the old closure bug as universal today. Reusing an externally declared variable still differs.
Go 1.25 added WaitGroup.Go; we use Add/Done so the example runs with Go 1.22+.
main returning exits the program without joining background goroutines. There is no implicit task tree.
This sketch starts one goroutine per URL and only prints; it is a stepping stone, not our final checker.
-->

---

## Give the result a shape

<<< @/examples/main.go#result go

```go
r := check(ctx, client, url) // Same sequential operation first.
if r.Err != nil {
    fmt.Println(r.URL, r.Err)
}
```

<div class="small"><code>ctx</code> carries cancellation. <code>client</code> is a reused HTTP client.</div>

<!--
10:00–11:00 · 60 seconds
Introduce a struct as roughly a small dataclass, with static field types. Err is an error interface; nil means no error.
No implicit exception propagation to a parent goroutine. We choose how results and errors get back to the caller.
The second block is a usage excerpt: ctx, client, and url are parameters/input, not magic globals.
The complete check helper uses HEAD, closes the response body, checks HTTP status explicitly, and applies a per-request context timeout. We'll inspect it after context is introduced.
On network failure Status stays its zero value, 0; that is not an HTTP response code.
-->

---

## Channels transfer values

```go
results := make(chan Result) // Unbuffered: a rendezvous.
go func() {
    results <- check(ctx, client, url) // Send; may block.
}()
r := <-results // Receive; may block.
```

<v-click>

A send needs a receiver.<br>
A receive needs a value—or a closed channel.

</v-click>

<!--
11:00–12:15 · 75 seconds
Read the arrows aloud. make allocates the channel; chan Result is its type. This is a one-request teaching sketch, before we add cancellation to sends.
Unbuffered send and receive synchronize. The relevant memory writes before sending are visible after the matching receive.
Sending a value copies that value, not everything it points to. Sending a pointer or slice doesn't make the underlying mutable data safe to share.
Compare queue.Queue or asyncio.Queue, but don't claim identical APIs or shutdown semantics.
Later our collector receives while workers are running, so workers never depend on a collector that starts only after joining.
-->

---

## Buffers are a queue, not a speed switch

```go
jobs := make(chan string, 8) // Up to eight queued values.
jobs <- url                 // Blocks when the buffer is full.
```

- Capacity bounds queued values—not active workers.
- A full queue pushes back on the producer.
- A giant buffer postpones overload; it doesn't solve it.

<!--
12:15–13:15 · 60 seconds
Our final example deliberately uses unbuffered channels: no extra queue beyond the active workers. A small bounded buffer can absorb bursts if measurement justifies it.
Bound every relevant resource: concurrent requests, queued work, memory retained in the result list, and downstream rate. A concurrency cap is not a requests-per-second limit.
The caller already owns urls as a slice; this example is a finite batch. Streaming inputs and outputs would be a different contract for huge inputs.
Python semaphore or thread limits and Go channel capacity control different things. Do not interchange them.
-->

---

## Close means “no more values”

```go
close(jobs) // The producer owns this close.

for url := range jobs {
    // Receive until closed AND drained.
}
```

<div class="small">Receive also supports <code>url, ok := &lt;-jobs</code>.<br><code>ok == false</code> means closed and drained.</div>

<p class="warning">Never close a channel while someone may still send.</p>

<!--
13:15–14:15 · 60 seconds
Channels do not need to be closed for garbage collection. Close is a protocol signal used when a receiver needs to know production is finished.
Closing a channel does not cancel work already running. Buffered values can still be received after closure; then receives immediately return the zero value and false.
Sending to a closed channel panics. Closing an already-closed channel also panics. A nil channel blocks sends and receives indefinitely.
Rule of thumb: the sender closes; multiple senders require a coordinator that knows they all finished. Our results channel will use exactly that coordinator.
-->

---

## Make ownership visible

<PoolDiagram :step="$clicks" />

<div class="small">One producer · a fixed worker count · one collector</div>

<div v-click="1" class="small mt-3">Workers share the HTTP client, not a mutable results slice.</div>
<div v-click="2" class="small mt-3">The collector alone appends and reports.</div>
<div v-click="3" class="small mt-3">Every blocking boundary gets a stop path.</div>

<!--
14:15–15:30 · 75 seconds
Follow one URL all the way across, revealing the workers and results.
The diagram shows three workers for illustration; the executable demo uses two. The worker count is a parameter.
Our Run function is the collector. It starts a fixed number of workers and one producer, then receives continuously.
Each worker owns its local Result. net/http.Client is safe for concurrent use; reuse it rather than building a new connection pool per request.
The collector's results slice needs no mutex because there is only one writer. This is a data-ownership design, not a magical safety property of Go channels.
Before implementing the whole pool, decide how it stops.
-->

---

## Context: “this work is no longer needed”

```go
ctx, cancel := context.WithTimeout(parent, 2*time.Second)
defer cancel()

select {
case jobs <- url:
    // Handed to a worker.
case <-ctx.Done():
    return // Stop producing.
}
```

<div class="small">Pass <code>ctx</code> explicitly, conventionally as the first argument.</div>

<v-click>

<<< @/examples/main.go#parent go

</v-click>

<!--
15:30–17:00 · 90 seconds
parent is a request context or context.Background at the program boundary. A child inherits cancellation and cannot extend an earlier parent deadline.
In a service, parent comes from signal.NotifyContext (Go 1.16+): Ctrl+C or SIGTERM cancels it, stop restores the default exit behavior. Pair with http.Server.Shutdown to drain an HTTP server; the runnable demo uses this parent.
Done is a channel that closes to broadcast cancellation. ctx.Err distinguishes Canceled from DeadlineExceeded; errors.Is handles wrapped errors.
cancel releases timer/context resources even if work finishes early. It does not join goroutines or forcibly kill them.
select waits for one ready communication. If multiple cases are ready, one is chosen pseudo-randomly: cancellation is cooperative, not a strict priority or a guarantee of zero further handoffs.
Avoid a default in this waiting loop: it can turn blocking into a busy spin. A default can be useful for deliberately non-blocking operations, not here.
-->

---
class: dense
---

## Cancellation must reach the HTTP request

<<< @/examples/main.go#check go

<!--
17:00–18:30 · 90 seconds
This is the actual compiled helper, included directly from examples/main.go.
The batch's two-second budget contains a 500 ms child budget per request. Whichever deadline is earlier wins.
NewRequestWithContext carries the signal through the standard HTTP transport. Merely passing ctx to our own function would not interrupt client.Do.
Go returns transport failures in err, but HTTP 503 is a valid response with nil transport error; we deliberately classify 4xx/5xx as URL failures.
Always close Body after a successful Do, including HEAD. HEAD has no response payload to drain. A GET-based version must deliberately handle reading/draining and size limits for connection reuse.
This checks the final response status with the client's redirect policy, not application-level health or every redirect hop. A 200 alone doesn't prove the service is healthy.
A custom RoundTripper could ignore cancellation; our lifetime guarantees assume the standard context-aware HTTP transport.
-->

---
class: dense
---

## A worker: receive → check → send

<<< @/examples/main.go#workers go

<!--
18:30–19:45 · 75 seconds
Actual code excerpt inside Run. jobs, results, wg, ctx, and client were established by the surrounding function; full source is included with the deck.
We add the entire fixed worker count before any Wait. Each worker calls Done on every return path.
Receive selects between the next job and cancellation; closed jobs ends normal work.
After check, the result send ALSO has a cancellation path. Without it, a worker could hang forever when its consumer goes away.
Only these workers call check, so at most workers checks are active. A large batch does not create one goroutine per URL.
No strict order or cancellation priority is promised. An already-cancelled request can finish with an error, and a result may be omitted during cancellation.
-->

---
class: dense
---

## The producer owns `jobs`

<<< @/examples/main.go#producer go

<div class="small">No worker can accidentally close the queue for its siblings.</div>

<!--
19:45–20:45 · 60 seconds
A separate producer allows Run's current goroutine to collect results immediately.
The two defers ensure jobs closes and producerDone signals completion on both normal exhaustion and cancellation. Defers run in reverse order: jobs closes first.
An unbuffered jobs send hands work to an available worker. There is no independently growing job queue.
producerDone lets the coordinator join the producer as well as the workers. Just sending cancellation and returning would not establish that all our goroutines have stopped.
-->

---

## Join senders, then close results

<<< @/examples/main.go#collector go

<div class="small">Collect while workers run—not after <code>wg.Wait()</code>.</div>

<!--
20:45–22:00 · 75 seconds
The coordinator waits for all result senders and for the producer, then closes results as its final operation. No send can race with this close.
The caller goroutine ranges until closure and drain; it alone appends. Joining is part of Run's contract even on cancellation.
Deadlock exercise: move wg.Wait before starting the receive loop in the same goroutine. Workers block sending, cannot call Done, and Wait never returns.
A bigger buffer might hide that bug for one batch size. Correct lifecycle coordination fixes it.
Result order is completion order, not input order. To preserve order, attach the input index and reorder in the collector.
-->

---
class: dense
---

## Two levels of error handling

<<< @/examples/main.go#caller go

<div class="small">URL failure → report and continue.<br>Batch cancellation → partial results plus a batch error.</div>

<v-click>

```go
if err != nil {
    return fmt.Errorf("check %s: %w", url, err) // wrap, keep the cause
}
if errors.Is(err, context.DeadlineExceeded) {   // matches wrapped errors
    log.Println("deadline")
}
```

</v-click>

<!--
22:00–23:30 · 90 seconds
This is the runnable demo's call site. urls and server are local fixtures prepared above it; parent arrives via signal.NotifyContext from the context slide.
Inspect r.Err for each URL. Run's err reports lifecycle failure, not an aggregate of every URL failure.
An expired per-request timeout is a URL error; a parent batch timeout also stops dispatch and can leave URLs unchecked. Don't label missing results successful.
Cancellation may discard a just-computed result because its send races with Done. The contract allows partial results, not exactly one result per input on cancellation.
WaitGroup is not an exception collector. For fail-fast tasks, errgroup.WithContext from golang.org/x/sync is useful: it joins, propagates the first error, and signals cancellation. Its tasks still must cooperate. We need no dependency for this collect-all policy.
An unhandled panic is not an ordinary error value and is not caught by WaitGroup; don't use panic for routine HTTP failures.
The idiom block is a sketch, not excerpted — our checker reports raw errors at its reporting boundary. Bigger codebases: wrap with %w, compare with errors.Is (bare == misses wrapped errors), errors.As for types, errors.Join to aggregate.
-->

---

## Run the story, not the internet

```sh
cd content/slides/python-to-go-concurrency/examples
go run .
go test -race ./...
go vet ./...
```

```text
/ok       → 200, no error
/broken   → 503, URL error
/slow     → request deadline exceeded
```

<div class="small">Local HTTP fixtures · two workers · completion order varies</div>

<!--
23:30–24:30 · 60 seconds
Demo slot: run go run . if convenient; otherwise narrate this deliberately normalized output. The real output contains local URLs, ephemeral ports, and wrapped error messages.
The local /slow endpoint waits a second, so the half-second request deadline wins. The two-second batch budget normally stays unexpired.
Tests check real local HTTP behavior: bounded overlapping work, all results on normal completion, URL failures, invalid worker counts, an empty batch, batch deadline, request timeout, and cancellation reaching the server.
The race detector observes only code paths exercised in this execution. A passing run is evidence, not proof that every possible execution is safe.
Ctrl+C mid-run cancels gracefully via the signal parent: partial results + a batch error. A second Ctrl+C is absorbed until the run finishes.
-->

---

## What happens under load?

<v-clicks>

- Slow remote → workers park on their deadlines
- Producer stalls → backpressure, by design
- Throughput ≈ workers ÷ response time
- The cap protects the remote, too

</v-clicks>

<p class="warning">A concurrency cap is not a rate limit — that's <code>x/time/rate</code>.</p>

<div class="small mt-4">8 workers × 500 ms ≈ 16 checks/s → 100,000 URLs ≈ 1¾ hours — bounded, not stuck.</div>

<!--
24:30–25:30 · 60 seconds
Saturation is when the design choices get tested.
Throughput = in-flight capacity ÷ response time — Little's law. More input adds waiting, not capacity.
Deadlines bound the tail: a hung endpoint costs 500 ms, never forever.
The stalled producer is backpressure: no growing queue, bounded memory.
The cap protects the remote too: at most `workers` requests in flight.
Rate limiting is a different tool: golang.org/x/time/rate.
No performance claim — compare like for like.
-->

---

## Shared state? Use a lock—or avoid it.

<div class="columns">
<div>

### Unsafe from multiple workers

```go
counts[r.Status]++ // map race
```

</div>
<div>

### If sharing is necessary

```go
mu.Lock()
counts[r.Status]++
mu.Unlock()
```

</div>
</div>

<p class="accent">Our collector can update <code>counts</code> without sharing it.</p>

<!--
25:30–26:30 · 60 seconds
These are alternative design excerpts, not code to paste into our existing collector. counts is map[int]int and mu is sync.Mutex. Every concurrent read and write must obey the same lock.
Maps and slice append are not safe for unsynchronized concurrent mutation. A WaitGroup joining later does not prevent workers racing with one another now.
Use a mutex for a short shared-state invariant. Channels for ownership transfer and coordination. Neither is morally superior.
Keep network calls out of a critical section. Never copy an in-use mutex or WaitGroup; share the original.
Our single collector makes the lock unnecessary. This is the simplest solution for the report.
Relate to Python threading.Lock: the GIL never guaranteed that a whole business operation was atomic.
-->

---

## Before you write `go`, ask…

<v-clicks>

- **Race:** who else can mutate this data?
- **Leak:** what if the receiver leaves?
- **Deadlock:** am I waiting before anyone can receive?
- **Overload:** what bounds active and queued work?
- **Shutdown:** who cancels, joins, and closes?

</v-clicks>

<!--
26:30–27:45 · 75 seconds
Audience exercise: ask which line would leak if we removed its ctx.Done case. The worker's results send is the classic answer; the producer's jobs send is another.
A leak is a goroutine whose work will never complete, even if it uses almost no CPU. It retains memory and resources.
Not all deadlocks produce Go's global all-goroutines-asleep diagnostic: a service can remain alive while one request is stuck forever.
Don't fix lifecycle bugs by adding sleeps. Don't spawn unbounded goroutines that merely wait on a semaphore if goroutine count itself must be bounded.
Context is a stop signal, not forced interruption. Work must observe it, and the owner still must join.
If behind schedule, combine the first three prompts into one question, but keep the shutdown recap.
-->

---

## Take the model, not just the syntax

<PoolDiagram :step="3" />

<div class="accent">Overlap waiting. Bound work. Own data. Join everything.</div>

<div class="small mt-6">Goroutines start work · channels coordinate · context signals stop<br>WaitGroup joins · mutex protects shared invariants</div>

<!--
27:45–28:30 · 45 seconds
Retell the whole checker: producer hands URLs to fixed workers; workers issue context-aware HEAD requests; one collector owns results; producer closes jobs; coordinator joins everyone before closing results.
Translate back to Python: executor/TaskGroup lifetime, bounded queues, cancellation cooperation, and locks are not unfamiliar concepts. Go exposes different defaults and syntax.
The performance lesson is overlapping I/O under a budget, not language superiority.
Close the prepared material at minute 28 so there is genuinely room for questions.
-->

---

## Questions?

What owns the work?<br>
What makes it stop?

<div class="small mt-8">Haseeb Majid · <a href="https://haseebmajid.dev">haseebmajid.dev</a></div>

<div class="small mt-4">Runnable source and reading list follow →</div>

<!--
28:30–30:00 · 90 seconds reserved for Q&A
If no questions: ask how to preserve input order, then where a service gets its parent context.
Answers: attach indices and collect by index; signal.NotifyContext cancels on Ctrl+C or SIGTERM, paired with http.Server.Shutdown to drain an HTTP server.
If asked about Go versions: runnable module uses Go 1.22+, deliberately avoids newer WaitGroup.Go. Python free-threading is optional from CPython 3.13, not a blanket claim about every deployment.
The following slides are an untimed appendix, not part of the 30-minute run.
-->

---
class: resources
---

## Appendix · authoritative reading

<div class="resources">

- [Python threading and the GIL](https://docs.python.org/3/library/threading.html#gil-and-performance-considerations)
- [Free-threaded CPython: support and extension caveats](https://docs.python.org/3/howto/free-threading-python.html)
- [asyncio tasks, cancellation, and TaskGroup](https://docs.python.org/3/library/asyncio-task.html)
- [A Tour of Go: concurrency](https://go.dev/tour/concurrency/1)
- [Go context: cancellation, deadlines, and cleanup](https://pkg.go.dev/context)
- [Go pipelines: cancellation and stopping short](https://go.dev/blog/pipelines)
- [Go race detector](https://go.dev/doc/articles/race_detector)
- [Go memory model](https://go.dev/ref/mem)
- [os/signal: NotifyContext](https://pkg.go.dev/os/signal#NotifyContext)
- [x/time/rate: request rate limiting](https://pkg.go.dev/golang.org/x/time/rate)

</div>

<!--
Untimed appendix. Consult these sources rather than treating the Python/Go analogy as a specification.
Go snippets on the implementation slides are included from the tested main.go file, not a second manually maintained copy.
-->

---

## Appendix · day one: a basic HTTP API

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /urls/{id}", showURL)

srv := &http.Server{Addr: ":8080", Handler: mux}
log.Fatal(srv.ListenAndServe())
```

<v-clicks>

- No Flask/FastAPI decision — `net/http` is the framework
- `go mod init` — go.mod replaces venv + requirements
- `go build` ships one statically-compiled binary, deps included
- `slog.Info("served", "id", id)` — structured logs, stdlib

</v-clicks>

<div class="small mt-4">hello-world binary: C ≈ 16 KB, borrows the system libc · Go ≈ 2.4 MB — runtime inside</div>

<div class="small mt-4">Beyond stdlib: <strong>sqlc</strong> — SQL in, type-safe Go out · <strong>mockery</strong> — mocks from interfaces</div>

<!--
Untimed appendix. The first service most teams build; everything here is standard library.
No framework decision: net/http routes and serves; patterns take methods and wildcards since Go 1.22 — r.PathValue("id") reads them. Handler shape if asked: func(w http.ResponseWriter, r *http.Request).
Production hardening: set ReadHeaderTimeout; pair Ctrl+C with srv.Shutdown(ctx) — the same signal context as this talk's demo. ListenAndServe returns ErrServerClosed after Shutdown.
go mod init + go mod tidy replace requirements.txt and venv; the module path is the import prefix. Packages are directories.
go build ships a statically-compiled binary — all dependencies included; no interpreter or venv on the target.
CGO_ENABLED=0 keeps it fully static (cgo can force dynamic linking).
Hello-world binary: ~16 KB in C (dynamically linked — libc ships with the OS) vs ~2.4 MB in Go — that's what self-contained costs.
log/slog (Go 1.21+): key-value logs; JSON via slog.NewJSONHandler. gofmt, vet, go test ship with the toolchain.
SQL: database/sql is stdlib; sqlc generates type-safe Go from plain SQL.
Mocks: small interface, tiny hand-rolled fake — or testify-style mocks via mockery.
-->

---

## Appendix · the same shape, at Kafka scale

<div class="columns">
<div>

### The URL checker

- Fixed worker count
- One `jobs` handoff at a time
- One collector owns results
- Producer closes `jobs`
- Cancel, then join

</div>
<div>

### A consumer group

- Group size caps the pool
- Each partition: one owner
- Handlers own their message
- Rebalance: drain and join
- Commit after completion

</div>
</div>

<div class="small mt-4">A commit is an ownership handoff — acknowledge only finished work.</div>

<!--
Untimed appendix. Conceptual mapping; a real client (franz-go, as in our Kafka labs) owns polling, heartbeats, and commits.
A group is a bounded pool: one member owns each partition — concurrency capped by partitions, not topic size.
Commit after processing = at-least-once; before = at-most-once — the same choice as reporting URL failures as data.
Rebalance is the drain-and-join you saw: stop, finish, commit, reassign.
-->

---

## Appendix · explore the complete example

```text
python-to-go-concurrency/
  slides.md                # Timed narrative + speaker notes
  components/PoolDiagram.vue
  examples/
    go.mod                 # Go 1.22+, standard library only
    main.go                # Full checker + local HTTP demo
    main_test.go           # Lifecycle, limits, errors, timeouts
    checker.py             # Runnable Python thread baseline
  README.md                # Preview, validation, and boundaries
```

<div class="small">Next experiment: add input indices; preserve ordering without worker-side mutation.</div>

<!--
Untimed appendix. Mention that these are teaching fixtures for trusted local endpoints, not a public URL-checking service.
An internet-facing checker needs URL validation and an SSRF threat model; retries, per-host rate limits, and bounded streaming output are separate product decisions.
The finite input and collected results are O(number of URLs), even though active work and channel queues are bounded.
-->
