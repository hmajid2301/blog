---
title: "Your blog: structure, style, and theme"
summary: "An independent layout, typography, and colour playground using the real blog."
hideMeta: true
showtoc: false
---

This is a local demo of your actual blog. Browse real posts, talks, images, code, archives, and topics. Nothing here replaces the live site.

## Design one page at a time

[Open Design Builder →](/design-builder/)

The builder is a page-first workbench: choose **Preview page**, then edit that page’s controls beside its actual-page preview. **Home** opens first when migrating an older draft; subsequent visits remember your page and Light/Dark mode. Existing draft choices are preserved, including typography, style, heading weight, MonoLisa and saved colour pairs. Without a draft, the workbench starts from the applied builder design when available, otherwise the existing defaults. Editing fonts or code never forces a different preview page; choose Article yourself to inspect code.

**Overall design** is collapsed but still contains body and heading fonts, heading weight, monospace, Plain/Neovim code, style, and separate light/dark palettes and accents. **Review current design** is an optional summary; **Use this design** is always available near the page picker. Defaults are starting points, not a claim that one design suits everyone.

### Home controls

- **Introduction & portrait:** follow the overall structure or choose side-by-side/stacked; show/hide the portrait; choose its size (160/220/280px) and arch, rounded, circle or square shape.
- **Spacing & panels:** section gaps (24/48/72px), card padding (16/24/32px), and square, soft or round corners. **Default** keeps the current structure/style’s treatment rather than imposing a new baseline.
- **Recent writing:** show 1–12 posts, keep the overall structure’s default summary treatment or explicitly show full/two-line/no summaries, and toggle publication dates. Short summaries clamp existing text, not rewritten content.
- **Speaking preview:** show 1–6 talks, toggle publication dates, and show titles, actual event metadata, or available slides/recordings. Publication dates are not invented event dates.
- **Supporting sections:** keep Default visibility or explicitly Show/Hide featured writing, topic discovery, recent writing, speaking and the setup/archive group. Move up/down changes their order; the introduction and H1 remain first. Default visibility follows your overall structure. Custom ordering stacks Home sections in their actual reading/keyboard order without replacing the saved overall structure.

**Reset Home tweaks** restores only these Home defaults, including supporting-section visibility and order. It preserves fonts, colours, style, code, structure, reading settings and every other page layout. Other pages currently offer their existing layout selector and **Reset current page layout** only; detailed controls will arrive when those pages are addressed.

Body choices include **Jost (live blog)** and **System sans (live blog UI)** as familiar baselines. For long articles, compare **Source Sans 3** (open and readable), **Lato** (warm and understated), and **Noto Sans** (neutral, with broad language coverage). **Newsreader** and **Source Serif 4** offer serif alternatives alongside Literata and the existing sans-serif choices. System sans uses the reader’s installed fonts, so its appearance varies by device. The recommended default remains IBM Plex Sans.

The **Heading weight** control under **Overall design** chooses **Medium (500)**, **Semibold (600)**, **Bold (700)**, or **Extra Bold (800)**. Choose **Schibsted Grotesk + Bold (700)** to match Editorial’s main-heading weight. Medium remains the starting point for existing drafts. Space Grotesk and Radio Canada Big support up to 700, so Extra Bold is unavailable for those families; switching from an 800-weight family reduces the choice to Bold. The saved weight applies to content headings throughout the demo, not body text or builder controls. Manual styles retain their own heading weights.

**MonoLisa (installed locally)** is available under **Overall design → Monospace font**. It uses the font installed on the device running your browser; no MonoLisa font files are downloaded, copied, or served by this project. Devices without it use their system monospace fallback. Publicly serving MonoLisa would require the appropriate [webfont licence](https://www.monolisa.dev/license).

Draft choices, preview page and appearance are saved without applying them to the blog. Switch Light/Dark, inspect each page and optionally expand the design summary, then select **Use this design** to apply the exact fonts, code treatment, Home tweaks, separate light/dark palette/accent pairs, and page layouts across the demo. **Open current page** opens the normal page in a new tab without applying the draft. The header appearance switch uses the selected comparison’s light/dark colours. Structure and reading-size controls stay available.

### Style and four-way colour comparison

The builder’s **Style · visual treatment** picker under **Overall design** changes panels, spacing and borders while preserving your body font, heading family/weight, monospace, code framing and page layouts. **Soft Studio** is the fallback treatment when no saved or applied builder style exists; Reading Room and every other style remain available. Choose **Home** under Preview page to judge the personal-profile panels. Default Home controls follow the overall Page structure and style selected on the normal demo; explicit Home tweaks override only their named treatment.

Switch **Catppuccin / Fireside**, then **Light / Dark**, to compare all four appearances. Your current valid Catppuccin flavours and accents are captured exactly from your saved draft. Fireside starts with its own Light/Dark palettes and theme-default accents. Each pair remembers its own changes, including across reloads while the other pair is selected. If no Catppuccin pair has been chosen, it starts with Latte/Mocha and teal accents. Mixed or other palettes are labelled **Custom** without discarding either saved comparison.

**Use this design** applies the selected style, typography, page layouts and both comparison pairs to the demo. In normal pages, the applied-builder notice offers the same Catppuccin/Fireside buttons; the existing Appearance control or header switch chooses Light/Dark. The normal Style buttons also preserve builder fonts while builder mode is active. These normal-page edits update the applied design, not the builder draft; return to the builder to edit its separate draft.

**Use manual controls**, choosing a manual Theme, Font override or Accent, or selecting a combined personal-profile shortcut, returns to the manual playground. **Reset all** also exits builder mode. Original structure-only shortcuts still change just the overall structure. No changes are deployed to the live site.

## Three independent choices

- **Structure** decides what leads, what sits beside it, and how lists work.
- **Style** supplies fonts, typography, spacing, and visual treatment—not colours.
- **Theme** supplies the colour palette—not fonts or layout.

Change any one without resetting the other two. For example: **Sidebar notebook** structure + **Serif Contrast** style + **Catppuccin Mocha · Teal** theme.

## Try it

1. Choose one of six **starting points**: Minimal writer, Personal profile, Magazine, Knowledge base, Sidebar journal, or Split editorial. These now change **only structure**; they do not reset your style, theme, accent, illustration, or reading settings.
2. Try the twenty-one **Style** choices. Their neutral Aa swatches preview type rather than palettes.
3. Choose a **Theme · colour palette** independently. All twelve Catppuccin colour/accent variations remain here, alongside Fireside, Nord, Gruvbox, and the earlier palettes.
4. **Appearance** follows the theme’s default or explicitly chooses Light/Dark. **Accent** overrides just the accent. **Font override** optionally replaces a style’s font pairing; *Style default* restores its intended fonts.
5. Adjust **Reading width**, **Article type**, and **Illustration style** independently. **Hide controls** to judge the page itself.

### Personal profile variations

The extra row restores the old shaded-panel look and adds five more profile-focused experiments. These are intentional **style + Profile layout** shortcuts, unlike the six structure-only buttons above. They restore the style’s own font pairing and leave your current palette, accent, illustration, reading width, and article size alone. If a builder design is active, these shortcuts exit builder mode while retaining its current palette/accent.

- **Soft Panels** — the original Soft Studio / Personal profile combination: rounded shaded introduction and article cards.
- **Literary Profile** — Newsreader + Instrument Sans, journal-like shaded cards, arched portrait, and tinted article headings.
- **Humanist Profile** — IBM Plex Sans, inset introduction, accent rails on cards, and highlighted article headings.
- **Serif Profile** — Source Serif 4 + DM Sans, outlined panels and framed article sections.
- **Bold Profile** — Manrope + Schibsted Grotesk, strong panel edges and accent bands beneath article section headings.
- **Quiet Profile** — Literata + IBM Plex Sans, soft cards and gentle section-heading tints.

All five new treatments are also available independently under **Style**. Soft Panels reuses **Soft Studio**, rather than duplicating it.

Selections persist across pages and reloads. Older combined design selections are split into their corresponding style and palette automatically. **Reset all** returns to Editorial style, Paper & Rose theme, and Profile + writing structure.

## Page content alternatives

These choices arrange the actual page content independently of the six overall structures below. Normal pages show a contextual **Page layout** selector; the builder edits the type selected by **Preview page**. Each type saves its own choice; Tags, Categories and Series share Topics layouts. Changing pages keeps your fonts, palettes and Home tweaks. **Reset current page layout** resets only the selected page type: Yearly programme for Talks, Original for the others. Home has its own focused reset, described above.

Every type retains **Original** for comparison:

| Page type | Alternatives |
| --- | --- |
| Talks index | Yearly programme; featured talk + timeline; talk library |
| Writing index | Editorial rows; magazine feature + grid; compact year-grouped reading list |
| Uses | Categorised inventory; photo-led setup story; compact reference |
| Archive | Year navigation + month-grouped lists; compact yearly index |
| Tags, categories, series directories | Counted topic directory; compact alphabetical index |
| Individual talks | Resource-first briefing; watch-first presentation |
| Articles | Reading-focused; contents rail; editorial header |

Previews use the normal routes in isolated frames, without the site toolbar or shell. Non-anchor preview links open a new tab; heading anchors remain inside the preview. Existing content and available resources are reused rather than invented.

## Page structures

### Profile + writing

A large introduction and speaking photo lead into recent posts, talks, and the setup. Introduces you as well as your writing.

### Writing first

A brief signature, then chronological titles and dates. No large photo, feature cards, or summaries on the homepage. The smallest structural direction to maintain.

### Sidebar notebook

A persistent left rail holds identity, sections, topics, and popular series. The navigation continues on articles, archives, and taxonomies; mobile collapses it to a short row.

### Magazine

One article leads with topic links beside it. A two-column story grid and separate talks column follow. The posts index becomes a card grid.

### Topic library

Topics and their recent articles appear before the timeline, with series alongside. Persistent sidebar navigation supports browsing deeper.

### Split editorial

Introduction on the left; writing and talks scroll on the right. Articles put the TOC in a left rail where available. Mobile returns to one column. A custom exploration, not an upstream feature claim.

## Twenty-one typography styles

All styles work with any theme. Style names describe their typography or treatment, not a palette.

| Style | Fonts and treatment |
| --- | --- |
| Editorial | Schibsted Grotesk + IBM Plex Mono; oversized titles, open lists, fine rules. |
| Literary Journal | Newsreader + Instrument Sans; literary headlines and generous rhythm. Previously Latte Journal. |
| Technical Workshop | Space Grotesk + IBM Plex Sans + JetBrains Mono; structured metadata and bounded surfaces. Previously Mocha Workshop. |
| Quiet Notebook | Literata; narrow reading, restrained titles, no large homepage portrait. |
| Swiss Grid | Manrope + IBM Plex Mono; strong grid, heavy rules, aligned metadata. |
| Soft Studio | Fraunces + DM Sans; expressive titles, rounded framing, warmer photo treatment. |
| Fieldnotes | Newsreader + IBM Plex Sans; quiet headlines, fine rules, arched portrait. Former Nord typography, without its palette. |
| Bookish Almanac | Literata + DM Sans; bookish headings and measured spacing. Former Gruvbox typography, without its palette. |
| Monospace Log | JetBrains Mono; square edges, dashed rules, no glow. |
| Bold Headlines | Schibsted Grotesk + IBM Plex Mono; heavy type and strong rules. |
| Serif & Sans | Radio Canada Big + Source Serif 4 + Geist Mono; typography from the Python talk, independent of Fireside colours. |
| Reading Room | Newsreader + IBM Plex Sans; calm titles and comfortable reading. Former shared Catppuccin typography. |
| **Humanist Notes** | **New:** IBM Plex Sans + IBM Plex Mono; friendly sans-serif titles and relaxed reading rhythm. |
| **Serif Contrast** | **New:** Source Serif 4 + Instrument Sans; large serif titles against crisp sans-serif body text. |
| **Compact Reference** | **New:** Manrope + IBM Plex Sans; compact headings, tighter lists, scannable information. |
| **Airy Essay** | Newsreader + Literata; book typography, generous paragraph spacing, understated metadata. |
| **Literary Profile** | Newsreader + Instrument Sans; journal cards and tinted article headings. |
| **Humanist Profile** | IBM Plex Sans; inset panels and accent rails. |
| **Serif Profile** | Source Serif 4 + DM Sans; outlined panels and framed section headings. |
| **Bold Profile** | Manrope + Schibsted Grotesk; strong edges and section bands. |
| **Quiet Profile** | Literata + IBM Plex Sans; soft cards and gentle heading tints. |

Font overrides preserve the style’s spacing and treatment. Width and article size sliders remain under your control.

## Colour themes

**Paper & Rose**, **Latte Plum**, **Mocha Green**, **Sage Paper**, **Clean Blue**, **Soft Peach**, **Nord**, **Gruvbox**, **Forest Terminal**, **Ink & Signal**, **Fireside Light**, and **Fireside Dark** preserve the earlier palette choices without changing fonts.

### Twelve Catppuccin variations

Choose **Latte**, **Frappé**, **Macchiato**, or **Mocha**, each in **Mauve**, **Teal**, or **Peach**. These are now colour themes, not typography styles. Use the same style to compare palettes directly, or the same palette to compare typography.

The [official Catppuccin palettes](https://catppuccin.com/palette/) supply neutrals and dark accents. Latte accents are darkened for readable links on page and shaded surfaces. **Accent** also lets you independently try Blue, Rose, or Green. *Theme default* restores that variation’s accent.

**Appearance:** Theme default shows the named flavour. Light uses Latte for all twelve; Dark uses the named dark flavour, or Mocha for Latte variations. Changing Style does not change appearance.

### Neovim-style code preview

Choose the **Catppuccin Mocha · Teal** theme with any style, then open the [Go/Postgres RLS article](/posts/2026-08-15-how-i-implemented-authorization-in-my-go-app-with-rls-postgres/#the-problem). Its code blocks preview the Python talk’s Neovim framing: language tabs, line numbers, highlighted first line, and NORMAL/read-only status bar. Code, syntax highlighting, Copy, and horizontal scrolling remain intact. This is a static visual preview, not an editor; other themes and posts retain their existing code blocks in manual mode. Design Builder can explicitly select Plain or Neovim framing for highlighted snippets across the demo, independently of palette.

## Upstream themes

**This playground uses custom previews, not installed copies of upstream themes.** Choose one direction before deciding whether to adopt a real upstream Hugo theme. Keeping every playground choice is not the low-maintenance end state.

- [Hugo Bear Blog](https://janraasch.github.io/hugo-bearblog/) and [Typo](https://tomfran.github.io/typo-wiki/): content-first options for a small writing-focused blog.
- [Congo](https://jpanther.github.io/congo/docs/homepage-layout/): personal introduction plus writing, with profile/page homepages.
- [Blowfish](https://blowfish.page/docs/homepage-layout/): richer browsing, hero and card layouts.
- [Hextra](https://imfing.github.io/hextra/docs/guide/organize-files/): structured topics and sidebar navigation.
- [Terminal](https://themes.gohugo.io/themes/hugo-theme-terminal/) and [Risotto](https://themes.gohugo.io/themes/risotto/): terminal-inspired references.
- [Stack](https://themes.gohugo.io/themes/hugo-theme-stack/): card-style browsing and sidebar structure.

The split/sidebar structures are custom experiments. Davide Imola’s [About page](https://www.davideimola.dev/about) remains an editorial reference. Check shortcodes, search, taxonomies, and slide integration before any actual theme switch.

## Browse the whole site

[Home](/) · [Writing](/posts/) · [Talks](/talks/) · [Slides catalogue](/slides/) · [Uses](/uses/) · [Archive](/archive/) · [Tags](/tags/) · [Categories](/categories/) · [Series](/series/) · [SVG gallery](/design-art/) · [404](/404.html)

Existing search, Copy, TOCs, metadata, series navigation, and previous/next links remain. Press `/` or use the header magnifier for search. Analytics are disabled. Reveal decks stay local; Slidev routes open the published presentations unchanged.

Fonts load from Google Fonts; content is local. Homepage introductory text is proposed copy; article and talk content is unchanged.

## Run this demo again

From the design worktree:

```bash
bash scripts/design-lab.sh
```

Open `http://127.0.0.1:8767/`. Choose another port with `PORT=8768 bash scripts/design-lab.sh`. Restart after source edits; visual controls apply immediately. Ctrl+C stops the demo.
