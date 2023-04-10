---
title: How to Get Code Coverage From Playwright Tests in a Sveltekit App 
date: 2023-04-15
canonicalURL: https://haseebmajid.dev/posts/2023-04-15--how-to-get-code-coverage-from-playwright-tests-in-a-sveltekit-app-
tags:
    - sveltekit
    - playwright
    - testing
    - ci/cd
---

![Code Coverage Meme](images/code_coverage.jpg)

In this post, I will show you how to get code coverage reports from your Playwright tests in your SvelteKit app.
So let's imagine we are starting with the basic SvelteKit template. First, we need to install:

```bash
npm i -D vite-plugin-istanbul
```

We need the vite plugin to instrument our code using Istanbul.
Istanbul is a tool which allows us to instrument our code such that it can determine which lines were covered
by our tests.


## vite.config.ts

First, let's update our `vite.config.ts` (or `.js`) file: 

```ts {hl_lines=[11-17]}
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import istanbul from "vite-plugin-istanbul";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    sveltekit(),
    istanbul({
      include: "src/*",
      exclude: ["node_modules", "test/"],
      extension: [".ts", ".svelte"],
      requireEnv: false,
      forceBuildInstrument: true,
    }),
  ],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
```

> forceBuildInstrument - Optional boolean to enforce the plugin to add instrumentation in build mode. Defaults to false.

In theory, we should just be able to use `requireEnv: true` and then pass the `VITE_COVERAGE=true` environment variable.
To our playwright tests job, so instead I just set the `forceBuildInstrument`. Now, this always instrument our builds with Istanbul.
However, we can do something like `process.env.NODE_ENV === "test"`. Which will only run when `NODE_ENV` is `test`.
In this example, we will keep it simple and leave it as is.

## tests

Now let's go to our `tests` folder we need to add a new file called `baseFixtures.ts` [1], which looks like this:

```ts
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { test as baseTest } from '@playwright/test';

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output');

export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex');
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__))
      ),
    );
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      if (coverageJSON)
        fs.writeFileSync(path.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`), coverageJSON);
    });
    await use(context);
    for (const page of context.pages()) {
      await page.evaluate(() => (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)))
    }
  }
});

export const expect = test.expect;
```

We will use `test` and `expect` functions from this module instead of the playwright ones. As this module,
will collect the corresponding coverage files into `.nyc_output` in a JSON file.

Now open our tests file and update them to use the base fixture module from this:

```ts
import { expect, test } from '@playwright/test';
```

to this:

```ts
import { expect, test } from "./baseFixtures.js";
```

## Run the Tests

Now we can run the tests like `npm run test`, this should create a new file `.nyc_output`.
To see the actual coverage we need to use `nyc` we can do that:

```bash
npx nyc report --report-dir ./coverage --temp-dir .nyc_output --reporter=text --exclude-after-remap false

# output
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------|---------|----------|---------|---------|-------------------
All files     |     100 |        0 |     100 |     100 |                   
 +page.svelte |     100 |        0 |     100 |     100 | 16                
 +page.ts     |     100 |      100 |     100 |     100 |                   
--------------|---------|----------|---------|---------|-------------------
```

### C8

If we want to generate a C8 (Coberatura) report we can do:

```bash
npx nyc report --report-dir ./coverage --temp-dir .nyc_output --reporter=cobertura --exclude-after-remap false
```

This will save the code coverage data in the C8 format in the `coverage` folder.

### JUnit

We can also generate a JUnit file, first we need to add the following to our `playwright.config.ts` file:
`reporter: [["junit", { outputFile: "results.xml" }]]`. Then to generate the report we need to run
`PLAYWRIGHT_JUNIT_OUTPUT_NAME=results.xml npm run test`, we pass an environment variable to tell playwright where to save
the JUnit file.

## (Optional) Run in GitLab CI

If we put all of this together we can run the tests in GitLab CI and get the code coverage, JUnit and Coberatura reports like so:

```yml
image: node

stages:
  - test

tests:e2e:
  stage: test
  script:
    - npx playwright install
    - npm run test -- --reporter=junit
    - npx nyc report --report-dir ./coverage --temp-dir .nyc_output --reporter=cobertura --exclude-after-remap false
    - npx nyc report --report-dir ./coverage --temp-dir .nyc_output --reporter=text --exclude-after-remap false
  coverage: /All files[^|]*\|[^|]*\s+([\d\.]+)/
  artifacts:
    reports:
      junit: results.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    when: always
    paths:
      - test-results/
    expire_in: 1 week
```

GitLab will be able to show some useful information using this code coverage data, such as lines covered in an open MR.
It can show if the code coverage has gone up or down within the MR as well.

That's it! Hopefully, this post has helped you set up retrieving code coverage from your playwright tests!

## Appendix

- [Example source code](https://gitlab.com/hmajid2301/blog/-/tree/main/content/posts/2023-04-15--how-to-get-code-coverage-from-playwright-tests-in-a-sveltekit-app-/example)
- [Playwright Discussion](https://github.com/microsoft/playwright/discussions/20841)
- [Inspired By this repo](https://github.com/stevez/playwright-test-coverage/tree/integrate-vite-plugin-istanbul)

[^1]: Taken from this repo, https://github.com/mxschmitt/playwright-test-coverage