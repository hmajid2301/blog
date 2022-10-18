---
title: Uses
summary: What I use!
canonicalURL: https://haseebmajid.dev/uses/
url: "/uses/"
date: 2022-10-08
---

# What do I use?

The following is a list of the tools that I use on a daily basis. This page
was inspired by [Wes Bros](https://wesbos.com/uses). See more pages like this [here](https://uses.tech)

- My [dotfiles](https://gitlab.com/hmajid2301/dotfiles)

## 🐧 OS + Hardware

- I am currently using [Arch Linux](https://archlinux.org/)
- I use the Gnome DE
- I use two 🖥️ 32" 4k monitors
- I use a ⌨️ [Logitech G915](https://www.logitechg.com/en-gb/products/gaming-keyboards/g915-low-profile-wireless-mechanical-gaming-keyboard.html) with GL clicky switches ⌨️ and an [Logitech G502](https://www.logitechg.com/en-gb/products/gaming-mice/g502-lightspeed-wireless-gaming-mouse.910-005568.html) 🖱️ 

## 📑 Editor

- [Visual Studio Code](https://code.visualstudio.com/) is my current editor. I swapped over a few years ago from PyCharm

- I use the 🧛 [dracula theme](https://github.com/dracula/visual-studio-code)
- I use the font 🔥 [fira code](https://github.com/tonsky/FiraCode) and 🖼️ [MonoLisa](https://monolisa.dev/)

## ✔️ Terminal

- I use the 🧛 [Dracula theme](https://draculatheme.com/gtk)
- I use the [alacritty terminal](https://github.com/alacritty/alacritty) with [Starship prompt](https://starship.rs/)
- I use [fish 🐟 shell](https://fishshell.com/) as my default shell

## ⚙️ Tools

### Applications

- I use 🦊 [Firefox](https://www.mozilla.org/en-US/exp/firefox/new/) as my main browser
- I use ⏱️ [Timeshift](https://itsfoss.com/backup-restore-linux-timeshift/) to create backups
- I use 🪵 [Logseq](https://logseq.com/) for taking notes
- I use 🦆 [Mullvad](https://mullvad.net/) as my VPN

#### 🔒 Backups

My Backup strategy is as follows:

- I backup my entire computer locally using TimeShift
- I backup my entire computer remotely to BackBlaze using Restic

### 🧰 CLI Tools

- [exa](https://github.com/ogham/exa): ls replacement, used with [exa aliases](https://github.com/gazorby/fish-exa)
- [fzf](https://github.com/junegunn/fzf): Really nice fuzzy search tool
- [tldr](https://github.com/dbrgn/tealdeer): Simplified man pages
- [gtop](https://github.com/aksakalli/gtop): System monitoring dashboard alternative to htop
- [bat](https://github.com/sharkdp/bat): A better version of `cat`
- [zoxide](https://github.com/ajeetdsouza/zoxide): A great tool for jumping between multiple directories.

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
