---
title: "TIL: How to Run Android Emulator Using avd on Hyprland"
date: 2024-03-02
canonicalURL: https://haseebmajid.dev/posts/2024-03-02-til-how-to-run-android-emulator-using-avd-on-hyprland
tags:
  - emulator 
  - android
  - hyprland
cover:
  image: images/cover.png
---

**TIL: How to Run Android Emulator Using avd on Hyprland**

Recently, I was having issues when trying to run an Android Emulator using Android Studio (avd). When I would try to 
run an Emulator from the device manager, I would get the following `The emulator process for avd xxx has terminated error`.

Looking deeper into the logs at `~/.local/cache/Google/AndroidStudio2023.1/log/idea.log`, I noticed the following:

```bash
2024-02-20 12:01:45,859 [ 781674]   INFO - Emulator: Pixel 7 Pro API 34 - Android emulator version 33.1.24.0 (build_id 11237101) (CL:N/A)
2024-02-20 12:01:45,859 [ 781674]   INFO - Emulator: Pixel 7 Pro API 34 - Found systemPath /home/haseebmajid/Android/Sdk/system-images/android-34/google_apis_playstore/x86_64/
2024-02-20 12:01:46,037 [ 781852]   WARN - Emulator: Pixel 7 Pro API 34 - Failed to process .ini file /home/haseebmajid/.config/.android/avd/../avd/Pixel_7_Pro_API_34.avd/quickbootChoice.ini for reading.
2024-02-20 12:01:46,053 [ 781868]   INFO - Emulator: Pixel 7 Pro API 34 - Storing crashdata in: , detection is enabled for process: 194632
2024-02-20 12:01:46,054 [ 781869]   INFO - Emulator: Pixel 7 Pro API 34 - Fatal: This application failed to start because no Qt platform plugin could be initialized. Reinstalling the application may fix this problem.
2024-02-20 12:01:46,054 [ 781869]   INFO - Emulator: Pixel 7 Pro API 34 - Duplicate loglines will be removed, if you wish to see each individual line launch with the -log-nofilter flag.
2024-02-20 12:01:46,054 [ 781869]   INFO - Emulator: Pixel 7 Pro API 34 - 
2024-02-20 12:01:46,054 [ 781869]   INFO - Emulator: Pixel 7 Pro API 34 - Increasing RAM size to 3072MB
2024-02-20 12:01:46,054 [ 781869]   INFO - Emulator: Pixel 7 Pro API 34 - Available platform plugins are: xcb.
2024-02-20 12:01:46,054 [ 781869]   INFO - Emulator: Pixel 7 Pro API 34 - Warning: Could not find the Qt platform plugin "wayland" in "/home/haseebmajid/Android/Sdk/emulator/lib64/qt/plugins" ((null):0, (null))
2024-02-20 12:01:46,054 [ 781869]   INFO - Emulator: Pixel 7 Pro API 34 - ((null):0, (null))
2024-02-20 12:01:46,055 [ 781870]   INFO - Emulator: Pixel 7 Pro API 34 - Fatal: This application failed to start because no Qt platform plugin could be initialized. Reinstalling the application may fix this problem.
```

Note, I did have qtwayland5 installed on my Ubuntu machine.
So get it working based on this log line `Available platform plugins are: xcb.` The simplest thing I could think of was
to run 

```bash
QT_QPA_PLATFORM=xcb ~/Android/Sdk/emulator/emulator -avd Pixel_XL_API_33
```

Forcing it to use the platform it can find. I don't need to do much Android development, so this was fine for now.
For a better solution, you can look at this [issue](https://github.com/hyprwm/Hyprland/issues/3417), to add both 
in your Hyprland config itself.


