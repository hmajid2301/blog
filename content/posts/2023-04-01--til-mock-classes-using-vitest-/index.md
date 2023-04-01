---
title: "TIL: How to Mock Classes Using Vitest"
date: 2023-04-01
canonicalURL: https://haseebmajid.dev/posts/2023-04-01--til-mock-classes-using-vitest-
series:
    - TIL
tags:
    - vitest
    - testing
---

**TIL: How to Mock Classes Using Vitest**

Recently I have been creating a SvelteKit app, when creating a new SvelteKit app you get a choice
of different things you can add. Such as using `vitest` for unit testing.

I needed to spy on/mock a method in a class, to see if it was called when a button was pressed and, it was called
with the correct arguments. 

Let's say we have a `Button` component which looks like this:

```svelte
<!-- button.svelte -->
<script lang="ts">
    import { API } from "./api"

    const api = new API()
</script>

<button on:click={api.create}>Press Me!</button>
```

Then the `api.ts` looks something like this:

```ts
export class API {
	async create() {
        // ... does something
	}
}
```

So how do we test that the `create` method is called?
Let's assume we will be using the `svelte testing library` [^1].

```ts {hl_lines=12}
// __tests__/button.test.ts
import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import Button from "../Button.svelte";
import { API } from "./api";

describe("Button", () => {
	test("Successfully render Button", async () => {
		const user = userEvent.setup();
		const mock = vi.spyOn(API.prototype, "create");

		const { getByRole, getByLabelText } = render(Button, { props: {} });

		const button = getByRole("button", { name: "Add Bookmark" });
		await user.click(button);
		expect(mock).toHaveBeenCalled();
	});
});
```

The key being this line `vi.spyOn(API.prototype, "create")`, where we need to use `.prototype`.
So we can access the methods in the class. Without the `.prototype` we will not find the method
on the object itself.

That's it! Thanks for reading.

[^1]: https://testing-library.com/docs/svelte-testing-library/intro/