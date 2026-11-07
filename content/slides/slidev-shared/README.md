# Shared Slidev resources

Decks opt in through their own `styles/index.css` (automatically loaded by Slidev):

```css
@import '../../slidev-shared/styles/theme.css';
@import '../../slidev-shared/styles/patterns.css';

/* Deck-specific overrides go after the imports. */
```

- `theme.css`: Catppuccin palette, fonts, base layouts, code blocks, click animation.
- `patterns.css`: reusable diagram/caption composition, media sizing, emphasis,
  fade-only reveals, and Magic Move focus geometry. Optional, so existing decks
  do not acquire new styling unexpectedly.
- `setup/shiki.ts`: shared syntax-highlighting setup; re-export it from a deck's
  `setup/shiki.ts`.

## Diagram with explanations

Use ordinary markup and slots/content rather than a component that owns click
state. Any diagram component can occupy the first column:

```html
<div class="diagram-explanation">
  <MyDiagram :step="$clicks" />
  <div class="explanation-captions">
    <div v-click="1" class="explanation-heading tone-teal">1. First step</div>
    <div v-click="1" class="explanation-detail explanation-detail-spaced">What happens.</div>
    <div v-click="2" class="explanation-heading tone-mauve">2. Next step</div>
    <div v-click="2" class="explanation-detail">What happens next.</div>
  </div>
</div>
```

`diagram-explanation` uses a 3:2 split with a 32px gap. Captions are 24px and
headings 32px. `explanation-detail-spaced` leaves room before the next heading.
The composition does not impose click directives, so each talk controls reveals.

## Other patterns

| Class | Use |
| --- | --- |
| `tone-teal`, `tone-mauve`, `tone-green`, `tone-blue`, `tone-red`, `tone-peach`, `tone-yellow`, `tone-sapphire`, `tone-lavender` | Consistent emphasis colors |
| `marked-phrase` | Keep a `v-mark` phrase on one line |
| `slide-image` | Centered image, 65vh tall, contained within slide width |
| `slide-footnote` | Centered 18px muted text |
| `slide-summary` | Centered 28px text |
| `diagram-fixed` | Prevent a diagram shrinking in a flex layout |
| `caption-columns-4` | Override an existing caption grid to four columns |
| `reveal-fade` | Slide-level, opacity-only reveals without movement or blur |

For fade-only reveals, set `class: px-8 py-6 reveal-fade` in slide frontmatter
(or append `reveal-fade` to its existing classes). This is opt-in per slide,
not a global change to animations.

## Magic Move focus

Wrap a Magic Move block in `code-focus`. Choose `focus-start-N` (zero-based
line index) and `focus-lines-N` (highlight height). Current start presets are
1, 2, 4, 5, 6, 7, 8, 10; height presets are 1, 3, 6, 9.
`code-reserve-tall` reserves 505px to avoid a jump when frames change height.
Use Vue `:class` bindings to change focus presets as `$clicks` advances.
Extend the shared presets when another talk needs a new range.

## Shareable Vue components

[`addons/code-journey/`](addons/code-journey/README.md) is the opt-in Slidev addon
under this shared folder for `NeovimCode`, `GoProjectDiagram`, `SchedulerDiagram` and
`ChannelDiagram`. It includes its own component-scoped styling defaults and a
standalone example; it does not require these shared theme styles. Other repositories
can copy or locally install the addon folder. It does not migrate any deck's theme.
Shared styles, setup hooks, palettes and addons all live here rather than in separate
top-level Slidev utility folders.

## What stays local

Keep subject-specific illustrations, dimensions, and content in the deck.
Kafka's offset board and retry diagrams are not generic slide primitives.
Styles owned by a Vue component stay scoped in that component. Share a Vue
component when another talk actually needs the same rendering or behavior;
shared CSS is enough for the presentational patterns above.

When moving a slide's `<style>` rules here, replace implicit slide scoping with
an explicit class. Do not move bare `.slidev-vclick-hidden` overrides into a
global stylesheet: they would affect every slide (and annotations).
