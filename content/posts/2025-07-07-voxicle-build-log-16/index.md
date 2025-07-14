---
title: Voxicle Build Log 16
date: 2025-07-21
canonicalURL: https://haseebmajid.dev/posts/2025-07-07-voxicle-build-log-15
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

## ⏮️ Previous Build Log Objectives

- Finish the setting page
- Improve observability
  - Send data to LGTM Grafana Cloud

## 🛠️ What I Worked On

### Observability

This was more for my Gophercon talk, but I fixed the local LGTM stack setup so that we can send logs, metrics and traces
and view it all in Grafana. Then correleate them correctly and move between them in the GUI.

Worked on the terraform code to then create the same stack in Grafana cloud to setup the LGTM stack. Including deploying
an alloy agent on my VPS. So we can send all of our OTLP data their and have consumed by the Grafana cloud.

### Setting Page

Started work on the settings page to allow the user to update various settings about the organization.
Such as the name, logo and description.

Added ways for user to change their org name, avatar and description.

## ✅ Wins

- Learnt a lot more about OTLP observability

## ⚠️ Challenges

- Didn't work much on this project got busy with real life

## 💡 What I Learned

- How to correlate logs, traces and metrics in the Grafana UI using the LGTM stack.

## ⏭️ Next Build Log Objectives

- Finish the setting page
