# One service, incrementally rewritten

All commands run from this directory. Go 1.22+, Python 3, standard libraries only.

```sh
python3 demo.py
```

This starts local fixtures, builds Go in a temporary directory, then runs Python
sequential, Go sequential, and Go pooled through `POST /checks`. It prints real
elapsed times and server-observed peak concurrency, not a language benchmark.
Requires free loopback ports 9099, 18080 and 18081. Processes are stopped on exit.
Captured output: `demo-output.txt`.

## Walk it manually

Keep the fixture running in one terminal:

```sh
python3 demo.py fixtures
```

Choose one service in another terminal:

```sh
python3 service.py                 # :18080, sequential baseline
# OR
go run . -serve -sequential        # :18081, sequential translation
# OR
go run . -serve                    # :18081, two-worker pool
```

Send the same request (change only the service port):

```sh
curl -sS http://127.0.0.1:18081/checks \
  -H 'Content-Type: application/json' \
  -d '{"urls":["http://127.0.0.1:9099/ok","http://127.0.0.1:9099/broken","http://127.0.0.1:9099/slow"]}'
```

Both return `results: [{url,status,error}]` and `batch_error`. Status `0` means no
HTTP response. Ordinary URL failures do not stop the report. Successful complete
batches return HTTP 200 even when a URL failed. Ordering and diagnostic error
strings are not part of the contract. Empty batches return an empty results array.

Only the three exact fixture URLs above are accepted; redirects are disabled.
Invalid input returns 400 before any outbound work. Each body is limited to 64 KiB
and each batch to 1000 URLs. This is not an arbitrary-URL open proxy.

Go derives the batch context from the inbound request, with a 2-second budget.
Each outbound HEAD has a 500 ms context deadline. Parent cancellation can leave
partial results; the HTTP response is 504 with `batch_error` if still writable.
A disconnect cannot receive a response. Python deliberately shows the initial
limitation: per-call socket timeouts but no batch deadline/disconnect propagation.
Its `ThreadingHTTPServer` can serve different batches concurrently; checks within
each batch are sequential. Python socket timeouts and Go deadlines are not exact
equivalents.

`go run .` without flags preserves the original standalone local demo, including
its signal context. `checker.py` remains the original threaded Python CLI.

## Existing verification only

```sh
go test -race -v -count=1 ./...
go vet ./...
python3 -m py_compile checker.py service.py demo.py
```

The race detector needs a C compiler. On the authoring machine this was supplied
with `nix shell nixpkgs#gcc -c bash`; no project dependencies were added.
`verification-output.txt` captures the existing suite. No tests were added.
The suite covers `Run`/`check`, not the HTTP wrapper. `demo.py` is a runnable
observation of the service, not a new assertion-based test harness.

## Honest boundaries

The worker cap is **per batch**, not global across inbound requests. Input and
output memory are O(batch size). A concurrency cap is not a rate limiter. The
Python fixture sleeps even after client timeout; client cancellation cannot force
a remote application to stop. The existing Go cancellation test uses a fixture
that observes request cancellation and verifies both sides stop.

These loopback teaching servers are not production deployment templates. Global
admission control, SSRF policy for real targets, rate limits, retries, streaming,
observability, and graceful process shutdown need separate design decisions.
