# Blog

My personal website and blog built using Hugo.

## Usage

> You need [go-task](https://taskfile.dev/installation/) installed

```bash
go-task start_server

# To see all talks
go-task --list-all
```

### New Content

To create a new post:

```
go-task new_post ARTICLE_NAME=a-new-post
```

To create a new talk:

```
go-task new_talk TALK_NAME=a-talk-post
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


## Older Versions

- [Version 1](https://v1.haseebmajid.dev)
- [Version 2](https://v2.haseebmajid.dev)
- [Version 3](https://v3.haseebmajid.dev)
- [Version 4](https://v4.haseebmajid.dev)

## Appendix

- <a href="https://www.flaticon.com/free-icons/blog" title="blog icons">Blog icons created by Freepik - Flaticon</a>
- [Custom PaperModX Fork](https://github.com/hmajid2301/hugo-PaperModX)
   - Note this is no longer used as I have merged the theme with my blog to make it easier to change
