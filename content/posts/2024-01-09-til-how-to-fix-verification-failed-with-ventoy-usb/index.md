---
title: "TIL: How to Fix `Verification Failed` With Ventoy USB"
date: 2024-01-09
canonicalURL: https://haseebmajid.dev/posts/2024-01-04-til-how-to-fix-verification-failed-with-ventoy-usb
tags:
  - ventoy
  - secure-boot
series:
  - TIL
cover:
  image: images/cover.png
---

**TIL: How to Fix `Verification Failed` With Ventoy USB**

Recently, I tried to boot with my Ventoy USB on my new AMD motherboard Framework. However, I was getting a which looked
like `Verification failed:(0x1A) Security Violation`. It turns out this was because secure boot was turned on. So we 
needed to turn it off initially to boot off the Ventoy. You can follow the instructions 
[here](https://community.frame.work/t/solved-secure-boot-and-custom-keys-on-the-amd-motherboard/38362/3).

We can then turn on secure boot after, I will do a future post how we can do this with NixOS. When I get it working.

That's it! Super short post this time.

## Appendix

- [SO Post](https://askubuntu.com/questions/1456460/verification-failed-0x1a-security-violation-while-installing-ubuntu)

