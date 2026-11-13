# Ticket: Apply the approved A + B buffer-style callouts

Labels: `wayfinder:task`
Status: resolved
Assignee: pi
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

Selected in [Choose which new components are in scope for this redesign](15-feature-backlog.md), finally approved with “ys”. Reference: `http://127.0.0.1:1418/callouts-buffer-hybrid.html`; source `/tmp/make-blog-buffer-hybrid.py`.

- A's tinted body and bottom severity statusline.
- B's active tab shape and filled severity icon.
- Palette/severity-tinted top bar, **not** B's black background.
- Readable body-font prose, four existing palette/mode states and native disclosure.
- Decorative `notes.md`/status chrome must not imply real file metadata or add screen-reader noise. The summary still conveys severity and title.

## Completion

- Integrate through the existing `notice` shortcode and shared notice CSS; preserve existing parameters, type aliases, Markdown and content. Inventory all used types before editing.
- Preserve intended default-open behaviour and handle explicit closed values correctly; the prototype's closed optional example is not an instruction to collapse existing articles' warnings.
- Keep required steps/warnings in the article. Do not modify code-block/terminal render hooks or apply the prototype page shell.
- Check real posts, long titles, links, code/lists inside notes, keyboard focus/folding, light/dark Catppuccin/Fireside and 320px/mobile/desktop widths. Build fresh production output and record limitations.

## Resolution — approved hybrid integrated

Implemented in the existing `layouts/shortcodes/notice.html` and `assets/css/common/notice.css`; removed only obsolete notice/iconfont overrides from `assets/css/extended/zzzz-article-review.css`. No article content or code/terminal render hooks changed.

- Applied A's tinted body/statusline and B's active tab/filled severity icon, with a tinted (not black) top bar. All chrome and inline SVGs are decorative; the accessible summary contains severity and title. No icon-font request or JavaScript is needed.
- Inventoried 107 notices: warning 34, tip 20, info 40, Info 1, important 1, warnings 1, danger 4, note 1, caution 3, warn 2. Case is normalized; caution/important/warn/warnings retain their original classes and use warning severity. All twelve formerly styled types retain distinct labels/icons and appropriate severity colours. Unknown types retain a readable label and note-icon fallback.
- Omitted `opened` remains open. Explicit false/0/no/off now omit the boolean attribute rather than emitting `open="false"`. Existing three intentionally closed notes now start closed; no content was removed. A missing title/type gets a usable Note summary.

### Verification

Disposable evidence: `/tmp/blog-callout-integration/` (not repository infrastructure).

- Fresh final production build: `hugo --environment production --destination /tmp/blog-callout-integration/production-final`, exit 0, 712 pages, 629ms. Same twelve pre-existing missing-image warnings. Full post-output inventory: 107 notices, three closed; canonical kinds warning 41/info 41/tip 20/danger 4/note 1.
- A separate Hugo fixture build exercises all twelve original types, aliases/case, unknown/missing parameters, long titles, links, lists, code and explicit open values. `check.js`/`check.log`: Chromium at 320/390/1440px × Catppuccin/Fireside light/dark; no notice or title/control overflow. Enter/Space folding, 3px visible focus, link tab order and accessible summary verified. Desktop/mobile screenshots inspected.
- `real-posts.js`/`real-posts.log`: five actual posts (Python None, Docker DNS, NixOS workflow, Lanzaboote/TPM, Dotbot plugins), 60 responsive/palette combinations; content present, default/explicit disclosure states correct, no notice overflow. Real-post screenshots saved.
- Focused independent read-only review found no actionable issues. `git diff --check` passed; nothing committed or staged.
- Limits: Chromium only; no screen-reader, other-engine or full accessibility audit. No Lighthouse audit or repository test infrastructure added. Inherited production/media changes remain untouched. Release remains separate.

## Notes

Execution authorized by the user's continuation request. Plan: inventory notices and preserve parameters; replace only the shortcode/shared notice CSS and obsolete notice overrides; verify fresh output and real-post browser rendering, then record the resolution. No new repository tests; disposable checks stay in `/tmp`.

Implementation is separate from the scope decision. Work only in `/home/haseeb/projects/blog-design-lab`; preserve dirty work. No commit, push, merge, deployment or new tests/test infrastructure without a request. Prior prototype evidence and remaining accessibility/browser limits live in the parent decision ticket.
