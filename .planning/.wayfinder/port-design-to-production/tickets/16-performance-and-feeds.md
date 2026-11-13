# Ticket: Fix image weight, RSS links, analytics and fonts

Labels: `wayfinder:task`
Status: resolved
Assignee: pi
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

The site is slow and leaks data in ways that have nothing to do with the redesign. What needs fixing, and is it done? AFK. Each item can ship to `main` on its own, before or after the merge.

## To fix

Source: `../review-2026-11-11.md` → "Performance, feeds and other non-design issues".

- [x] **GIF → MP4/WebM.** The 5 largest are 2.9–11.4 MB (`2022-12-02-my-useful-vim-commands-with-vs-code/images/*.gif`). Convert with `ffmpeg -i x.gif -movflags faststart -pix_fmt yuv420p x.mp4` and update the markdown. `render-image.html` already renders video, so add `autoplay muted loop playsinline` there.
- [x] **Image pipeline.** `render-image.html` should output resized WebP with a `srcset` (720/1440w) and `width`/`height`. Today the site ships 987 images (205 MB) at original size, with no dimensions.
- [x] **RSS.** Make the 22 relative internal links (`href="./posts/…"`) absolute in the feed, and set the channel description.
- [x] **Analytics.** User chose to remove both GoatCounter and Plausible, including the view counter. This supersedes the original keep-one proposal.
- [x] **Fonts.** Self-host Jost and Schibsted Grotesk (woff2, Latin subset, size-matched fallbacks) and drop `fonts.googleapis.com`.
- [x] **Content.** Merge duplicate tags (`go`/`golang`, `flake`/`flakes`, `home lab`/`homelab`, `ci`/`ci-cd`/`CD`) and lowercase them. The legacy `cover.png` deletion (77 MB) is handled in ticket 08.

## Progress — Analytics removal

The user chose “should we just remove both” when asked which analytics service should remain, then confirmed continuation. Removed both services and their configuration, the analytics invocation from `layouts/_default/baseof.html`, and the obsolete page-view partial/config/translation. The view-counter partial was already unused by the current post metadata. Historical blog tutorials about analytics are preserved, including their escaped examples and JSON-LD article descriptions. Site-verification meta tags and inactive generic Hugo hooks were not changed.

Verification:

- Production build passed in **1453ms**, with the same **12 pre-existing missing-image warnings**.
- Parsed all **720 HTML outputs**: no executable GoatCounter/Plausible script, endpoint or counter remained. The audit deliberately distinguishes executable scripts from tutorial text and inert JSON-LD.
- Browser request capture across home, `/uses/`, the RLS post and the GoatCounter tutorial found **zero requests** to GoatCounter/Plausible domains.
- `git diff --check` passed. No tests or test infrastructure were added. During this work, user checkpoint `43ac933` captured the config/base-template removals and preceding shipping cleanup. The partial/translation deletions and this progress record remain uncommitted. This session performed no commit, push or deployment.

Evidence: `/tmp/blog-analytics-removal/build.log`, `output-audit.json`, `browser-requests.log` and `production/`.

### Media baseline for the remaining work

A static audit of local `img`/`source` references in the current production build found the three heaviest posts below. Bytes sum unique referenced local media files; request counts are unique media URLs, not total browser/network requests. This is a comparable source-weight baseline, not measured transfer size or loading time.

| Post | Referenced local media bytes | Unique media URLs |
| --- | ---: | ---: |
| `2022-12-02-my-useful-vim-commands-with-vs-code` | 29,326,188 | 5 |
| `2023-04-30-my-dotfiles` | 5,434,073 | 7 |
| `2018-09-07-debugging-react-native-apps-in-webstorm-and-visual-studio-code` | 3,786,947 | 4 |

Baseline artifact: `/tmp/blog-performance-baseline.json`. This was recorded before the image-delivery pass below; the baseline alone did not satisfy the required before/after browser measurement.

## Progress — GIF demos and responsive image delivery

The user selected this as the next pass. Implemented only GIF conversion and the render-hook image pipeline; feed fixes, font hosting and tag cleanup remain open. Local implementation plan: `../plans/16-image-delivery.md`.

- Converted all five GIF demos in the Vim/VS Code post to H.264/yuv420p MP4 and changed only their Markdown destinations. Original GIF sources and their published URLs remain intact. GIF-derived videos retain the original labels as accessible names, loop muted inline with native pause controls, and expose original-animation links as unsupported-video fallback content. Ordinary videos remain non-autoplay.
- Encoding: `ffmpeg -i input.gif -an -c:v libx264 -preset slow -crf 20 -vf 'pad=ceil(iw/2)*2:ceil(ih/2)*2' -pix_fmt yuv420p -fps_mode vfr -enc_time_base 1:100 -bf 0 -movflags +faststart output.mp4`. The initial B-frame encode shortened final holds; comparison of every decoded frame confirmed the final files preserve all frame timestamps and durations exactly. Dimensions/frame counts match; MP4 metadata precedes media data for streaming. Each MP4 includes the final 100ms frame hold that GIF container duration metadata omits.
- Supported local static raster images use WebP at up to 720/1440px, deduplicated and capped at source width. Intrinsic original dimensions, lazy loading and responsive sizes preserve layout; `data-zoom-src` retains full-resolution originals. Shared image/video CSS now sets `height: auto` so intrinsic dimensions do not stretch media when width is capped.
- GIFs remain animated and unprocessed, SVGs remain SVG, and remote/protocol-relative URLs remain external. Parsed local URL paths fix query/fragment and encoded-space lookup. The current non-slide inventory contains no animated PNG/WebP; none was flattened by this pass. No slide source or unrelated content was modified.

### Current clips — Shortened on user request

After the initial conversion, the user considered removing the demos, then asked whether they could be trimmed further. The five live MP4s now contain only a representative action: 4.5–5 seconds, 960px wide, 12fps, H.264/yuv420p, CRF 24. The full frame is retained because cropping would hide keystroke overlays or the file/panel-navigation context. The article's surrounding code examples remain unchanged; fine editor text still benefits from fullscreen viewing.

| Demo | Source interval (seconds) | Clip duration | Current bytes |
| --- | --- | ---: | ---: |
| Easymotion | 0.5–5 | 4.5 | 141,755 |
| Panel navigation | 1–6 | 5 | 69,218 |
| File explorer | 12–17 | 5 | 86,625 |
| Normal mode | 5.5–10.5 | 5 | 127,071 |
| Indent/outdent | 5–10 | 5 | 205,100 |

Total: **629,769 bytes**, down from 10,835,747 bytes for the full-length MP4s and 29,326,188 bytes for the original GIFs (**97.85% smaller than GIFs**). Every clip is below 500,000 bytes. Original GIF source files and published fallback URLs remain unchanged. Full-length MP4 backups are under `/tmp/blog-image-review/trim/full-length-backup/`.

Reproduction: encode from each original GIF using `ffmpeg -i input.gif -ss START -t LENGTH -an -c:v libx264 -preset slow -crf 24 -vf 'fps=12,scale=960:-2:flags=lanczos' -pix_fmt yuv420p -fps_mode cfr -enc_time_base 1:12 -bf 0 -movflags +faststart output.mp4`. A fixed 12fps output bounds clip duration reliably; keeping source VFR frame holds had allowed some trial trims to run past five seconds.

Verified browser playback, looping, mute/inline properties and pause controls for all five clips. Measured 390/1440px runs still make five local media requests and select 629,769 total media bytes, with no page overflow. All local media decoded on the other two measured posts as well. Contact sheets and live desktop/mobile captures were inspected. Final build passed in **772ms** with the same 12 existing missing-image warnings; `git diff --check` passed. No additional template or article Markdown edits were needed for this follow-up, and no commit, push or deployment was performed.

Evidence: `/tmp/blog-image-review/trim/` (`candidates.json`, `after-browser.json`, `live-check.log`, contact sheets, desktop/mobile PNGs and `build.log`). This current selection supersedes the full-length clip sizes and timing-preservation claims below; the responsive-image evidence remains applicable.

### Initial full-length before/after measurements (historical)

Measurements use Chromium at DPR 1, fresh contexts with cache disabled, 390px and 1440px viewports, and all article images forced eager for a comparable whole-post run. Third-party hosts (including the historical remote Giphy image) are blocked in both runs. The table reports **full-file bytes of the local media URLs actually selected by the browser**, plus observed local image/media request counts. It is not a page-load timing or partial-buffer transfer benchmark: video buffering intentionally may stop before the complete file, so incomplete Network loading-finished byte totals are not used as a claimed saving. Inline native-control icons/data URLs are not network requests.

| Post | Width | Before bytes | After bytes | Reduction | Requests before/after |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vim/VS Code commands | 390 | 29,326,188 | 10,835,747 | 63.1% | 5 / 5 |
| Vim/VS Code commands | 1440 | 29,326,188 | 10,835,747 | 63.1% | 5 / 5 |
| My dotfiles | 390 | 5,434,073 | 1,549,727 | 71.5% | 7 / 7 |
| My dotfiles | 1440 | 5,434,073 | 1,773,313 | 67.4% | 7 / 7 |
| React Native debugging | 390 | 3,786,947 | 3,600,340 | 4.9% | 4 / 4 |
| React Native debugging | 1440 | 3,786,947 | 3,609,872 | 4.7% | 4 / 4 |

The React Native post still contains two large GIFs outside the selected five-demo conversion. They remain animated, so that page's reduction is smaller. Source/original resources are retained for compatibility; these are visitor-media savings, not a reduction in archived/deployed original assets.

Verification:

- Final production build passed in **615ms**, with the same **12 pre-existing missing-image warnings**. `git diff --check` passed.
- All local media decoded in the six measured page/viewport combinations. No horizontal overflow; maximum displayed-media geometry difference from baseline was **0.234375px**.
- Eight live palette/mode/viewport combinations verified all five videos' labels, aspect ratios, mute/loop/inline/autoplay/control properties and no overflow. Playback advanced, pause worked, and original-image zoom opened and fetched the full-resolution PNG. Desktop/mobile video and desktop image screenshots were inspected.
- A production-output audit found **224 responsive image instances** and **387 unique WebP candidates**; all candidate files, original zoom URLs, positive dimensions and capped/accurate width descriptors were verified. The five original GIF URLs still serve byte-identical files.
- A disposable Hugo fixture checked a 320px source (one non-upscaled candidate), large raster, global asset, query/fragment, percent-encoded space, GIF, SVG, remote/protocol-relative images and ordinary video. All checks passed without repository tests or test infrastructure.
- Independent `image-delivery-review`: no actionable findings in the scoped changes. No files were modified by the reviewer.

Evidence: `/tmp/blog-image-review/` (`before-browser.json`, `after-browser.json`, `comparison.json`, `video-encoding.json`, `live-check.log`, inspected PNGs, `fixture-build.log`, `build-final.log`). Media/code changes remain uncommitted; this session performed no commit, push, merge or deployment. The ticket remains in progress for RSS, fonts and tags.

## Resolution

Completed the remaining feed, font and tag work on the design worktree. The media/analytics implementations and their evidence above are preserved; the historical “remains in progress” notes no longer describe the ticket's current status. No commit, push, merge or deployment was performed.

- **RSS:** channel description now uses the page description or configured site description. Feed-only partials resolve HTML navigation/media/zoom URLs and responsive candidates against each article permalink, including footnote fragments, parent paths, queries and protocol-relative URLs. Historical `./posts/…` links resolve from the site root. Summaries receive the same treatment; normal page rendering is not changed by the feed partials. Escaped code samples remain untouched, and CDATA terminators are safely split.
- **Fonts:** packaged unmodified Latin variable WOFF2 subsets from pinned Fontsource packages 5.2.8: Jost normal + italic (100–900), Schibsted Grotesk normal (400–900), **104,028 bytes total**. Removed Google Fonts CSS and preconnects. Bundled CSS provides `font-display: swap` and x-height/vertical-metric-matched local Arial/Liberation Sans fallbacks. Unsupported glyphs use system fonts. Source URLs, checksums, metrics and complete OFL notices live in `static/fonts/web-fonts-README.md` and the adjacent license files. Terminal fonts and MonoLisa policy are unchanged.
- **Tags:** normalized front matter in **18 posts**, merging `golang` → `go`, `flake` → `flakes`, `home lab` → `homelab`, and `ci`/`ci/cd`/`CI/CD` → `ci-cd`; lowercased remaining mixed-case tags. Deduplicated the post already carrying both `go` and `golang`. No article body, slide or example source changed. Hugo aliases retain the old taxonomy landing/page-one URLs. Six explicit `static/_redirects` rules preserve old tag RSS subscriptions on GitLab Pages, including nested `/tags/ci/cd/index.xml`; canonical feeds contain the union of the original articles. Added compatibility for `/tags/cd/` although that variant was not present in the current inventory. Unrelated tag synonyms and content defects were not broadened into this pass.

### Verification

Fresh evidence: `/tmp/blog-performance-finish/`.

- **Production build:** `hugo --destination /tmp/blog-performance-finish/final` passed in **739ms**, with the same **12 existing missing-image warnings**. `git diff --check` passed. A separate equivalent local-base build is served on port **1431** for browser checks.
- **Feeds:** parsed all **230 generated RSS feeds**, **1,474 item instances**, and **12,454 inspected navigation/media URLs**: no relative inspected URLs or missing channel descriptions. All item links/GUIDs are absolute. The feed count decreases from 235 because duplicate tag feeds were merged, not because articles were dropped. Confirmed **1,098 code blocks across 225 homepage-feed articles** retain their original text. Evidence: `check-feeds.py`, `feeds-final.json`, `code-preservation.json`.
- **Disposable feed fixture:** verified summary and full-content output for root/site-post/page-relative/parent links, fragments, query/entity escaping, external/mail/protocol-relative URLs, single-quoted HTML, srcset descriptors, comma-containing URLs/data URLs, absent descriptors and no separator whitespace. Escaped tutorial code is preserved. Independent review identified the initial comma-splitting defect; fixed it and reran the fixture plus all production-feed checks. Evidence: `fixture/`, `check-fixture.py`, `fixture/check.json`.
- **Fonts in Chromium:** all three web fonts and three local fallback faces loaded successfully in **9 page/viewport combinations** (home, uses, dotfiles × 320/390/1440px); no Google font links/requests, page exceptions or horizontal overflow. Forced font-request failures still leave readable text and working local fallback faces at 390/1440px. Additional checks cover all four palette/mode states at 390/1440px, desktop 200% text sizing, and no-JS mobile rendering. Desktop/mobile screenshots and blocked-font screenshot were inspected. Evidence: `font-browser.json`, `palette-font-check.json`, `nojs-fonts.log`, `fonts-390.png`, `fonts-1440.png`, `fonts-blocked-desktop.png`.
- **Taxonomies/search:** all **237 search entries** retain their article identities, titles, content, section and date, with the expected normalized tags. Canonical tag feeds contain **go 14 / flakes 2 / homelab 5 / ci-cd 19** posts. Verified **12 old-path HTML aliases**, six emitted feed redirect rules, and their canonical RSS destinations. Parsed **722 HTML outputs** for live Google Fonts links: none. Evidence: `final-check.json`, `tag-inventory.json`, `tag-changes.json`.
- **Review:** independent scoped read-only review found one actionable srcset edge case, now fixed and covered by the disposable fixture. Other missing feed destinations are legacy content defects, not repaired here.
- **Source identity:** HEAD `43ac933fb2a051082452b21958136e4dcf7e41a4` plus dirty source snapshot; `source/` records the binary patch, untracked-asset archive and SHA-256 manifest, including inherited MP4/component assets. Nothing was committed merely to identify the build.

The required before/after media measurements remain the earlier recorded runs: Vim/VS Code GIFs **29,326,188 → 629,769 bytes**, five requests at both measured widths; dotfiles **5,434,073 → 1,549,727 / 1,773,313 bytes**, seven requests; React Native debugging **3,786,947 → 3,600,340 / 3,609,872 bytes**, four requests (390/1440px). These are selected full-file media sizes, not transfer/load-time or Lighthouse claims. This session did not repeat or supersede those media encodings.

### Limitations / next decision

This resolves implementation and focused verification, **not shipping approval**. [Audit before/after performance, accessibility and site health](18-before-after-lighthouse-audit.md) remains unclaimed for the matched Lighthouse/site-health comparison. No Lighthouse, field CWV, full link crawl or cross-browser coverage is claimed here. Actual GitLab Pages HTTP feed redirects must be confirmed after deployment; the local static server cannot execute `_redirects`. Fallback matching reduces reflow but does not promise identical glyph widths or zero CLS. Blocking all external resources also exposes the existing external medium-zoom dependency; the font pass leaves it unchanged for the audit to inventory.

## Done when

Image size and request counts on the 3 heaviest posts are measured before and after, and recorded in the resolution.
