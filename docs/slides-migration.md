# Slide URL migration

## Permanent compatibility contract

The blog stays at `https://haseebmajid.dev/`, including `/talks/`.
Slide sources will move to a separate `slides` repository, published at
`https://slides.haseebmajid.dev/`.

**Keep every existing `/slides/<deck>/` URL permanently.** Printed QR codes,
bookmarks, and conference links cannot be updated. Updating `/talks/` links later
does not replace these redirects.

The authoritative, hardcoded mapping is [`data/slide_redirects.toml`](../data/slide_redirects.toml).
Hugo renders it through [`layouts/index.redirects`](../layouts/index.redirects)
into `public/_redirects` for GitLab Pages on every normal blog build.
Do not edit the generated file or delete an old mapping when adding an edition.

## Destination naming

Use `<talk>/<YYYY-MM-DD>-<event>/` for each conference edition. Repeated talks
share a topic directory but have independent, stable edition URLs. Never send a
historical deck to a moving “latest” version.

The mapping currently records:

| Existing `/slides/` slug | Destination path on `slides.haseebmajid.dev` |
| --- | --- |
| `an-intro-to-pocketbase` | `/an-intro-to-pocketbase/2023-05-31-london-gophers/` |
| `faster-go-tests-and-postgres` | `/faster-go-tests-and-postgres/2025-07-15/` |
| `gitlab-runners-and-dind` | `/gitlab-runners-and-dind/2023-11-15-london-gophers/` |
| `go-labs-eda-go-kafka` | `/eda-go-kafka/2026-11-02-golab/` |
| `go-labs-htmx-go-web-app` | `/htmx-go-web-app/2025-10-06-golab/` |
| `go-labs-reproducible-envs-with-nix` | `/reproducible-envs-with-nix/2024-11-13-golab/` |
| `gophercon-htmx-go-web-app` | `/htmx-go-web-app/2026-08-12-gophercon-uk/` |
| `gophercon-otel` | `/otel-go/2025-07-15-gophercon-uk/` |
| `london-gophers-reproducible-envs-with-nix` | `/reproducible-envs-with-nix/2024-11-20-london-gophers/` |
| `my-journey-using-docker-as-a-developer-tool` | `/my-journey-using-docker-as-a-developer-tool/2022-07-13-europython/` |
| `python-to-go-concurrency` | `/python-to-go-concurrency/2026-11-02/` |
| `reproducible-envs-with-nix` | `/reproducible-envs-with-nix/2024-04-25-conf42-golang/` |

Dates/events come from the existing talk metadata, falling back to slide metadata
or the featured deck entry. Confirm them before publishing the new host:

- `go-labs-htmx-go-web-app` has conflicting slide metadata (GopherCon UK,
  2026-08-12). The mapping uses its talk page's GoLab date, 2025-10-06.
- No event is recorded for `faster-go-tests-and-postgres` or
  `python-to-go-concurrency`; their edition paths use only the recorded date.
- Other dates, including GopherCon dates, are copied as recorded, not independently
  verified against conference schedules.

## Redirect behavior

Each deck gets an exact no-trailing-slash rule, an exact trailing-slash rule,
and a nested-path rule. Nested paths retain their suffix, for example:

```text
/slides/reproducible-envs-with-nix/slides.pdf
→ https://slides.haseebmajid.dev/reproducible-envs-with-nix/2024-04-25-conf42-golang/slides.pdf
```

`/slides` and `/slides/` redirect to the new index. There is no blanket rule for
unknown decks: each old slug has a deliberate destination.

These are HTTP 301 redirects, not Hugo's default HTML/meta-refresh aliases.
Browsers inherit the original URL fragment when the Location header has no
fragment, so Reveal links such as `#/3/1` continue to target the same slide.
Slidev path routes and PDF/image suffixes are retained by the nested-path rule.
The destination must actually publish those files and support those routes.

GitLab does not support query-parameter matching in redirect rules; no rule
attempts to inspect or rewrite query parameters. Check actual query-string
forwarding on the deployed GitLab Pages instance before cutover.

## Local extraction and blog cleanup

The approved destination is standalone Reveal.js in a separate `slides`
repository at `/home/haseeb/projects/slides`. Legacy decks remain Markdown,
with only Hugo-specific syntax replaced by native Reveal.js equivalents; the
standard Reveal Markdown plugin loads them directly. Deck rendering no longer
depends on Hugo or reveal-hugo. The Nix shell and GitLab Pages build are prepared
in that repository; Hugo handles only its index and routing rules. Publication
uses the dated/event paths in the compatibility map, with GitLab Pages serving
as the initial host. Preserve the existing custom-domain redirect targets until
that domain is configured or deliberately change them before the blog cutover.

This blog no longer imports reveal-hugo or runs slide exports/builds in its
Taskfile or Pages job. The obsolete slide Hugo config, export helper, and
slide-only JavaScript partial are removed. Historical `content/slides/` sources
and `static/slides/` assets remain on disk, but content is ignored and the Hugo
static mount excludes `slides/**`. Normal builds publish the blog and redirect
rules, not legacy slide files. `/talks/` content and links are unchanged.

Blog changes are isolated in `/home/haseeb/projects/blog-slides-migration` on
branch `feat/slides-migration`. The original blog checkout has not been cleaned
or switched. The new slides repository is pushed to
`https://gitlab.com/hmajid2301/slides`; its Pages deployment and custom-domain
redirect destinations still need live verification. No DNS or blog cutover has
been performed. See the new repository's `docs/slides-migration.md` for the
extraction checklist.

## Safe cutover (not yet performed)

**Do not deploy this blog cutover until the new host and every mapped destination
have been verified. These are local changes only, not a live migration.**

1. Move deck sources, PDFs, demos, and shared slide components to the new repo,
   preserving current uncommitted edits. Keep `/talks/` here.
2. Configure the new repo's GitLab Pages deployment and custom domain/TLS.
   Build each standalone Reveal.js deck at the exact destination in the mapping;
   preserve assets, shared imports, and compatibility with old routes.
3. Publish and verify every destination, including nested routes and PDFs.
4. Confirm the prepared blog cleanup excludes all legacy slide files from the
   output. Use a fresh publish directory so previously generated files do not
   survive deployment; the static mount exclusion does not clean stale output.
5. Deploy the blog with its Hugo-generated `public/_redirects` intact.
6. Check GitLab's rule diagnostics at `https://haseebmajid.dev/_redirects`.
   Verify the old slash/no-slash URLs, a QR-code URL, a Reveal fragment, a Slidev
   route, a PDF, and a query string against the live site.
7. Update `/talks/` links separately once the redirects are working. Existing
   GitLab source/PDF links under the old repo also need separate consideration;
   this site's redirects cannot redirect URLs owned by `gitlab.com`.

**GitLab serves existing files before applying redirects.** The static mount
exclusion prevents legacy assets from shadowing redirects in a fresh build.
Do not deploy this cleanup before the new host is ready, and do not assume a
`301!` force rule works: GitLab does not support it.

This change prepares blog cleanup and redirects locally. It does not deploy
either repository, change DNS, delete slide content, or change `/talks/` links.

## Local verification

```sh
output=$(mktemp -d /tmp/blog-slide-redirects.XXXXXX)
hugo --destination "$output" --printPathWarnings
grep -c ' 301$' "$output/_redirects"
test ! -e "$output/slides"
test -f "$output/index.html"
test -f "$output/talks/index.html"
```

Inspect `$output/_redirects` (no `.txt` extension). A normal blog build should
generate 38 rules: three per deck and two index rules, with no `slides/` output.

References:

- [GitLab Pages redirects](https://docs.gitlab.com/user/project/pages/redirects/)
- [Hugo output formats](https://gohugo.io/configuration/output-formats/)
