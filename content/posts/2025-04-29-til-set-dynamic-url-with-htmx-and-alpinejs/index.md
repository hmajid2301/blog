---
title: TIL - How to Set Dynamic uRL With hTMX and Alpinejs
date: 2025-04-29
canonicalURL: https://haseebmajid.dev/posts/2025-04-29-til-set-dynamic-url-with-htmx-and-alpinejs
tags:
  - alpinejs
  - htmx
series:
  - TIL
cover:
  image: images/cover.png
---

TLDR; Add this attribute to your x-bind:hx-delete `x-effect="currentItemId;htmx.process($el)"` as an example (adjust for your example).

## Background

In my app, I show the user 25 feedbacks per page, and they can delete them which opens a modal to confirm the action.
If the user presses the delete button in the modal I want to send a HTTP DELETE request to an endpoint like
`/feedback/{id}`, but the ID is dynamic, as we are using one modal for all the feedbacks vs having one modal
per one feedback.

I am using HTMX, generated using templ and using AlpineJS for some frontend interactivity, where it doesn't make
sense to send a request back to the server.

## Solution

The solution is relatively easily in the end

We have a button like this which triggers the modal to open, this is rendered in templ via Go. Hence the `fmt.Sprintf`
function. Here we are setting a variable which will be used by AlpineJS.

```html
<button
    class="btn btn-ghost btn-xs text-neutral"
    @click={ fmt.Sprintf("currentItemId = '%s'; document.getElementById('delete-modal').showModal()", item.ID) }
    aria-label="Delete Feedback"
>
    <i class="text-lg hgi hgi-solid hgi-delete-02"></i>
</button>
```

In one of the parent div make sure we set the `x-data` attribute, which matches the same variable we set on the `@click`.

```html
<div class="" x-data="{ currentItemId: '' }">
```

Finally here is a simplified version of the button in the modal when pressed will send the delete request.
The key line is `x-effect="currentItemId;htmx.process($el)"`, we need HTMX to reevaluate the hx-delete attribute.
Else the request will go to `/feedback/` without the ID.

```html
<button
    x-bind:hx-delete="'/feedback/' + currentItemId"
    x-effect="currentItemId;htmx.process($el)"
    hx-target="#feedback_list"
    hx-swap="outerHTML"
>
    Delete
</button>
```

That's it, now you can set the endpoint dynamically, generally speaking I don't need to use this pattern much.
As most of the time this can be set when we render the template as they are usually static.

## Appendix

- Github: https://github.com/mvolkmann/htmx-examples/blob/main/dynamic-endpoint/public/index.html
- Reddit Post: https://old.reddit.com/r/htmx/comments/1fyaw8r/htmx_and_alpinejs_dynamic_data/
