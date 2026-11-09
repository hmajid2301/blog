# Ticket: Decide which search ships to production

Labels: `wayfinder:grilling`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

Which search experience lands on the live blog?

The design-lab modified `assets/js/fastsearch.js` and `layouts/partials/search.html` (the search overlay, with query-term highlighting fixes) and added `searchPopup` treatments (`dropdown`, `spotlight`, `riseup`, etc.) in `zzzzzzzzz-search.css`. The chosen design uses `searchPopup: dropdown`.

The main blog already has its own search (fastsearch + the same partial, unmodified). The decision:

- Does the live blog keep the design-lab's `dropdown` search overlay and its highlighting fixes?
- Do the other `searchPopup` treatments (spotlight, sidebar, glass, etc.) get stripped with the playground, leaving only `dropdown`?
- Are there content/search-index differences (`layouts/_default/index.json`) that must carry over?

The answer names the search files that ship and the treatment that stays active.

## Resolution

- **Ship** the design-lab search: rewritten `assets/js/fastsearch.js` (query-term `<mark>` highlighting, ↑↓ keyboard nav, focus trap, Ctrl+K, `aria-live` status, max 20 results) and `layouts/partials/search.html` (status element, keyboard-hint footer, autocomplete/spellcheck off).
- **Treatment**: only `dropdown` survives; `data-search-popup` is baked static to `dropdown`. The base overlay + dropdown rules in `zzzzzzzzz-search.css` ship; `spotlight`, `riseup`, `fade`, `scaleblur`, `sidebar`, `glass`, `fullscreen`, `command` are deleted.
- **Index**: carry over the design-lab `layouts/_default/index.json` (adds `section`, `date`, `tags`, truncates `content` to 500 chars).
- **Note**: the rewritten `fastsearch.js` hardcodes `fuseOptions` and no longer reads `[params.fuseOpts]` from `hugo.toml` — that config block becomes dead and is trimmed in ticket 08.
