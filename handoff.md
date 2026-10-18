# Handoff

## What Was Completed

Project: `/home/haseeb/projects/blog`. Slidev deck: `content/slides/go-labs-eda-go-kafka/`.

Added four custom Vue components and five slides **at the end**, preserving the original slides:

- Slide 73: `RoughDiagram.vue`, outbox relay comparison (`relay-shapes`).
- Slide 74: `RoughDiagram.vue`, worker scaling comparison (`worker-scaling`).
- Slide 75: `PartitionQueue.vue`, partition-local logs, stalled worker, growing lag, recovery; consumption advances offsets without deleting log records.
- Slide 76: `OffsetCrashDemo.vue`, bank payment succeeds, crash before offset commit, replay, same bank key, two requests but one payout.
- Slide 77: `OutboxDemo.vue`, atomic state/outbox transaction, publication acknowledged, relay crash before marking, same event republished, possible duplicates.

Key supporting files:

- `components/diagram-previews.ts`: existing diagram definitions, palette and click-indexed data. Reused for Rough.js comparisons.
- `components/rough-drawing.ts`: deterministic seeded Rough.js paths, nodes, groups, edges, arrowheads.
- `components/demo-states.ts`: stateless click-indexed snapshots for the three demos. Backward navigation restores the whole state.
- `components/demo-panels.css`: shared styles for demo cards.
- `tests/demo-states.test.ts`: four Node tests for state semantics, routed geometry and deterministic Rough.js drawing.
- `tests/demo-browser.js`: Playwright CLI forward/backward check of all 26 states across slides 73–77, screenshots, overflow and page errors.
- `tests/arrow-browser.js`: arrow animation/colour regression check for slides 53–54, backward navigation and reduced motion.
- `package.json`/`pnpm-lock.yaml`: direct dependency `roughjs` 4.6.6 (already transitive in lockfile); `pnpm test` uses native Node TypeScript support.

### Arrow styling corrections (important user feedback)

User found slide 53's white-on-white animation too subtle. An initial attempt with thick arrows, huge heads and a cyan overlay looked bad to the user. **Do not repeat that styling.** User explicitly pointed to **slide 6 and earlier slides** as the reference.

Final `DiagramPreview.vue`/`RoughDiagram.vue` treatment:

- Single slim **4px** line.
- Active arrows use moving **9px/5px dashes**, not a coloured overlay on a solid line.
- Small arrowheads (14px marker size for SVG; similar Rough.js geometry).
- Default pale `#bac2de` arrows; red `#f38ba8` for bank failure, orange `#fab387` for upstream timeouts.
- Arrowheads match line colour. Labels retain semantic colours.
- Default labels moved off straight arrow paths so text doesn't mask animation; explicit `labelAt` positions retained.
- Reduced motion stops animation but keeps dashed emphasis.
- Slide 54 click 1: bank arrow turns red. Click 2: upstream arrows turn orange, bank stays red.
- Active straight arrows in the Slidev-Arrow comparison use SVG for the dashed animation; inactive straight arrows still use the built-in Arrow component.

Verification completed:

- `pnpm test`: 4/4 pass.
- `pnpm build`: successful, latest run after restoring red/orange colours.
- `git diff --check`: clean.
- Browser: slides 73–77 all 26 states reversible, no page errors or detected slide overflow (checked before final colour-only change).
- Browser regression: slides 53–54 active dashes move, correct click activation and colour progression, reduced motion and backward reset pass after latest changes.
- Screenshots of all new slides and corrected arrows inspected visually.
- Independent read-only subagent review of initial five-slide implementation found no actionable issues.

## Current State

The user asked for further storytelling component suggestions. Suggested:

1. `FailureCascade`: bank slows → waiting calls → timeouts → retry load; contrast independent consumers.
2. `RetryJourney`: follow one event through failure → retry topic → another attempt → DLQ → deliberate operator replay.
3. `RebalancePause`: worker joins/dies, processing pauses, partitions move, processing resumes.
4. `OutcomeUnknown`: bank processed payment, response was lost; compare a new retry key against the same stable key.
5. `TransferTracker`: recurring status strip for transfer t-42 across slides.

Recommended **RetryJourney and OutcomeUnknown** because they add new storytelling value rather than duplicate diagrams.

Latest user request: **"do it at but write in skill:handoff"**. Interpreted as: record a handoff to implement the two recommended components **at the end** of the deck. The earlier explicit placement requirement was also "at the end". No implementation of these next two components has started. Do not assume all five suggestions were requested; the concrete recommended scope is the two below.

## What Remains

1. Inspect existing retry/DLQ and timeout/idempotency sections in `slides.md` to preserve the talk's exact terminology and guarantees.
2. Implement **RetryJourney.vue**, append one new slide (expected 78):
   - Keep the same event ID and transfer identity visible throughout, e.g. `evt-42` / `t-42`.
   - Click through processing failure, acknowledged publication to `disbursements.retry.5m`, commit of original offset, retry when due, exhausted budget → `disbursements.dlq`, then inspect/fix and deliberate operator replay.
   - Avoid too many clicks: group related operations, but make publish-before-commit ordering visible.
   - Retry topics are not automatically delayed by Kafka; show a due-time/not-before check or label “retry worker waits until due”. Existing deck also mentions `.retry.30m` and a separate retry consumer group.
   - DLQ replay must be explicitly operator-driven after inspection/fix, not automatic looping.
   - Keep event ID and stable bank idempotency key when replaying. Clearly distinguish event identity from partition offsets.
3. Implement **OutcomeUnknown.vue**, append one new slide (expected 79):
   - Bank processes a payment, response is lost/times out; worker sees “unknown”, not “failed”.
   - Show two branches side by side: new key → another payout is possible; same stable key → original result, one payout.
   - Keep actual bank outcome and worker knowledge visually separate.
   - Explain assumption that bank enforces idempotency; do not imply Kafka guarantees exactly-once external effects.
4. Reuse the current palette, fonts, state snapshot pattern and existing components/styles where useful. Keep both components click-driven, deterministic and reversible. No real bank/Kafka integration, timers or new animation libraries needed.
5. Write runnable state tests first (native `node:test`, no test framework dependency). Add browser checks for new slides' click progression, backward navigation, reduced motion if animation is added, and overflow.
6. Run `pnpm test`, `pnpm build`, browser click-through and inspect screenshots. Report the final slide numbers and local links. Do not modify/reorder earlier slides.

Suggested bounded design: two self-contained Vue components plus state functions added to `demo-states.ts`, native tests in the existing test file, two appended slides with explicit frontmatter `clicks` and short speaker notes. Prefer narrative state changes over gratuitous visual effects. User has approved proceeding with the recommendations; do not re-ask whether they want them.

## Key Decisions & Constraints

- **Append only** for new storytelling slides. Existing deck currently totals 77 slides.
- User likes earlier slides' sketch style and slim dashed arrows. Match slide 6; no cyan overlay, oversized arrows or flashy redesign.
- Use semantic red/orange failure cues and current Catppuccin palette.
- Keep this a storytelling aid, not a production simulator or a general-purpose diagram framework.
- Fixed seed Rough.js geometry prevents jitter across clicks.
- Click state is derived from `step` / `$clicks`, never accumulated side effects. That supports backwards navigation, presenter previews and exports.
- External payment idempotency is conditional on bank support, stable keys and retention; Kafka offset commits do not deduplicate bank effects.
- Outbox prevents the DB/event-loss gap but allows duplicate delivery.
- A `.codegraph` index is available. Prefer codegraph exploration for structural questions; sync when stale. Last colour edits may not be synced.
- User prefers local ketch tools for external research; no research needed unless materially helpful.
- Skill repo downloaded at `/tmp/slidev-skills` (not installed globally). Previously read: `slidev-components`, `slidev-click-animations`, `slidev-drawings`; other skills are there if needed.
- Follow installed coding skills; use a short bounded workflow rather than a large architecture/spec exercise.

## Running State

- Branch: `feat/v3-kafka`.
- HEAD at handoff creation: `ced9dd9` (`work`, empty commit). Prior substantive commit: `6bf7039` (`work`), containing the four components, five slides and final arrow updates.
- Working tree was clean before creating this `handoff.md`. User appears to have committed the session changes externally; **do not reset or amend their commits**.
- Dev server already running: PID **28493**, Slidev `slides.md --open`, port **3030**, HTTP 200.
- Deck root: `/home/haseeb/projects/blog/content/slides/go-labs-eda-go-kafka`.
- Current reference links:
  - `http://localhost:3030/#/6`
  - `http://localhost:3030/#/53?clicks=1`
  - `http://localhost:3030/#/54?clicks=2`
  - New components start at `http://localhost:3030/#/73`.
- Playwright CLI not in the plain shell PATH; use `nix develop -c playwright-cli ...` from repo root.
- Browser session name: **slidev-comparison**, may still be running, most recently on slide 54 click 2.
- Nix shell creates browser config `.playwright/cli.config.json` and browser symlinks `.playwright-browsers/`; these and `.playwright-cli/` are ignored by git.
- Browser warning logs contain `ClicksContext: Unexpected register after mounted` from hot reload of existing `v-mark` components. No page errors were observed. Do not mistake these HMR warnings for failed tests.
- No database/Kafka/bank services are required for these explanatory demos.

### Verification commands

```bash
# From deck root
cd /home/haseeb/projects/blog/content/slides/go-labs-eda-go-kafka
pnpm test
pnpm build

# From repo root; existing browser session
cd /home/haseeb/projects/blog
nix develop -c playwright-cli -s=slidev-comparison run-code \
  --filename=content/slides/go-labs-eda-go-kafka/tests/demo-browser.js
nix develop -c playwright-cli -s=slidev-comparison run-code \
  --filename=content/slides/go-labs-eda-go-kafka/tests/arrow-browser.js

# If the browser session needs reopening
nix develop -c playwright-cli -s=slidev-comparison open \
  http://localhost:3030 --config=.playwright/cli.config.json
```

Browser scripts are function expressions understood by `playwright-cli run-code`, not Node test files. Screenshots/logs from this session are in `/tmp/blog-*` and ignored `.playwright-cli/`; don't add them to git.
