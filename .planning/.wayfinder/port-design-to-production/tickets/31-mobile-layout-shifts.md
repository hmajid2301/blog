# Ticket: Reduce remaining mobile layout shifts

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

Which font/terminal/media sizing changes cause the remaining mobile layout shifts, and what is the smallest safe improvement?

## Evidence and scope

[Audit 18](18-before-after-lighthouse-audit.md) reports matched three-run lab medians: `/uses/` CLS improves 0.1963 → 0.1481 but remains notable; home rises 0.0023 → 0.0298, Vim 0.0247 → 0.0854, React 0.0011 → 0.0514. Dotfiles improves 0.0264 → 0.0061. These are initial-navigation lab CLS values, not field CWV or new pass/fail budgets. Font self-hosting is not a zero-CLS guarantee.

[Comparison and per-run ranges](../assets/audits/session16/COMPARISON.md), raw Lighthouse JSON/HTML and `comparison.json` in that asset directory. Capture attribution/timeline before changing fallback metrics, terminal geometry or media sizing; distinguish existing `/uses/` behavior from smaller new shifts. Preserve all palette/width/blocked-font layouts and verify matched final runs after any fix. Initial Vim transfer also rises 634.3 KiB/+5 requests while whole-article media falls 97.8%; do not optimize a single score by hiding playback costs. No implementation performed by the audit.

## Investigation findings (no code change)

Attribution captured from final-source Lighthouse layout-shifts and unsized-images audits (mobile):

- `/uses/` **0.1481** → `.lab-terminal`. Pre-existing terminal geometry/ASCII surface; already improved from the0.1963 baseline. Not a new regression.
- Vim **0.0854** → first article `<p>`. Body font swap (`font-display: swap`, Jost over Arial); ticket16 matched x-height/line but not every glyph width.
- React **0.0514** → `.post-body`, driven by the remote Giphy GIF (`media.giphy.com/...giphy.gif`) rendered with no `width`/`height` (unsized-images audit).
- Home **0.0298** → `.lab-writing` section (small).

Why no safe minimal fix was applied:

- Font-swap shifts would require switching `font-display` to `optional` (risks never showing the design fonts on slow loads) or further metric tuning that could regress ticket16's verified fallback work — a UX tradeoff, not a safe win.
- The React remote GIF needs either a content edit (out of scope: presentation, not posts) or a build-time remote dimension fetch (non-hermetic, unreliable).
- The terminal shift is pre-existing and already improving.

All values are lab CLS, not field CWV; only `/uses/` exceeds0.1. Left as deferred debt rather than an unjustified risky change.

## Resolution

Deferred as debt — no code change. The remaining CLS is lab-only; no safe minimal fix exists without regressing ticket 16's verified font-fallback work or making non-hermetic build-time changes, and the only route above 0.1 (`/uses/`, a pre-existing terminal shift) already improves from baseline. Revisit only if field CWV or a concrete regression surfaces.
