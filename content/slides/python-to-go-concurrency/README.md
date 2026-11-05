# From Python to Go: Concurrency Without the Surprises

A 30-minute talk by **Haseeb Majid**, for Python developers new to Go. One local
HTTP service evolves from sequential Python to sequential Go, then to a bounded,
cancellable Go implementation. This is not a Python-versus-Go benchmark.

## Story and timing

`slides.md` owns the short opener, roadmap, closing and untimed appendix. Slidev
imports the complete multi-slide body with `src: ./pages/service-story.md`:

1. **01 · the service we have** — preserve the HTTP contract; observe serial waiting.
2. **02 · the service we rewrite** — translate first, then make ownership and limits explicit.
3. **03 · the service we can trust** — propagate cancellation, join work, show evidence.

Allow 1½ minutes for the opener/agenda, about 24 for the body, 45 seconds for the
closing, and 3¾ minutes for questions. The assembled deck has **36 slides**:
2 opener/agenda + 26 imported body + 2 closing/Q&A + 6 appendix. If behind, use
the body's final ownership slide as the recap and move directly to Q&A.
Six untimed appendix slides preserve
reading links and useful Python→Go bridges without repeating the old main body.
`TALK.md` records the thesis and demo fallback. Speaker notes distinguish actual
code, teaching sketches, normalized output and known limitations.

## Preview

From the repository root:

```sh
cd content/slides/python-to-go-concurrency
pnpm install --frozen-lockfile
pnpm dev
```

Use Slidev's printed local URL (normally port 3030); `p` opens presenter mode.
For a remote VPS, forward that port rather than exposing the development server:
`ssh -L 3030:localhost:3030 haseeb@vps`. Do not restart an existing preview merely
to open another browser tab.

## Compare themes and animations

```sh
pnpm dev:themes
```

Open <http://localhost:3051/?themes=1#/1>. The preview imports the entire
current talk, then adds four animation-lab slides: click reveals and annotations,
Shiki Magic Move with line highlighting, staged diagrams, and a moving checkpoint.
These extra slides are not added to the normal `slides.md` presentation.

The top toolbar offers the original style plus 20 themes. Switching preserves
both the slide and its click step; the URL retains your selected theme on reload.
Use **Replay slide** to restart the current sequence, or **Animation lab** to jump
to the four motion examples. Arrow keys navigate after focus leaves the toolbar.
Without `?themes=1`, preview controls and theme overrides remain inactive.

The palette registry and opt-in CSS live in `../slidev-shared/`. Code syntax
follows the deck's `setup/shiki.ts`; the full-deck preview adapts
palette, fonts, panels, diagrams, and selected heading treatments rather than
installing 20 independent Slidev packages. Display fonts need a network request
unless cached; local fallbacks remain available.

Browser regression check, with the preview server running and `playwright-cli`
installed (from this deck's directory):

```sh
playwright-cli -s=python-go-themes open http://localhost:3051/
playwright-cli -s=python-go-themes run-code --filename=tests/theme-preview.js
```

## Run the service story

Go 1.22+, Python 3; standard libraries only. From the deck directory:

```sh
cd examples
python3 demo.py
```

If Go has cgo enabled but no C compiler is installed, use
`CGO_ENABLED=0 python3 demo.py` for this standard-library-only demo. The race
suite still needs a C compiler.

The demo starts the local fixture, builds Go into a temporary directory, runs all
three stages through `POST /checks`, and cleans up its subprocesses. It needs
free loopback ports **9099, 18080 and 18081**. It prints measured elapsed time and
fixture-observed concurrency; these controlled waits are not a language benchmark.
Captured fallback: [`examples/demo-output.txt`](examples/demo-output.txt).

For a manual walkthrough, keep `python3 demo.py fixtures` running in one terminal.
Choose **one** service in another:

```sh
python3 service.py                 # Sequential Python, :18080
# OR
go run . -serve -sequential        # Sequential Go, :18081
# OR
go run . -serve                    # Two-worker Go pool, :18081
```

Then send the same request (use port 18080 for Python):

```sh
curl -sS http://127.0.0.1:18081/checks \
  -H 'Content-Type: application/json' \
  -d '{"urls":["http://127.0.0.1:9099/ok","http://127.0.0.1:9099/broken","http://127.0.0.1:9099/slow"]}'
```

See [`examples/README.md`](examples/README.md) for the exact contract and limits.
`go run .` without flags preserves the original standalone local checker;
`checker.py` remains the threaded Python CLI. The asyncio slide is a conceptual
async-library sketch, not an installed dependency.

### Boundaries worth saying aloud

- Same JSON shape: `results: [{url,status,error}]` and `batch_error`; completion
  order and diagnostic error strings are not a stable ordering/error-code API.
- URL failures are data: even a completed report containing `503` returns HTTP 200.
- Go derives a 2 s batch budget from the incoming request; each outbound HEAD has
  a 500 ms child deadline. Cancellation returns partial results after joining.
  An expired batch returns 504 if writable; a disconnected caller gets no response.
- Python deliberately shows the baseline limitation: per-call socket timeouts,
  but no batch deadline or disconnect propagation. This is not hidden equivalence.
- Two workers **per batch**, not globally. Finite input/output retain O(n) memory;
  channel backpressure is neither streaming nor requests-per-second rate limiting.
- Exact trusted loopback targets only, redirects disabled. A public URL checker
  needs an SSRF model, global admission, deployment hardening and shutdown policy.
- Cancellation is cooperative and `select` does not prioritize it. It doesn't kill
  remote server work. Context signals stop; the owner must still join.

## Existing verification and build

```sh
pnpm test        # Existing Go race suite + go vet; needs a C compiler
pnpm build       # Deck-local dist/, not published site assets
```

Or from `examples/`: `go test -race -v -count=1 ./... && go vet ./...`.
If GCC is absent on the author's Nix machine, use
`nix shell nixpkgs#gcc -c bash -c 'go test -race -v -count=1 ./... && go vet ./...'`.
Existing captured evidence: [`examples/verification-output.txt`](examples/verification-output.txt).
No tests or test infrastructure were added. The existing suite covers `Run` and
`check`, not the new HTTP wrapper; the demo observes the wrapper. Race detection
only covers executed paths and is not a proof about every schedule or leak.

Build verification is coordinated separately from this structure/diagram change;
no generated publication output is part of it. `pnpm build:hugo` writes into
`static/slides/python-to-go-concurrency/` for site publication—do not run it just
to preview, nor run the all-decks publish task. The existing Hugo entry is
`content/talks/python-to-go-concurrency/index.md`.

## SVGs, structure and inspiration

- Davide Imola's [securing-go talk plan](https://github.com/davideimola/presentations/blob/main/securing-go/TALK.md)
  and [slides](https://github.com/davideimola/presentations/blob/main/securing-go/src/slides.md)
  inspired the **structure**, not the security subject matter: a concrete incident
  before abstraction, three chapters, small code, visible evidence, a fix and a
  practical closing. This deck tells Haseeb's own teaching-service story.
- The upstream [DrawnSvg.vue](https://github.com/davideimola/presentations/blob/main/theme-brand/components/DrawnSvg.vue)
  demonstrates progressive ink strokes, click-group reveals, and readable static
  export/reduced-motion states. Our pool SVG is an **original drawing and
  implementation** of that technique, not copied upstream source or artwork.
- No explicit license was found in the inspected repository-root file listing or
  the `securing-go` directory; the checked root, talk and `theme-brand` `LICENSE`
  URLs returned 404. That is not a license grant. No upstream SVG, brand component,
  personal branding, logo or portrait is redistributed here.
- Earlier visual direction referenced Severin Neumann's
  [Reliability: Manual → Autopilot](https://github.com/bronto-community/ai-sre-talk).
  Theme/layout styling remains deck-local and separate from the neutral diagrams;
  no Bronto or Davide branding/artwork is included.

`PoolDiagram` retains `<PoolDiagram :step="$clicks" />` (stages 0–3). Nodes stay
fixed while producer handoff, worker-local work tokens, result collection and
cancellation are revealed. Arrows name actions. Stroke transitions run only on
stage changes; nothing loops. Overview/print/export show the completed diagram,
and reduced motion disables transitions. The illustrated three workers are a
visual aid; the runnable service uses two. `AgendaTimeline` follows the actual
three chapters, not the former five-stop timeline.

[`THEME-NOTES.md`](THEME-NOTES.md) compares all three upstream themes, including
the MIT-licensed legacy theme, and records the original local theme’s direction.

Components use `--talk-ink`, `--talk-paper`, `--talk-accent` and `--talk-muted`
with fallbacks so local layout/theme changes do not require another palette.
No dependency, lockfile or publishing-infrastructure changes are needed for them.
