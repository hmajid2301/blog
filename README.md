# Blog

My personal website and blog built using Hugo.

## Usage

> You need [task](https://taskfile.dev/installation/) installed

Or you can use Nix flakes, with direnv to auto activate your development environment.

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
