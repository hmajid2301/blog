# Ticket: Remove redundant encoding from existing JSON-LD fields

Labels: `wayfinder:task`
Status: resolved
Parent: `../map.md`
Blocks: none
Blocked by: none

## Question

How can schema fields retain correct JSON types/values instead of embedding a second layer of JSON quotes?

## Evidence and scope

Known follow-up from [OG ticket 09](09-og-card-redesign.md), confirmed before and after by [audit 18](18-before-after-lighthouse-audit.md): all JSON-LD parses, but 239 documents contain double-encoded values. Examples include homepage `@type` literally containing quote characters around Organization, and article headlines/dates/publisher fields. OG image equality was already fixed; preserve it.

[Durable health report](../assets/audits/session16/health/REPORT.md), `health/{before,after}.json` findings `schema_double_encoded_values`. Fix template serialization once, check semantic values and valid schema types rather than JSON parse success alone, and preserve canonical/OG/Twitter/image/date consistency. This is pre-existing technical SEO debt, not a new audit regression or permission for unrelated legacy content repairs. No implementation performed by the audit.

## Resolution

Every `jsonify` in `layouts/partials/templates/schema_json.html` now pipes through `safeJS` (values render inside `<script>`), the `image` value is explicitly serialized, and `wordCount` is emitted as a JSON number. `site.Title`, `@type`, dates, language, author/publisher and `sameAs` no longer embed a second layer of quotes.

[Final-source evidence](../assets/audits/session17/REPORT.md) and `schema-check.json` in that directory: 487 emitted JSON-LD blocks (1 Organization, 248 BreadcrumbList, 238 BlogPosting) all parse; zero double-encoded strings and zero non-numeric `wordCount`. Semantic spot-check confirms quoted/typed values and OG image equality is preserved. No content/canonical/OG/Twitter change; no commit, push, merge or deployment.
