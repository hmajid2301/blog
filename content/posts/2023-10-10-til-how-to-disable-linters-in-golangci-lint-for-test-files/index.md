---
title: "TIL: How to Disable Linters in Golangci Lint for Test Files"
date: 2023-10-10
canonicalURL: https://haseebmajid.dev/posts/2023-10-10-til-how-to-disable-linters-in-golangci-lint-for-test-files
tags:
  - go
  - golang
  - golangci-lint
series:
  - TIL
---

**TIL: How to Disable Linters in Golangci Lint for Test Files**

Today (for once), I ran `golangci-lint run` and it failed on CI with the following error:

```bash
internal/options/parser_test.go:13: Function 'TestParse' is too long (69 > 60) (funlen)
func TestParse(t *testing.T) {
task: Failed to run task "lint": exit status 1
```

Where my `.golangci.yml` file looked like this:

```yaml
run:
  timeout: 5m
  skip-dirs:
    - direnv

linters:
  enable:
    - bodyclose
    - dogsled
    - dupl
    - errcheck
    - exportloopref
    - funlen
    - gochecknoinits
    - goconst
    - gocritic
    - gocyclo
    - gofmt
    - goimports
    - gomnd
    - goprintffuncname
    - gosec
    - gosimple
    - govet
    - ineffassign
    - lll
    - misspell
    - nakedret
    - noctx
    - nolintlint
    - revive
    - staticcheck
    - stylecheck
    - typecheck
    - unconvert
    - unparam
    - unused
    - whitespace
```

So basically we want the ability to turn off `funlen` for our tests (and other linters). Because we don't mind
if some of our test functions get a big long with different sub-tests.

So to disable some linters for our test files we can do something like this:

```yaml {hl_lines=[6-10]}
linters:
  enable:
    - bodyclose
    # ...

issues:
  exclude-rules:
    - path: _test.go
      linters:
        - funlen
```

That's it! For once a TIL, that was written on the same day as I learned it (or re-learnt it)
