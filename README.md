# Blog

My personal website and blog built using Hugo.
## Talks

This site also has all of my talks and the slides for them! You can find them [here](https://haseebmajid.dev/talks).

## Usage

This project is setup to make it easy to get started if you are using Nix and Flakes.
You can leverage direnv to automatically activate the development environment, which should have all the apps and tools
you need to get started.

```bash
# Serve Main Site
task start_server

# Serve /slides path
task start_slides
```

### New Content

To create a new post:

```
task new_post
```

## Theme

The theme is based of PaperModX with some of my own tweaks

- Mermaid Diagram Support
- Series posts shown
- Notice/Admonitions (Highlighted sections)
- Inline Search
	- Inspired by Blowfish Theme
- Remove newsletter
- FaunaDB to show likes per post
- Page Views
- A bunch of PRs merged (from PaperModX)


## Appendix

- <a href="https://www.flaticon.com/free-icons/blog" title="blog icons">Blog icons created by Freepik - Flaticon</a>
- [Custom PaperModX Fork](https://github.com/hmajid2301/hugo-PaperModX)
   - Note this is no longer used as I have merged the theme with my blog to make it easier to change
