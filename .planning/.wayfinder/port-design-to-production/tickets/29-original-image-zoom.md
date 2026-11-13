# Ticket: Restore original-resolution image zoom and Escape closing

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: shipping recommendation from ticket 18
Blocked by: none

## Question

Why does responsive-image zoom open only a small generated image rather than the original?

## Evidence and scope

New medium functional regression in [audit 18](18-before-after-lighthouse-audit.md), following image delivery in [ticket 16](16-performance-and-feeds.md). On Dotfiles, first screenshot before opens `quick_settings.png` at 3840×2160; after retains a generated 1440×810 WebP. Its naturalWidth760 is density-corrected CSS width from srcset/sizes, not the file resolution. `data-zoom-src` resolves to the correct original, but no original request occurs after click, even after three seconds in a fresh context. Reproduced in three interaction passes. Escape closes before, but **after remains open** (`zoom-focused.json` escapeClosed=false, independently raw.json zoom-escape.remaining=1).

[Durable browser report](../assets/audits/session16/browser/REPORT.md), `browser/zoom-focused.json`, `before-zoom-focused.png`, `after-zoom-focused.png`. Root cause is not established by the audit; inspect the duplicate mediumZoom script/initialization paths rather than assuming the responsive render hook alone is wrong.

Restore real full-resolution loading and reliable Escape closing while preserving responsive normal rendering and no-zoom exclusions. Verify actual requested URL and file dimensions (naturalWidth may be density-corrected by srcset), not just overlay visibility. Also avoid the pre-existing `mediumZoom is not defined` exception when the external CDN is unavailable (`browser/resilience.json`); prefer one coherent initialization path. Sampled zoom is pointer-only in both builds: assess keyboard operability/focus explicitly, including the new Escape failure, rather than treating the overlay alone as accessible. Recheck affected pages/health and final audit snapshot after changes. No implementation performed by ticket 18.

## Resolution

User subsequently explicitly requested both audit blockers fixed together. Root cause reproduced with an isolated browser experiment: mediumZoom clones `loading=lazy` into a detached HD image, then waits for it to load before insertion. Opening never finishes, so Escape is ignored. Merely removing lazy loading in the experiment restores the original request and closing.

`page_footer.html` now removes `loading` only on the selected image's `open` event, before cloning; other images remain lazy. The local library has a single initializer, with the existing dark backdrop, default-on behavior when the parameter is absent and an explicit-false opt-out. The duplicate CDN loader/unconditional initializer in `extend_footer.html` is removed, also eliminating its unavailable-CDN startup exception. Vendored library and responsive-image render hook unchanged.

[Final-source evidence](../assets/audits/session17/REPORT.md), `probe.json`, `browser.json`, `extra.json`, `preservation.json` and raw Lighthouse results in that asset directory. Two zoom/open/Escape cycles ×390/1440 ×normal/all-external-blocked request the original only after click, open exactly one overlay and close after opening completes; no page exceptions/CDN requests, untouched images still lazy. Original PNG independently decodes3840×2160; clone naturalWidth can remain density-corrected and is not mistaken for file resolution. No-zoom fixture does not initialize/open. Explicit-false fixture omits initialization; default fixture includes it. Thirty fresh final-source Lighthouse runs cover all five representative pages and both modes.

Independent scoped review found no introduced defects. Pointer-only opening, Escape during the library's opening animation, true InstantClick navigation and cross-browser behavior were not redesigned/certified. No permanent tests/framework, commit, push, merge or deployment. Broader audit limitations and remaining motion/layout/schema tickets stand.
