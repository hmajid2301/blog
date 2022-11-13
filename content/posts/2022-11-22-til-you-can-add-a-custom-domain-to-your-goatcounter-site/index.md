---
title: "TIL: You can add a custom domain to your Goatcounter site"
canonicalURL: https://haseebmajid.dev/posts/til-you-can-add-a-custom-domain-to-your-goatcounter-site/
date: 2022-11-22
tags:
  - goatcounter
  - hugo
  - blog
series:
  - TIL
  - Goatcounter with Hugo
cover:
  image: images/cover.png
---

**TIL: You can add a custom domain to your Goatcounter site**

When you create an account on Goatcounter and add a new site, you can view the analytics by going to `[sitecode].goatcounter.com`.
For example, [`haseebmajid.goatcounter.com`](https://haseebmajid.goatcounter.com). However, we can use a custom domain, to view your analytics.

{{< notice type="warning" title="Custom Domain" >}}
You will need a domain, that you can control the DNS of to do the following!
{{< /notice >}}


## Goatcounter

We can do this by:

- First go to your Goatcounter site
  - i.e. `haseebmajid.goatcounter.com`
- Then go to `Settings`
- Then `Domain settings` > `Custom domain`
  - Add your domain
    - i.e. `stats.haseebmajid.dev`
- Press the `Save` button on the bottom left

{{< gfycat src="InsignificantMemorableGreathornedowl" >}}

## Domain

Finally, we need to go to our domain management tool, such as `namecheap` and add a new entry:

- `CNAME stats.haseebmajid.dev haseebmajid.goatcounter.com`

{{< notice type="tip" title="Certificate" >}}
It can up to an hour for the certificate to be created so try to visit your page in an hour.
{{< /notice >}}
