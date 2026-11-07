---
name: cfp-submit
description:
    Use when preparing or revising conference call-for-proposals answers, talk abstracts, speaker bios, or a
    CFP submission.
---

<!-- cspell:ignore Trilium Davide Imola -->

# CFP submit

Adapt an approved talk to a conference without changing its promise or inventing the speaker's experience.
Preparing answers is not submitting them. Draft in English unless asked otherwise.

## Gather only the gaps

Read the local `<deck>/TALK.md` and any existing CFP drafts or approved answers. Use codegraph first for
repository exploration; verify live files before editing. Reuse known facts and approvals. If the talk
direction is unresolved, use `talk-forge` before selling a different story.

Use `ask_user_question` for missing facts, choices and approvals; fall back to concise chat questions only if
unavailable. Establish:

- Conference name, official homepage/CFP URL and intended track.
- Deadline including timezone, talk format/duration, audience and selection criteria.
- Exact form questions, required fields, word/character limits and relevant policies.
- Speaker name, approved bio, co-speakers and any required personal details.

Use local ketch tools to check official conference sources when useful. Record source URLs and distinguish
verified requirements from assumptions. If the form is inaccessible, request its fields; don't infer them or
claim to have inspected it. Don't guess credentials, availability, travel commitments, affiliations or
demographic answers.

## Draft for the audience

Keep the approved story, learning and takeaway. Adjust framing and vocabulary to the conference audience, not
the technical truth. A rewrite journey should remain a journey, not become a list of language features or
safety principles.

Return field-ready answers under the form's exact labels, with counts for constrained fields and unresolved
items clearly marked. Distinguish the public abstract from reviewer-only outline, prerequisites, logistics and
biography. Check whether limits count words or characters; leave margin when the form's counting convention is
unknown.

Preserve previously approved answers. Show material changes for approval rather than silently replacing them.
Don't invent achievements, production history, benchmarks or promised demos. Respect anonymized-review rules
and keep personal details out of public or anonymous fields as required.

Draft privately in the conversation. If asked to save, use the agreed repo-local path; confirm a new path
rather than creating extra documents automatically. No external editorial-system, Trilium or personal-brand
dependency.

## Approval and submission

Present the final field values and unresolved blockers for approval using `ask_user_question`, or concise chat
questions if unavailable. Approval of wording or a request to “prepare a CFP” authorizes drafting, not
sending.

Before any external form entry, upload or submission, obtain explicit authorization for that action and
destination. Before final submission, confirm required fields, counts, privacy rules and commitments against
the exact current payload. An explicit submission request naming that payload and destination satisfies
authorization; don't ask again for the same permission. If a browser/tool is unavailable, provide copy-ready
answers instead of claiming submission. Don't accept terms, pay fees or create accounts on the author's behalf
without explicit authorization.

Report precisely: drafted, saved locally, entered but not submitted, or submitted with actual confirmation
evidence. Never claim acceptance or successful submission from preparation alone. No commits, publishing or
unrelated writes without a request.

Workflow inspiration:
[Davide Imola's cfp-submit](https://github.com/davideimola/presentations/tree/main/.claude/skills/cfp-submit).
Independently worded for this repository, not a verbatim upstream copy.
