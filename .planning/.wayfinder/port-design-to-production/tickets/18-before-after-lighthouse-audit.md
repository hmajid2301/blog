# Ticket: Audit before/after performance, accessibility and site health

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

Do the cleanup, analytics removal and media changes improve the visitor experience without introducing performance, accessibility, functionality or site-health regressions? Which findings must be addressed before shipping? Use Lighthouse plus focused checks it does not cover.

## Notes

AFK audit task: gather evidence needed for the shipping decision, not a new test suite or permission to deploy. Requested by the user after the GIF demos were shortened. Related work: [Fix image weight, RSS links, analytics and fonts](16-performance-and-feeds.md).

The baseline can be captured now. The final comparison must identify exactly which pending fixes are included; if the performance ticket changes afterward, rerun the affected final audits before drawing a shipping conclusion. This ticket has no blocker so baseline capture is not delayed.

## Comparison scope

- **Before:** `8c3d1c054e0f4b0f26d21928e91c8ae25e17611b`, the pushed design checkpoint before the cleanup/analytics/media pass. This isolates those improvements rather than conflating them with the entire redesign.
- **After:** the exact final design-branch revision or reproducible working-tree snapshot being assessed. Record its SHA and any dirty patch/new assets; do not silently omit untracked MP4s or commit the user's work just to run an audit.
- If a whole-redesign comparison is also wanted, run a separately labelled comparison against production/main. Do not substitute it for the scoped baseline or mix the results.
- Use isolated source snapshots and production Hugo builds served locally, without Hugo's development server or live reload. Leave both existing worktrees untouched. Use the same build toolchain and equivalent local base URLs.

## Representative pages

Run the same paths on both builds:

- `/` — homepage and shared chrome/fonts.
- `/uses/` — Floating terminal and symbol fonts.
- `/posts/2022-12-02-my-useful-vim-commands-with-vs-code/` — five converted/shortened GIF demos.
- `/posts/2023-04-30-my-dotfiles/` — responsive screenshots plus retained animation.
- `/posts/2018-09-07-debugging-react-native-apps-in-webstorm-and-visual-studio-code/` — mixed local/remote images and retained GIFs.

## Audit method

- Pin and record Lighthouse and Chrome versions, OS, command/flags, viewport/DPR, CPU/network throttling, cache state and server setup. Keep these identical across each before/after pair.
- Run Lighthouse performance, accessibility, best practices and SEO categories in mobile and desktop modes. Use at least three fresh-profile/cold-cache runs per page/mode/build; compare medians and keep the individual results to show variance.
- Record category scores, FCP, LCP, CLS, TBT and Speed Index, plus request counts and transferred bytes by resource type. Do not promise a score of 100 or invent pass/fail budgets after seeing results.
- Lighthouse's initial-navigation audit does not necessarily load all lazy images or buffer every video. Include a separately labelled, matched whole-article scroll/media check so animation and responsive-image savings are not missed. Distinguish selected full-file sizes from actual transferred bytes and video range requests.
- Keep external-resource/analytics routing policy explicit and consistent. Avoid polluting real analytics with test visits; document any blocking and its effect on the comparison. Record third-party outages separately from regressions.
- Preserve the selected palette/mode for matched score comparisons. Supplement contrast findings with checks of all four palette/mode states and keyboard focus. Automated accessibility scores are not a complete accessibility review.
- These are lab results, not field Core Web Vitals. Do not infer real-user INP or a field pass from Lighthouse's TBT.

## Complementary audits

Use disposable scripts/browser sessions and existing tools; add no repository test framework. Capture before/after results where comparable, distinguishing pre-existing failures from new regressions.

- **Links and assets:** crawl generated internal page links, redirects, heading fragments and image/video/font URLs. Check HTTP failures, missing assets and unexpected redirect loops. Check a small sample of external links; do not launch an unrestricted external crawl.
- **Feeds and discoverability:** parse RSS XML and verify channel metadata, absolute item/content links and media URLs. Check sitemap/robots consistency, canonical URLs, titles/descriptions, OG/Twitter images and structured-data parse errors. Confirm removed playground pages stay absent.
- **Browser health and privacy:** inspect console exceptions and failed network requests. Confirm no GoatCounter/Plausible or localhost-widget requests remain. Inventory remaining third-party hosts, mixed content and unnecessary requests; never report removal of all third-party traffic merely because analytics is gone.
- **Keyboard and accessibility:** check visible focus, navigation/search focus management, Escape/Tab behavior, accessible names, heading order and zoomed text. Spot-check colour contrast in all four palette/mode states. Check reduced-motion behavior and that looping media can be paused. Preserve actionable findings even if Lighthouse's accessibility score is high.
- **Responsive and visual regressions:** inspect representative pages at narrow/mobile and desktop widths, with text zoom. Look for horizontal overflow, layout shifts, distorted images, clipped code/status bars and font fallback problems. Use matched screenshots where helpful, not a new screenshot-test harness.
- **Key interactions and media:** verify search, palette/light-dark persistence, code copying/feedback, original-image zoom, and video decode/loop/pause/inline behavior. Check page navigation and RSS links from the UI. Surface browser-specific risks; Chromium-only evidence must not be labelled cross-browser coverage.

Triage new shipping regressions first. Report legacy content defects separately rather than silently broadening this into an all-site repair project.

## Deliverables and completion

- [x] Save the exact before/after source identities, environment, commands and raw Lighthouse HTML/JSON reports as linked audit assets.
- [x] Publish a concise comparison table by page and mobile/desktop mode, including median metrics, byte/request changes and run variability (local planning asset, not an external publication).
- [x] Record successful checks and regressions with affected pages, evidence and severity; explain whether changes are meaningful or within noise.
- [x] Summarize the complementary link/feed/SEO/privacy/accessibility/responsive/interaction checks, including explicit untested areas.
- [x] Link existing relevant tickets or create focused follow-ups for actionable findings. Avoid bundling implementation fixes into this audit.
- [x] Post the resolution with a clear shipping recommendation and limitations, then add only a named gist/link to the parent map.

Keep generated reports/screenshots outside production content, initially under `/tmp`; attach or copy the chosen reports to a durable linked audit asset location before resolving. Use a disposable Lighthouse installation if needed. No permanent test infrastructure, CI jobs, automatic commits, pushes, merge or deployment are requested.

## Resolution — audit evidence, not release approval

**Subsequent fix follow-up:** the user explicitly requested both demonstrated blockers fixed together. [Ticket28](28-sidenote-list-semantics.md), [ticket29](29-original-image-zoom.md), [ticket30](30-media-motion-preferences.md) and [ticket32](32-structured-data-encoding.md) are now resolved; [new exact-source verification](../assets/audits/session17/REPORT.md) includes30 fresh final-source Lighthouse runs and focused browser/JSON-LD evidence. [Ticket31](31-mobile-layout-shifts.md) remains deferred with investigation findings. The original two-blocker hold below describes the earlier snapshot, not an unresolved failure in the new one. Broader limitations/debt remain; no release/deployment approval is implied.

**Recommendation: hold this snapshot for two demonstrated regressions.** [Sidenote list semantics](28-sidenote-list-semantics.md) is an important accessibility regression (desktop Vim score 100 → 96, three out of three runs); [original-resolution zoom/Escape closing](29-original-image-zoom.md) is a medium functional regression (Dotfiles retains the responsive1440×810 WebP rather than loading the3840×2160 original, and Escape leaves the after overlay open; naturalWidth760 is density-corrected CSS width, not file resolution). No fixes bundled into the audit. Those tickets remain unclaimed; rerun affected final checks after fixing them.

**Durable local entry point:** [Audit report](../assets/audits/session16/REPORT.md). [Comparison table](../assets/audits/session16/COMPARISON.md), [whole-article transfers](../assets/audits/session16/MEDIA.md), [browser/accessibility](../assets/audits/session16/browser/REPORT.md), [site health](../assets/audits/session16/health/REPORT.md), [reconstruction/commands](../assets/audits/session16/REPRODUCE.md). All 60 final Lighthouse HTML/JSON pairs, per-run/per-type metrics and screenshots are retained alongside them. The ignored asset directory is durable on this worktree, **not uploaded, committed or backed up remotely**; copy it before deleting the worktree. SHA256SUMS verifies the copied artifacts.

### Exact comparison

Before `8c3d1c054e0f4b0f26d21928e91c8ae25e17611b`; after HEAD `43ac933fb2a051082452b21958136e4dcf7e41a4` plus retained binary dirty patch and untracked-assets archive, including five MP4s, fonts, feeds/tags and all inherited component work. After input-manifest SHA-256: `c203a41cf354d3ab48474d52c952a8a959bcca9103177d2005b41b3d83e8df8c`. Full history bundle preserves GitInfo. Snapshot excludes only later audit planning/evidence edits; no production files were changed for this task.

60 valid cold-profile runs (3 × 5 pages × 2 modes × 2 builds), Hugo 0.164.0 production/minified, Lighthouse 13.6.0 / Chrome 149.0.7827.55. Same Range-capable uncompressed/no-store loopback server. Mobile 412×823/DPR1.75, simulated RTT150ms/1638.4Kbps/CPU4×; desktop1350×940/DPR1, RTT40ms/10240Kbps/CPU1×. Catppuccin/light matched comparisons; four-state contrast/focus supplement. Identical analytics/widget blocklist on both; other third parties live. Discarded preflight/emulation attempts are not pooled; final raw settings assert correct mobile/desktop modes.

### Main results and trade-offs

- Actual whole-article image/media transfer: Vim **97.8% lower**, Dotfiles **71.5% mobile / 67.3% desktop lower**, React **3.4% / 3.2% lower**. Five MP4 payloads total629,769 bytes; actual encoded transfer631,013 over five206 Range responses (all buffered fully here, not a universal buffering claim).
- Vim initial navigation instead costs **+634.3KiB / +5 requests** (videos preload before scrolling; baseline lazy GIFs did not). Mobile score93 → 91; LCP effectively unchanged. Home/uses transfer grows16.2/16.6KiB. Do not sell whole-article savings as universal initial-load savings.
- Home mobile LCP2251 → 1952ms; most other mobile LCP deltas0–1ms are noise. Uses mobile CLS improves0.1963 → 0.1481 but remains notable; smaller new mobile shifts on home/Vim/React remain. [Layout-shift follow-up](31-mobile-layout-shifts.md). No field-CWV/INP/zero-CLS claim or retrospectively invented budget.
- SEO scores unchanged; relative RSS content URL occurrences1,991 → 0, 230 after feeds parse, no new missing referenced internal target/fragment/asset after semantic comparison. Legacy links/images and generic “here” anchor text remain. [Pre-existing JSON-LD encoding](32-structured-data-encoding.md) is separate debt, previously noted in ticket09.
- No after analytics/widget request attempts or Google Fonts requests. Remaining sampled hosts include cdnjs and Giphy; normal-policy browser runs had no uncaught exceptions. Blocking all external resources separately reproduces the **existing** mediumZoom startup exception on both builds.
- Search results/ArrowDown/Tab/Escape/navigation, actual theme-control persistence, code-copy/feedback, MP4 decode/pause/inline, four-state homepage focus/contrast, 320/390/1440 layouts and blocked-font fallback checked. Native text zoom was not tested; verified computed-font doubling is only a stress proxy. [Motion-preference/retained-GIF pause follow-up](30-media-motion-preferences.md). Image zoom is pointer-only in sampled before/after markup.

Six old-tag-feed301 rules are emitted with valid targets/no chains. Local old feed404s are expected because the audit server does **not** interpret GitLab Pages `_redirects`; live HTTP compatibility still needs verification after an authorized deployment. Best-practices81 → 100 is partly the local HTTP/protocol-relative analytics finding, **not a demonstrated production-HTTPS security improvement**.

Limits: Chromium only, no real screen-reader/other-engine/iOS/field coverage, no production CDN/TLS/cache/header verification, no exhaustive syntax-token/component audit, no native zoom or unrestricted external crawl. Reports retain variance, successful checks, failures and explicitly superseded helper evidence. No permanent tests/dependencies/CI added; no commit/push/merge/deployment or guessed site-history release entry.
