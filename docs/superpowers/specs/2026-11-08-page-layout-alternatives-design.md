# Page content layout alternatives

## Intent
Explore better presentation of the actual blog content beyond the homepage. The user requested a Davide-inspired talks page, alternatives for the other pages, all proposed alternatives rather than selecting only one, and controls in both the normal design-lab pages and the design builder.

Work only in `/home/haseeb/projects/blog-design-lab`. Keep exploration uncommitted, opt-in to the design lab, and do not change the live site or slides. Do not add tests or test infrastructure. Use temporary browser checks and Hugo builds.

## Approaches
- Replace each page with a single new layout: small but prevents comparison; rejected by the user's request for all alternatives.
- Separate duplicate preview pages for each alternative: easy to isolate but duplicates content/template maintenance; not chosen.
- Shared page-type variants with selectors in the toolbar and builder: chosen implementation approach. Real pages and builder previews use the same rendering, content and CSS. Existing global structure, style, palette and font controls remain separate.

## Variants
Preserve an Original choice for comparison wherever an existing page is being changed.

| Page type | Alternatives |
| --- | --- |
| Talks index | Yearly programme (default for this new exploration), featured talk + timeline, talk library |
| Writing index | Editorial rows, magazine feature + grid, compact year-grouped reading list |
| Uses | Categorised inventory, photo-led setup story, compact reference |
| Archive | Year navigation + month-grouped lists, compact yearly index |
| Tags/categories/series directories | Counted topic directory, compact alphabetical index |
| Individual talks | Resource-first briefing, watch-first presentation |
| Articles | Reading-focused, contents rail, editorial header |

Alternatives rearrange existing content, not create new biography or claims. Surface only available event/resource metadata; missing recordings, images or summaries do not get invented placeholders. An undated or unavailable event must not be inferred from a publication date alone. Existing links, anchored headings, code/copy functionality, search and pagination must remain usable.

## Controls and storage
Extend the existing validated settings engine with a small page-variant map. Add a contextual page-layout selector to the normal toolbar for the current page type. Selections persist independently per page type. Keep the original six overall structure shortcuts unchanged.

Extend builder drafts with the same variant map; old saved settings and drafts receive safe defaults. Add a page-layout step before the final combined review. Provide a page/sample selector in the builder so users can preview all listed page types with the chosen fonts and palettes. Applying a design persists the page variants alongside the existing builder choices. Draft previews must not write global settings.

Builder previews must use shared actual templates/partials or an equivalent isolated rendering path, not hand-copied screenshots or mock content. Do not expose the normal toolbar inside the preview frame. Keep links from unexpectedly replacing the builder preview. Article code-choice steps continue to show the real code-heavy article.

## UI/UX and accessibility requirements
The user explicitly requested UI/UX and accessibility consideration. These are acceptance criteria for every alternative, not a separate decorative pass. Aim for WCAG 2.2 AA within the changed surfaces; do not claim whole-site certification.

- Content hierarchy: one clear page heading; introductory context before controls; semantic sections and nested headings; real lists, navigation and time elements where appropriate. Chronology and resource availability must remain understandable without visual styling.
- Clear interactions: descriptive link names (including talk context for repeated Slides/Recording links), no nested interactive card elements or full-card overlays that block resource links, and no colour-only state communication.
- Keyboard: all selectors, tabs/disclosures and links are reachable, have visible focus, and follow a logical order. Layout changes retain focus on their control. Do not move focus on every preview update or trap focus in the iframe. Clearly label the preview iframe and provide an open-page link.
- Controls: normal pages show only the relevant page-type layout selector. Builder editing distinguishes the selected preview page from saved choices and offers a clear path to the combined review. Label native selects; announce draft/application status politely without announcing the entire preview on each update.
- Responsive reading: no page-wide horizontal overflow at 320 CSS pixels; test desktop and narrow/mobile layouts, text enlargement and keyboard navigation. Lists and grids collapse in meaningful reading order. Code and genuinely wide data can scroll within their own region. Respect long titles and missing images.
- Contrast: inspect text, metadata, links, borders where essential, controls and focus indicators in representative light/dark palettes. Target 4.5:1 for normal text, 3:1 for large text and essential UI indicators. Reuse existing tokens but correct new-surface failures rather than assuming tokens guarantee compliance.
- Target size: controls and resource links meet the WCAG 2.2 AA 24-by-24 CSS pixel minimum or its spacing exceptions, with approximately 44-pixel touch targets where practical. Avoid cramped link clusters.
- Images/media: reuse meaningful existing alt text, decorative artwork gets empty alt/appropriate hiding, and no invented photo descriptions. Give embeds accessible titles; no autoplay. Do not invent captions/transcripts; expose existing ones where available and record gaps.
- Motion: no essential animation; honour reduced motion for any added transitions. No layout-shift-heavy preview animation or sticky elements that obscure focused content.
- Compatibility: preserve article anchors, TOC semantics, code Copy handlers, search, pagination and resource navigation. Existing global layouts may constrain page arrangements; verify all six shell structures on representative new surfaces rather than silently resetting user settings.

Use existing palette/font tokens across light/dark and manual/builder modes. Do not add framework dependencies or unrelated infrastructure.

## Verification
Fresh Hugo blog and slide-catalogue builds (not Slidev rebuilds), JavaScript syntax and whitespace checks. Temporary browser exercises for every variant's selection/rendering, representative mobile and dark layouts, builder preview/apply/persistence, normal-page persistence, and absence of global-storage writes from draft frames. Check representative resource links, article anchors, code copying and directory navigation. Run keyboard-only checks, inspect accessible names and heading hierarchy, check reflow/text enlargement and reduced-motion behaviour, and measure representative contrast pairs. If an existing accessibility tool is available, use it as an additional check without adding dependencies; automated findings do not replace manual checks. Document verification scope, accessibility limitations and existing unrelated image warnings.

## Approval
Approved by the user with “do it” after adding explicit UI/UX, accessibility, performance and preservation requirements. Shared rendering/storage details are the assistant's implementation choices, not prior user decisions.
