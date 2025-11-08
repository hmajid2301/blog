---
title: TIL - How to Enable Video Thumbnails for SMB Share on Nixos and Nautilus
date: "2025-11-06"
canonicalURL: https://haseebmajid.dev/posts/2025-11-06-til-how-to-enable-video-thumbnails-for-smb-share-on-nixos
tags:
  - nixos
  - nautilus
series:
  - TIL
cover:
  image: images/cover.png
---

So recently I have setup a mini NAS and I connect to it via an SMB share, but on nautilus I noticed that
unlike my local files for the videos it would not create thumbnails when I was using nautilus (file manager for Gnome).

The fix ended up being pretty simple [^1]:

```
Nautilus > Preference > Show thumbnails.

Set it to "On this computer only" for only seeing thumbnails on your system, .

If u need it to do same for a remote server, select "All files"
```

Or since we are managing this via NixOS and want to do things declaratively we can do do the following in our Nix config [^2].

```nix{12-14}
{
dconf.settings = {
  "org/gnome/desktop/thumbnailers" = {
    disable-all = false;
  };

  "org/gnome/desktop/thumbnail-cache" = {
    maximum-age = -1;
    maximum-size = -1;
  };

  "org/gnome/nautilus/preferences" = {
    show-image-thumbnails = "always";
  };
};
}
```

That's it, in your SMB share you should now be able to view thumbnails for all of your videos.

[^1]: https://www.reddit.com/r/gnome/comments/u6t0u8/comment/i5aq8no/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
[^2]: https://gitlab.com/hmajid2301/nixicle/-/blob/changes/modules/nixos/roles/desktop/addons/nautilus/default.nix
