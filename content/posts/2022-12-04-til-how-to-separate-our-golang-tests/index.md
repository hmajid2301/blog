---
title: "TIL: How to Separate our Golang Tests"
canonicalURL: https://haseebmajid.dev/posts/2022-12-04-til-how-to-separate-our-golang-tests/
date: 2022-12-04
tags:
  - golang
  - test
  - vscode
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Separate our Golang Tests**

Sometimes we want to be able to run our unit tests and integration tests separately.
In Golang we can do this using build tags, build tags are used to tell the compiler
important information when we run `go build` [^1].


Let say we have a file called `package_test.go`. By adding `// +build integration` to the top of the file
without any whitespace. This test file will only be run when we specify the tags in our
test command `go test --tags=integration`.

Our integration test file would look something like:

```golang
// +build integration

package mypackage_test
```

Our unit tests can be left without any build tags and can be run with `go test` like normal.

To get this to compile correctly with VS Code we need to add the following to `settings.json` file.

```json
{
  "go.buildFlags": [
      "-tags=integration"
  ],
  "go.testTags": "integration",
}
```


[^1]: More about Golang build tags, https://mickey.dev/posts/go-build-tags-testing/
[^2]: Inspired by, https://www.ryanchapin.com/configuring-vscode-to-use-build-tags-in-golang-to-separate-integration-and-unit-test-code/