---
title: Voxicle Build Log Week 12
date: 2025-05-12
canonicalURL: https://haseebmajid.dev/posts/2025-05-12-voxicle-build-log-week-12
tags:
  - voxicle
  - buildinpublic
  - micro-saas
  - build-log
series:
  - Build In Public
cover:
  image: images/cover.png
---

## ⏮️ Last Weeks Objectives

- Implement Authorization using RLS in Postgres
- Better error modals (fixed)

## 🛠️ What I Worked On

### 🔒 Row Level Security (Authorization)

Row Level Security for Feedback and Upvotes. With row level security we can add policies and use config variables.
Such that we set the organization ID and users can only get feedback that is part of their organization.
This means we can simplify our SQL queries with fewer joins and fewer where clauses. Making them easier to read.
Essentially it lets us do a simple form of authorization inside the web app.

An example on select statements for the user `voxicle`.

```sql
create policy feedback_select_policy on public.feedback
for select to voxicle
using (
    organization_id = current_setting('app.current_org_id')::uuid
);
```

Where we then have some "hooks" in pgx which look like this when we configure it. Where the auth is set in the ctx
in some middleware. It does make testing a bit more awkward but its a fine trade off.

```go
pgxConfig.BeforeAcquire = func(a context.Context, conn *pgx.Conn) bool {
    state := auth.GetFromContext(a)
    if state.OrgID != uuid.Nil {
        _, err := conn.Exec(a, "SELECT set_config('app.current_org_id', $1, false);", state.OrgID)
        if err != nil {
            // TODO: log the error
            panic(err)
        }
    }

    return true
}

pgxConfig.AfterRelease = func(conn *pgx.Conn) bool {
    _, err := conn.Exec(context.Background(), "SELECT set_config('app.current_org_id', $1, false);", uuid.Nil)
    if err != nil {
        // TODO: log the error
        panic(err)
    }
    return true
}
```

I will do a write up/video on how I setup this up with sqlc, goose and pgx.

### ✏️ Refactor

Refactored the get feedback query to not include upvotes, split that into another query. More DB queries by they are
simpler, and easier to understand now. Can change later if the app feels sluggish, needs to do some profiling.

### 🧪 Tests

Added more tests for upvotes, unit tests, integration tests and E2E tests (playwright).
Made it so the tests can run in parallel `-parallel 10` (GOMAXPROCS). This has caused the run time to decrease by about
50% in CI. Even though there are actually more tests now.

## ✅ Wins

- RLS meant we could simplify our queries
- Added more tests
- Made the tests run faster in CI
  - Run them in parallel

## ⚠️ Challenges

Implementing RLS took a longer to implement than I expected. Spent the better part of a week on it. Has issues because
I was testing with a super user on postgres i.e. the default one in Docker. It took using AI to give me the hint what
could be the issues.

## 💡 What I Learned

RLS - Doesn't apply to super users so needed to create a separate user i.e. voxicle for local tests.
Vs using postgres the default admin user in Docker.

That you need to be careful running tests with `t.Parallel` in table test [See more here](https://posener.github.io/go-table-driven-tests-parallel/).

## ⏭️ Next Weeks Objectives

- Better error modals (fixed)
- Start working on public page
- Multi tenant sub domains
  - i.e. org1.voxicle.app
