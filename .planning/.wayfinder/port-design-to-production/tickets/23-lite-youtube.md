# Ticket: Load YouTube players only after an explicit click

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Decision and scope

Approved in [Choose which new components are in scope for this redesign](15-feature-backlog.md). Reference: `http://127.0.0.1:1418/lite-youtube.html`.

Use a local-poster, click-to-load recording treatment instead of eagerly loaded YouTube iframes. Preserve current talk IDs and content; prototype artwork is not a required production thumbnail.

## Completion

- Inventory current YouTube shortcode/embeds and preserve used parameters, accessible titles and any existing start-time behaviour.
- No YouTube/ytimg/player request before reader consent, including thumbnails. Prefer existing local artwork or a simple local poster; do not add a remote thumbnail dependency.
- A labelled keyboard-accessible control loads the privacy-enhanced player. Keep normal player controls and no unsolicited autoplay. Provide an ordinary video link/no-JS fallback and preserve aspect ratio.
- Verify pre-click network isolation and real post-click playback separately; prior prototype interception did not prove playback. Check mobile, keyboard and all four palette states; build fresh production output and record limitations.

## Resolution — click-to-load YouTube applied

Overrode the built-in shortcode in `layouts/shortcodes/youtube.html` with `assets/js/lite-youtube.js` and `assets/css/extended/zzzz-youtube.css`.

- Preserves `id`/`title`/`start`; local poster, labelled control, privacy-enhanced `youtube-nocookie.com` iframe with no autoplay, and an ordinary "Watch on YouTube" no-JS link at 16:9.

### Verification

`/tmp/blog-approved-components/parent/youtube-check.log`: zero pre-consent YouTube/ytimg/googlevideo requests. `/tmp/blog-approved-components/parent/playback.log`: after click+Play the player actually advanced (currentTime 9.6→11.6s, not paused).

## Notes

Execution authorized by the user's request to implement the remaining approved components; shared plan: `../plans/20-26-components.md`.

Implementation is separate from the scope decision. Work only in the design worktree; preserve dirty work. No commit/push/merge/deployment or new repository tests without a request.
