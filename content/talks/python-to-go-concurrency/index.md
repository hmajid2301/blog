---
title: "From Python to Go: Concurrency Without the Surprises"
canonicalURL: https://haseebmajid.dev/talks/python-to-go-concurrency/
date: 2026-11-02
ShowToc: false
ShowReadingTime: false
ShowWordCount: false
hideMeta: false
hideSummary: true
---

A 30-minute introduction to Go concurrency for developers who know Python but are
new to Go. We evolve one URL checker from sequential Python and thread/asyncio
mental models into a bounded Go worker pool, with explicit ownership,
cancellation, deadlines, and error handling.

Along the way: concurrency versus parallelism, what the GIL does (and does not)
mean, optional free-threaded CPython, goroutines, channels, synchronization, and
how to avoid races, leaks, and deadlocks. No promise that Go is always faster—just
a practical model for overlapping I/O safely.

- [Slides](/slides/python-to-go-concurrency/)
- [Runnable Go example and tests](https://gitlab.com/hmajid2301/blog/-/tree/main/content/slides/python-to-go-concurrency/examples)
