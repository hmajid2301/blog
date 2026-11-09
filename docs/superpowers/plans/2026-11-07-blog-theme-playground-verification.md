# Playground delivery record

Plan: `2026-11-07-blog-theme-playground.md`

All three implementation tasks complete; no commits or deployments requested. The demo runs at `http://127.0.0.1:8767/`; restart using `bash scripts/design-lab.sh` from the worktree.

## Implementation decisions

- Apply design controls only when `params.designLab` is enabled via the local configuration overlay. Normal builds retain the original homepage and theme.
- Use direct implementation in this session and a fresh independent reviewer at the end; no new tests or infrastructure per repository preference.
- Exclude Slidev/shared source trees from the separate Reveal build to avoid Hugo interpreting the existing theme-gallery HTML as content. This is a local overlay, not a change to production slides config.
- Build Reveal decks without redesigning them. Redirect the two unbuilt Slidev decks to their published versions in the temporary demo output.
- Disable analytics and page-view requests in the demo. The latter avoids requests to an empty Goatcounter domain when tracking is disabled.
- Quiet Notebook defaults to a serif reading face; the explicit Literata + Plex Sans override uses the advertised sans body pairing.

## Evidence

- Blog Hugo build: 714 pages, 13 paginator pages; exit 0.
- Slides Hugo build: 18 pages; exit 0.
- `git diff --check`, JS `node --check`, shell `bash -n`: clean.
- All six direction defaults checked through the UI, including loaded heading fonts and intended default modes.
- All six home/post-index/article layouts checked at 390px: no horizontal page overflow, expanded controls included.
- Home, writing, talks, uses, archive, tags, categories, series, guide, 404 and slides catalogue return 200 and have working design controls.
- Archive/taxonomy/uses/talks/slides/404 also checked at 390px: no page overflow.
- Font, appearance, accent, width (960px) and article type (24px) persisted through article navigation and reload; Reset restored defaults.
- Existing header theme toggle updates persisted playground mode and body class consistently.
- Search on Slides catalogue searches the root blog index: Nix query produced 104 results; Escape closed the modal.
- Post pagination navigated to `/posts/page/2/`; tag navigation opened `/tags/ajax/`.
- Article TOC opened; 12 copy buttons rendered and clicking one returned `copied!`.
- Demo pages contain no analytics scripts.
- Reveal deck internals omit playground controls; Slidev redirect pages point to the published presentations.

## Independent review

One important finding: malformed stored values could throw during coercion before controls initialized. Reproduced in browser with object-valued `design`/`width`: no root design and zero font options. Fixed by accepting only known string fields and finite numeric values before validation. Rechecked same malformed data: Editorial default, width 760, seven font options, and changing to Journal worked. A browser context denying localStorage still switched successfully to Workshop/dark.

Also corrected the explicit Literata/Plex font pairing and hid decorative Aa swatches from accessible names.

## Existing limitations

Hugo reports existing missing-image references in older content. An existing iconfont TTF is empty and may emit a browser decode warning. Those content/assets were not changed. Fonts require network access. Source edits require restarting the demo script; visual controls apply immediately. No production deployment or presentation rebuild was performed.
