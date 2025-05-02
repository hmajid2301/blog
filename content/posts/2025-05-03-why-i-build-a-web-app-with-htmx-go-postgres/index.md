---
title: Why I Built a Web App With HTMX, Go & Postgres
date: 2025-05-05
canonicalURL: https://haseebmajid.dev/posts/2025-05-03-why-i-build-a-web-app-with-htmx-go-postgres
tags:
  - voxicle
  - htmx
  - go
  - postgres
cover:
  image: images/cover.png
---

## Introduction

Recently, I have started to build apps using the web stack:

  - frontend
      - htmx
      - tailwindcss
        - daisyui
      - alpine

  - backend
      - go
        - templ
      - postgres

  - devex
    - gitlab ci
    - nix devshells


I have now built two apps using this stack, one of them being `banterbus.games` a browser-based party game (currently broken).
Using web sockets, so it isn't the most normal web application. As there are a few quirks of web sockets.

Banter Bus Code: https://gitlab.com/hmajid2301/banterbus

I am currently building a more normal CRUD app, called Voxicle (https://voxicle.app), a SaaS platform for collecting
and acting on user feedback. The first time, I am trying to build something which I will charge others for (hence
the code also not being open-source yet). Some more context here: https://haseebmajid.dev/posts/2025-03-03-go-feedback-my-new-side-project/

In this article, go over why I like this tech stack so much. Mainly because I want to keep things as simple as possible.
One other thing to note, I am a backend developer, and don't really like writing frontend code a la JavaScript (JS).
So this stack is designed to avoid writing as many JS as I can, which other developers of course love writing.
So read this article through those lenses. This stack might not make sense for you.

## Frontend

One of the issues I found in my side projects was that I would always lose motivation when I had to write frontend
code. For a few reasons, I never had enough experience with frameworks like React or Svelte to know how to structure
them. Therefore, they would quickly become a mess.

Another issue is maintaining consistent state between the backend and frontend. If we drive everything from the backend
we can maintain most of our state there. Which works pretty well for a simple CRUD app we are building? The UI
doesn't need to do anything super crazy or clever.

### TailwindCSS

For styling, I have stuck with TailwindCSS for a number of years, some people hate it. I have never minded it.
It does lead to bloated class and makes the HTML look more complicated. But I never worked out how to structure
CSS. So tailwind always felt simpler to me.

I probably have a bunch of duplicated styles and can simplify what I have, as again I am no CSS expert nor
frontend expert. But we can look at that if we feel the frontend is slow to load etc.

#### DaisyUI

I am using this component library on top of TailwindCSS, which provides us with a bunch of components and themes
we can use out of the box. Straightforward to style and tweak/change. I like it again, backend developer doing frontend
so perhaps for more complicated apps, you want your own design system and creating your own components is better.
But again, I really like how easy it makes frontend development feel for me.

### HTMX

The frontend is built using HTMX, as a simple library, where we drive most of our state from the backend.
The server returns HTML (vs JSON) and then we tell it where to replace. Look at this HTMX request.
When the form is submitted, we send a POST request to the `/feedback` endpoint the body is the input fields as JSON.
(`json-enc` extension converts it to JSON for us). Then the target means the HTML returned replaces the outer HTML
`feedback_list`

```html
<form
    hx-post="/feedback"
    hx-target="#feedback_list"
    hx-swap="outerHTML"
    hx-ext="json-enc"
    class="space-y-6"
>
```

### AlpineJS

I combined HTMX with AlpineJS, as some actions you don't always want to go to the server. Like opening a modal,
or accordion. I don't use it a lot and maybe could refactor my site without it. But for now, it does help
make things a bit simpler. Especially with Dynamic HTMX queries, which cannot be statically generated on the backend
when we render the HTML template.
See an example here: https://haseebmajid.dev/posts/2025-04-29-til-set-dynamic-url-with-htmx-and-alpinejs/

## Backend

### Go

I moved from Python to Go about 3 years ago and honestly haven't looked back. I really liked statically typed
languages. Again, each to their own, but I think having typed data just makes your life so much easier. I also really
like the smaller, better devex around Go. Fast to compile. Compiles to single static binary. Easier to put into a scratch
Docker image. Simple dependency management, `go mod`. The CLI tool has a test runner (`go test`).

I really like the simplicity of Go, the code is pretty easy to read and see what is going on. I have tried to avoid
using frameworks like Gin, or Gorilla. In the end, I did use Fuego, so I could generate an Open API specification.

I started writing raw SQL with `sqlc`, so I know exactly what the query will do vs guessing with an ORM.
I loved using ORMs and frameworks like Flask or FastAPI in Python but have completely reversed my opinion in Go.

```sql
-- name: AddUser :one
insert into users (email) values ($1) returning *;

-- name: AddOrganization :one
insert into organizations (display_name, slug) values ($1, $2) returning *;
```

Then we can generate the SQL code by running `sqlc generate` which generates go code. We are going to use `pgx` as
the underlying driver.

I am using the common 3 layer structure, controller (return HTML) -> service layer (business logic) -> store layer (DB).

### Postgres

I remember I used to really like experimenting with different technologies like MongoDB. But these days boring is sexy
for me. Like this entire stack, keep it simple, stupid. Unless you have a good reason, just use Postgres. It works
there is a lot of tooling around it. For some instances, storing JSON and querying JSON, it outperforms MongoDB.

## DevEx

A few points on the DevEx part, I really like Gitlab CI, I self-host my own runners. So speed/running out of minutes
is not an issue. I am just very familiar with it. I use it alongside `go-task` (Taskfiles), which I found simpler
than make.

Finally, if you know me, I always love to mention Nix, the project is set up to use Nix dev shells for all the non go
dependencies, and we then have a really similar dev env and CI env. See more: https://www.youtube.com/watch?v=bdGfn_ihHO

That's about it! That is my high-level experience and reason for going with this tech stack for building a SaaS.
I may well go into more details about the platform I choose to help with authentication and how I intend to do
authorization but for now, this is a good starting point.
