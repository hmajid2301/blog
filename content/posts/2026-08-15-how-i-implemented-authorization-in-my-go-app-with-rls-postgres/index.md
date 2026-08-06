---
title: How I Implemented Authorization in My Go App With RLS (Postgres)
date: "2026-08-15"
canonicalURL: https://haseebmajid.dev/posts/2026-08-15-how-i-implemented-authorization-in-my-go-app-with-rls-postgres
tags:
  - go
  - authorization
  - rls
  - postgres
  - pgx
cover:
  image: images/cover.png
---

## Introduction

In this article, I will show you how I set up Authorization with Row Level Security (RLS) specifically with Postgres in my
web app in Go.

A quick distinction between:
  - Authentication (AuthN): who are you?
  - Authorization (AuthZ): what can you do?

We will mostly be focusing on AuthZ in this article, what is the user allowed to do but mostly see and we will
use my gardening app called LettuceGo [^1] (yes terrible pun, but I love it) as an example.

## The problem

I noticed in a lot of my SQL queries I was adding `where user_id = $1`, to make sure that the user had the correct
permissions. Either to read data only that user had access to i.e. all of their plants. Or to edit plants that they
"own" (update, write, delete etc). This involved a lot of repetition in our queries. Which in itself is not a massive
issue.

But I thought there has to be a better way to do this, then I remember when building other multi tenant apps
in the past I had heard of RLS. So I started looking into if that was a way to reduce our boilerplate.

Our old query to list plants may have looked like this:


```sql
-- name: ListPlants :many
SELECT *
FROM plants p
WHERE p.user_id = $1
ORDER BY p.name;
```

Then after we implement RLS we can simplify just do this. This is for all the 20/30 queries we have in our app for
example. So starts to save us a bit of boilerplate. It also simplifies our code as we don't need to pass a user_id
to every function i.e. `transport -> service -> data store`.

It also makes our queries a bit safer, if we miss a where filter above potentially a user could read data they
shouldn't be able to. But with RLS, which will see in a bit, it reduces the risk of this happening.


```sql
-- name: ListPlants :many
SELECT *
FROM plants p
ORDER BY p.name;
```

## What is RLS?

RLS = Row Level Security, allows us to attach policies to tables. Which are evaluated per row on every
SELECT/INSERT/UPDATE/DELETE query that touches the table.

Turn it on per table:

```sql
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
```

With RLS enabled but no policy, no rows are visible by default. That's only for roles RLS applies to though,
owners bypass it until you `FORCE` (see below). Add a policy:

```sql
CREATE POLICY plants_owner ON plants
  FOR SELECT
  USING (user_id = app_current_user_id());
```

- `USING`: which rows are visible (SELECT, UPDATE-existing, DELETE).
- `WITH CHECK`: which rows are writable (INSERT, UPDATE-new). Blocks cross-user inserts.

Essentially now we are moving some of the AuthZ logic into the DB itself vs in the business logic of our application.

### Example Policy

Not every table has a `user_id` column. `events` belongs to a `plant`, which belongs to a user. So the policy checks
ownership through the parent:

```sql
-- users (1) -> (N) plants (1) -> (N) events / photos / plant_tags
CREATE POLICY events_owner ON events
USING (
    plant_id IN (
        SELECT id FROM plants
        WHERE user_id = app_current_user_id()
    )
);
```

### Do we need to `FORCE ROW LEVEL SECURITY`?

In production LettuceGo connects as the `lettucego` role, a normal (non-superuser) role with `CREATEROLE` that
owns the tables in the `lettucego` database.

Two things to know about who RLS applies to:

- Owners bypass RLS: the table owner sees every row unless you `FORCE` it.
- Superusers bypass RLS: and there is no `FORCE` for them. This is exactly why the connection
  role is no longer a superuser.

For the actual app queries we go one step further and `SET ROLE app_user` (below), so the session runs as a role
that owns nothing and the policies apply to it normally. `FORCE` is just there as a fallback, it covers the owner
connection itself (migrations, admin queries, or any code path that forgets to `SET ROLE`) so the owner can never
silently see every row.

We create a second role, `app_user`, with just the grants it needs, and make
`lettucego` a member of it so it can switch to it:

```sql
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user;
    END IF;
END
$$;

GRANT app_user TO lettucego;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

Then force RLS on so even the table owner is subject to policies:

```sql
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants FORCE ROW LEVEL SECURITY;
```

> In production, scope the role per app `lettucego_app_user`
> Postgres roles are cluster-wide, not per-database, so a shared `app_user` would
> collide across apps and end up holding grants for every app's tables.

### The `app_current_user_id()` helper

Policies need the current user's id. We pass it through a session via a Postgres
custom setting. We then read it back with a small helper.

```sql
CREATE OR REPLACE FUNCTION app_current_user_id() RETURNS uuid AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::uuid;
EXCEPTION WHEN others THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
```

- `current_setting('app.current_user_id', true)` read the settings. The `true` means return `NULL` if not found.
- `EXCEPTION` if the GUC holds a non-uuid string (we set `""` for unauth requests), the `::uuid` cast throws, and we return NULL instead.


## How to implement this with Go

Now that we have covered roughly how the policies look they of course do get more complicated, you can see
some examples in the codebase I shared in the appendix but roughly speaking, high level, they do the same thing.

We need to orchestrate our Go code to set up the app user to the current user id, so the policies actually work.
In the examples below I'm using `pgx`, a very popular Postgres driver, but it should translate to other `drivers` and
DBs at least at a high level.


### `PrepareConn`

`PrepareConn` runs every time the pool hands out a connection. We pull the user from the request context
(set by auth middleware), and then set the postgres setting.

```go
pgxConfig.PrepareConn = func(ctx context.Context, conn *pgx.Conn) (bool, error) {
    // INFO: always set app_user so RLS applies even for unauth requests.
    // Unauth requests get an empty user id, which makes app_current_user_id()
    // return NULL, so ownership policies deny every row.
    if _, err := conn.Exec(ctx, "SET ROLE app_user"); err != nil {
        return false, fmt.Errorf("failed to set role: %w", err)
    }

    userID := ""
    if user := identity.GetFromContext(ctx); user.IsAuthenticated {
        userID = user.UserID.String()
    }
    if _, err := conn.Exec(ctx, "SELECT set_config('app.current_user_id', $1, false)", userID); err != nil {
        return false, fmt.Errorf("failed to set RLS user context: %w", err)
    }
    return true, nil
}
```

You'll notice that we `SET ROLE app_user` even if the request is unauthenticated, which in theory shouldn't be possible.
However, I think it's a good check to have just in case the auth middleware we have to set the user breaks.

An empty `userID` makes `app_current_user_id()` return NULL, so every ownership policy denies all rows.

### `AfterRelease`

`AfterRelease` runs when the connection goes back to the pool. We reset the role and clear the postgres setting.
Returning `false` tells pgx to destroy the connection if anything fails.

```go
pgxConfig.AfterRelease = func(conn *pgx.Conn) bool {
    ctx, cancel := context.WithTimeout(releaseCtx, 5*time.Second)
    defer cancel()

    if _, err := conn.Exec(ctx, "RESET ROLE"); err != nil {
        return false
    }
    if _, err := conn.Exec(ctx, "SELECT set_config('app.current_user_id', $1, false)", ""); err != nil {
        return false
    }
    return true
}
```

> This also works for DB transactions

## An example

The `photos` table is an interesting one. A photo belongs to a plant, and a plant belongs to a user. We want two
things, only the owner can read a photo, and nobody can insert a photo that points at someone else's plant.

So we end up with a policy like this:

```sql
CREATE POLICY photos_owner ON photos
USING (user_id = app_current_user_id())
WITH CHECK (
    user_id = app_current_user_id()
    AND plant_id IN (
        SELECT id FROM plants
        WHERE user_id = app_current_user_id()
    )
);
```

`USING` filters reads. `WITH CHECK` filters on writes (INSERT) and the new row of an UPDATE. It runs on the
proposed new row before it's written. If it returns false the row isn't stored and the statement is rejected.

The `WITH CHECK` here has two conditions:

- `user_id = app_current_user_id()`: The photo's `user_id` must match the caller.
- `plant_id IN (SELECT id FROM plants WHERE user_id = app_current_user_id())`: The plant it's attached to must also belong to the caller.

The second condition here is actually very important, without it, user B could insert a photo with
their own `user_id` but pointing at user A's `plant_id`.

The subquery reads `plants`, and `plants` has its own RLS policy (`user_id = app_current_user_id()`). So when
`app_user` runs the subquery, it only sees its own plants anyway. The subquery can never return someone else's `plant.id`,
even if we got the "outer" policy wrong (photos). The RLS stacks, the inner table is filtered before the "outer" policy sees it.

## Performance

RLS rewrites every query behind your back. A query you write as `SELECT * FROM plants` actually runs as
`SELECT * FROM plants WHERE user_id = app_current_user_id()`.

Let's say we add an index on plants for user id like so:

```sql
CREATE INDEX idx_plants_user_id ON plants (user_id);
```

This can be really important for the performance of our queries, note this can make writes a bit slower.
This matters twice for child policies. The `plant_tags` policy has
`plant_id IN (SELECT id FROM plants WHERE user_id = app_current_user_id())`.

That subquery can run once per outer row the planner evaluates (in a nested-loop plan). Without the index on
`plants.user_id`, each of those runs is a seq scan of `plants`. With the index, each is a cheap index lookup.
One index fixes the direct policies and the subqueries under the child policies.

## Conclusion

RLS here really only handles one part of AuthZ, ownership. As in, can you see or change *your* rows. But
authorization is broader than that. Things like whether you're allowed to do an action at all, role-based
access (admin vs normal user), or feature/plan limits (say, free users can only have 50 plants) don't really
map onto a row filter.

For example, "this user has hit their free-tier plant limit, they can't create another" isn't something RLS can
enforce. RLS only sees rows, it has no idea about plans or quotas. That check has to live in the service layer,
before the insert. RLS just backs it up, if we ever miss an ownership check the worst case is an empty result
set, not someone else's rows.

But now you should be able to setup RLS with pgx (Postgres) in Go. Let me know how you get on with it. Or if you
find a better way to implement yourself.

## Appendix

The full source for the snippets in this post lives in the LettuceGo repo on GitLab [^1]:

- [`internal/store/db/pgx.go`](https://gitlab.com/hmajid2301/lettucego/-/blob/main/internal/store/db/pgx.go)
- [`migrations/20260428000001_add_row_level_security.sql`](https://gitlab.com/hmajid2301/lettucego/-/blob/main/internal/store/db/sqlc/migrations/20260428000001_add_row_level_security.sql)

[^1]: https://gitlab.com/hmajid2301/lettucego
