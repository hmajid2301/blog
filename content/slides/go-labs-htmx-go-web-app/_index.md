+++
title = "How I built a Web App with Go & HTMX"
outputs = ["Reveal"]
[logo]
src = "images/logo.png"
diag = "90%"
width = "5%"
[reveal_hugo]
custom_theme = "stylesheets/reveal/catppuccin.css"
slide_number = true
+++

# How I built a Web App with Go & HTMX

---

{{% section %}}


## Introduction

- Haseeb Majid
  - Backend Software Engineer at [Nala](https://www.nala.com/)
  - https://haseebmajid.dev
- Loves cats 🐱
- Avid cricketer 🏏 #BazBall

---

## Who is this for?

- Backend Developers
  - No JS
- Manage state in one place

{{% note %}}
{{% /note %}}

---

<img width="70%" height="auto" data-src="images/js_meme.jpg">

[Credit](https://velog.io/@daeseongkim/series/JavaScript)

{{% /section %}}

---

{{% section %}}

## Tech Stack

- Go
- Postgres
  - sqlc
- Templ

{{% note %}}
{{% /note %}}

---

## Tech Stack

- HTMX
- TailwindCSS
- AlpineJS


{{% note %}}
{{% /note %}}

---

<img width="80%" height="auto" data-src="images/stack.webp">

[Credit](https://procoders.tech/blog/how-to-choose-best-tech-stack-for-web-development/)

{{% /section %}}

---

{{% section %}}

## Why HTMX?

- State on backend
- Reduced complexity
- Simpler tooling

{{% note %}}
- No npm
{{% /note %}}

---

## What about JSON?

- Separate API
- Mobile vs WebApp

{{% note %}}
- A bit more boilerplate
{{% /note %}}

{{% /section %}}

---

## Why tooling

---

## Templ

---

## TailwindCSS

- DaisyUI


{{% note %}}
- Bootstrap
{{% /note %}}

---

## Setup

- Go Web Server

---

## HTMX

```html
<script src="https://unpkg.com/htmx.org@2.0.2" integrity="sha384-Y7hw+L/jvKeWIRRkqWYfPcvVxHzVzn5REgzbawhxAuQGwX1XWe70vji+VSeHOThJ" crossorigin="anonymous"></script>
<script src="https://unpkg.com/htmx.org/dist/ext/json-enc.js"></script>
```

---

## HTMX

```html{3-6|10}
<form
    class="space-y-4"
    hx-post="/waitlist"
    hx-target="#container"
    hx-swap="innerHTML"
    hx-ext="json-enc"
>
    <label class="w-full input validator">
        <i class="h-6 hgi hgi-solid hgi-tick-02"></i>
        <input type="email" name="email" placeholder="hello@example.com" required/>
    </label>
    <div class="hidden validator-hint">Enter valid email address</div>
    <button
        type="submit"
        class="p-4 transition-colors btn btn-neutral btn-block hover:bg-secondary hover:text-neutral"
        hx-indicator=".hx-indicator"
        hx-disabled-elt="this"
    >
        <span class="htmx-show">Send Magic Link ✨</span>
        <span class="hidden justify-center items-center hx-indicator">
            <span class="loading loading-spinner"></span>
            <span class="ml-2">Sending...</span>
        </span>
    </button>
</form>

<div id="container"></div>
```

---

## Go

```go{1-3|}
type MagicLink struct {
	Email string `json:"email"`
}

func (h Handler) AddToWaitlist(c fuego.ContextWithBody[MagicLink]) (fuego.Templ, error) {
    // Add to waitlist
    // ...

	return components.SuccessWaitlist(email), nil
}
```

---

## Go/Templ

```templ{|14}
templ SuccessWaitlist(email string) {
	<div class="p-8 space-y-6 text-center">
		<div class="flex justify-center text-neutral">
			<i class="h-10 text-neutral hgi hgi-solid hgi-tick-02"></i>
		</div>
		<h3 class="text-2xl font-semibold">
			You're on the Waitlist 🎉
		</h3>
		<div class="space-y-6">
			<p>Thank you for your interest in our application.</p>
			<p>
				We'll notify you at
				<br/>
				<span class="font-mono text-primary">{ email }</span>
				<br/>
				when we're ready to launch.
			</p>
		</div>
	</div>
}
```

---

## HTMX

```html{|15}
<div id="container">
	<div class="p-8 space-y-6 text-center">
		<div class="flex justify-center text-neutral">
			<i class="h-10 text-neutral hgi hgi-solid hgi-tick-02"></i>
		</div>
		<h3 class="text-2xl font-semibold">
			You're on the Waitlist 🎉
		</h3>
		<div class="space-y-6">
			<p>Thank you for your interest in our application.</p>
			<p>
				We'll notify you at
				<br/>
				<span class="font-mono text-primary">hello@haseebmajid.dev</span>
				<br/>
				when we're ready to launch.
			</p>
		</div>
	</div>
</div>
```

---

## DevEx

- docker-compose

---

```yaml{|5|11}
services:
  postgres:
    image: postgres:17.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/postgres-init.sql:/docker-entrypoint-initdb.d/init.sql
```

---

## DevEx

- Task Runners
    - Taskfiles/Makefiles/Just
- air
- watch
    - tailwind
    - templ

---

```yaml{|7|9-11|11}
version: "3"

tasks:
  dev:
    desc: Start the app in dev mode with live-reloading.
    dotenv:
      - .env.local
    cmds:
      - podman-compose up -d
      - task: watch
      - air
```

---

```yaml
watch:
  desc: Watch for file changes and run commands, i.e. generate templates or tailwindcss
  cmds:
    - tailwindcss --watch=always -i ./static/css/tailwind.css -o ./static/css/styles.css --minify &
    - templ generate -watch --proxy="http://localhost:8080" --open-browser=true &
```

---

## DevEx

- nix dev shells
  - standalone
  - tailwind

---

## DevEx

- LSP
  - DaisyUI

---

## When not to use HTMX?

- Lots of frontend reactivity
- Separate frontend/backend teams

---

## Further

- Observability
  - Otel
- Playwright
  - Go

---

<img width="50%" height="auto" data-src="images/qr.png">

https://haseebmajid.dev/slides/go-lab-htmx-go-web-app/

---

## References & Thanks

- Example App: https://gitlab.com/hmajid2301/banterbus

