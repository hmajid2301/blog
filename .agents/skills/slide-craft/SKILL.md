---
name: slide-craft
description:
    Use when drafting or revising presentation slides, speaker notes, diagrams, or animations from a talk
    brief, including Slidev decks.
---

<!-- cspell:ignore Davide Imola -->

# Slide craft

Turn an approved story into sparse visuals and useful speaker notes. The speaker explains; the slides make the
journey visible. Work in English unless asked otherwise.

## Establish direction

Read `<deck>/TALK.md`, the requested slides and their notes, actual theme/layouts, shared components and
package scripts. Use codegraph first for repository exploration; verify live files before editing. Preserve
existing decisions and unrelated work. If the brief is missing or the story needs redefining, use `talk-forge`
rather than silently inventing a new talk.

Use `ask_user_question` for missing information and direction approval; use concise chat questions only if
unavailable. Show the proposed story beat, visual treatment and click progression before editing when
direction is not already approved. Existing approval covers routine edits within that direction; ask again
only for material changes to story, scope or visuals. An explicit “do not edit yet” remains binding.

## Build the spoken journey

- Give each slide one job in the causal story, not another item in a feature list.
- Keep on-slide text minimal: a short claim, essential labels or a small readable code excerpt. Put
  explanation, qualifications and transitions in speaker notes.
- Prefer animated diagrams when changes in state, ownership, communication or time become clearer through
  motion. Use static diagrams when motion adds nothing.
- Reveal one meaningful change per click. Align notes with click cues and explain the final state; don't hide
  essential information behind decorative motion.
- Keep technical meaning and the author's account truthful. Label illustrative code, simulations and
  simplifications; don't invent production experience, benchmark results or working demos.

For example, in a service-rewrite talk, show the service changing and introduce language concepts when the
rewrite needs them. Don't replace that journey with an ownership or cancellation checklist.

## Edit the existing deck

Reuse the current entry files, shared addon/components, theme tokens and layouts. For Slidev, load the
relevant syntax, component, animation or styling skills as needed. Keep changes to the agreed slides and
diagrams; adjust directly affected notes and references. Preserve source links and distinguish sourced facts
from the author's experience.

Respect provisional timing and “expand first, cut later”; don't silently impose an old duration. No extra
galleries, README/planning files, test infrastructure or dependencies without a request.

## Verify and report

Run the existing relevant build commands and check the scoped diff. Check slide order, code readability and
click/notes alignment with available tools. Ask before taking screenshots; don't treat a successful build as
visual verification. Report changed paths, checks actually performed and any unverified rendering or rehearsal
risks. No commits, publishing or external writes without explicit authorization.

Workflow inspiration:
[Davide Imola's slide-craft](https://github.com/davideimola/presentations/tree/main/.claude/skills/slide-craft).
Independently worded for this repository; no upstream editorial-system or branding dependency.
