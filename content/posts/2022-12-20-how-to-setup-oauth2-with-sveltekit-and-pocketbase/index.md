---
title: How to Setup OAuth2 with SvelteKit and Pocketbase
canonicalURL: https://haseebmajid.dev/posts/2022-12-20-how-to-setup-oauth2-with-sveltekit-and-pocketbase/
date: 2022-12-20
tags:
  - svelte
  - sveltekit
  - auth
  - pocketbase
cover:
  image: images/cover.png
---

Hi everyone, I've been building a new [bookmarking app](https://gitlab.com/banter-bus/bookmarkey/gui), using SvelteKit and
PocketBase. [PocketBase](https://pocketbase.io/), is an open-source backend, that we need to self-host [^1]. It is written
in Golang, think of it similar to Firebase or Supabase.

PocketBase will handle authentication for us, creating new users, and storing the password securely. You know things all apps
need that we don't need to think about. To learn more about authentication with SvelteKit I recommend checking out the web
there are some fantastic tutorials available [^2].

In this post, we will look at how we can use OAuth providers such as Google, Github or Gitlab to authenticate with our app
and if needed to create a new account.

For a more complicated example, an actual app, using OAuth with SvelteKit [click here](https://gitlab.com/banter-bus/bookmarkey/gui/-/tree/22c3843ddb70d0002584efff0192140466d70283).

## PocketBase

We can run pocketbase locally by using docker, create a `docker-compose.yml` which contains the following:

```yaml
version: '3.7'
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - '8090:8090'
    volumes:
      - /pb_data
      - /pb_public
```

### Setup Auth Providers

Then this will be available on `http://localhost:8090/_/` (after running `docker compose up`). Then set up our OAuth providers,
this process will vary from provider to provider. Let's setup up Gitlab in this post.

- Go to https://gitlab.com
- Go to `Preferences` (click on your avatar)
- Then go to `Applications` (left bar)
- Create a new application
  - Give it a name like `Bookmarkey Dev`
  - Set the Redirect URI `http://localhost:5173/callback`
  - Set `read_user` in scopes

Then set up the Auth provider on PocketBase.

- Go to `http://localhost:8090/_/` 
- Go to `Settings > Auth providers`
- Click on `GitLab` and check `Enable`
- Copy the `Application ID` (from Gitlab application) to the `CLIENT ID`
- Copy the `secret` to `CLIENT SECRET`

Now we have Gitlab as an OAuth provider enabled on PocketBase let's start coding on SvelteKit.

## SvelteKit

I assume you already have a SvelteKit app if not you can follow the instructions here to create it `npm create svelte@latest example`.

Let's install PocketBase `npm install --save pocketbase`.

Then let's create a `src/hooks.server.ts`, which looks like this:

```ts
import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.pb = new PocketBase('http://localhost:8090');
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
        }
    } catch (err) {
        event.locals.pb.authStore.clear();
    }

    const response = await resolve(event);
    const isProd = process.env.NODE_ENV === 'production' ? true : false;
    response.headers.set(
        'set-cookie',
        event.locals.pb.authStore.exportToCookie({ secure: isProd, sameSite: 'Lax' })
    );
    return response;
};
```

This handle function acts as a bit of middleware between each of our requests. The `handle` function runs every time the
SvelteKit server receives a request [^3]. The function above we will be used to add the auth token to our request header.

Then if you are using Typescript go to your `app.d.ts` file and make it look like this:

```ts
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
    type PocketBase = import('pocketbase').default;
    interface Locals {
        pb?: PocketBase;
    }
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
}
```

### Login

Next, let's go setup up the `login` page. Let's create a `src/routes/login/+page.server.ts`:

```typescript
import type { PageServerLoad } from './$types';

export type OutputType = { authProviderRedirect: string; authProviderState: string };

export const load: PageServerLoad<OutputType> = async ({ locals, url }) => {
    const authMethods = await locals.pb?.collection('users').listAuthMethods();
    if (!authMethods) {
        return {
            authProviderRedirect: '',
            authProviderState: ''
        };
    }

    const redirectURL = `${url.origin}/account/callback`;
    const gitlabAuthProvider = authMethods.authProviders[0];
    const authProviderRedirect = `${gitlabAuthProvider.authUrl}${redirectURL}`;
    const state = gitlabAuthProvider.state;

    return {
        authProviderRedirect: authProviderRedirect,
        authProviderState: state
    };
};
```

Here we get all the auth providers, in this case, we only want the information from the first one.
As we only have one provider, we can get the first one (Gitlab). Then we return the `state` and the
redirect URL to the OAuth provider.

What is returned from this `PageServerLoad` can be accessed by the Svelte page. Let's see how
we can do this, create an `src/routes/login/+page.svelte`.

```svelte
<script lang="ts">
    import { browser } from '$app/environment';
    import type { PageData } from './$types';

    export let data: PageData;
    function gotoAuthProvider() {
        if (browser) {
            document.cookie = `state=${data?.authProviderState}`;
        }

        window.location.href = data.authProviderRedirect || '';
    }

</script>

<button on:click={gotoAuthProvider}>Login with GitLab</button>
```

We can access what is returned in the `.server.ts` file by using the `data` variable.
Here when the user clicks the button to go login with Gitlab. We save the state
in the cookie, which we will compare later on. Then we redirect them to the OAuth login
for Gitlab. After they have authenticated with GitLab, they will be redirected back to our
site but redirected to the `/callback` route. As we configured above.

{{< notice type="tip" title="Types" >}}
Types are auto-generated when we run `svelte-kit sync` or `vite dev`.
These types automatically work out what the `PageServerLoad` function returns.
When we type our `data` as `PageData`.
{{< /notice >}}

## Callback

Let's create a new page called `src/routes/callback/+server.ts`, this page will have the 
logic to authenticate (and create an account if needed). 

```ts
import { redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url, cookies }: RequestEvent) => {
    const redirectURL = `${url.origin}/callback`;
    const expectedState = cookies.get('state');

    const query = new URLSearchParams(url.search);
    const state = query.get('state');
    const code = query.get('code');

    const authMethods = await locals.pb?.collection('users').listAuthMethods();
    if (!authMethods?.authProviders) {
        console.log('authy providers');
        throw redirect(303, '/login');
    }
    const provider = authMethods.authProviders[0];
    if (!provider) {
        console.log('Provider not found');
        throw redirect(303, '/login');
    }

    if (expectedState !== state) {
        console.log('state does not match expected', expectedState, state);
        throw redirect(303, '/login');
    }

    try {
        await locals.pb
            ?.collection('users')
            .authWithOAuth2(provider.name, code || '', provider.codeVerifier, redirectURL);
    } catch (err) {
        console.log('Error logging in with 0Auth user', err);
    }

    throw redirect(303, '/');
};
```

Here we are grabbing our auth provider, comparing the state is what we expect in cookie. Then using pocketbase
to check the query parameters sent to the redirect URI are all valid, as someone could of course spoof this.
Try to authenticate as someone else.

The main auth logic happens here:

```ts
await locals.pb
    ?.collection('users')
    .authWithOAuth2(provider.name, code || '', provider.codeVerifier, redirectURL);
```

Using Pocketbase means we don't have to write any of the logic ourselves in a backend service.
It'll handle this interaction, it is even smart enough to create a new user if none is associated
with the email the user authenticates.

Finally, if everything worked we redirect them to the home page `throw redirect(303, '/');`.
We can then check if the user is logged in using `locals.pb.authStore.isValid`.
Again we would use the pattern we saw above with `+page.server.ts` and `+page.svelte`.
To pass it in as data, to the Svelte components/page.

## Layout

If we want to check someone if logged we could do something like this create a `src/routes/+layout.server.ts`:

```ts
import type { LayoutServerLoad } from './$types';

export type OutputType = { isLoggedIn: boolean };

export const load: LayoutServerLoad<OutputType> = async ({ locals }) => {
    return {
            isLoggedIn: locals.pb?.authStore.isValid ? true : false,
    };
};
```

Then we can access this in `src/routes/foo/+page.svelte` as:


```svelte
<script lang="ts">
    import type { PageData } from './$types';


    export let data: PageData;
</script>

<div>
{data.isLoggedIn}
</div>
```

That's it! We can now authenticate users using OAuth and Pocketbase. I recommend [this video](https://www.youtube.com/watch?v=UbhhJWV3bmI)
for some caveats when try to project routes.


## Appendix

- [Bookmarkey App using this pattern](https://gitlab.com/banter-bus/bookmarkey/gui/-/tree/537c7c71e5529c3c1351d98a8a632d9244b16e41/src)
- [Example source code](https://gitlab.com/hmajid2301/blog/-/tree/main/content/posts/2022-12-20-how-to-setup-oauth2-with-sveltekit-and-pocketbase/source_code/example)


[^1]: https://github.com/pocketbase/pocketbase/discussions/537
[^2]: https://www.youtube.com/watch?v=vKqWED-aPMg
[^3]: https://kit.svelte.dev/docs/hooks#server-hooks-handle