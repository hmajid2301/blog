---
title: How to Autosort our SvelteKit Imports
canonicalURL: https://haseebmajid.dev/posts/2023-01-10-how-to-autosort-our-sveltekit-imports/
date: 2023-01-10
tags:
  - sveltekit
  - svelte
  - eslint
  - typescript
  - automated
cover:
  image: images/cover.png
---

In this post, we will go over how we can auto-sort our imports in our svelte files. To do this we will be using eslint and the 
[`eslint-import-plugin` plugin](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md).

If you're anything like me you like have ordered imports, rather than random imports that can be hard to make sense of.
In Python we have `isort` in golang we have `goimports`. In JavaScript we can use eslint with the above plugin. However,
we need to set up some specific configuration.

## Setup

I will create a new SvelteKit application but this should be equally applicable to existing applications and should
work with both SvelteKit and Svelte. As all we are going to do is organise our imports.

```bash
npm create svelte@latest example
cd example
npm install

# Output
# create-svelte version 2.1.0
# 
# Welcome to SvelteKit!
# 
# ✔ Which Svelte app template? › SvelteKit demo app
# ✔ Add type checking with TypeScript? › Yes, using TypeScript syntax
# ✔ Add ESLint for code linting? … No / Yes
# ✔ Add Prettier for code formatting? … No / Yes
# ✔ Add Playwright for browser testing? … No / Yes
# ✔ Add Vitest for unit testing? … No / Yes
```

## eslint

Now onto the main part of this post let us edit our `.eslintrc.cjs` file which looks like this:

```js
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
```

### eslint-plugin-svelte

First, we need to use an "unofficial" plugin for Svelte which also comes with an eslint parser (I think).
See the relevant thread [here](https://github.com/import-js/eslint-plugin-import/issues/2407#issuecomment-1223394415).

```bash
npm install eslint-plugin-svelte --save-dev
```

Then we edit our eslint config file so it looks like this now:

```js {hl_lines=[3-13,15-23]}
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		extraFileExtensions: ['.svelte']
	},
	extends: [
		'eslint:recommended',
		'plugin:svelte/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
```

### eslint-import-plugin

Now let's add the plugin that will actually update our imports.

```bash
npm install eslint-plugin-import --save-dev
```

Now we want to edit our eslint config file so it looks like:

```js {hl_lines=[12-14,28-39]}
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		extraFileExtensions: ['.svelte']
	},
	extends: [
		'eslint:recommended',
		'plugin:svelte/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
        'plugin:import/errors',
		'plugin:import/warnings',
        'plugin:import/typescript'
	],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	rules: {
		'import/order': [
			'warn',
			{
				alphabetize: {
					order: 'asc',
					caseInsensitive: true
				},
				'newlines-between': 'always'
			}
		]
	},
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
```

#### import/order

The most interesting change we did is to add a bunch of rules. We want to add rules for import/order which is what is used to sort our imports.
In the example below we are setting any incorrectly ordered imports to warn us rather than throw an error. Then we are telling it to sort
our imports alphabetically. We are also setting it to create new lines between the various groups. Where a group would be something like: 
`builtin`, `external`, `parent`, you can read more about it [here](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md#importorder).

```js
rules: {
    'import/order': [
        'warn',
        {
            alphabetize: {
                order: 'asc',
                caseInsensitive: true
            },
            'newlines-between': 'always'
        }
    ]
},
```

We can auto fix imports if we run `eslint` with the `--fix` argument i.e. `eslint --fix .`. We can also our IDE auto sort our imports on save
in VS Code add the following option to your `settings.json` file:

```json
{
  "eslint.codeActionsOnSave.mode": "all",
}
```

This will attempt to fix all the issues raised by eslint for our file when we save it (you will need the eslint extension, https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).


## Appendix

- [Example source code](https://gitlab.com/hmajid2301/blog/-/tree/main/content/posts/2023-01-10-how-to-autosort-our-sveltekit-imports/source_code)
- [Example commit adding import order](https://gitlab.com/bookmarkey/gui/-/commit/db184d8ddd427e81d8884e65c6a5f013bb30ab2c)
- [Example eslint confif file](https://gitlab.com/bookmarkey/gui/-/blob/886f230e0c6c75b6f5f7f9e445205fd90b6fbf33/.eslintrc.cjs)
