# Ticket: Fix image weight, RSS links, analytics and fonts

Labels: `wayfinder:task`
Status: in progress
Assignee: pi
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

The site is slow and leaks data in ways that have nothing to do with the redesign. What needs fixing, and is it done? AFK. Each item can ship to `main` on its own, before or after the merge.

## To fix

Source: `../review-2026-11-11.md` → "Performance, feeds and other non-design issues".

- [ ] **GIF → MP4/WebM.** The 5 largest are 2.9–11.4 MB (`2022-12-02-my-useful-vim-commands-with-vs-code/images/*.gif`). Convert with `ffmpeg -i x.gif -movflags faststart -pix_fmt yuv420p x.mp4` and update the markdown. `render-image.html` already renders video, so add `autoplay muted loop playsinline` there.
- [ ] **Image pipeline.** `render-image.html` should output resized WebP with a `srcset` (720/1440w) and `width`/`height`. Today the site ships 987 images (205 MB) at original size, with no dimensions.
- [ ] **RSS.** Make the 22 relative internal links (`href="./posts/…"`) absolute in the feed, and set the channel description.
- [ ] **Analytics.** Keep one of GoatCounter or Plausible. Keep the view counter only if GoatCounter stays.
- [ ] **Fonts.** Self-host Jost and Schibsted Grotesk (woff2, Latin subset, size-matched fallbacks) and drop `fonts.googleapis.com`.
- [ ] **Content.** Merge duplicate tags (`go`/`golang`, `flake`/`flakes`, `home lab`/`homelab`, `ci`/`ci-cd`/`CD`) and lowercase them. The legacy `cover.png` deletion (77 MB) is handled in ticket 08.

## Done when

Image size and request counts on the 3 heaviest posts are measured before and after, and recorded in the resolution.
