---
layout: section
label: '01 · the service we have'
---

# The service we have

A working Python service. A growing queue of waiting callers.

<!--
Main body begins around 01:30. Chapter 1: 4 minutes; chapter 2: 9 minutes; chapter 3: 11 minutes. Leave about 4½ minutes for the deck's opener, closing and questions.
One application evolves, not a parade of disconnected concurrency snippets. Each change answers a failure we can observe. No language-speed contest.
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
45 seconds. Same request/response shape in service.py and service.go. HTTP 200 means the report completed, NOT that every URL is healthy. Each result has a status and error; 0 means no HTTP response. Order is not part of the contract. Error strings are diagnostic text, not machine-readable identifiers.
Only three exact local targets are accepted: /ok, /broken, /slow on 127.0.0.1:9099. Unknown targets, malformed bodies and more than 1000 URLs get 400. Body cap: 64 KiB. Redirects are disabled. This is deliberately not an arbitrary-URL proxy.
Python listens on 18080, Go on 18081. Go adds a 2-second batch deadline: 504 with partial results and batch_error. A disconnected client cannot receive that response. The baseline lacks that lifecycle guarantee; this is an explicit improvement, not hidden API equivalence.
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
layout: terminal
title: Watch the waiting
command: python3 demo.py
---

# Six URLs. One occupied slot.

```text
Python sequential: 6 results; fixture peak=1
Go sequential:     6 results; fixture peak=1
Go pool:           6 results; fixture peak=2
```

Normalized evidence from the local demo; timings come next.

<!--
45 seconds. Run from examples/. These are normalized summaries, not invented benchmark numbers. Replace timings only with captured local output; demo.py prints elapsed wall time, fixture-observed peak and status/error summaries.
The fixture waits 100 ms for /ok and /broken, one second for /slow. Six /ok calls are deliberately small and deterministic in behavior, not scheduler timing. The bottleneck is serial waiting, not Python bytecode. See examples/demo-output.txt for the captured run.
A simple timeline: request A waits, then B waits. We want B's wait to overlap A's. Concurrency means multiple tasks in progress; parallelism means simultaneous execution. This I/O problem does not require a CPU benchmark.
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
60 seconds. Conceptual sketches, not new dependencies. ThreadPoolExecutor/as_completed imports and report are omitted here; checker.py is the existing complete threaded CLI with explicit exception reporting. Our service.py check returns errors as data, so the same strategy can wrap its run function.
The semaphore limits active calls, not the number of tasks created by gather. The executor limits active calls, not queued submissions. Exiting its with block waits for work; cancelling a future does not kill an already-running thread. asyncio needs an actual async HTTP client: async_head stands for that operation, NOT urllib in async def. TaskGroup gives structured lifetime, but errors/cancellation still require policy.
GIL-enabled CPython allows overlapping blocking I/O; it limits Python-bytecode CPU parallelism, not all concurrency. Native extensions can release it; optional free-threaded CPython builds exist since 3.13. The GIL was never an application-invariant lock. Go is a rewrite choice, not a prerequisite for concurrency.
-->

---
layout: section
label: '02 · the service we rewrite'
---

# The service we rewrite

Same endpoint. Same result policy. Make it work before making it concurrent.

<!--
15 seconds. Chapter 2 about 9 minutes. Introduce syntax immediately before it is used. We are translating the working service, not beginning with a worker-pool abstraction.
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
layout: statement
---

# A thousand URLs.<br>A thousand goroutines?

Cheap is not free. Put the limit where work starts.

<!--
30 seconds. One goroutine per URL plus a semaphore bounds active requests but still creates a thousand goroutines. A worker pool bounds both execution slots and the number of worker goroutines.
The contract caps a batch at 1000 URLs, but that is validation, not the concurrency limit. Multiple inbound batches can each create a pool: our two-worker bound is PER BATCH, not global protection for a deployed service.
-->

---
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
layout: code-hero
---

# Queue capacity isn't concurrency

```go
jobs := make(chan string)      // No waiting queue.
results := make(chan Result)   // Collector receives as we run.

// Alternative: up to 8 queued values, NOT 8 workers.
jobs = make(chan string, 8)
```

Full queue → producer waits → backpressure.

<!--
45 seconds. Our actual pool uses the first two unbuffered channels, not the alternative reassignment. A fixed worker count bounds active calls; capacity bounds queued values. A huge buffer postpones overload, not fixes it. No sleeps or default select busy-spins.
This finite-batch API still retains the input and output slices: O(number of URLs) memory, not constant memory. A streaming contract would be another feature. Limits apply to two outbound checks per incoming batch; a global admission limit/rate limit would be needed for a public service. Concurrency is not requests per second.
-->

---
layout: section
label: '03 · the service we can trust'
---

# The service we can trust

Limits are only useful if work also stops.

<!--
15 seconds. Chapter 3 about 11 minutes, including evidence. We have solved overlap, ownership and active-call bounds. Now break the caller's connection and ask what remains running.
-->

---
layout: statement
---

# The caller left.<br>Your work didn’t.

A result nobody wants can still occupy a socket, a worker, or a blocked send.

<!--
40 seconds. The sequential Python baseline catches a broken response pipe only AFTER doing all its checks. Threading or async alone would not supply a complete cancellation policy.
Go's incoming request context is cancelled when the client disconnects, the request is cancelled, or the handler returns. Merely spawning a goroutine doesn't attach a structured lifetime to it. Cancellation must reach every blocking boundary, AND the owner must join.
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
75 seconds including demo. This is normalized actual local test output, not new tests. Captured full output in examples/verification-output.txt. Environment lacked gcc; used nix shell nixpkgs#gcc to run the existing race suite. go vet has no output on success.
Explain evidence, don't merely read green names. The bounds test forces two requests to overlap, checks six results and exact peak=2. The cancellation test waits for a request to start, cancels its parent, then waits for both Run and the server's request context to stop. That is stronger evidence than sleeping and counting goroutines. URL-error test includes malformed URL and 503; deadline test starts with an expired deadline; per-request timeout uses a server that waits for cancellation.
These existing tests cover Run/check, not the newly added HTTP wrapper. The local demo exercises the wrapper's success/failure contract. Race detection covers executed paths, not every possible schedule. Passing tests aren't a proof of no leaks or all production behavior.
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
65 seconds. Run examples/demo.py; it starts the local fixture, builds Go in a temporary directory, runs Python, sequential Go, then bounded Go through the SAME HTTP contract, and cleans up subprocesses. See demo-output.txt for measured elapsed times and full summaries. It refuses occupied service ports; requires loopback 9099, 18080 and 18081.
Manual path: terminal A python3 demo.py fixtures; terminal B python3 service.py OR go run . -serve -sequential OR go run . -serve. POST the request from the contract slide to port 18080 or 18081. go run . with no flags still runs the original standalone local demo.
The fixture uses fixed delays and known responses, but elapsed time varies with scheduling and machine load. Peak is observed at the local server for the finite healthy batch; it isn't a production throughput claim. On timeout, a remote may continue server-side work even when our client stops. The cancellation test uses a Go fixture that cooperates with disconnect, unlike the Python fixture's deliberate sleep.
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
45 seconds. Hand back to the deck's closing around minute 25½. Retell the problem→evidence→fix sequence: working service waits sequentially; threads/async can overlap too; a sequential Go equivalent preserves behavior; naive goroutines lose completion and ownership; collector fixes races; workers bound active work; contexts stop all waits; joining makes return mean finished.
Limits to state honestly: two workers per batch, not globally; bounded input/result memory via a finite API, not a streaming design; concurrency cap, not a rate limiter; exact trusted local targets, not an SSRF-safe internet checker. Production global admission, per-host limits, retries, observability, shutdown and SSRF policy are separate requirements, not hidden claims of this example.
The lesson is not to memorize arrows. Before go, ask who owns data, how work stops, who joins, and who is allowed to close.
-->
