# GopherCon UK slides — final suggested changes

## Goal

Make the talk feel like one story:

- Banter Bus = working version
- Svelte / socket complexity = friction
- LettuceGo = cleaner example
- HTMX + Go = why this stack fits well

---

## Biggest changes first

### 1. Add this to speaker notes

Use this when the deck moves from Banter Bus to LettuceGo:

> "Banter Bus is the project
> that got me here.
> LettuceGo is the newer app,
> so some later examples come from there
> because the stack is cleaner."

---

### 2. Move `js_meme.jpg`

Move to:
- right before `## Svelte`

Why:
- joke lands better once people have seen the old complexity coming

---

### 3. Cut or move generic HTMX slides to appendix

Best candidates:
- `## Swap Strategies`
- `## WebSockets`
- maybe current `## Advanced Triggers`

Why:
- feels like a docs tour
- not the strongest real LettuceGo examples

---

## Better main story order

Suggested order:

1. Intro
2. Who is this for
3. Banter Bus images
4. JS meme
5. Svelte / socket pain
6. Short transition note about LettuceGo examples
7. Why HTMX?
8. HTMX mental model
9. Real LettuceGo HTMX patterns
10. Backend / templ
11. SQLC
12. DevEx / tests
13. When not to use HTMX
14. Takeaways
15. Links

Why:
- pain first
- then reason
- then the fix
- then proof in code

---

## Slides to add

### 1. Real search/filter slide

Why:
- real app example
- easy to understand
- stronger than a generic trigger slide

### Slide text

## Search without SPA

- URL stays shareable
- Server owns filtering
- HTML fragment swaps in

### Code

```html{1-4|5-8|9-13}
<input
    name="q"
    hx-get="/plants"
    hx-trigger="input changed delay:300ms"
    hx-target="#plants-list"
    hx-push-url="true"
    hx-include="[name='location']"
/>
<select
    name="location"
    hx-get="/plants"
    hx-target="#plants-list"
    hx-trigger="change"
    hx-include="[name='q']"
>
```

### Notes

{{% note %}}
- This is a good real HTMX example.
- Search state lives in URL, not client store.
- Input and select both call server.
- Server renders updated list fragment.
- No client router. No frontend state machine.
{{% /note %}}

---

### 2. Lazy load slide

Why:
- real LettuceGo pattern
- cleaner than a generic `load` trigger slide

### Slide text

## Load expensive bits later

- Page first
- Timeline after

### Code

```html{2-3|4-6}
<div
    id="timeline-section"
    hx-get={ fmt.Sprintf("/plants/%s/timeline", plant.ID.String()) }
    hx-trigger="load"
>
    <p class="text-sm text-muted">Loading...</p>
</div>
```

### Notes

{{% note %}}
- Plant detail page renders first.
- Timeline loads after.
- Good fit for HTMX: expensive section, clear target, coarse update.
- Faster first render without building client fetch layer.
{{% /note %}}

---

### 3. Best new slide: one POST, many updates

Why:
- strongest real app example
- shows why server-rendered HTML works well

### Slide text

## One action, many updates

- Save health entry
- Update whole screen

### Code

```go{1|3|5-6|8-9}
response.SuccessWithToast(
    w, r, "Health recorded!",
)

_ = healthviews.HealthDotOOB(
    plantID, entry.Rating,
).Render(r.Context(), w)

timeline, _ := h.timeline.GetPlantTimeline(
    r.Context(), plantID,
    defaultHealthTimelineLimit, 0,
)
_ = plants.TimelineOOB(
    plantID, timeline,
).Render(r.Context(), w)
_ = plants.LastEventOOB(
    timeline,
).Render(r.Context(), w)

healthHistory, _ := h.healthSvc.ListByPlant(
    r.Context(), plantID,
    defaultHealthHistoryLimit, 0,
)
_ = plants.HealthHistoryOOB(
    healthHistory,
).Render(r.Context(), w)
```

### Notes

{{% note %}}
- One POST does one mutation.
- Server then returns several HTML fragments.
- Toast updates.
- Health dot updates.
- Timeline updates.
- Health history updates.
- No client cache sync. No event bus. No reducer logic.
{{% /note %}}

---

### 4. Better error handling slide

Why:
- current version is too small
- the real LettuceGo pattern is better

### Slide text

## Errors go one place

- Handlers return toast
- Layout catches swap

### Code

```go{2-3|5}
func ErrorWithToast(
    w http.ResponseWriter,
    r *http.Request,
    statusCode int,
    message string,
) {
    w.Header().Set(
        "HX-Retarget",
        "#toast-container",
    )
    w.Header().Set(
        "HX-Reswap",
        "outerHTML",
    )
    w.WriteHeader(statusCode)
    _ = components.Toast(
        message,
        components.ToastError,
    ).Render(r.Context(), w)
}
```

```js{2-4|5-8}
document.addEventListener('htmx:before:swap', function(e) {
    var retarget = e.detail.ctx.response.headers.get('HX-Retarget');
    if (e.detail.ctx.response.status >= 400 && retarget) {
        var target = document.querySelector(retarget);
        if (target) {
            e.detail.shouldSwap = true;
            e.detail.target = target;
        }
    }
});
```

### Notes

{{% note %}}
- This gave me one shared error path.
- Handler decides message.
- Layout decides where error lands.
- Works across many HTMX forms without custom client code per form.
{{% /note %}}

---

### 5. HTMX did not mean no JS

Why:
- honest
- more mature
- easier to trust

### Slide text

## HTMX != zero JS

- Small JS still useful
- Big JS app gone

### Code

```js{1-5|7-10}
function lookupSpecies(q, targetId) {
    if (!q) return;
    htmx.ajax('GET', '/species/lookup?q=' + encodeURIComponent(q), {
        target: '#' + targetId,
        swap: 'innerHTML'
    });
}

function selectHealthRating(btn) {
    var rating = parseInt(btn.dataset.rating);
    document.getElementById('health-rating-input').value = rating;
}
```

### Notes

{{% note %}}
- HTMX removed big frontend architecture, not all JavaScript.
- I still use tiny helpers for UI polish.
- Difference: JS stays local and boring.
- No SPA router. No global client state. No component framework.
{{% /note %}}

---

### 6. Better Playwright slide

Why:
- uses a real test from the app
- proves the stack is testable end to end

### Slide text

## Test real user flow

- Open modal
- Submit HTMX form
- Assert dashboard changed

### Code

```go{1-2|4-6|8-11}
addButton := page.Locator(
    "button:has-text('Add Plant')",
)
require.NoError(t, addButton.First().Click())

modal := page.Locator(
    "form[hx-post='/plants']",
)
require.NoError(t,
    modal.Locator("input[name='name']").Fill(plantName),
)
require.NoError(t,
    modal.Locator(
        "button[type='submit']:has-text('Create Plant')",
    ).Click(),
)

gotoAndWait(t, page, webappURL)
require.NoError(t,
    expect.Locator(
        page.Locator("#dashboard-recent-plants"),
    ).ToContainText(plantName),
)
```

### Notes

{{% note %}}
- Test talks to app like user does.
- No special SPA harness.
- Fill form, submit, wait for HTML change.
- Good fit for HTMX because UI already server-rendered.
{{% /note %}}

---

## Slides to replace

### Replace `## Advanced Triggers`
Use:
- search/filter slide
or
- lazy load slide

### Replace `## WebSockets`
Use:
- one POST, many updates
or
- species identify / lookup slide

### Replace current `## Error Handling`
Use:
- shared toast retarget pattern

---

## Slides to keep, maybe tighten

### Keep
- HTMX intro
- poem
- request/response diagram
- basic form example
- Svelte pain slides
- handler slide
- templ slide
- Taskfile / live reload
- Nix
- Playwright
- When not to use HTMX

### Tighten
- SQLC section -> maybe 1 or 2 slides
- loading indicators -> keep only if the demo value still feels worth it

---

## Small wording changes

### `Why HTMX?`
Maybe change the bullets to:

- Server owns state
- Less coordination code
- Simpler tools

Why:
- stronger than generic “reduced complexity”
- closer to the real app lesson

---

## New final slide

### Slide text

## Takeaways

- HTMX good for coarse UI updates
- Go + templ fit model well
- Small JS helpers still fine
- Less coordination, less pain

### Notes

{{% note %}}
- Main lesson is not “never write JavaScript”.
- Main lesson is “stop building coordination layers you do not need”.
- Go handlers, templ components,
  HTML fragments, and Playwright tests
  line up cleanly in this stack.
{{% /note %}}

---

## If short on time

Cut first:
- Swap Strategies
- WebSockets
- one of SQLC slides
- maybe loading indicators

Keep no matter what:
- Svelte pain
- Why HTMX
- one real HTMX example from LettuceGo
- handler
- templ
- Playwright
- when not to use HTMX

---

## Best single improvement

If you only do one thing:

**Add `One action, many updates` slide from health flow.**

Why:
- most real
- most memorable
- best proof this stack works

---

## What research says for this talk

### Better story shape

This talk works best with a simple shape:

1. **Why I changed**
   - Banter Bus worked.
   - But Svelte state and socket code got painful.

2. **What HTMX changed**
   - Small mental model.
   - Server renders UI again.

3. **Proof in a real app**
   - search / filter
   - lazy load
   - one POST, many updates
   - shared error / toast path

4. **Where the line is**
   - small JS still useful
   - when not to use HTMX
   - real tradeoffs

5. **Repeat the takeaway**
   - simpler stack
   - simpler failure modes
   - still room for small JS helpers

This is better than a docs-tour shape.
It gives pain -> change -> proof -> limits -> takeaway.

### Keep

These parts still feel worth keeping:

- story / motivation early
- Banter Bus screenshots
- Svelte pain section
- small HTMX mental model
- real LettuceGo examples
- handler + templ sections
- Playwright example
- tradeoffs / when not to use HTMX
- QR / links at end

### What to cut or move

Cut or move to appendix first:

- `## Swap Strategies`
- `## WebSockets`
- generic `## Advanced Triggers`
- long utility-class snippets
- any code block that needs scrolling

### What to replace

Replace weaker generic slides with stronger real ones:

- `## Advanced Triggers`
  -> search / filter slide
  -> or lazy load slide

- `## WebSockets`
  -> one POST, many updates
  -> or species identify / lookup

- current tiny `## Error Handling`
  -> shared toast retarget pattern

- generic Playwright snippet
  -> real LettuceGo flow

### What to tighten

Keep these, but make them shorter:

- SQLC section -> 1 or 2 slides max
- loading indicators -> only if demo value still feels good
- DevEx -> keep it practical and short

### Common mistakes to avoid

- feature-name slides with no takeaway
- bullet dumps
- tiny code or tiny fonts
- long code with too many ideas at once
- reading slide text out loud
- starting too abstract or too technical
- too much “about me / company” early on
- a demo with no fallback plan
- too many equal-weight examples
- no recap between sections
- ending with Q&A instead of a final point

### Suggested slide changes

1. **Make titles say the point**
   - Replace labels like `WebSockets` with titles like:
     - `One action can update whole screen`
     - `Search state can live in URL`
     - `HTMX still leaves room for JS`

2. **Split dense slides**
   - If one slide has code + bullets + notes,
     split it into 2 slides.

3. **Use visual proof where possible**
   - Banter Bus pain:
     screenshot + one sentence.
   - LettuceGo examples:
     short code block or annotated screenshot,
     not both at full size.

4. **Give the best example more space**
   - `One action, many updates`
     should be the marquee example.

5. **Turn docs-tour slides into app-story slides**
   - `Advanced Triggers` -> `Search without SPA state`
   - `WebSockets` -> `One POST, many updates`
   - `Error Handling` -> `Server can retarget errors`

6. **Add recap slides between sections**
   - After pain
   - After mental model
   - After real examples
   - One sentence only

### Presentation tips

- Open with the problem, not a feature list.
- Keep one takeaway per section.
- Signpost where you are in the talk.
- Keep code short enough to read fast.
- End with takeaway + links, not only “Thanks”.
- Leave time for a clean ending.
- If a slide feels like docs, simplify it.

### Interactive parts we could use

Use only a few. Keep them short and safe.

1. **Opening show of hands**
   - “Who here built an SPA and later regretted it?”
   - Good before Svelte pain section.

2. **Quick audience check**
   - “Who has used HTMX before?”
   - Good before mental model slide.

3. **Prediction question**
   - “What should update after this POST?”
   - Good before `One action, many updates`.

4. **Tradeoff prompt**
   - “Where would you still reach for React or Svelte here?”
   - Good before tradeoffs / limits.

5. **End-of-talk reflection**
   - “What would you simplify first in your stack?”
   - Good just before the final takeaway.

### Where a diagram is better than code

1. **HTMX mental model**
   - request -> handler -> HTML fragment -> swap
   - Better than raw markup first.

2. **One POST, many updates**
   - one action in the center,
     arrows to form / timeline / badge / toast
   - Better than long response code.

3. **Banter Bus -> LettuceGo transition**
   - old path vs new path
   - client-state-heavy flow -> server HTML flow

4. **Error handling**
   - request -> server error -> retarget -> toast area
   - Better than header-heavy code first.

5. **Search / filter flow**
   - input -> URL params -> handler -> list fragment
   - Then show a small code snippet after.

6. **Architecture fit**
   - browser -> handler -> templ -> db
   - Better than many implementation slides.

### Animations we could use

Keep motion subtle and useful.
Use it to explain sequence, not to decorate slides.

Good options:

- **Simple appear / fade**
  - reveal one bullet or callout at a time

- **Stepwise code highlight**
  - reveal one concern per click
  - target / trigger / swap
  - request / response / OOB update

- **Before -> after slide pair**
  - use two slides for dense comparisons

- **Subtle morph / magic move**
  - only when layout stays mostly the same
  - good for shrinking code
  - or moving focus from form -> result

- **Short visual demo first, then explanation**
  - show end state
  - then unpack how it works

- **Black / blank screen beat**
  - short reset before a big takeaway

Avoid:

- fly-ins everywhere
- spinning / bouncing text
- a different transition on every slide
- long build chains on tiny bullets
- motion that fights with code reading

### Good places to use animation

1. **Banter Bus -> HTMX transition**
   - Fade screenshot out
   - show one-line takeaway in the middle

2. **Mental model diagram**
   - reveal request
   - then handler
   - then HTML fragment
   - then swapped region

3. **Search / filter flow**
   - highlight form
   - then URL state
   - then updated list target

4. **One POST, many updates diagram**
   - reveal changed regions one by one:
     form, timeline, badge, toast

5. **Tradeoffs slide**
   - reveal one honest limit at a time

### Final rule

If motion, interaction, or code
is not helping understanding,
cut it.

### Short summary

Main advice after all this review:

- fewer generic feature slides
- more real app story
- one clear takeaway per section
- one strongest example gets most time
- use diagrams before dense code when flow matters
- keep text short
- keep code short
- use subtle motion only when it teaches
- end on takeaway + links

---

## Backend section review

### Handler slide

Better to match the earlier HTMX example.
So instead of `GetTimeline`, use a small `UpdateTimeline`-style handler
that shows mutation + re-render.

Use this shape:

```go{1-4|7-12|14-19}
func (h *EventHandler) UpdateTimeline(
    w http.ResponseWriter,
    r *http.Request,
) {
    // ...

    timeline, err := h.eventSvc.GetPlantTimeline(
        r.Context(),
        plantID,
        defaultTimelineLimit,
        0,
    )
    if err != nil {
        response.ErrorWithToast(
            w, r,
            http.StatusInternalServerError,
            "Failed to load timeline",
        )
        return
    }

    err = pagesplants.TimelineContent(
        plantID,
        timeline,
        0,
    ).Render(r.Context(), w)
    if err != nil {
        h.logger.ErrorContext(
            r.Context(),
            "failed to render timeline content",
            slog.Any("error", err),
        )
    }
}
```

Notes:

{{% note %}}
- Mutation happens.
- Handler gets fresh data.
- Handler sends updated HTML back.
- Same mental model as earlier HTMX examples.
{{% /note %}}

### Plant detail screenshot

This is optional, not required.
It only helps if you use it as a bridge:

- “This is the page the handler is rendering.”
- “Next slide is the actual handler for one part of it.”

If you are not saying that clearly, it is weak and cuttable.
It should not be there just to show the app again.

### Templ section

Keep the general idea, but avoid a feature-list feeling.
Best message is:

- templ keeps UI close to HTML
- still gives reuse and types
- cost is more tooling

### Most cuttable backend bits

If you need to tighten this section later, cut in this order:

1. plant detail screenshot
2. LSP video
3. tiny wrapper / dashboard slide
4. older Banter Bus templ example if it feels disconnected

### Backend section takeaway

This section should feel like one sentence:

> HTMX works well here because Go handlers and templ components already line up with sending HTML back to the browser.

---

## Research-backed sources

Use these when deciding structure, visuals, and pacing.

### Best sources for this talk

1. **Hynek Schlawack — On Conference Speaking**
   - https://hynek.me/articles/speaking/
   - Minimal slides, practice, pacing, final slide.

2. **Chapeau — Code on slides**
   - https://chapeau.freevariable.com/2023/03/code-on-slides.html
   - Short code, staged explanation, highlights.

3. **Ines Montani — Technical content**
   - https://ines.io/blog/beautiful-slides-talks-part-3-technical-content
   - Flowcharts, annotated code, visual tech content.

4. **Scott Hanselman — Tips for Preparing for a Technical Presentation**
   - https://www.hanselman.com/blog/tips-for-preparing-for-a-technical-presentation
   - Narrative arc, pivot points, pacing, prep.

5. **Duarte — How to move presentation audiences with structure and story**
   - https://www.duarte.com/blog/move-presentation-audience-with-story-techniques-in-presentations/
   - “What is” vs “what could be”, tension, release.

6. **Garr Reynolds — How to Design a Great Presentation**
   - https://www.garrreynolds.com/design-tips
   - Cut noise, avoid slideuments, big readable visuals.

7. **Switowski — How to Make a Great Conference Talk**
   - https://switowski.com/blog/how-to-make-a-great-conference-talk/
   - Hook, summary, reveal bullets carefully, short code.

8. **Gunnar Morling — Ten Tips to Make Conference Talks Suck Less**
   - https://www.morling.dev/blog/ten-tips-make-conference-talks-suck-less/
   - Mission-first opening, rule of three, circle back.

9. **Nordic APIs — 10 Tips on Giving Standout Talks at Developer Conferences**
   - https://nordicapis.com/10-tips-on-giving-standout-talks-at-developer-conferences/
   - One takeaway, narrative arc, concrete examples.

10. **Abraham Mhaidli — Guide to Giving Conference Talks**
   - https://mhaidli.github.io/blog/academic/public-presentation-guide/
   - Signposting, fewer words, stronger final slide.

11. **Shruti Kapoor — Tips for Creating Powerful Conference Talks**
   - https://shrutikapoor.dev/posts/Career-Speaking-At-Conferences
   - Meat first, audience anchoring, visuals, subtle animation.

12. **speaking.io — Transitions / Images / Outlining**
   - https://speaking.io/design/transitions/
   - https://speaking.io/design/using-images/
   - https://speaking.io/plan/an-outline/
   - Skip flashy motion, use big images, outline first.

### Also reviewed

- freeCodeCamp — https://www.freecodecamp.org/news/tips-for-speaking-at-tech-conferences/
- Chapeau — Pacing technical talks — https://chapeau.freevariable.com/2015/10/pacing-technical-talks.html
- MIT Comm Lab — Structuring — https://mitcommlab.mit.edu/nse/commkit/structuring-a-slide-presentation/
- MIT Comm Lab — Slide Design — https://mitcommlab.mit.edu/nse/commkit/slide-design/
- Harvard Catalyst — Slides — https://catalyst.harvard.edu/writing-communication-center/visualize-science/slides/
- Penn State — Structure — https://www.engr.psu.edu/speaking/STRUCTURE.html
- Assertion-Evidence — https://www.assertion-evidence.com/
- Scott Hanselman — 11 Top Tips — https://www.hanselman.com/blog/11-top-tips-for-a-successful-technical-presentation
- Duarte — 3-Act Structure — https://www.duarte.com/blog/business-communication-demands-3-act-story-structure/
- Duarte — Audience is the hero — https://www.duarte.com/blog/presentation-storytelling-audience-is-hero/
- Guy Kawasaki — 10/20/30 — https://guykawasaki.com/the_102030_rule/
- Garr Reynolds — Preparation Tips — https://www.garrreynolds.com/preparation-tips
- Garr Reynolds — Delivery Tips — https://www.garrreynolds.com/delivery-tips
- Garr Reynolds — Slide Makeovers — https://www.garrreynolds.com/slide-makeovers
- speaking.io — Repetition — https://speaking.io/plan/repetition/
- speaking.io — Typography — https://speaking.io/design/typography/
