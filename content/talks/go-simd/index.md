---
title: "The Fast and the Floatiest: SIMD in Go 1.27"
canonicalURL: https://haseebmajid.dev/talks/go-simd/
date: 2026-11-17
ShowToc: false
ShowReadingTime: false
ShowWordCount: false
hideMeta: false
hideSummary: true
---

A 15-minute introduction to Single Instruction, Multiple Data (SIMD) in Go.
Starting with a loop that adds two slices, we compare scalar Go, assembly, and
the experimental portable `simd` package in Go 1.27.

Along the way: vector widths, runtime CPU dispatch, handling leftover elements,
and when to reach for `archsimd`. Benchmarks show where SIMD helps—and why a
faster loop does not always mean a faster request.

- [Slides](https://slides.haseebmajid.dev/go-simd/2026-11-17/)
- [Example code](https://gitlab.com/hmajid2301/slides/-/tree/main/content/slides/go-simd/2026-11-17/examples)
