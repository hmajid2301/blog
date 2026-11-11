"""Facts gathered from content/posts, content/talks and content/slides. Nothing invented."""

GL = "https://gitlab.com/hmajid2301/"

def P(d, t):
    return {"href": f"/posts/{d}/", "title": t, "date": d[:10]}

PROJECTS = [
    {
        "slug": "banterbus", "name": "Banter Bus",
        "kind": "Multiplayer party game",
        "desc": "A browser-based multiplayer party game in the spirit of Jackbox or Skribbl.io, and my third attempt at building one.",
        "long": "State lives almost entirely on the server: HTML is rendered with templ, HTMX swaps it in, and Alpine covers the small bits of client-side interactivity. Deployed to my homelab k3s cluster with FluxCD.",
        "stack": ["Go", "templ", "HTMX", "Alpine.js", "Tailwind", "Postgres", "WebSockets"],
        "ft": "go",
        "repo": GL + "banterbus", "site": "https://banterbus.games",
        "img": "/posts/2026-01-01-my-year-in-review-2025/images/banterbus.png",
        "img_alt": "Banter Bus lobby screen with nickname and room code fields and Start and Join buttons",
        "first": 2024,
        "talks": [("What I learnt building a web app with Go and HTMX", "/talks/gophercon-htmx-go-web-app/", "GopherCon UK 2026"),
                  ("Observability Made Painless: Go, OTel & LGTM Stack", "/talks/gophercon-otel/", "GopherCon UK 2025")],
        "posts": [
            P("2026-01-01-my-year-in-review-2025", "My Year in Review 2025"),
            P("2025-05-03-why-i-build-a-web-app-with-htmx-go-postgres", "Why I Built a Web App With HTMX, Go & Postgres"),
            P("2025-01-01-my-year-in-review-2024", "My Year in Review 2024"),
            P("2024-09-15-til-how-to-cancel-stale-pipelines-in-gitlab-ci", "TIL: How to Cancel Stale Pipelines in GitLab CI"),
            P("2024-09-12-til-how-to-get-shell-completions-in-nix-shell-with-direnv", "TIL: How to Get Shell Completions in Nix Shell With Direnv"),
            P("2022-12-01-how-to-use-copier-to-create-project-templates", "How to use copier to create project templates"),
            P("2022-08-08-running-gitlab-ci-jobs-in-docker-using-docker-compose", "Running Gitlab CI jobs in Docker using docker-compose"),
        ],
    },
    {
        "slug": "voxicle", "name": "Voxicle",
        "kind": "Micro-SaaS, built in public",
        "desc": "A SaaS platform for collecting and acting on user feedback, built in public with weekly build logs.",
        "long": "My first attempt at something I would charge for, so the code is not open source. A plain CRUD app on the same Go and HTMX stack, styled with Tailwind and DaisyUI.",
        "stack": ["Go", "templ", "HTMX", "Alpine.js", "Tailwind", "DaisyUI", "Postgres", "Nix"],
        "ft": "go",
        "repo": None, "site": "https://voxicle.app",
        "img": "/posts/2026-01-01-my-year-in-review-2025/images/voxicle.jpg",
        "img_alt": "Voxicle feedback board with a list of submitted feedback and a Submit New Feedback button",
        "first": 2025,
        "talks": [],
        "posts": [
            P("2026-01-01-my-year-in-review-2025", "My Year in Review 2025"),
            P("2025-07-07-voxicle-build-log-16", "Voxicle Build Log 16"),
            P("2025-06-23-voxicle-build-log-15", "Voxicle Build Log 15"),
            P("2025-06-18-how-to-use-the-gitlab-proxy-in-ci", "How to Use the GitLab Proxy in CI"),
            P("2025-06-02-voxicle-build-log-14", "Voxicle Build Log 14"),
            P("2025-05-19-voxicle-build-log-week-13", "Voxicle Build Log 13"),
            P("2025-05-12-voxicle-build-log-week-12", "Voxicle Build Log Week 12"),
            P("2025-05-06-how-i-setup-tailwindcss-lsp-with-neovim-nix-with-daisyui-", "How I Setup Tailwindcss LSP With Neovim & Nix (With DaisyUI)"),
            P("2025-05-05-voxicle-week-11", "Voxicle Week 11"),
            P("2025-05-03-why-i-build-a-web-app-with-htmx-go-postgres", "Why I Built a Web App With HTMX, Go & Postgres"),
            P("2025-04-28-voxicle-week-9-week-10", "Voxicle Week 9 & Week 10"),
            P("2025-04-14-voxicle-week-7-week-8", "Voxicle Week 7 & Week 8"),
            P("2025-04-12-til-how-to-get-dropbar-and-auto-session-to-work", "TIL - How to Get Dropbar and Auto Session to Work"),
            P("2025-03-31-voxicle-week-6", "Voxicle Week 6"),
            P("2025-03-24-voxicle-week-5", "Voxicle Week 5"),
            P("2025-03-22-til-fix-issue-with-dropbar-and-auto-session", "TIL: How to Fix Issue With Dropbar and Auto Session"),
        ],
    },
    {
        "slug": "nixicle", "name": "nixicle",
        "kind": "NixOS & Home Manager config",
        "desc": "My NixOS and Home Manager configuration: desktops, laptops and the homelab, all built from one flake.",
        "long": "Home of the custom modules (lib.nixicle) behind posts on Traefik, Cloudflare tunnels, Pocket ID, Zellij and Neovim.",
        "stack": ["Nix", "NixOS", "Home Manager", "Traefik"],
        "ft": "nix",
        "repo": GL + "nixicle", "site": None,
        "img": None, "img_alt": "",
        "first": 2024,
        "talks": [],
        "posts": [
            P("2026-08-25-why-i-migrated-from-authentik-to-pocketid", "Why I Migrated From Authentik to PocketID"),
            P("2025-12-31-how-to-setup-a-new-pc-with-lanzaboote-tpm-decryption-sops-nix-impermanence-nixos-anywhere", "How to Setup a New PC With Lanzaboote, TPM Decryption, sops-nix, Impermanence and nixos-anywhere"),
            P("2025-11-06-til-how-to-enable-video-thumbnails-for-smb-share-on-nixos", "TIL - How to Enable Video Thumbnails for SMB Share on Nixos and Nautilus"),
            P("2025-11-02-yak-shaving-neotest-edition", "Yak Shaving: Neotest Edition"),
            P("2025-07-10-how-to-use-tailscale-gitlab-ci-to-deploy-to-our-nix-homelab", "How to Use Tailscale GitLab CI to Deploy to Our Nix Home lab"),
            P("2025-05-15-part-8-neovim-as-part-of-your-development-workflow", "Part 8: Neovim as Part of Your Development Workflow"),
            P("2025-05-06-how-i-setup-tailwindcss-lsp-with-neovim-nix-with-daisyui-", "How I Setup Tailwindcss LSP With Neovim & Nix (With DaisyUI)"),
            P("2025-01-20-how-to-fix-firefox-rendering-emoji-font-black-bold-numbers-issue", "How to Fix Firefox Rendering Emoji Font (NixOS)"),
            P("2025-01-01-my-year-in-review-2024", "My Year in Review 2024"),
            P("2024-12-18-part-7-zellij-as-part-of-your-development-workflow", "Part 7: Zellij as Part of Your Development Workflow"),
            P("2024-10-15-how-to-wrap-nixgl-around-package-in-home-manager", "How to Wrap NixGL Around Package in Home Manager"),
            P("2024-09-30-how-to-setup-cloudflare-tunnels-to-point-to-service-behind-traefik", "How to Set up Cloudflare Tunnels With Traefik (In NixOS)"),
            P("2024-09-06-how-to-setup-authentik-forward-auth-with-traefik-on-nixos", "How to Set up Authentik Forward Auth With Traefik on NixOS"),
            P("2024-07-01-part-6-fish-shell-as-part-of-your-development-workflow", "Part 6: Fish Shell as Part of Your Development Workflow"),
            P("2024-04-28-part-5-nix-as-part-of-your-development-workflow", "Part 5: Nix as Part of Your Development Workflow"),
        ],
    },
    {
        "slug": "optinix", "name": "OptiNix",
        "kind": "CLI / TUI",
        "desc": "A CLI tool for finding Nix options from the terminal, with a TUI built on Bubble Tea.",
        "long": "Built to practise more Go and to make a tool I actually use. Also the example project in my Conf42 Golang talk on Nix.",
        "stack": ["Go", "Bubble Tea", "Viper", "Nix"],
        "ft": "go",
        "repo": GL + "optinix", "site": None,
        "img": None, "img_alt": "",
        "first": 2024,
        "talks": [("Reproducible & Ephemeral Development Environments with Nix", "/talks/reproducible-envs-with-nix/", "Conf42 Golang 2024")],
        "posts": [
            P("2025-03-03-go-feedback-my-new-side-project", "Go Feedback My New Side Project"),
            P("2025-01-01-my-year-in-review-2024", "My Year in Review 2024"),
            P("2024-05-19-how-to-use-env-variables-with-viper-config-library-in-go", "How to Use Env Variables With Viper Config Library in Go"),
        ],
    },
    {
        "slug": "lettucego", "name": "LettuceGo",
        "kind": "Gardening app",
        "desc": "A gardening app (yes, terrible pun). The worked example for row level security in Postgres from Go.",
        "long": "Authorization is enforced in the database with RLS policies through pgx, and sign-in goes through Pocket ID.",
        "stack": ["Go", "Postgres", "pgx", "RLS", "Pocket ID"],
        "ft": "go",
        "repo": GL + "lettucego", "site": None,
        "img": None, "img_alt": "",
        "first": 2026,
        "talks": [],
        "posts": [
            P("2026-08-25-why-i-migrated-from-authentik-to-pocketid", "Why I Migrated From Authentik to PocketID"),
            P("2026-08-15-how-i-implemented-authorization-in-my-go-app-with-rls-postgres", "How I Implemented Authorization in My Go App With RLS (Postgres)"),
        ],
    },
]

YT = "https://www.youtube.com/watch?v="
PDF = "https://gitlab.com/hmajid2301/blog/-/blob/main/content/slides/{}/slides.pdf"

# Decks, newest first. date/event come from the talk page when one exists.
DECKS = [
    {"slug": "go-labs-eda-go-kafka", "title": "Building Resilient Event-Driven Architectures with Go and Kafka",
     "date": "2026-11-02", "event": "GoLab", "engine": "Slidev", "talk": None, "topic": "kafka",
     "summary": "A Slidev deck covering event-driven architectures, Go, Kafka, PostgreSQL, outbox, retries and DLQs.",
     "res": [("Slides", "/slides/go-labs-eda-go-kafka/")]},
    {"slug": "python-to-go-concurrency", "title": "From Python to Go: Concurrency Without the Surprises",
     "date": "2026-11-02", "event": None, "engine": "Slidev", "talk": "/talks/python-to-go-concurrency/", "topic": "concurrency",
     "summary": "A 30-minute introduction to Go concurrency for developers who know Python but are new to Go.",
     "res": [("Slides", "/slides/python-to-go-concurrency/"),
             ("Code", "https://gitlab.com/hmajid2301/blog/-/tree/main/content/slides/python-to-go-concurrency/examples")]},
    {"slug": "gophercon-htmx-go-web-app", "title": "What I learnt building a web app with Go and HTMX",
     "date": "2026-08-12", "event": "GopherCon UK", "engine": "reveal-hugo", "talk": "/talks/gophercon-htmx-go-web-app/", "topic": "htmx",
     "photo": "/talks/gophercon-htmx-go-web-app/images/1Q2A7432.webp", "photo_alt": "Haseeb presenting at a lectern at GopherCon UK",
     "res": [("Slides", "/slides/gophercon-htmx-go-web-app/"), ("PDF", PDF.format("gophercon-htmx-go-web-app")), ("Video", YT + "lZ4EPkIngRc")]},
    {"slug": "go-labs-htmx-go-web-app", "title": "What I learnt building a web app with Go and HTMX",
     "date": "2025-10-06", "event": "GoLab", "engine": "reveal-hugo", "talk": "/talks/go-labs-htmx-go-web-app/", "topic": "htmx",
     "res": [("Slides", "/slides/go-labs-htmx-go-web-app/"), ("PDF", PDF.format("go-labs-htmx-go-web-app")), ("Video", YT + "dKWgb4P9Rng")]},
    {"slug": "gophercon-otel", "title": "Observability Made Painless: Go, OTel & LGTM Stack",
     "date": "2025-07-15", "event": "GopherCon UK", "engine": "reveal-hugo", "talk": "/talks/gophercon-otel/", "topic": "otel",
     "photo": "/talks/gophercon-otel/images/1.jpg", "photo_alt": "Haseeb speaking on stage at GopherCon UK",
     "res": [("Slides", "/slides/gophercon-otel/"), ("PDF", PDF.format("gophercon-otel")), ("Video", YT + "t3Xz-IrxNwk"), ("Code", GL + "banterbus")]},
    {"slug": "faster-go-tests-and-postgres", "title": "From Coffee Break to Instant Feedback: Rapid Integration Testing in Go",
     "date": "2025-07-15", "event": None, "engine": "reveal-hugo", "talk": None, "topic": "testing",
     "res": [("Slides", "/slides/faster-go-tests-and-postgres/")]},
    {"slug": "london-gophers-reproducible-envs-with-nix", "title": "Using Nix to create reproducible Go development environments",
     "date": "2024-11-20", "event": "London Gophers", "engine": "reveal-hugo", "talk": "/talks/london-gophers-reproducible-envs-with-nix/", "topic": "nix",
     "photo": "/talks/london-gophers-reproducible-envs-with-nix/images/1.jpg", "photo_alt": "Audience at London Gophers watching the Nix talk",
     "res": [("Slides", "/slides/london-gophers-reproducible-envs-with-nix/"), ("PDF", PDF.format("london-gophers-reproducible-envs-with-nix"))]},
    {"slug": "go-labs-reproducible-envs-with-nix", "title": "Using Nix to create reproducible Go development environments",
     "date": "2024-11-13", "event": "GoLab", "engine": "reveal-hugo", "talk": "/talks/go-labs-reproducible-envs-with-nix/", "topic": "nix",
     "photo": "/talks/go-labs-reproducible-envs-with-nix/images/1.jpeg", "photo_alt": "Haseeb presenting the Nix talk at GoLab",
     "res": [("Slides", "/slides/go-labs-reproducible-envs-with-nix/"), ("PDF", PDF.format("go-labs-reproducible-envs-with-nix")), ("Video", YT + "bdGfn_ihHOk"), ("Code", GL + "banterbus")]},
    {"slug": "reproducible-envs-with-nix", "title": "Reproducible & Ephemeral Development Environments with Nix",
     "date": "2024-04-25", "event": "Conf42 Golang", "engine": "reveal-hugo", "talk": "/talks/reproducible-envs-with-nix/", "topic": "nix",
     "res": [("Slides", "/slides/reproducible-envs-with-nix/"), ("PDF", PDF.format("reproducible-envs-with-nix")), ("Video", YT + "HcNXlC1bjvI"), ("Code", GL + "optinix")]},
    {"slug": "gitlab-runners-and-dind", "title": "GitLab Runners: Docker-in-Docker Explained",
     "date": "2023-11-15", "event": "London Gophers", "engine": "reveal-hugo", "talk": "/talks/gitlab-runners-and-dind/", "topic": "docker",
     "res": [("Slides", "https://talks.haseebmajid.dev/gitlab-runners-and-dind/")]},
    {"slug": "an-intro-to-pocketbase", "title": "An Introduction to Pocketbase: A Go Based Backend",
     "date": "2023-05-31", "event": "London Gophers", "engine": "reveal-hugo", "talk": "/talks/an-intro-to-pocketbase/", "topic": "pocketbase",
     "photo": "/talks/an-intro-to-pocketbase/images/talk.jpeg", "photo_alt": "Haseeb presenting at London Gophers",
     "res": [("Slides", "/slides/an-intro-to-pocketbase/"), ("PDF", PDF.format("an-intro-to-pocketbase")), ("Video", YT + "y5E1dox9ZEA"), ("Code", GL + "talks/-/tree/main/an-intro-to-pocketbase")]},
    {"slug": "my-journey-using-docker-as-a-developer-tool", "title": "My Journey Using Docker as a Development Tool",
     "date": "2022-07-13", "event": "EuroPython", "engine": "reveal-hugo", "talk": "/talks/my-journey-using-docker-as-a-developer-tool/", "topic": "docker",
     "photo": "/talks/my-journey-using-docker-as-a-developer-tool/images/docker_talk.jpg", "photo_alt": "Haseeb presenting at EuroPython",
     "res": [("Slides", "/slides/my-journey-using-docker-as-a-developer-tool/"), ("PDF", PDF.format("my-journey-using-docker-as-a-developer-tool")), ("Video", YT + "JSSG4FqKaGI"), ("Code", GL + "talks/-/tree/main/docker-as-a-dev-tool/example")]},
]

INTRO = ("A collection of talk decks I've given, exported as HTML from "
         '<a href="https://mfontanini.github.io/presenterm/">presenterm</a>, '
         '<a href="https://github.com/joshed-io/reveal-hugo/">reveal-hugo</a> and '
         '<a href="https://sli.dev/">Slidev</a>.')

MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()

def fdate(d, short=False):
    y, m, dd = d.split("-")
    return f"{int(dd)} {MONTHS[int(m)-1]}" + ("" if short else f" {y}")

PH = lambda s: f'<span class="mock-ph" title="Placeholder: not verified">[{s}]</span>'

COMMON_CSS = """
.mock-ph{font-family:var(--lab-mono);font-size:.78em;letter-spacing:.02em;color:var(--lab-muted);
  border:1px dashed color-mix(in srgb,var(--lab-muted) 55%,transparent);border-radius:6px;padding:1px 6px;white-space:nowrap;font-weight:400}
.main.post:has(> [data-mock-wide]){max-width:1164px}
.mock-wrap{max-width:1100px;margin:0 auto;padding:8px 0 80px}
.mock-wrap a:focus-visible{outline:2px solid var(--lab-accent);outline-offset:3px;border-radius:4px}
"""

def render(page, alt, title, content):
    import os
    tpl = open("/tmp/ogbuild/mock-template.html").read()
    out = tpl.replace("MOCK_TITLE", title).replace("<!--MOCK-->", content)
    d = f"/tmp/ogbuild/mockups/{page}/{alt}"
    os.makedirs(d, exist_ok=True)
    open(f"{d}/index.html", "w").write(out)
