---
title: "TIL: How to Use Multiple Auth Files in Playwright"
date: 2023-03-22
canonicalURL: https://haseebmajid.dev/posts/2023-03-22--til-how-to-use-multiple-auth-in-playwright-
tags:
  - playwright
  - testing
  - sveltekit
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Load Authenticate State in Playwright**

In this post, I will quickly show you how you can reduce boilerplate code to log in to your app in Playwright tests.
Log in to our app is a very common action that will likely be required in most of our tests.

You can read this [documentation here](https://playwright.dev/docs/auth), which will explain how you can set this up.
However, what do you do if you want to say test the login flow or the register flow? You cannot use the same auth
file as all the other tests as you will already be logged in.

It is a great way to reduce boilerplate code from our tests, which would require us to write code to log in before each test.
You could log yourself in the test but, then we are adding more boilerplate code again.

What you can do is create a 2nd file say called `playwright/.auth/not_logged_in.json` which looks like this:

```json
{
	"cookies": [],
	"origins": []
}
```

In other words there is no state, so the user will not be logged in.
Then we can do something like this in say our `login.test.ts`:

```ts {hl_lines=[6-13]}
import type { Page, expect, test } from "@playwright/test";

test.describe(() => {
	let page: Page;

	test.beforeEach(async ({ browser }) => {
		const loginContext = await browser.newContext({
			storageState: "playwright/.auth/not_logged_in.json"
		});
		page = await loginContext.newPage();
	});

	test("Successfully login to app", async ({ baseURL }) => {
		await page.goto("/login");

		const email = "test@bookmarkey.app";
		await page.locator('[name="email"]').type(email);

		const password = "password@11";
		await page.locator('[name="password"]').type(password);

		await page.locator('button[type="submit"]').click();
		await page.waitForURL(`${baseURL}/my/collections/0`);
	});

	test("Fail to login to app using incorrect credentials", async ({ baseURL }) => {
		await page.goto("/login");

		const email = "test@bookmarkey.app";
		await page.locator('[name="email"]').type(email);

		const password = "wrong_password";
		await page.locator('[name="password"]').type(password);

		await page.locator('button[type="submit"]').click();

		const toastMessage = await page.locator(".message").innerText();
		expect(toastMessage).toBe("Wrong email and password combination.");
		await page.waitForURL(`${baseURL}/login`);
	});
});
```

Rather than using the "normal" page argument provided by Playwright, we will create our context.
Using this stateless file, will mean the user is not logged in.

If we still want a test to use to automatically logged in we can do:

```ts
import { test } from "@playwright/test";

test.describe(() => {
	test("Successfully load collections in side bar", async ({ page, baseURL }) => {
		await page.goto(`${baseURL}/my/collections/0`);
		await page.getByRole("link", { name: "folder closed test" }).click();
		await page.waitForURL(`${baseURL}/my/collections/46lfmlwhymhv6xl`);
	});
});
```

That's it!

## Appendix

- [Used in the Bookmarkey Project](https://gitlab.com/bookmarkey/gui/-/blob/55f7a6456da20a362c7b7ccf6069a9118acaa7f7/tests/auth.setup.ts)
