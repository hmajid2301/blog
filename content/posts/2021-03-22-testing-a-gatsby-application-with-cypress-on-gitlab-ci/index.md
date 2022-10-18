---
title: Testing a Gatsby application with Cypress on Gitlab CI"
canonicalURL: https://haseebmajid.dev/posts/2021-03-22-testing-a-gatsby-application-with-cypress-on-gitlab-ci/
date: 2021-03-22
tags:
  - gatsby
  - testing
  - react
  - gitlab
  - ci-cd
---

In this blog post, we will go over how we can automatically test a Gatsby site end-to-end (e2e), using Cypress on Gitlab CI.

# Introduction

## Gatsby

[Gatsby](https://www.gatsbyjs.com) is a static site generator (SSG) built upon React. It allows us to create "blazing" fast websites.
In this example, we will use a simple blog starter template available and add a Cypress test.

## Cypress

> Fast, easy and reliable testing for anything that runs in a browser. - Cypress README

[Cypress](http://cypress.io/) allows us to test a web application, how a real user would use the application.
Cypress will be used to test our Gatsby application, though if it's a site you can test it using Cypress.

## Gitlab CI

[Gitlab CI](https://docs.gitlab.com/ee/ci/) is a continuous integration pipeline that will allow us to run our
tests automatically, such as when we merge code into the master branch.

# Getting Started

## Gatsby

Create a new Gatsby site, using this default Gatsby starter:

```bash
gatsby new gatsby-starter-blog https://github.com/gatsbyjs/gatsby-starter-blog
cd gatsby-starter-blog
```

### (Optional) Typescript

Adding Typescript to a Gatsby web application.

```bash
yarn add typescript @types/react @types/react-dom @types/node -D
yarn add gatsby-plugin-typescript
```

Add the following to your `gatsby-config.js`.

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true, // defaults to false
        jsxPragma: `jsx`, // defaults to "React"
        allExtensions: true, // defaults to false
      },
    },
  ],
}
```

Then create a new file `tsconfig.json` (in the project root, where the `gatsby-config.js` is).

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "esnext",
    "jsx": "preserve",
    "lib": ["dom", "esnext"],
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "noUnusedLocals": false,
    "allowJs": true
  },
  "exclude": ["node_modules", "public", ".cache"]
}
```

## Cypress

Now to finally add Cypress to our application so we can test it. First, install the dependencies.

```bash
yarn add -D cypress cypress-axe axe-core start-server-and-test
# Add types
yarn add -D @types/cypress-axe
```

Next, let's create a `cypress.json` folder in the project root.

```json
{
  "baseUrl": "http://localhost:8000/",
   "integrationFolder": "cypress/e2e"
}
```

Next, let's add some new "scripts" to the `package.json` file.

{{< highlight json "hl_lines=1-2,10" >}}
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "build": "gatsby build",
    "develop": "gatsby develop",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "start": "npm run develop",
    "serve": "gatsby serve",
    "clean": "gatsby clean",
    "test": "echo \"Write tests! -> https://gatsby.dev/unit-testing\" && exit 1",
    "test:e2e": "start-server-and-test 'yarn develop' http://localhost:8000 'yarn cy:open'",
    "test:e2e:ci": "start-server-and-test 'yarn develop' http://localhost:8000 'yarn cy:run'"
  }
{{< /highlight >}}

These scripts allow us to start Cypress, `cy:open` opens a GUI to visualise our tests whereas `cy:run` does it all
in the terminal (the browser runs in headless mode). Where we will run `test:e2e:ci` in our CI pipeline, here we use
the `start-server-and-test` command to start our Gatsby server using `yarn develop`. Then we run `cy:run` to
start our tests.

### Structure

Create a new folder called `cypress` which will look something like this.

```bash
.
├── e2e
│   └── accessibility.test.ts
├── fixtures
│   └── graphql.json
├── plugins
│   └── index.js
├── support
│   ├── commands.js
│   ├── index.d.ts
│   └── index.js
└── tsconfig.json
```

```bash
mkdir -p cypress/support
```

Create a file at `cypress/support/commands.js`

```js
Cypress.Commands.add(`assertRoute`, (route) => {
  cy.url().should(`equal`, `${window.location.origin}${route}`);
});
```

Add some custom types for Cypress `index.d.ts` if you are using Typescript.

```ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Assert the current URL
     * @param route
     * @example cy.assertRoute('/page-2')
     */
    assertRoute(route: string): Chainable<any>;

    /**
     * Waits for Gatsby to finish the route change, in order to ensure event handlers are properly setup
     */
    waitForRouteChange(): Chainable<any>;
  }
}
```

Next create the `index.js` file, which should look something like this.

```js
import "cypress-axe"
import "./commands"
```

Next, let's create a plugin folder `mkdir -p cypress/plugins`.

```js
// / <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  return config
}
```

Now finally let's create our tests folder `mkdir -p cypress/e2e`.

### cypress-axe

In this blog post we won't go over any complicated Cypress test we will simply use `cypress-axe` to test
the accessibility of our (a11y) of our website.

```ts
/// <reference types="../support/index" />
/// <reference types="cypress" />
/// <reference types="@types/cypress-axe" />

describe("Component accessibility test", () => {
  it("Main Page", () => {
    cy.visit("/")
    cy.wait(500)
    cy.injectAxe()
    cy.checkA11y({
      include: [["#___gatsby"]],
    })
  })
})
```

Note the `///` comments at the top used to add types for cypress. The test above will go to our
home page and test if it has any a11y violations and if so will fail the test.

We can now run our tests locally by running this command:

```bash
yarn run test:e2e
```

## Gitlab CI

Now how can we automate this, so the tests will run say every time we make changes on the master branch to make
sure we haven't broken any a11y. Create a new `.gitlab-ci.yml` or add the following job to an existing CI file.

```yml
image: node:12.14.1

variables:
  CYPRESS_CACHE_FOLDER: "$CI_PROJECT_DIR/cache/Cypress"

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - cache/Cypress
    - node_modules

stages:
  - test

before_script:
  - yarn install

tests:
  image: cypress/browsers:node12.14.1-chrome83-ff77
  stage: test
  script:
    - yarn test:e2e:ci
```

I won't go into the details of what makes up a Gitlab CI file. At the top of the file, we will cache the `node_modules`
file so we can share it between the job and the Cypress cache.
The job itself is very simple it uses a `cypress/browsers:node12.14.1-chrome83-ff77` Docker
image which provides a headless chrome browser that Cypress can leverage to run the tests.
As we won't have access to a GUI in the Gitlab CI runner. The `tests` job is very simple it runs `yarn test:e2e:ci` to
run our Cypress tests.

That's it, quite simple to add Cypress tests that run in our CI pipeline.

## Appendix

- [Example source code](/https://gitlab.com/hmajid2301/blog/-/tree/main/content/posts/2021-03-22-testing-a-gatsby-application-with-cypress-on-gitlab-ci/source_code)
- [Cypress](http://cypress.io/)
- [Example Job](https://gitlab.com/hmajid2301/portfolio-site/-/jobs/1080367107)
