---
title: Why I moved from Gatsby to Hugo for this blog?
canonicalURL: https://haseebmajid.dev/posts/why-i-moved-from-gatsby-to-hugo-for-this-blog?/
date: 2022-11-17
tags:
  - hugo
  - gatsby
  - blog
  - me
cover:
  image: images/cover.png
---
# About This Site

This site was built with [hugo](https://gohugo.io/) and the [PaperModX Theme](https://github.com/hmajid2301/hugo-PaperModX) (using a fork of a fork at the moment).

I decided to go with an existing theme rather than creating my own this time, to one save time but also to give the
site a more consistent feel. I am no designer and I felt my last website (v3), really felt like a bunch of different
websites thrown together. It was a great way to learn React, TailwindCSS and a bunch of other technologies.

## Technologies Used

- [Hugo](https://gohugo.io/)
	- [PaperModX Theme](https://github.com/hmajid2301/hugo-PaperModX)
		- My own fork (of a fork of a fork)
- [Goatcounter](https://www.goatcounter.com/) for Analytics
- Hosted by [Netlify](https://www.netlify.com/)
- Using [NetlifyCMS](https://www.netlifycms.org) for content management

## Why Move to Hugo ? 

I also had a bunch of issues even building the [site recently](https://gitlab.com/hmajid2301/portfolio-site/-/pipelines).
I had a schedule job to rebuilt it so that the stats page would update with the most viewed articles etc.
The final straw for me was not being to easily add a new page for talks. I recently was lucky enough to give a
talk at Europython and wanted to share that on my website but realised with my old Gatsby site that would be a bit of
a pain to add. I could also no longer easily upgrade my site to the latest version of Gatsby v4 due to old
plugins I relied on.
Mostly it was essentially an issue with me, that I no longer wanted to put in the effort to maintain the site.

So I decided to take a look at something easier to maintain but that would still look great. I have been
learning Golang and decided to take a look at Hugo. One thing I noticed right away was how fast it was to
build the site. Roughly speaking the old site used to take ~120 seconds to build and this site takes < 1 second.

Anecdotally I noticed the hot reloader seems to work better but again I was using a v2 of Gatsby.
Overally I am pretty happy with this new site. Using hugo archetypes and page-bundles. I have moved
all of my articles within this repo, making it far easier to create new blog posts and test draft posts.

So hopefully I will be blogging more often 🤣 (I'm looking at you 2 posts in 2022, as of time of writing)!

## 👴 Older iterations:

You can find older iterations of this site here:

- [Version 1](https://v1.haseebmajid.dev)
- [Version 2](https://v2.haseebmajid.dev)
- [Version 3](https://v3.haseebmajid.dev)
