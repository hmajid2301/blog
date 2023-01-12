---
title: "TIL: How Includes, Extends work with TS Config (with SvelteKit)"
canonicalURL: https://haseebmajid.dev/posts/2023-01-14-til-how-includes,-extends-work-with-ts-config-(with-sveltekit)/
date: 2023-01-14
tags:
  - sveltekit
  - typescript
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How Includes, Extends work with TS Config (with SvelteKit)**

I have recently been creating an app with SvelteKit and Typescript. I noticed all of a sudden Typescript and VS Code not playing
nice with each other. It wouldn't show me the types of variables that I knew it was showing me before. So I started to investigate
and work out what was wrong. I was getting `locals` with a type `any`:

![TS Errors](images/errors.png)

Even though `locals` has a defined type in my `app.d.ts`

I used the documentation to create my SvelteKit app like so:

```ts
declare namespace App {
	type PocketBase = import("pocketbase").default;
	interface Locals {
		user?: import("pocketbase").Record | import("pocketbase").Admin | null | undefined;
		pb?: PocketBase;
	}
}
```

```bash
npm create svelte@latest my-app
cd my-app
npm install
npm run dev
```

This gives us a `tsconfig.json` file that looks like this:

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"strict": true,
		"allowUnreachableCode": false,
		"exactOptionalPropertyTypes": true,
		"noImplicitAny": true,
		"noImplicitOverride": true,
		"noImplicitReturns": true,
		"noImplicitThis": true,
		"noFallthroughCasesInSwitch": true,
		"noUncheckedIndexedAccess": true,
		"types": ["vite-plugin-pwa/client"]
	}
}
```

My `tsconfig.json` looked like this:

```json {hl_lines=[15]}
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"strict": true,
		"allowUnreachableCode": false,
		"exactOptionalPropertyTypes": true,
		"noImplicitAny": true,
		"noImplicitOverride": true,
		"noImplicitReturns": true,
		"noImplicitThis": true,
		"noFallthroughCasesInSwitch": true,
		"noUncheckedIndexedAccess": true,
		"types": ["vite-plugin-pwa/client"]
	},
	"include": ["./setupTest.ts"]
}
```

The line breaking my configuration was the last `include` [^1] it turns out it was overwriting the include within the `./.svelte-kit/tsconfig.json`.
That we were extending above. Which had defined its own include:

```json
{
  "include": [
      "ambient.d.ts",
      "./types/**/$types.d.ts",
      "../vite.config.ts",
      "../src/**/*.js",
      "../src/**/*.ts",
      "../src/**/*.svelte",
      "../src/**/*.js",
      "../src/**/*.ts",
      "../src/**/*.svelte",
      "../tests/**/*.js",
      "../tests/**/*.ts",
      "../tests/**/*.svelte"
  ]
}
```

Turns out we were just replacing all these files above with just `./setupTest.ts`, hence it couldn't find the types that SvelteKit creates
for us [^2] 🤦‍♂️. 

We were of course now overwriting all these files with just the one we specified. Causing VS Code to throw errors and not type things that
had types. Removing this line `"include": ["./setupTest.ts"]` fixed the issue more.
In my case, I just moved this file into my `tests` folder.

[^1]: I was trying to setup this [library](https://github.com/chaance/vitest-dom)
[^2]: Relevant [SO post](https://stackoverflow.com/a/55015988/3108619)