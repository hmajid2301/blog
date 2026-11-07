---
name: talk-forge
description:
    Use when developing a technical talk idea, finding its story or audience, importing existing material into
    a talk, or revising a TALK.md brief.
---

<!-- cspell:ignore Trilium Davide Imola -->

# Talk forge

Develop Haseeb's talk in English. The local `<deck>/TALK.md` is the brief; no external editorial system,
Trilium, issue tracker or personal-brand template is required.

## Start from what exists

Read the existing brief and material before questioning. Use codegraph first for repository exploration;
verify live files before editing. Reuse the established audience, language, examples and approved decisions.
Identify whether this is a new idea or a revision; don't restart the interview on every turn.

Use `ask_user_question` for interviews and approvals. Group related gaps into a short interview, with
free-text questions for the author's experience and intended story. If that tool is unavailable, ask concise
questions in chat. Never invent answers from an unavailable tool.

## Find the story

Separate three things:

- **Story:** the concrete journey the audience follows.
- **Learning:** concepts discovered when that journey needs them.
- **Takeaway:** what the audience can understand or do afterwards.

Ask what changes between the opening and ending, what causes each next step, why the audience cares, and what
experience supports the claims. An educational example is valid; don't invent production incidents, migration
history or dramatic stakes.

When the author wants to teach core Go through rewriting a Python service, keep the rewrite as the story.
Goroutines, channels and ownership explain that journey; a worker-pool recipe or safety checklist must not
silently replace it.

Offer one recommended narrative and explain the main trade-off. Use diagrams to explain state, communication
and consequences; let the speaker supply the explanation. A sequence of topic headings is not a story.

## Confirm, then write

Show a compact proposed direction and obtain explicit confirmation before changing the brief or scaffolding a
new folder. Existing approval covers routine edits within that direction; don't ask permission for every
sentence. Ask again if thesis, audience, scope or visual direction materially changes.

After approval, write or update only `<deck>/TALK.md`, preserving unrelated material. Use the existing deck
path; confirm a new slug before creating one. Include:

- Promise, audience/prerequisites, learning and one primary takeaway.
- Opening, causal story beats and closing payoff.
- Concepts and proposed diagrams at each beat.
- Provisional timing/Q&A, demo fallback, sources and unresolved questions.

Respect “expand first, cut later”; don't force an unrehearsed draft into an old duration. Brief and slides
stay English unless the author requests another language.

## Boundaries

Slide drafting belongs to `slide-craft`; conference answers belong to `cfp-submit`. Don't automatically run
either. No screenshots, new tests/test infrastructure, extra README/planning documents, commits, publishing or
external writes without an explicit request. Use local ketch tools only when research materially helps. Report
the changed path and remaining decisions briefly.

Workflow inspiration:
[Davide Imola's talk-forge](https://github.com/davideimola/presentations/tree/main/.claude/skills/talk-forge).
These instructions are independently worded for this repository, not a verbatim upstream copy.
