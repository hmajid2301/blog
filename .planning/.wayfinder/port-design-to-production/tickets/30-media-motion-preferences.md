# Ticket: Respect motion preferences and make retained animations pausable

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

What consistent pause and reduced-motion behavior should screen-recording demos and retained GIFs provide?

## Evidence and scope

[Audit 18](18-before-after-lighthouse-audit.md) found a visible converted Vim MP4 still advances and loops with `prefers-reduced-motion: reduce` (currentTime 1.18s, paused=false). Native controls now allow pause, an improvement over the old GIFs. Retained Dotfiles/React GIFs have no native pause controls. This is a carried accessibility gap, not evidence the media conversion alone introduced motion into static content.

[Durable evidence](../assets/audits/session16/browser/REPORT.md): `browser/supplement.json` reduced-motion-visible, retained-gifs; `browser/raw.json` video play/pause/decode. Choose default/reduced-motion behavior explicitly, keep useful demos available by deliberate action, preserve inline playback and visible controls, and verify preferences before and after navigation. Scope any retained-media replacements separately from unrelated content cleanup. Chromium evidence is not Safari/iOS coverage. No implementation performed by the audit.

## Resolution

`assets/js/reduced-motion.js` pauses autoplaying demo videos and removes their `autoplay` attribute under `prefers-reduced-motion: reduce`, with re-application on DOMContentLoaded/load and on media-query change. Deliberate playback via visible controls is unaffected; no-preference pages autoplay as before. Script is minified/fingerprinted in the footer component slice.

[Final-source evidence](../assets/audits/session17/REPORT.md), `motion.json` and `check-motion.mjs` in that directory. All five Vim videos are paused at `currentTime`0 with `autoplay` removed under reduced motion; deliberate `.play()` advances; under no-preference all five autoplay. Chromium only; retained Dotfiles/React GIFs remain unpausable and are still a documented limitation (replacement remains out of scope). No Safari/iOS/other-engine claim, no permanent tests, commit, push, merge or deployment.
