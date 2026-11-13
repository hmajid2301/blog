# Image Delivery Implementation Plan

**Goal:** Reduce article media weight without flattening animations, breaking zoom or changing slide assets.

**Spec:** `../tickets/16-performance-and-feeds.md` (GIF conversion and image pipeline items only).

**Architecture:** Keep Hugo's image render hook and resource lookup. Convert the five GIF demos in the Vim/VS Code post to H.264 MP4. Generate WebP candidates up to 720/1440px for static raster images, with no upscaling; retain originals for zoom and keep GIF/SVG/remote fallbacks intact.

## Constraints

- Work only in `/home/haseeb/projects/blog-design-lab`, branch `design/blog-theme-exploration`.
- Preserve existing dirty analytics changes. No commits, pushes or deployment.
- No new tests or infrastructure; verification scripts/builds/screenshots stay under `/tmp/blog-image-review/`.
- Do not edit slides, unrelated content, feeds, analytics choices, fonts or taxonomy.
- Keep original GIF source assets and stable original-resource URLs. Videos keep pause controls and accessible labels.

## Task 1: Baseline

- [x] Read render hook, video shortcode, zoom callers, image CSS and five demo callers.
- [x] Measure cold-cache local media requests and bytes on the three heaviest posts at 390/1440px.
- [x] Record methodology: force lazy images eager for a whole-post comparison, block third-party hosts, use DPR 1, capture local network request counts and browser-selected media URLs. Compare full-file sizes of those selected URLs; video buffering can leave Network loading-finished byte totals incomplete. Historical third-party images are excluded from the local comparison.

## Task 2: Delivery

- [x] Convert five `images/*.gif` demos to `.mp4` with ffmpeg: H.264/yuv420p, CRF 20, variable frame timing, even-dimension padding and faststart. Use `-enc_time_base 1:100 -bf 0` to preserve every GIF frame timestamp/duration; the initial B-frame encode shortened final holds.
- [x] Change only those five Markdown URLs. Retain labels and original GIFs.
- [x] Update `layouts/_default/_markup/render-image.html`: supported local static raster resources get WebP candidates at min(720, original width) and min(1440, original width), intrinsic original dimensions, lazy loading, sizes and original-image zoom URLs.
- [x] Keep external resources external and GIF/SVG fallbacks unprocessed. Resolve local resources from the parsed URL path so fragments do not break lookup.
- [x] The converted GIF-derived videos loop muted inline with controls; regular videos keep their existing non-autoplay behavior. Use retained GIF metadata for intrinsic dimensions and original-animation fallback links.

## Task 3: Verification

- [x] Production build; no new missing-image warnings.
- [x] Compare the same cold-cache browser measurements against baseline; report bytes and request counts, including video range requests.
- [x] Verify all local media decode, responsive candidates match real widths and preserve layout at 390/1440px; inspect screenshot quality.
- [x] Check video playback/loop/mute/inline/pause behavior and original zoom links. Check narrow viewport overflow and four palette states.
- [x] Disposable Hugo content verifies remote/protocol-relative images, query/fragment lookup, SVG, animated GIF and small/large raster boundaries without repository tests.
- [x] Independent focused review of this pass; record evidence and remaining work in the ticket. The parent performance ticket remains open.

## Follow-up: user-selected short clips

- [x] Inspect contact sheets and select one representative action per demo.
- [x] Trim to 4.5–5 seconds, keep the full frame to preserve keystroke/navigation context, scale to 960px and encode at 12fps/CRF 24. This supersedes the initial full-length/VFR settings above.
- [x] Verify all five clips are under 500,000 bytes, play/loop/pause correctly and retain their accessible labels. Total is 629,769 bytes; measured local requests remain five at 390/1440px.
- [x] Retain original GIFs and keep full-length MP4 backups under `/tmp/blog-image-review/trim/full-length-backup/`; record commands, intervals and sizes in the ticket. No commit/push.
