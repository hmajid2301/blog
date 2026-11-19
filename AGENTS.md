# User preferences

- Do not add tests unless the user explicitly requests them.
- For slide work, keep changes focused on the requested slides and diagrams; do not add test infrastructure.
- Keep speaker notes succinct and easy to scan while presenting: short reminders and click cues,
  not scripts or dense paragraphs.

## Fonts

- MonoLisa (licensed) is never committed: `/static/fonts/monolisa/` is ignored and
  `scripts/fetch-fonts.sh` copies it from the private `nixicle-assets` repo
  (`$NIXICLE_ASSETS`, `../nixicle-assets`, or a CI job-token clone) before `hugo`.
  Without it the site falls back to Terminal Mono (JetBrains Mono subset, OFL).
