---
layout: section
label: '01 · the service we have'
---

# The service we have

A working Python service. A growing queue of waiting callers.

<!--
~15 seconds. Body starts around 01:30; timing provisional until rehearsal.
- Chapter budgets: ~4 / 26½ / 15½ minutes. Expand first, trim later.
- One evolving service; each change answers an observable problem.
- No language-speed contest.
-->

---
layout: split-code
---

# Keep the HTTP contract

```http
POST /checks
Content-Type: application/json

{"urls":["http://127.0.0.1:9099/ok"]}
```

::right::

```json
{
  "results": [{
    "url": "http://127.0.0.1:9099/ok",
    "status": 200,
    "error": ""
  }],
  "batch_error": ""
}
```

<!--
~45 seconds. Same wire shape in service.py / service.go.
- HTTP 200 = completed report, not healthy URLs. Status 0 = no response; order unspecified; error text diagnostic only.
- Exact local /ok, /broken, /slow targets on :9099. No redirects or arbitrary-URL proxy.
- Bad input → 400; ≤1000 URLs, ≤64 KiB body.
- Python :18080; Go :18081 adds 2 s batch deadline → 504 + partial report if writable.
- Disconnect means no response. Go lifetime policy is an explicit improvement over baseline.
-->

---
layout: code-hero
---

# First, it works

```python
def run(urls):
    return [check(url) for url in urls]

# Inside POST /checks, after validation:
output = {
    "results": run(urls),
    "batch_error": "",
}
```

Each `check` makes a blocking `HEAD` request with a 500 ms timeout.

<!--
45 seconds. Real implementation: examples/service.py. The HTTP server can handle different incoming batches on threads, but each batch checks its own URLs sequentially. Don't confuse request-server concurrency with concurrency inside one request.
check returns a result even for network failures and HTTP 503. urllib raises HTTPError for unsuccessful statuses; catch it at the per-URL reporting boundary, close it, keep going. The complete service includes JSON validation and response encoding; we are not deleting those to fit a slide.
-->

---
class: runtime-animation
routeAlias: overlapping-waits
clicks: 2
---

# Same checks. Overlapping waits.

<WaitTimeline :step="$clicks" />

<!--
~60 seconds.
- Start: A–F wait one after another. Python and Go sequential: same pattern.
- [click 1] Same six checks → two workers. Overlap waits, not faster requests.
- [click 2] Earlier finish. Illustration, not measured timing or a promised 2× speedup.
- Evidence: demo-output.txt — six results each; fixture peaks 1 / 1 / 2.
- Bridge: Python can overlap I/O too. Show that next.
-->

---
layout: two-cols-header
---

# Python can overlap those waits, too

::left::

### Blocking library → threads

```python
with ThreadPoolExecutor(
    max_workers=8,
) as pool:
    futures = [
        pool.submit(check, u)
        for u in urls
    ]
    for f in as_completed(futures):
        r = f.result()
        report(r["url"], r)
```

::right::

### Async library → `asyncio`

```python
limit = asyncio.Semaphore(8)

async def check_async(url):
    async with limit:
        return await async_head(url)
```

Both need bounded submission and a deliberate stop policy.

<!--
~60 seconds. Conceptual sketches; imports/report omitted. Complete threaded CLI: checker.py.
- service.py check returns errors as data; threads can wrap its run.
- Executor bounds active calls, not queued submissions. with waits; future.cancel won't kill a running thread.
- Semaphore bounds active calls, not gather-created tasks. async_head means real async I/O, not urllib in async def.
- TaskGroup structures lifetime; still choose error/stop policy.
- GIL-enabled CPython overlaps blocking I/O; bytecode CPU parallelism differs. Extensions may release GIL; optional free-threaded builds since 3.13.
- GIL ≠ application lock. Go is a choice, not prerequisite for concurrency.
-->

---
layout: section
label: '02 · the service we rewrite'
---

# The service we rewrite

Same endpoint. Same result policy. Make it work before making it concurrent.

<!--
15 seconds. Expanded chapter 2: allow roughly 26½ minutes, then trim after rehearsal. Introduce syntax immediately before it is used. We are translating the working service, not beginning with a worker-pool abstraction.
-->

---
routeAlias: go-editor
clicks: 3
---

# Open the Go project

<NeovimCode filename="service.go" directory-label="examples/" :directory="$clicks === 0" :picker="$clicks === 1 || $clicks === 2" :files="['go.mod', 'main.go', 'service.go', 'main_test.go']" :selected="$clicks < 2 ? 'go.mod' : 'service.go'">

```go
package main

import (
    "net/http"
    // Other imports omitted.
)
```

<template #preview>

<div v-if="$clicks < 2">

```go
module example.com/python-to-go-concurrency

go 1.22
```

</div>
<div v-else>

```go
package main

import "net/http"
// Other imports omitted.
```

</div>

</template>
</NeovimCode>

<!--
~90 seconds. Stylized editor, not live Neovim; actual example filenames.
- Start: directory + relative line numbers.
- [click 1] Picker previews complete go.mod.
- [click 2] Select service.go; shortened imports, omissions labeled.
- [click 3] Open buffer. Print/overview show this final state.
- NORMAL, cursor and gutter are illustration, not controls.
- Bridge: files → package → module.
-->

---
class: runtime-animation
routeAlias: go-packages
clicks: 3
---

# Files ≠ packages ≠ modules

<GoProjectDiagram scene="packages" :step="$clicks" />

<!--
~90 seconds. Actual examples/ files; no restructuring.
- [click 1] Files → package main. Shared declarations; no mutual imports.
- main_test.go joins during tests only. Normally one package per directory; external _test exception.
- [click 2] go.mod → module: versioned package collection, not a virtual environment.
- Module path is identity; go 1.22 is minimum version, not exact pin. go mod init only for a new project.
- [click 3] net/http: standard-library package. Imports are file-scoped; capitals export across packages.
- go.sum: dependency checksums, not complete lockfile. None needed here; stdlib only. go mod tidy maintains dependencies.
- Bridge: give the existing JSON a Go shape.
Sources: examples/go.mod, main.go, service.go, main_test.go; https://go.dev/doc/code ; https://go.dev/ref/mod .
-->

---
layout: split-code
---

# Give the JSON a Go shape

```go
type CheckRequest struct {
    URLs []string `json:"urls"`
}

type CheckResult struct {
    URL    string `json:"url"`
    Status int    `json:"status"`
    Error  string `json:"error"`
}
```

::right::

- `[]string`: a slice of strings
- `struct`: named, typed fields
- JSON tags preserve our wire names
- Exported fields begin with capitals

`error` values stay internal; strings cross the HTTP boundary.

<!--
45 seconds. Real types in service.go. Like a small dataclass, but fields have compile-time types. The internal Result remains URL, Status and Err error so the existing checker and its tests keep their API. CheckResponse wraps []CheckResult plus BatchError string. We translate errors to text only at the HTTP boundary: encoding an error interface directly is not our JSON contract.
:= declares and infers a local type; var declares a value, often initially its zero value. nil is the absence of an error, not a Python exception.
-->

---
layout: code-hero
---

# A handler is an ordinary function

```go
mux := http.NewServeMux()
mux.HandleFunc("POST /checks", checksHandler(true))

// Within that handler, after validation:
results, err := Sequential(ctx, client, input.URLs, 2)
output := CheckResponse{Results: []CheckResult{}}
// Map internal results into the unchanged JSON response.
```

Go's `net/http` supplies the request and response writer.

<!--
45 seconds. Excerpt assembled from service.go; true selects sequential, the final CLI uses the -sequential flag. HandlerFunc has signature func(w http.ResponseWriter, r *http.Request). Decode r.Body into CheckRequest, validate the entire batch BEFORE any outbound request, encode output to w. Methods in ServeMux patterns require Go 1.22+.
Read the complete checksHandler after the talk: body cap, unknown-field rejection, exactly one JSON object, URL allowlist, reusable client, no redirects, response translation and HTTP status policy are all there. Python uses the same target allowlist and limits. This teaching server binds loopback and sets ReadHeaderTimeout; it is not a production deployment template.
-->

---
layout: code-hero
---

# The sequential translation comes first

```go
var results []Result
for _, url := range urls {
    if err := ctx.Err(); err != nil {
        return results, err
    }
    results = append(results, check(ctx, client, url))
}
return results, ctx.Err()
```

`func` declares a function; `(value, error)` makes failure explicit.

<!--
45 seconds. Exact body of Sequential in service.go. Its signature accepts context, client, URLs, and a worker parameter unused in the sequential version, allowing the HTTP wrapper to swap only the implementation. for _, url ranges over values, ignoring the index.
The lower-case check function is the same complete helper used by Run. This is not yet faster; demo.py shows a peak of one for both sequential services. We have preserved behavior before changing execution.
Context is an explicitly passed request-lifetime signal; we will follow its full path in chapter 3. The second returned error is for batch cancellation. Per-URL failures remain in each Result.
-->

---
layout: split-code
---

# A failed URL is still a result

```go
resp, err := client.Do(req)
if err != nil {
    r.Err = err
    return r
}
defer resp.Body.Close()
r.Status = resp.StatusCode
if resp.StatusCode >= 400 {
    r.Err = fmt.Errorf(
        "HTTP status %d", r.Status)
}
return r
```

::right::

`503` is a valid HTTP response—not a Go transport error.

`defer` schedules cleanup for function return.

One broken target must not erase the rest of the report.

<!--
45 seconds. Excerpt from check in main.go, with r.Status substituted into the equivalent formatting expression. The full helper builds a HEAD request, sets a 500 ms child deadline, handles request-construction errors and closes every received response body.
Compare urllib's HTTPError. There is no implicit exception propagation across goroutines. Defer resembles finally/with cleanup but runs at function exit, not block exit. HEAD avoids reading a payload; a GET checker needs body size and draining policy.
The shared reusable client is safe for concurrent use. Per-request timeout is a URL failure if the batch is still active. Python's socket timeout is not exactly Go's end-to-end context deadline.
-->

---
class: runtime-animation
routeAlias: go-run
clicks: 3
---

# Run the rewrite

<GoProjectDiagram scene="run" :step="$clicks" />

<!--
~60 seconds. Commands run from examples/; dot selects the whole package.
- [click 1] Compile/link as needed; cached artifacts may be reused.
- [click 2] Run on 127.0.0.1:18081. -serve / -sequential are program flags.
- [click 3] Compile-and-run, not a named binary to keep. Not an interpreter/watcher.
- Entry point: package main + func main (here in service.go). go run main.go omits that file; _test.go excluded.
- Manual demo: python3 demo.py fixtures separately; ports 9099/18081 free. No flags → older standalone demo.
- Bridge: add go before check. What goes missing?
Sources: examples/service.go (main); https://pkg.go.dev/cmd/go#hdr-Compile_and_run_Go_program .
-->

---
layout: statement
---

# Starting work isn’t finishing work

```go
for _, url := range urls {
    go check(ctx, client, url)
}
// The handler can return before any result exists.
```

`go f()` starts another goroutine. It doesn't join it—or collect its result.

<!--
45 seconds. Deliberately broken sketch, not runnable service code. The function is ordinary Go; go changes how it executes, not its definition. There is no await color on check.
Goroutines are runtime-scheduled, not one OS thread each. Waiting network operations can park them; CPU work can run across cores subject to runtime/CPU limits. They still cost memory, sockets and lifetime management.
Returning from an HTTP handler doesn't wait for spawned work, and its request context is cancelled. Returning from main exits the entire program. Neither boundary provides automatic TaskGroup semantics.
-->

---
class: runtime-animation
routeAlias: scheduler-roles
clicks: 3
---

# G, M, P

<SchedulerDiagram scene="roles" :step="$clicks" />

<!--
Expanded route · about 90 seconds. Click 0: G is a goroutine, with its own growable stack. Click 1: M is an operating-system thread. Click 2: P holds scheduler/allocator resources required to execute user Go code; it is NOT a physical core. Click 3: the runtime pairs G + M + P to execute that code.
Use our HTTP check as G1. The Go runtime schedules goroutines onto threads; the OS schedules those threads on hardware. Neither layer promises a particular core or thread affinity. More Gs do not require one M each. The matching model is a runtime implementation model, not new Go syntax or a public API we configure per request.
Source: https://go.dev/src/runtime/HACKING.md#scheduler-structures . Runtime details can change across Go versions. This is an original teaching diagram, not a measured execution trace.
-->

---
class: runtime-animation
routeAlias: scheduler-parallelism
clicks: 3
---

# Many Gs. Two Ps.

<SchedulerDiagram scene="parallelism" :step="$clicks" />

<!--
Expanded route · about 75 seconds. Illustrate two Ps with two Gs executing; more Gs are runnable, not running. Advance to a possible yield and replacement without inventing another execution slot. The final distinction is concurrency versus parallel execution.
Use two as a chosen illustration, not an assertion about the user's machine or Go's version-dependent default. GOMAXPROCS is process-wide, not our service's per-batch worker count. It neither creates CPU cores nor guarantees two cores of CPU time under OS/container limits. It doesn't bound total goroutines, sockets or OS threads. Runtime work and system calls are outside this simplified user-code limit.
For this service, two workers is an application policy; two Ps would be a separate runtime configuration. Don't conflate the two merely because this picture uses the same number.
Sources: https://pkg.go.dev/runtime#GOMAXPROCS and https://go.dev/src/runtime/HACKING.md .
-->

---
class: runtime-animation
routeAlias: scheduler-network
clicks: 4
---

# Network wait

<SchedulerDiagram scene="network" :step="$clicks" />

<!--
Expanded route · about 90 seconds. Trace G1 executing a request, parking for pollable network I/O, and G2 using the same M/P. Network readiness later makes G1 runnable; only a subsequent scheduling decision runs it. Advance one step at a time so waiting, runnable and running are visibly different states.
This is why our blocking-looking client.Do can overlap waits without dedicating an OS thread to each socket wait. It does not mean every operation inside an HTTP request is pollable or thread-free: DNS resolution, cgo and other blocking system calls may behave differently. The next slide distinguishes that case.
The runtime network poller integrates readiness with goroutine scheduling. It is not one goroutine executing Go code on a hidden extra P. No claim that concurrency makes CPU-bound work cheaper.
Sources: https://go.dev/src/runtime/HACKING.md (gopark/goready) and https://go.dev/src/runtime/netpoll.go .
-->

---
class: runtime-animation
routeAlias: scheduler-syscall
clicks: 4
---

# Blocking syscall

<SchedulerDiagram scene="syscall" :step="$clicks" />

<!--
Expanded route · about 90 seconds. Contrast with the previous network picture: G1 and M1 are stuck in a blocking syscall. Show P1 becoming available/retaken, then M2 using P1 to execute another G. On return, G1 must obtain execution resources or become runnable; syscall return doesn't guarantee immediate user-Go execution.
This shows one possible slow/blocking path. Do NOT teach “every syscall immediately releases its P”: runtime entry paths, fast returns, handoff and sysmon retake vary. A long cgo/blocking call can consume an OS thread even though Go work elsewhere keeps moving. That is why GOMAXPROCS is not an OS-thread limit.
Avoid adding low-level syscall API recommendations; net/http is still the right abstraction for our service. We expose the mechanism to understand resource limits, not to replace the scheduler.
Sources: https://go.dev/src/runtime/HACKING.md and https://go.dev/src/runtime/proc.go (entersyscall, exitsyscall, retake).
-->

---
class: runtime-animation
routeAlias: scheduler-queues
clicks: 3
---

# Work stealing

<SchedulerDiagram scene="steal" :step="$clicks" />

<!--
Expanded route · about 75 seconds. Show P1's runnable queue, P2 exhausting local work, a possible steal, then execution on the otherwise idle M/P. The moving token is a runnable G; we are not stealing the currently executing goroutine or a parked I/O operation.
Simplified possible schedule, not a guarantee of FIFO, fairness, exact steal size, or who runs next. The runtime also has a global queue, runnext, timers, network readiness and preemption; this small drawing is not the complete findRunnable algorithm. Scheduler choices differ by version and load. Never make application correctness depend on these arrows' order.
Return to the service: because goroutines can interleave, who owns the shared report? A scheduler is not a data-race fix. That question motivates the WaitGroup/collector slides immediately after this one.
Source: https://go.dev/src/runtime/proc.go (findRunnable, stealWork, runqsteal).
-->

---
layout: split-code
---

# Waiting alone doesn't make sharing safe

```go
var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)
    go func(url string) {
        defer wg.Done()
        results = append(results,
            check(ctx, client, url)) // RACE
    }(url)
}
wg.Wait()
```

::right::

A `WaitGroup` joins work.

It does **not** protect the shared slice.

A mutex around **every** shared access works. One collector avoids sharing.

<!--
60 seconds. Still a deliberately broken intermediate version; never run this in the finished service. Multiple appends race on slice metadata and potentially backing storage even if the parent reads only after Wait. The existing tests exercise the final collector, not this sketch.
Add before launching; defer Done covers returns; Wait only after all increments are established. Pass url explicitly for clarity. Go 1.22+ loop-declared iteration variables are fresh each iteration; don't teach the historical closure bug as universal. Add/Done supports the module's Go version without newer WaitGroup.Go.
A valid mutex alternative: compute r outside the critical section, mu.Lock(); results=append(results,r); mu.Unlock(). Protect reads as well, don't copy an in-use mutex or WaitGroup. Channels aren't morally superior to locks: our report naturally has one owner.
-->

---
layout: code-hero
---

# Send results to their owner

```go
results := make(chan Result)
go func() {
    results <- check(ctx, client, url)
}()
r := <-results
```

`<-` sends or receives. An unbuffered channel is a rendezvous.

<!--
45 seconds. One-URL teaching sketch, before cancellation. make creates the channel; chan Result is its type. Sending blocks until a receiver is ready, receiving blocks until a value or closure. Workers don't append; the receiver owns the data.
A channel copies its value, not all referenced memory. Sending a slice or pointer does not automatically make mutation safe. The single Result here contains immutable URL text, a status, and an error.
We still need to know when ALL senders finish; a channel alone doesn't infer that. We'll add explicit closure after joining in chapter 3.
-->

---
class: runtime-animation
routeAlias: channel-rendezvous
clicks: 3
---

# Unbuffered

<ChannelDiagram scene="rendezvous" :step="$clicks" />

<!--
Expanded route · about 90 seconds. Follow the same value from sender to receiver. With no receiver, the send waits and the goroutine can park; it need not monopolize an OS thread. A matching receive permits the communication; a woken goroutine is runnable, not guaranteed to run immediately.
After the value is transferred, the sender may continue even while the receiver is still processing it. Rendezvous synchronizes the communication, not all future work in either goroutine. Our worker gives a Result to the collector; only the collector appends to the report.
The value is copied according to its type. Slice headers and pointers can still reference shared memory; a channel is not deep-copy isolation. Channel operations being safe concurrently does not make unsynchronized mutation of pointed-to data safe.
Sources: https://go.dev/ref/spec#Channel_types and https://go.dev/ref/mem#Channel_communication .
-->

---
layout: statement
---

# A thousand URLs.<br>A thousand goroutines?

Cheap is not free. Put the limit where work starts.

<!--
30 seconds. One goroutine per URL plus a semaphore bounds active requests but still creates a thousand goroutines. A worker pool bounds both execution slots and the number of worker goroutines.
The contract caps a batch at 1000 URLs, but that is validation, not the concurrency limit. Multiple inbound batches can each create a pool: our two-worker bound is PER BATCH, not global protection for a deployed service.
-->

---
routeAlias: worker-pool
clicks: 3
---

# Fixed workers. One result owner.

<PoolDiagram :step="$clicks" />

Producer → jobs → fixed workers → results → collector

<!--
60 seconds. Diagram API preserved: step 0..3. Follow one URL, then reveal all workers, collection and the stop path. The diagram's illustrated worker count may differ from the runnable demo's two.
One producer owns job submission. Only fixed workers call check. The collector is the goroutine running Run; it alone appends. It must receive WHILE workers run.
We are reusing the existing bounded Run implementation and its tests, not replacing a working pool with a second abstraction. The HTTP handler swaps Sequential for Run without changing the request/response mapping.
-->

---
class: runtime-animation
routeAlias: channel-buffer
clicks: 4
---

# Buffered

<ChannelDiagram scene="buffer" :step="$clicks" />

<!--
Expanded route · about 90 seconds. Buffered ALTERNATIVE, not the runnable service. Follow A/B/C waiting, D's blocked send, a worker finishing, then its receive of A. Because D is already waiting to send, the runtime copies D into the vacated buffer slot before waking its sender; the sender later resumes and its send returns. Do not depict a stable two-of-three buffer while that sender is runnable. There are still only two workers. A blocked channel operation can park its G; it does not need to spin or occupy a whole OS thread.
Actual service: jobs := make(chan string), results := make(chan Result). Both are unbuffered, so our fixed workers rendezvous with producer/collector rather than using this three-value queue. This alternative makes the difference between active checks and queued values concrete, not a hidden change to examples/main.go.
Full queue → producer waits → backpressure. An available receiver can receive directly; this drawing deliberately starts with workers busy so values fill the buffer. A huge buffer postpones overload, not fixes it. No sleep or default-select busy-spins.
Finite input/output slices remain O(number of URLs), not constant-memory streaming. Two workers per batch is not a global service limit or requests-per-second rate limiter.
Sources: https://go.dev/ref/spec#Channel_types , https://go.dev/ref/spec#Send_statements , and https://go.dev/src/runtime/chan.go (recv copies queue→receiver and waiting sender→queue before goready).
-->

---
layout: section
label: '03 · the service we can trust'
---

# The service we can trust

Limits are only useful if work also stops.

<!--
15 seconds. Expanded chapter 3: allow roughly 15½ minutes including channel lifecycle animations, tooling and evidence; trim after rehearsal. We have solved overlap, ownership and active-call bounds. Now break the caller's connection and ask what remains running.
-->

---
class: runtime-animation
routeAlias: cancellation-lifecycle
clicks: 5
---

# The caller left. Stop, then join.

<ShutdownDiagram :step="$clicks" />

<!--
~90 seconds. Illustrative path; exits need not happen together.
- Start: job handoff / HTTP / result send. Collector receives throughout.
- [click 1] Caller leaves → context canceled. Signal ≠ kill or join.
- [click 2] Producer + workers exit. Client I/O stops; remote work may continue.
- [click 3] Join complete. No senders remain.
- [click 4] Close results → drain → collector range ends.
- [click 5] Run returns partial report + error. Disconnected caller gets no response.
- Caveat: send can race cancellation; a completed result may be omitted.
- Bridge: now show the code behind each boundary.
Sources: examples/main.go; examples/service.go; https://pkg.go.dev/context ; https://pkg.go.dev/net/http#Request.Context .
-->

---
layout: code-hero
---

# Carry the caller's lifetime to the socket

```go
ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
defer cancel()
results, err := Run(ctx, client, input.URLs, 2)

// Inside check: the earlier parent/child deadline wins.
ctx, cancel = context.WithTimeout(ctx, 500*time.Millisecond)
defer cancel()
req, err := http.NewRequestWithContext(ctx, http.MethodHead,
    url, nil)
```

`context` signals cancellation. It doesn't kill—or join—a goroutine.

<!--
65 seconds. Two scope excerpts combined: first service.go, second main.go's check (the actual check uses := in its own scope). A 500 ms URL deadline is contained inside the 2-second batch budget. WithTimeout cannot extend an earlier deadline; defer cancel releases timer resources even when successful.
NewRequestWithContext is what carries cancellation into client.Do and the standard HTTP transport. Accepting a ctx parameter but ignoring it doesn't stop I/O. The request-derived context, not the OS signal context from the old standalone CLI, owns work in this HTTP handler.
The old no-argument demo still uses signal.NotifyContext. Production server shutdown/draining is a separate process-lifetime concern; our new loopback teaching server is not a graceful-shutdown template.
-->

---
layout: code-hero
---

# The producer needs an exit, too

```go
go func() {
    defer close(producerDone)
    defer close(jobs)
    for _, url := range urls {
        select {
        case jobs <- url:
        case <-ctx.Done():
            return
        }
    }
}()
```

Producer owns `close(jobs)`: “no more input.”

<!--
55 seconds. Exact producer body from Run; producerDone is make(chan struct{}) in the complete code. A select waits for one ready communication. Done closes to broadcast stop. If send and cancellation are both ready either may win: cancellation isn't strict priority and doesn't guarantee zero extra handoffs.
Defers run in reverse order: jobs closes, then producerDone closes. Receiving jobs with url, ok detects closed-and-drained. Closing a channel is NOT cancellation and doesn't remove buffered values. Channels need not be closed for garbage collection; close here is a protocol signal.
Without the cancellation arm, a producer could be stuck after all workers leave. The coordinator later joins producerDone as well as the workers.
-->

---
class: runtime-animation
routeAlias: channel-close
clicks: 4
---

# Close, then drain

<ChannelDiagram scene="close" :step="$clicks" />

<!--
Expanded route · about 90 seconds. Separate buffered teaching example, not the unbuffered jobs/results channels in our service. Start with A/B queued; the producer closes; A and B remain receivable with ok=true. Only closed AND drained yields the element type's zero value with ok=false. For chan int that is 0,false; for our chan Result it is Result{},false. A legitimate zero sent before closure still has ok=true.
The goroutine/protocol that knows no sends remain owns close. Sending on a closed channel panics; so does closing an already closed or nil channel. Closing is not required to garbage-collect a channel. A nil channel is different: send and receive block, rather than producing a zero/false result.
Our producer's defer close(jobs) lets workers finish ranging/receiving. Results needs a different closer: the coordinator must join ALL senders before closing. Close is an end-of-stream signal, not a request to interrupt HTTP work, and does not itself join the goroutines.
Sources: https://go.dev/ref/spec#Close and https://go.dev/ref/spec#Receive_operator .
-->

---
class: runtime-animation
routeAlias: channel-select
clicks: 3
---

# Select: one ready case

<ChannelDiagram scene="select" :step="$clicks" />

<!--
Expanded route · about 90 seconds. Revisit the producer's select: jobs <- url versus <-ctx.Done(). Initially neither can proceed; then the receiver is ready AND Done is closed. Show one possible cancellation choice, followed by a clearly labeled ALTERNATIVE send choice from the same readiness state—not two case bodies executing in one select.
The spec says one ready communication is selected by uniform pseudo-random selection. Source order doesn't prioritize cancellation. A pre-check of ctx.Err can reduce unnecessary work but cannot make cancellation and a send atomic. Some work/results can therefore race with cancellation; don't promise strict “zero extra handoffs.”
Without default, select waits until some case can proceed. A default would make an immediate alternative; repeatedly taking it can busy-spin. A nil channel's case is disabled because it cannot communicate. Done closes to broadcast cancellation; it does not kill arbitrary code or wait for completion. Our coordinator/WaitGroup is still needed.
Sources: https://go.dev/ref/spec#Select_statements and https://pkg.go.dev/context .
-->

---
layout: split-code
---

# Every blocking worker boundary gets a stop path

```go
select {
case <-ctx.Done():
    return
case url, ok := <-jobs:
    if !ok {
        return
    }
    // Check and send, at right.
}
```

::right::

```go
r := check(ctx, client, url)
select {
case results <- r:
case <-ctx.Done():
    return
}
```

Receive → context-aware HTTP → send.

<!--
70 seconds. These two excerpts are the nested body of one worker loop in main.go. The full code calls wg.Add(workers) BEFORE launching the fixed worker loop; each goroutine defers wg.Done. We don't compress a 25-line worker onto one slide.
Three distinct waits: receiving a job, outbound I/O, sending a result. All must observe cancellation. Removing the result-send stop arm is a classic leak when the consumer leaves. Our current collector drains, but the stop path makes the worker's protocol explicit and supports prompt cancellation.
On cancellation a completed result may be delivered OR discarded; missing URLs aren't successes. Returning partial results is part of the batch contract. No exactly-once report promise on cancellation. Standard HTTP transport honors ctx; arbitrary custom transports may not.
-->

---
layout: code-hero
---

# Join senders. Then close results.

```go
go func() {
    wg.Wait()
    <-producerDone
    close(results)
}()
var collected []Result
for r := range results {
    collected = append(collected, r)
}
return collected, ctx.Err()
```

Collect **while** workers run. Close only when no sender remains.

<!--
70 seconds. Actual collector region in main.go. Coordinator owns close(results) on behalf of all workers. Sending on a closed channel panics; a receiver must never close results just because it wants to stop. Results range ends after closure AND drain.
Run joins its workers and producer on normal completion and cancellation. The coordinator closes results as its final meaningful action. Context is a stop signal; WaitGroup and producerDone establish lifetime completion.
Deadlock exercise: move wg.Wait into the collector goroutine before the receive loop. Workers block sending results, cannot reach Done, and Wait cannot return. A bigger buffer can disguise this for one batch, not repair the protocol.
The collector alone mutates collected. WaitGroup is not a mutex, and a channel is not an automatic race eraser. Completion order, not input order; attach indices if input order becomes a requirement.
-->

---
layout: two-cols-header
---

# Don't confuse a URL failure with a stopped batch

::left::

### URL failure

- `/broken` → status `503`, error text
- `/slow` → status `0`, timeout error
- Keep checking the other URLs
- Completed report → HTTP `200`

::right::

### Batch cancellation

- Caller disconnects or 2 s budget expires
- Stop producer, workers and outbound I/O
- Join before `Run` returns
- Partial report + `batch_error`; `504` if writable

<!--
55 seconds. Run returns []Result and error. Inspect each Result.Err, then the batch error; they answer different questions. If a child URL timer expires while the parent is active, the batch continues. If the parent deadline wins, the whole operation is cancelled. Some completed results can be omitted as cancellation races with sends.
The Python baseline uses the same wire shape but does not yet implement batch deadlines or disconnect propagation; its empty batch_error represents that known baseline limitation. Go's sequential stage already carries context so the concurrency rewrite doesn't need to re-invent error policy.
For cancellation classification inside Go use errors.Is(err, context.Canceled/DeadlineExceeded), especially with wrapped errors. Don't parse diagnostic strings. WaitGroup doesn't gather errors or recover panics. errgroup is useful for fail-fast tasks; this report intentionally collects ordinary URL failures instead.
-->

---
class: runtime-animation
routeAlias: go-test
clicks: 3
---

# Test the rewrite

<GoProjectDiagram scene="test" :step="$clicks" />

<!--
~75 seconds. From examples/: go test ./... covers packages below this directory in the module; here, one.
- [click 1] _test.go joins a test binary; not a retained service executable.
- [click 2] Runner calls TestName(t *testing.T); t.Fatal/t.Fatalf fail a test.
- [click 3] -race checks executed accesses; supported platform + C compiler required.
- Existing pool/checker tests, not HTTP-wrapper coverage. Racy append sketch is not in the suite.
- Cached success possible; -count=1 forces execution. go vet is separate static analysis.
- No claim of every schedule, no leaks, or no deadlocks. Diagram isn't PASS evidence; that comes next.
Sources: examples/main_test.go; https://pkg.go.dev/cmd/go#hdr-Test_packages ; https://go.dev/doc/articles/race_detector .
-->

---
layout: terminal
title: Evidence, not a promise
command: go test -race -v ./... && go vet ./...
---

# Can it stop? Can it stay bounded?

```text
TestRunBoundedAndCollectsEveryResult     PASS
TestRunKeepsPerURLErrors                PASS
TestRunCancellationJoinsWorkers        PASS
TestRunDeadline                        PASS
TestRunEmptyAndInvalidWorkerCount      PASS
TestCheckRequestTimeout                PASS
```

Existing tests · real local HTTP · no external network

<!--
~75 seconds including demo. Normalized captured output: examples/verification-output.txt.
- Existing suite; gcc supplied via nix shell nixpkgs#gcc. go vet silent on success.
- Bounds: force overlap, six results, peak=2.
- Cancellation: wait for request start → cancel → await Run and server request-context exit. Not sleep/count evidence.
- URL errors: malformed URL + 503. Deadline test: already expired. URL timeout: server waits for cancellation.
- Scope: Run/check, not HTTP wrapper. Demo exercises wrapper contract; races only on executed paths. No universal leak/production proof.
-->

---
layout: terminal
title: One service, three stages
command: python3 demo.py
---

# Same report. Different waiting.

```text
Python sequential → 6 results; peak 1
Go sequential     → 6 results; peak 1
Go pool           → 6 results; peak 2

/ok     → 200, no error
/broken → 503, URL error
/slow   →   0, URL timeout
```

Normalized captured demo output. This is not a cross-language benchmark.

<!--
~65 seconds. From examples/: python3 demo.py.
- Local fixture → temporary Go build → three service stages → subprocess cleanup. Ports 9099/18080/18081 must be free.
- Fallback: demo-output.txt, measured times + full summaries.
- Manual: terminal A python3 demo.py fixtures; B chooses ONE service. POST to :18080 or :18081. No Go flags → standalone demo.
- Fixed fixture delays, variable elapsed time. Peak proves local overlap, not production throughput.
- Remote work may outlive client timeout. Cancellation-test Go fixture cooperates; Python fixture deliberately sleeps.
-->

---
class: runtime-animation
routeAlias: go-build
clicks: 3
---

# Keep the executable

<GoProjectDiagram scene="build" :step="$clicks" />

<!--
~75 seconds. From examples/: go build -o checker .
- [click 1] Compile/link main package + dependencies as needed.
- [click 2] Keep ./checker. Build neither starts the service nor runs tests.
- [click 3] ./checker -serve starts the pool; add -sequential for baseline.
- No Go installation needed on target; OS/architecture must match. cgo/native libraries may add requirements; suitable CGO_ENABLED=0 builds avoid those.
- Not universally static/tiny/portable. CA certificates, config, network and graceful shutdown remain separate.
- Bridge: package → run → test → build, all stdlib. Recap the rewrite.
Sources: examples/service.go; https://pkg.go.dev/cmd/go#hdr-Compile_packages_and_dependencies .
-->

---
layout: statement
---

# The rewrite changed the ownership model

One caller's lifetime.<br>
A fixed amount of active work.<br>
One owner of the report.<br>
No sender left behind.

<!--
~45 seconds. Hand back to closing; timing provisional.
- Journey: serial waits → sequential rewrite → goroutines → collector → workers → cancel + join.
- Python threads/async also overlap; no language superiority claim.
- Limits: per-batch workers, finite O(n) memory, no rate limiter, trusted local targets only.
- Production still needs global/per-host admission, SSRF policy, retries, observability and shutdown.
- Before go: who owns, stops, joins and closes?
-->
