---
title: "TIL: How You Can Zoom in on Photos in your Hugo Posts"
canonicalURL: https://haseebmajid.dev/posts/2022-11-21-til-how-you-can-zoom-in-on-photos-in-your-hugo-posts/
date: 2022-11-21
tags:
  - hugo
  - blog
  - markdown
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How You Can Zoom in on Photos in your Hugo Posts**

A quick before and after (below) is what we want to achieve:

![Before](images/zoom_before.png)

![After](images/zoom_after.png)

## How? 

Add the following code to your Hugo blog in my case using the Papermod theme I add it to the `layouts/partials/extend_footer.html`.

```html {hl_lines=[9]}
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/medium-zoom/1.0.6/medium-zoom.min.js"
  integrity="sha512-N9IJRoc3LaP3NDoiGkcPa4gG94kapGpaA5Zq9/Dr04uf5TbLFU5q0o8AbRhLKUUlp8QFS2u7S+Yti0U7QtuZvQ=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>

<script>
  const images = Array.from(document.querySelectorAll(".post-content img"));
  images.forEach((img) => {
    mediumZoom(img, {
      margin: 0 /* The space outside the zoomed image */,
      scrollOffset: 40 /* The number of pixels to scroll to close the zoom */,
      container: null /* The viewport to render the zoom in */,
      template: null /* The template element to display on zoom */,
      background: "rgba(0, 0, 0, 0.8)",
    });
  });
</script>
```

The highlighted line may need to change depending on how your blog is setup. For my blog using the
[PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme. This gets all the images on the page
`.post-content img`.

## Appendix

- [Github Issue w/ Solution](https://github.com/adityatelange/hugo-PaperMod/issues/384#issuecomment-899219940)