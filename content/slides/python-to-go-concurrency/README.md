# From Python to Go: Concurrency Without the Surprises

A 30-minute talk for Python developers with little Go experience. One finite URL
status-checking batch grows from sequential Python into a bounded, cancellable
Go worker pool. Speaker notes contain contiguous time windows: 28 minutes
30 seconds of prepared material and 90 seconds of Q&A. The final six slides
are untimed appendices.

## Preview

From the repository root:

```sh
cd content/slides/python-to-go-concurrency
pnpm install --frozen-lockfile
pnpm dev
```

Use the local URL Slidev prints (normally port 3030). Press `p` for presenter mode
and the timed speaker notes. On a remote VPS, forward the chosen port over SSH;
there is no need to expose a public development server or restart an existing one.
For example, from your laptop: `ssh -L 3030:localhost:3030 haseeb@vps`.

## Validate and build

```sh
pnpm test        # Go race detector + go vet, local HTTP fixtures only
pnpm build       # dist/, with the same /slides/<slug>/ base as the site
pnpm build:hugo  # static/slides/python-to-go-concurrency/, site publishing path
```

The repository's `task slides:publish:slidev` discovers this package's
`build:hugo` script automatically. Do not run the all-decks task just to preview
this deck: it rebuilds other talks too. From the repository root, a Hugo-only
check can write outside the working tree:

```sh
hugo --destination /tmp/python-to-go-concurrency-hugo
```

The Hugo talk entry lives at `content/talks/python-to-go-concurrency/index.md`.
The site's existing README asks for generated slide output alongside deck source;
`build:hugo` produces it locally, but this task does not commit or deploy anything.

## Examples

```sh
cd examples
go run .
go test -race -count=3 ./...
go vet ./...
# Optional Python baseline against your own trusted local fixture:
python3 checker.py http://localhost:8000/
```

Go 1.22+; Python 3 for the standard-library thread baseline. No third-party Go or
Python packages, no public network calls in the Go demo or tests. The asyncio
slide is a clearly marked conceptual aiohttp excerpt, not an installed dependency.

Implementation slides include named regions from `examples/main.go`, so the
presented pool is the code being tested. Early snippets are deliberately scoped
teaching stages, not independent programs. `Run` requires a non-nil context and
HTTP client; the standard transport observes cancellation.

Content slides carry a chapter footer — the five agenda stops, filling in
as the talk progresses — driven by `layouts/default.vue`.

The runnable demo takes its parent context from `os/signal.NotifyContext`: the
first Ctrl+C (or SIGTERM) cancels the batch gracefully and prints partial
results; a second Ctrl+C is absorbed until the run finishes.

### Contract and teaching boundaries

- At most `workers` checks in progress; unbuffered jobs/results channels.
- Positive worker count is required. An empty batch completes normally.
- Results arrive in completion order. URL errors are data, including HTTP 4xx/5xx.
- Batch cancellation returns partial results plus `ctx.Err()`, after joining the
  producer and workers. Cancellation is cooperative, not prioritized by `select`.
- A 500 ms per-request context budget sits inside a 2 s demo batch budget.
- The demo's parent context comes from `signal.NotifyContext` (Ctrl+C/SIGTERM);
  request and batch budgets still use `context.WithTimeout` on top of it.
- HEAD checks final HTTP status, not application health; some endpoints need GET.
- Finite input and collected output still use O(n) memory. No claim of fully
  bounded streaming, requests-per-second rate limiting, or universal speedup.
- Trusted local teaching endpoints only. Public URL input needs SSRF protection.
- Tests cover overlapping bounded requests, normal completion, per-URL errors,
  empty input, invalid limits, request deadline, expired batch deadline, and
  cancellation reaching an in-flight HTTP request. Race detection is not proof
  against unexercised races or all possible leaks/deadlocks.

## Visual reuse

The CSS imports the Kafka deck's palette, typography, and animation styles;
`setup/shiki.ts` re-exports its Catppuccin configuration. The pool diagram uses
that deck's existing `roughjs` dependency and seeded hachured-box treatment.
Keep the sibling `go-labs-eda-go-kafka` directory available when building.
No new dependency or publishing infrastructure is introduced. As in the Kafka
deck, display fonts are loaded from Google Fonts with local fallbacks; the talk
content and local code demo do not require that font request to succeed.
