# Slidev Code Journey

A local Slidev addon with four components: a Neovim-style code frame, Go project/tooling animations, scheduler scenes and channel scenes. No deck layouts, syntax themes, fonts, images or build plugins are bundled. Requires **Slidev 52+ and Vue 3.5+**; Vue and Slidev come from the consuming deck.

This is source you can move to another repository, **not a published npm package**. It is private and `UNLICENSED`; choose a license before public redistribution or publishing. No upstream artwork or application code from the Neovim reference screenshots is included.

## Use in another repository

Copy this **whole folder** to `vendor/slidev-addon-code-journey/` inside your Slidev project. Keep `components/`, `styles/` and `package.json` together. In the entry Markdown's headmatter:

```yaml
---
addons:
  - '@/vendor/slidev-addon-code-journey'
---
```

`@/` anchors local addon paths to the directory containing the entry Markdown, avoiding the parent-directory interpretation of plain relative addon paths in Slidev 52.19. Add it to each independently built entry (for example, a theme preview as well as the main deck). Components and addon styles are loaded automatically; no imports in your slides are needed.

Alternatively, install the folder as a local dependency:

```sh
pnpm add -D ./vendor/slidev-addon-code-journey
```

Then use `addons: [slidev-addon-code-journey]`. You can also distribute a tarball without publishing:

```sh
cd vendor/slidev-addon-code-journey
pnpm pack --pack-destination /tmp
# In another Slidev project:
pnpm add -D /tmp/slidev-addon-code-journey-0.1.0.tgz
```

### Existing blog decks

The Python→Go deck opts in with `addons: ['@/../slidev-shared/addons/code-journey']`. Its slides retain the same component names and click sequences. Other decks are not changed.

## NeovimCode

A presentation illustration, **not** a live editor, terminal, fuzzy search or language server. Any syntax language supported by your deck can go in its slots. Slidev/Shiki owns syntax highlighting; the addon only supplies the frame, gutter, selection motion and statusline.

````md
---
clicks: 2
---

# Open our project

<NeovimCode filename="worker.py" directory-label="src/" filetype="python" :directory="$clicks === 0" :picker="$clicks === 1" :files="['worker.py', 'config.py']" selected="worker.py">

```python
def check(url):
    return client.head(url)
```

<template #preview>

```python
def check(url):
    return client.head(url)
```

</template>
</NeovimCode>
````

| Prop | Type | Default / meaning |
| --- | --- | --- |
| `filename` | string, required | Buffer tab and statusline filename |
| `directory-label` | string | `.`; displayed in directory mode |
| `filetype` | string | Inferred from filename (`go · gopls`, `gomod`, or extension); override for your language |
| `directory` | boolean | `false`; show a directory buffer instead of the default slot |
| `picker` | boolean | `false`; show the floating picker |
| `files` | string[] | `[]`; directory and picker entries |
| `selected` | string | `filename`; selected entry and preview title |

- **Default slot:** opened buffer, including the final overview/print state.
- **`preview` slot:** highlighted file preview. Change its content alongside `selected`; the component does not read files.
- Click behavior belongs to the slide. The example uses directory → picker → opened buffer. Forward/backward selection changes animate without timers or autoplay.
- Keep excerpts short (about six lines in the default 360px frame). The picker is intentionally a small project illustration, not a scrolling file browser. Override `style="height: 420px"` if your layout has more room.
- Disable your deck's own code line numbers for this frame to avoid a duplicate gutter. The illustration places the cursor on the first line and shows relative numbers below it.

## Click-driven diagrams

````md
---
clicks: 4
---

# A full buffer

<ChannelDiagram scene="buffer" :step="$clicks" />
````

Set frontmatter `clicks` to the scene's **last stage**, not its number of states. Stage zero is the initial state. These SVG diagrams are fixed Go teaching illustrations, not arbitrary graph renderers or measured runtime traces. `GoProjectDiagram` retains the illustrative module/files, endpoint and commands from the Python→Go example; use `NeovimCode` slots for your own project's actual code.

| Component | `scene` | Stages / `clicks` |
| --- | --- | --- |
| `GoProjectDiagram` | `packages`, `run`, `test`, `build` | 0–3 / 3 |
| `SchedulerDiagram` | `roles`, `parallelism`, `steal` | 0–3 / 3 |
| `SchedulerDiagram` | `network`, `syscall` | 0–4 / 4 |
| `ChannelDiagram` | `rendezvous`, `select` | 0–3 / 3 |
| `ChannelDiagram` | `buffer`, `close` | 0–4 / 4 |

`scene` is required for all three. `GoProjectDiagram` requires numeric `step`; `SchedulerDiagram` defaults it to zero, while `ChannelDiagram` defaults to its scene's final stage. Prefer always passing `:step="$clicks"`. Finite numeric steps are clamped to the scene's bounds. No scene uses forward-only mutation, so backward clicks restore previous states.

```html
<GoProjectDiagram scene="build" :step="$clicks" />
<SchedulerDiagram scene="network" :step="$clicks" />
<ChannelDiagram scene="close" :step="$clicks" />
```

Scheduler/channel SVGs use a 1180×420 viewBox and scale to the container. The project diagram defaults to 380px height. Supply `style="height: 320px"` or a deck-local rule when needed; the addon doesn't resize your slides or headings. SVG descriptions explain each state, and per-instance IDs keep multiple diagrams' titles and arrow markers separate.

### Semantic boundaries

P is an execution resource, not a core; scheduling/stealing sequences are illustrative. Network readiness means runnable, not immediately running. A blocking syscall need not immediately release its P. Unbuffered communication doesn't mean receiver processing finished. The full-buffer receive moves the waiting sender's value into the vacated slot before waking that sender. Close preserves buffered values; select does not prioritize cancellation; cancellation does not join. Preserve these distinctions when editing the teaching scenes.

## Theme integration

Light/dark defaults work without the Python→Go styles. Dark mode follows Slidev's `.dark` ancestor. Customize these inherited variables on `:root`, a slide or a wrapper:

```css
:root {
  --journey-paper: #faf8f3;
  --journey-ink: #24211d;
  --journey-accent: #a9432e;
  --journey-muted: #625e56;
  --journey-surface: #f1e3d3;
  --journey-border: #c8ad98;
  --journey-accent-soft: #f0cdb8;
  --journey-font-mono: 'Your Mono Font', monospace;
}
```

Color precedence: `--journey-*` → legacy `--talk-*` → bundled light/dark defaults. Monospace font precedence: `--journey-font-mono` → Slidev's `--slidev-font-mono` → system monospace. No font downloads. Normal diagram text inherits the deck font. The internal `--_journey-*` variables are implementation details.

Styles are limited to the four component roots and scoped internals. Your deck keeps control of layouts, transitions, code syntax colors and heading sizes. Deck-level `!important` styles can still override component sizing; inspect those rules if a different theme changes the frame unexpectedly.

## Motion, print and overview

All components honor `prefers-reduced-motion`. Diagrams render their final stage in print/export/overview and next-slide previews rather than hiding content behind clicks. Neovim hides the picker/directory illustration outside live slide/presenter contexts and renders the default slot. Ensure that default slot contains the buffer you want printed, independent of live `$clicks` conditionals.

## Standalone example

`example.md` demonstrates all four components with the default Slidev theme, without this blog's layouts, styles or files. With the Slidev CLI available:

```sh
slidev example.md
slidev build example.md --out /tmp/code-journey-example
```

From the existing Python→Go deck's directory, reuse its installed CLI:

```sh
pnpm exec slidev build ../slidev-shared/addons/code-journey/example.md --out /tmp/code-journey-example
```
