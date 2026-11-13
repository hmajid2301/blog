# Ticket: Record the shipped redesign in site history

Labels: `wayfinder:task`
Status: resolved
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

## Resolution

Entry added (user-authorized override of the release gate): `content/site-history.md` gained the 5.0.0 "Hugo custom theme · current" entry with a captured 1280×900 cat-light home screenshot (`assets/site-history/v5.png`), and 4.0.0 lost its "current" marker. Fresh `hugo` build verified: the v5 image is processed into a 720w/1280w webp srcset and the tag link renders. The `5.0.0` GitLab tag itself is created at release (ticket 07's merge), so the tag link is intentionally forward-looking until then.
