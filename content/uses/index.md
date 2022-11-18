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

![Neofetch](images/neofetch.png)

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

#### Useful Commands:

- `git fetch -p && git branch -vv | awk '/: gone]/{print $1}' | xargs git branch -D`: Delete branches locally that don't exist on remote, i.e. have been merged in
- `docker kill (docker ps -q) $argv`: Kill all running Docker containers
- `docker rm (docker ps -a -q) $argv`: Remove all killed Docker containers

## Websites

### Privacy Focused

- [whoogle](https://github.com/benbusby/whoogle-search): Google frontend without ads, tracking etc
- [Invidious](https://invidious.io/): Open source youtube front-end
- [Goatcounter](goatcounter.com): Website analytics tools, without tracking
