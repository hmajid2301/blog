+++
title = "What I learnt building a web app with Go and HTMX"
outputs = ["Reveal"]
[logo]
src = "images/gophercon.svg"
diag = "90%"
width = "5%"
[reveal_hugo]
custom_theme = "stylesheets/reveal/catppuccin.css"
highlight_theme = "catppuccin"
slide_number = true
+++

# What I learnt building a web app with Go and HTMX

---

{{% section %}}


## Introduction

- Haseeb Majid
  - Backend Software Engineer at [Nala](https://www.nala.com/)
- Loves cats 🐱
- Avid cricketer 🏏 ~#BazBall~
- 🌱 Amateur Gardener

{{% note %}}
{{% /note %}}

---

## Who Is This For?


{{% note %}}
- Backend engineers
- People who want to ship full-stack apps
- Best fit when backend already owns most of the flow
{{% /note %}}

---

<img height="70%" width="auto" data-src="images/old_banterbus.png">

{{% note %}}
{{% /note %}}

---

<img height="70%" width="auto" data-src="images/side_projects.jpg">

{{% note %}}
{{% /note %}}

---

<img width="65%" data-src="images/banterbus_lobby.png">

{{% note %}}
{{% /note %}}

---


<img height="70%" width="auto" data-src="images/js_meme.jpg">

{{% note %}}
{{% /note %}}

{{% /section %}}

---

{{% section %}}

> Banter Bus got me here, LettuceGo made the same lessons easier to show.

{{% note %}}
{{% /note %}}

---

## What is HTMX?

{{% note %}}
- Small library.
- Add behaviour with HTML attributes.
- Server sends HTML back, not JSON for a client app to rebuild.
- Browser swaps it in.
{{% /note %}}

---

{{< mermaid >}}
sequenceDiagram
    participant User
    participant HTMX
    participant Server

    User->>HTMX: Click / submit
    HTMX->>Server: HTTP request
    Server-->>HTMX: HTML fragment
    HTMX-->>User: DOM swap
{{< /mermaid >}}

{{% note %}}
{{% /note %}}

---

```html{1-3|5-9|11}
<form hx-post="/plants/events"
      hx-target="#timeline"
>
   <div class="flex flex-col gap-4">
       <input name="event_type"
              type="radio"
              value="repotted"
              checked />
       <textarea name="notes" rows="3"></textarea>

       <button type="submit">Add Event</button>
   </div>
</form>
```

{{% note %}}
{{% /note %}}

---

<video data-autoplay loop muted playsinline preload="none" data-src="images/lettucego_timeline_event.mp4"></video>

{{% note %}}
- Same pattern.
- Small action.
- Clear update.
{{% /note %}}

---

## Why HTMX?

{{% note %}}

- State on backend
- Simpler tooling

{{% /note %}}

---

<img height="70%" width="auto" data-src="images/htmx_bellcurve.png">

{{% note %}}
{{% /note %}}


---

```html{3|4|5|6}
<input
    name="q"
    hx-get="/plants"
    hx-trigger="input changed delay:300ms"
    hx-target="#plants-list"
    hx-push-url="true"
/>
```

{{% note %}}
- Real app example.
- Search state lives in URL.
- No client store.
- No router.
{{% /note %}}

---

<video data-autoplay loop muted playsinline preload="none" data-src="images/lettucego_search.mp4"></video>

{{% note %}}
- URL changes too.
- Server sends filtered HTML back.
{{% /note %}}

---

## Svelte

```html{1|2-5}
<input bind:value={q} placeholder="Search plants" />
<select bind:value={location}>
  <option value="">All locations</option>
  <option value="indoors">Indoors</option>
  <option value="outdoors">Outdoors</option>
</select>
```

{{% note %}}
{{% /note %}}

---

```ts{2-4|6}
<script lang="ts">
  let q = ''
  let location = ''
  let plants = []

  $: params = new URLSearchParams({ q, location })
</script>
```

{{% note %}}
- Need local state.
- Need query params too.
{{% /note %}}

---

```ts{2-5|7-10}
<script lang="ts">
  $: if (q || location) {
    loadPlants()
    history.replaceState({}, '', `?${params}`)
  }

  async function loadPlants() {
    const res = await fetch(`/plants?${params}`)
    plants = await res.json()
  }
</script>
```

{{% note %}}
{{% /note %}}

---

```html{2|3|5}
<div
    hx-get="/plants/plant_1_id/timeline"
    hx-trigger="load"
>
    <p class="text-sm text-muted">Loading...</p>
</div>
```

{{% note %}}
- Cheap first render.
- Expensive bit comes after.
{{% /note %}}

---

```go{1-3|5-7|9-12|13-15}
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


// ...
```

{{% note %}}
- This is the big one.
- One POST.
- Many HTML updates.
- No client cache sync.
- No reducer glue.
{{% /note %}}

---

```html{|1}
<div id="toast-container" hx-swap-oob="true">
  Health recorded!
</div>

<div id="health-dot-plant-1-id" hx-swap-oob="true">
  <span class="bg-health-4"></span>
</div>

<div id="timeline-section" hx-swap-oob="true">
  <!-- updated timeline -->
</div>

<div id="last-event-oob" hx-swap-oob="true">
  Repotted — just now
</div>
```

{{% note %}}
- One response, many fragments.
- Each `hx-swap-oob` targets a page element by id.
- HTMX swaps them all in one round trip.
- No client knows about the others.
{{% /note %}}

---


{{< mermaid >}}
flowchart LR
    A[POST health entry]
    B[record health]
    C[toast]
    D[health dot]
    E[timeline]
    F[last event]
    G[history]

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
{{< /mermaid >}}

---

<video data-autoplay loop muted playsinline preload="none" data-src="images/lettucego_oob_health.mp4"></video>

{{% note %}}
- One health submit.
- Top summary changes.
- Health history changes.
- Timeline changes.
{{% /note %}}

---

```go{7|8|10-13}
func ErrorWithToast(
    w http.ResponseWriter,
    r *http.Request,
    statusCode int,
    message string,
) {
    w.Header().Set("HX-Retarget", "#toast-container")
    w.Header().Set("HX-Reswap", "innerHTML")
    w.WriteHeader(statusCode)
    _ = components.Toast(
        message,
        components.ToastError,
    ).Render(r.Context(), w)
}
```

{{% note %}}
- One shared error path.
- Handler decides message.
- Layout decides where it lands.
{{% /note %}}

---

## What About JSON?

- Separate API
- Mobile app
- More glue code

{{% note %}}
- Sometimes you still want JSON.
- Just more coordination.
{{% /note %}}

---

## When not to use HTMX?

- Lots of frontend reactivity
- Separate frontend/backend teams
- Design System

{{% /section %}}

---

{{% section %}}

## Backend

---

{{< mermaid >}}
flowchart LR
    subgraph Browser
        A[DOM]
        H[HTMX]
        A -->|User event| H
        H -->|Swap target| A
    end

    subgraph GoApp[Go application]
        B[Handler]
        C[Service]
        D[sqlc]
        F[templ]

        B --> C
        C --> D
        B --> F
    end

    E[(Postgres)]

    H -->|HTTP request| B
    D <--> E
    F -->|HTML fragment| H
{{< /mermaid >}}

{{% note %}}
{{% /note %}}

---

## Handler


```go{1-4|7-9|20-23}
func (h *EventHandler) UpdateTimeline(
    w http.ResponseWriter,
    r *http.Request,
) {
    // ...

    timeline, err := h.service.UpdatePlantTimeline(
        r.Context(),
        plantID,
    )
    if err != nil {
        response.ErrorWithToast(
            w, r,
            http.StatusInternalServerError,
            "Failed to load timeline",
        )
        return
    }

    err = plantcomponents.Timeline(
        plantID,
        timeline,
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

---

<img height="70%" width="auto" data-src="images/lettucego_timeline.png">

---

## Templ

- HTML Templates
- LSP
- Components


{{% note %}}
- Components: reuse
- Downside: extra tooling, another CLI
{{% /note %}}

---

<video data-autoplay loop muted playsinline preload="none" data-src="images/lsp.mp4"></video>

---

```go{1|3|5|6|8|10}
package components

import "gitlab.com/.../service"

 templ HealthHistory(entries []service.HealthEntry) {
    for _, entry := range entries {
        <div class="flex gap-3 items-center py-2">
            @Health(entry.Rating)
            <span class="text-sm font-medium text-text">
                { entry.Rating }
            </span>
        </div>
    }
}
```

{{% note %}}
{{% /note %}}

---

```html
<div class="flex gap-3 items-center py-2">
    <span class="inline-block w-3 h-3 rounded-full bg-health-3"></span>
    <span class="text-sm font-medium text-text">
        3
    </span>
</div>
```

---


```bash
templ generate
```

---

```go
// Code generated by templ - DO NOT EDIT.
func HealthHistory(entries []service.HealthEntry) templ.Component {
	return templruntime.GeneratedTemplate(func(...) (err error) {
		for _, entry := range entries {
			templruntime.WriteString(buf, 1, "<div class=\"flex gap-3 items-center py-2\">")
			Health(entry.Rating).Render(ctx, buf)
			templruntime.WriteString(buf, 2, "<span class=\"text-sm font-medium text-text\">")
			buf.WriteString(entry.Rating)
			templruntime.WriteString(buf, 3, "</span></div>")
		}
		return
	})
}
```

{{% note %}}
{{% /note %}}

---

```go{10-12|11}
package layouts

import "gitlab.com/.../http/views/components"

templ Base(title string, environment string) {
	<!DOCTYPE html>
	<html lang="en">
		<head>
		</head>
		<body class="bg-base-200 text-neutral">
			{ children... }
		</body>
	</html>
}
```

---

```go{2|3-5}
templ PlantPage(title string, environment string) {
	@Base(title, environment) {
        <div class="drawer lg:drawer-open">
          // ...
        </div>
    }
}
```

---

```html{1-6|7-9}
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Basil</title>
  </head>
  <body class="bg-base-200 text-neutral">
    <div class="drawer lg:drawer-open">
      <!-- page content -->
    </div>
  </body>
</html>
```

{{% /section %}}

---

{{% section %}}

## Postgres

{{% note %}}
{{% /note %}}

---

## SQLC

```sql{1|2-6}
-- name: ListHealthByPlant :many
SELECT id, plant_id, rating, recorded_at
FROM health_entries
WHERE plant_id = $1
ORDER BY recorded_at DESC
LIMIT $2 OFFSET $3;
```

---

```bash
sqlc generate
```

---

```go{1-4|6-10|11-17|18-31}
type ListHealthByPlantParams struct {
    PlantID uuid.UUID `json:"plant_id"`
    Limit   int32     `json:"limit"`
    Offset  int32     `json:"offset"`
}

func (q *Queries) ListHealthByPlant(
    ctx context.Context,
    arg ListHealthByPlantParams,
) ([]HealthEntry, error) {
    rows, err := q.db.Query(
        ctx, listHealthByPlant,
        arg.PlantID, arg.Limit, arg.Offset,
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var items []HealthEntry
    for rows.Next() {
        var i HealthEntry
        if err := rows.Scan(
            &i.ID, &i.PlantID, &i.UserID,
            &i.Rating, &i.Notes,
            &i.RecordedAt, &i.CreatedAt,
            &i.UpdatedAt,
        ); err != nil {
            return nil, err
        }
        items = append(items, i)
    }
    return items, rows.Err()
}
```

{{% /section %}}

---

{{% section %}}

## DevEx


---

## Taskfile

```yaml{|4-7|9-13}
version: "3"

tasks:
  dev:
    cmds:
      - docker compose up -d
      - concurrently "air" "task watch"

  watch:
    cmds:
      - templ generate -watch &
      - tailwindcss -i ./static/css/tailwind.css \
          -o ./static/css/styles.css --minify --watch
```

---

<video data-autoplay loop muted playsinline preload="none" data-src="images/air.mp4"></video>

---

## Live Reload

```go{1-3|5|6-9|11}
import (
    "github.com/aarol/reload"
)

func (s *Server) wrapWithReload(handler http.Handler) http.Handler {
    reloader := reload.New(
        "internal/transport/http/views",
        "static/css",
    )
    s.logger.Debug("starting reload server")
    return reloader.Handle(handler)
}
```

---

<video data-autoplay loop muted playsinline preload="none" data-src="images/reload.mp4"></video>

---

## flake.nix

```nix{1|2-12|12|15-17}
myPackages = with pkgs; [
  go
  goose
  air
  golangci-lint
  gofumpt
  go-task
  playwright-driver
  playwright-cli
  templ
  sqlc
  tailwindcss_4
];

devShellPackages =
  with pkgs;
  myPackages;
```

---

## Nix

```bash{2|5|8-9}
example on main via 🐹 v1.22.8
❯ which golangci-lint

example on main via 🐹 v1.22.8
❯ nix develop

example on main via 🐹 v1.22.8 ❄️ impure (nix-shell-env)
❯ which golangci-lint
/nix/store/kcd...golangci-lint-1.56.2/bin/golangci-lint
```

{{% note %}}
{{% /note %}}

---

## Playwright

```go{1|4-7|8-10|11-13|15-16}
func TestTimelineRefreshesAfterAddEvent(t *testing.T) {
    // setup ...

    page.Locator(
        "a:has-text('Timeline Refresh Plant')",
    ).First().Click()

    timelineSection := page.Locator(
        "#timeline-section",
    )
    expect.Locator(timelineSection).ToContainText(
        "Repotted",
    )

    lastEventOOB := page.Locator("#last-event-oob")
    expect.Locator(lastEventOOB).ToContainText("—")
}
```

{{% /section %}}

---

## Takeaways

- HTMX
- Go + Templ
- sqlc

---

{{% section %}}

<img width="40%" height="auto" data-src="images/qr.png">

- https://haseebmajid.dev/slides/gophercon-htmx-go-web-app/

---

## Useful Links

- Banter Bus: https://gitlab.com/hmajid2301/banterbus
- Splitting Your Data & Application APIs: https://htmx.org/essays/splitting-your-apis/
- Nix Dev Shell: https://www.youtube.com/watch?v=bdGfn_ihHOk
- Playwright: https://www.youtube.com/watch?v=XdBhYt3-bbU

{{% /section %}}
