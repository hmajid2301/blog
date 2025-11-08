+++
title = "From Coffee Break to Instant Feedback: Rapid Integration Testing in Go"
outputs = ["Reveal"]
[logo]
src = "images/logo.png"
diag = "90%"
width = "3%"
[reveal_hugo]
custom_theme = "stylesheets/reveal/catppuccin.css"
slide_number = true
+++

# From Coffee Break to Instant Feedback: Rapid Integration Testing in Go

---

{{% section %}}

## Introduction

- Haseeb Majid
  - Backend Software Engineer at [Nala](https://www.nala.com/)
  - https://haseebmajid.dev
- Loves cats 🐱
- Avid cricketer 🏏 #BazBall

---

## Who is this for?

- Go developers with slow test suites
- Teams using PostgreSQL for integration tests
- Anyone tired of waiting for CI

{{% note %}}
- Show of hands: who has gone to get coffee while waiting for tests?
- Who has lost focus because tests take too long?
- This talk is about getting that time back
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## The Pain of Slow Integration Tests

> "I pushed to CI and went to make coffee... then forgot what I was working on"

---

## The Real Cost

- Lost focus and context switching
- Slower feedback loops
- Reduced confidence in changes
- Delayed deployments

{{% note %}}
- Average developer loses 23 minutes regaining context after interruption
- Slow tests = less frequent test runs = more bugs
- Fast tests = confidence to refactor = better code
{{% /note %}}

---

## Impact on CI/CD

- Long CI times block other PRs
- Developers batch changes (riskier)
- "Skip tests" commits appear
- Deployment pipeline bottleneck

{{% note %}}
- CI queue builds up when tests take 10+ minutes
- Batching changes means bigger, riskier PRs
- Fast tests enable true continuous deployment
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## How to Profile Our Tests

```bash
go test -json ./... | go-test-trace
```

---

## Test Timing

```bash
go test -v ./... 2>&1 | grep -E '(PASS|FAIL).*\('
```

---

## Finding the Slowest

```bash
go test ./... -json | \
  jq -r 'select(.Action == "pass") |
  [.Elapsed, .Package] | @tsv' | \
  sort -rn | head -20
```

{{% note %}}
- First step: measure, don't guess
- Usually database tests are the slowest
- Look for patterns: migrations, seeding, teardown
- Time spent in setup vs actual test logic
{{% /note %}}

---

## Visual Test Explorer

```bash
go install github.com/lamarios/vgt@latest

vgt
```

{{% note %}}
- vgt: Visual Go Test - interactive TUI
- Shows test results in a tree view
- Easy to spot slow tests visually
- Filter by package, status, duration
- Great for exploring large test suites
- Can run specific tests from the UI
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Why Are Database Tests So Slow?

- Running migrations every test
- Seeding test data repeatedly
- Teardown and cleanup
- Sequential execution

{{% note %}}
- Migrations can take 100ms+ each time
- Multiply that by 50 tests = 5+ seconds just in setup
- Add actual test logic and you're at 10+ seconds per package
- Traditional approach: one DB, run tests sequentially
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Go's Built-in Tools

Two main levers:
- `t.Parallel()` - parallel tests within package
- `-p` flag - parallel package execution

---

## t.Parallel()

```go
func TestUserCreation(t *testing.T) {
    t.Parallel()

    // Test runs concurrently with other parallel tests
}
```

{{% note %}}
- Marks test as safe for parallel execution
- Go runs parallel tests across GOMAXPROCS
- Each needs isolated database to avoid conflicts
- This is where template databases shine
{{% /note %}}

---

## Understanding -p Flag

```bash
# Run 4 packages concurrently
go test -p 4 ./...

# Check what -p would do without running
go test -p 4 -n ./...
```

{{% note %}}
- Default: GOMAXPROCS (usually number of CPUs)
- Each package gets its own process
- Diminishing returns after 4-8 depending on I/O
- Database connection limits matter here
{{% /note %}}

---

## Combining Both

```bash
go test -p 4 -parallel 8 ./...
```

- `-p 4`: 4 packages at once
- `-parallel 8`: 8 tests per package

{{% note %}}
- This is where you can see 10x+ speedups
- But only if each test has its own database
- Template databases make this possible
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## What Are Template Databases?

PostgreSQL feature: clone databases instantly

```sql
CREATE DATABASE testdb
TEMPLATE template1;
```

{{% note %}}
- PostgreSQL copies at filesystem level
- Much faster than running migrations
- Template is read-only during copy
- Golden pattern: prepare once, clone many times
{{% /note %}}

---

## The Template Pattern

1. Run migrations once on template
2. Clone template for each test
3. Drop test database after test
4. Repeat

---

## Performance Difference

Traditional approach:
```
Test 1: 100ms migrations + 50ms test
Test 2: 100ms migrations + 50ms test
Total: 300ms
```

Template approach:
```
Setup: 100ms migrations (once)
Test 1: 10ms clone + 50ms test
Test 2: 10ms clone + 50ms test
Total: 220ms
```

{{% note %}}
- Real numbers from maragu.dk article: 33s -> 9.8s (3x speedup)
- This is before adding parallelization
- With parallel execution: 10x+ speedups possible
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Live Demo

Setting up template databases in Go

---

## Creating Template Database

```go
var initDatabaseOnce sync.Once

func setupTemplate(t *testing.T) {
    initDatabaseOnce.Do(func() {
        db := connectToPostgres()
        defer db.Close()

        // Run migrations on template1
        runMigrations(db, "template1")
    })
}
```

{{% note %}}
- sync.Once ensures migrations run exactly once
- Even with parallel tests across packages
- Migrations only on first test that runs
{{% /note %}}

---

## Creating Test Database

```go
func createTestDB(t *testing.T) *sql.DB {
    setupTemplate(t)

    dbName := fmt.Sprintf("test_%s_%d",
        t.Name(),
        time.Now().UnixNano(),
    )

    // Terminate existing connections
    terminateConnections(dbName)

    // Create from template
    db := connectToPostgres()
    db.Exec(fmt.Sprintf(
        "CREATE DATABASE %s TEMPLATE template1",
        dbName,
    ))

    return connectToTestDB(dbName)
}
```

{{% note %}}
- Unique name per test using test name + timestamp
- Must terminate connections before creating
- Returns connection to fresh test database
{{% /note %}}

---

## Cleanup

```go
func TestUser(t *testing.T) {
    t.Parallel()

    db := createTestDB(t)
    t.Cleanup(func() {
        dbName := db.Stats().Name
        db.Close()

        admin := connectToPostgres()
        defer admin.Close()

        terminateConnections(dbName)
        admin.Exec(fmt.Sprintf(
            "DROP DATABASE %s",
            dbName,
        ))
    })

    // Your test here
}
```

{{% note %}}
- t.Cleanup runs after test completes
- Clean up even if test fails
- Drop database to avoid accumulation
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Docker Optimizations

Beyond template databases

---

## Disable fsync

```yaml
services:
  postgres:
    image: postgres:16
    command: postgres -c fsync=off -c full_page_writes=off
```

{{% note %}}
- fsync ensures writes to disk (slow)
- For tests, we don't need durability
- Can achieve 15x speedup locally
- 3x speedup in CI
- NEVER use in production!
{{% /note %}}

---

## Use tmpfs

```yaml
services:
  postgres:
    image: postgres:16
    tmpfs:
      - /var/lib/postgresql/data
```

{{% note %}}
- Store PostgreSQL data in RAM
- Much faster than disk I/O
- Data lost when container stops (fine for tests)
- Watch memory usage with large datasets
{{% /note %}}

---

## Combined Configuration

```yaml
services:
  postgres:
    image: postgres:16
    command: postgres -c fsync=off
    tmpfs:
      - /var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: template1
```

{{% note %}}
- Both optimizations together
- Template database as default DB
- Memory vs speed tradeoff
- Monitor CI runner memory
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Common Pitfalls

Hard-learned lessons

---

## Connection Leaks

```go
// Bad: connection not closed
db := createTestDB(t)
// test code...

// Good: ensure cleanup
db := createTestDB(t)
t.Cleanup(func() {
    db.Close()
})
```

{{% note %}}
- Leaked connections prevent database drops
- Use t.Cleanup for guaranteed cleanup
- Monitor connection counts during development
{{% /note %}}

---

## Template Corruption

```go
// Bad: modifying template
db := connectTo("template1")
db.Exec("INSERT INTO users...")

// Good: only read from template
db := connectTo("template1")
// Read-only operations or create test DB
```

{{% note %}}
- Template should be read-only after setup
- Any writes corrupt all future test databases
- If template corrupted, recreate it
{{% /note %}}

---

## Naming Conflicts

```go
// Bad: predictable name
dbName := "test_db"

// Good: unique name
dbName := fmt.Sprintf("test_%s_%d",
    sanitize(t.Name()),
    time.Now().UnixNano(),
)
```

{{% note %}}
- Parallel tests need unique database names
- Include test name for debugging
- Timestamp ensures uniqueness
- Sanitize test name (remove special chars)
{{% /note %}}

---

## Connection Pool Limits

```yaml
postgres:
  environment:
    POSTGRES_MAX_CONNECTIONS: 200
```

```go
// In tests
db.SetMaxOpenConns(5)
db.SetMaxIdleConns(2)
```

{{% note %}}
- Default Postgres: 100 connections
- Each parallel test needs connections
- Math: packages × tests × connections
- Increase Postgres limit or reduce pool size
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Real Results

From the articles

---

## Before and After

- maragu.dk: 33.3s → 9.8s (3.4x)
- mikecann.blog: 15x faster locally, 3x in CI
- victoronsoftware: Large suite split into parallel jobs

{{% note %}}
- These are real-world results
- Your mileage may vary
- Biggest gains on migration-heavy test suites
- Combined with parallelization: 10x+ possible
{{% /note %}}

---

## My Results

```bash
# Before
go test ./...
# 45 seconds

# After: templates + parallel
go test -p 4 ./...
# 6 seconds
```

{{% note %}}
- 7.5x speedup on my project
- 50+ integration tests
- Each test gets fresh database
- No test isolation issues
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Summary

Three key techniques:

1. Template databases (avoid repeated migrations)
2. Go's parallelization (`t.Parallel()` + `-p`)
3. Docker optimizations (fsync, tmpfs)

---

## Getting Started

1. Profile your tests
2. Add template database helper
3. Mark tests `t.Parallel()`
4. Optimize Docker config
5. Adjust `-p` flag

{{% note %}}
- Start with profiling - measure first
- Template database: biggest bang for buck
- Parallelization: multiply the gains
- Docker tweaks: extra 2-3x
- Iterate and measure
{{% /note %}}

---

## The Payoff

- Instant feedback
- More confident refactoring
- Faster CI/CD
- Better developer experience

{{% note %}}
- Fast tests change how you develop
- More likely to run tests frequently
- Enables true TDD workflow
- Reduces context switching
{{% /note %}}

{{% /section %}}

---

{{% section %}}

## Resources

- maragu.dk: Template database pattern
- mikecann.blog: Docker fsync optimization
- rotational.io: Parallel testing strategies
- gajus.com: Template + tmpfs setup

---

## Code Examples

Example repo: https://gitlab.com/hmajid2301/banterbus

Slides: https://haseebmajid.dev/slides/faster-go-tests-and-postgres/

---

## Questions?

- Twitter/X: @hmajid2301
- Website: https://haseebmajid.dev
- Email: me@haseebmajid.dev

{{% /section %}}
