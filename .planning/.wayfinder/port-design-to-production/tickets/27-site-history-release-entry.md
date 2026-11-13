# Ticket: Record the shipped redesign in site history

Labels: `wayfinder:task`
Status: unclaimed
Parent: `../map.md`
Blocks: none
Blocked by: actual redesign release (external shipping gate)

## Decision and scope

Required by [Strip dev pages and land on main](07-strip-and-merge.md), retained in [Choose which new components are in scope for this redesign](15-feature-backlog.md).

Add the 5.0.0 entry to the existing site-history page **after the redesign actually ships**. This is not a new page and is not a pre-merge feature blocker.

## Completion

- Confirm the actual shipped version/date and describe only features that really landed.
- Preserve historical entries and the existing page layout; do not invent a deployment date or claim release from local preview/build checks.
- Verify the page/links and a fresh production build; record the release reference supporting the entry.

## Notes

Do not take this up before the shipping gate is satisfied. No merge/deployment/commit/push authorization is supplied by this ticket. No new repository tests without a request.
