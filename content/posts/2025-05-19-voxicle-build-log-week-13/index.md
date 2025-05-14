---
title: Voxicle Build Log Week 13
date: 2025-05-19
canonicalURL: https://haseebmajid.dev/posts/2025-05-19-voxicle-build-log-week-13
tags:
  - voxicle
  - buildinpublic
  - micro-saas
  - build-log
series:
  - Build In Public
cover:
  image: images/cover.png
---

## ⏮️ Last Weeks Objectives

- Better error modals (fixed)
- Start working on public page
- Multi tenant sub domains
  - i.e. org1.voxicle.app

## 🛠️ What I Worked On

### Error Modal Bug

I have some middleware that will show an error modal when we return an error back to the client. I may change this to
be a toast for certain actions vs a full on modal but we can do that in the middleware.

There was a bug where the modal wouldn't work insted it would return the status code and HTML like so:

```html
401 Unauthorized (Failed to login.)<div>...</div>
```

Set `HX-Retarget`, to replace other items i.e. not `#feedback_list` but we want to update `#error_modal_container`.
So in the middleware we now set this header, with an error modal.

```go
w.Header().Set("HX-Retarget", "#error_modal_container")
w.Header().Set("Content-Type", "text/html")
```

With the following script, to show the modal after a HTMX swap:

```html
<script>
    document.body.addEventListener('htmx:afterSwap', function(evt) {
      if (evt.detail.target.id === 'error_modal_container') {
        document.getElementById('error_modal')?.showModal();
      }
    });
</script>
```

### hx-indicator trigger

For really fast request we don't want to show the loading spinner quickly and then hide it. So for the first x seconds
don't show the loading spinner wait say 1 second then show it. So it is less likely to flash on screen and disappear.
Which doesn't provide an amazing experience for the user, of course there is a chance that this could still happen.

I fixed it by doing something like this, when we make a request to our backend.

```html
<span id="delete-indicator" class="hidden justify-center items-center transition duration-300 delay-2000 hx-indicator">
    <span class="loading loading-spinner"></span>
    <span class="ml-2">Sending...</span>
</span>
```

### Public Feedback Page

One of the main features of the web app is allowing other people to vote on features, so we allow anonymous votes.
So decided to manage anonymous votes in its own table, which keeps track of a device_id.  A long lived cookie we
populate. Which of course means you can vote again from another device. But this is a good enough trade off.

So started work to show the feedbacks on a single public page, which a user can then filter on like the private one
but then also vote for it anonymously or if you are logged in the vote counts as normal.

### Subdomains

Part of the public page is allowing the app to handle subdomains i.e. `org1.voxicle.app/public/feedback` to show
the public feedback page.

## ✅ Wins

- Error modal fixed
- Worked out how to handle anonymous votes

## ⚠️ Challenges

## 💡 What I Learned

- (remembered) HTMX only swaps by default on 200 HTTP Status code
  - `<meta name="htmx-config" content='{"responseHandling": [{"code":"...", "swap": true}]}'/>`
- `hx-swap-oob` used for other changes first container is replaced, we can use `hx-retarget`

## ⏭️ Next Weeks Objectives

