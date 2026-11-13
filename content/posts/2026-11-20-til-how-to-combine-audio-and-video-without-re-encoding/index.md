---
title: TIL - How to Combine Audio and Video Without Re-encoding
date: "2026-11-20"
draft: true
canonicalURL: https://haseebmajid.dev/posts/2026-11-20-til-how-to-combine-audio-and-video-without-re-encoding
tags:
  - ffmpeg
series:
  - TIL
---

Recently I had some recordings where the audio and video were downloaded as separate files. I wanted to combine
them into one MP4 without having to re-encode everything.

You can do this with ffmpeg using `-c copy` [^1]:

```bash
ffmpeg -n -i video.mp4 -i audio.mp4 \
  -map 0:v:0 -map 1:a:0 -c copy combined.mp4
```

The `-map 0:v:0` takes the first video stream from the first file, and `-map 1:a:0` takes the first audio stream
from the second file. `-c copy` copies both streams without re-encoding, so there is no quality loss from encoding
again. The `-n` stops ffmpeg from overwriting an existing output file.

Note the codecs need to be supported by the output container. In my case the video was H.264 and the audio was AAC,
which both work in an MP4.

That's it!

[^1]: https://ffmpeg.org/ffmpeg.html#Streamcopy
