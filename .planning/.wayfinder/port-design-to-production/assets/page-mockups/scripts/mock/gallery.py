# Builds /tmp/ogbuild/mockups/index.html: one section per page, three alternatives each,
# with light/dark thumbnails linking to the live mockup. Also writes small JPG thumbs.
import os, subprocess, html
pages = [("about","About"),("now","Now"),("projects","Projects"),("slides","Slides index"),
         ("til","TIL"),("series","Series"),("subscribe","Subscribe"),("blogroll","Blogroll")]
out = "/tmp/ogbuild/mockups"; thumbs = f"{out}/_thumbs"; os.makedirs(thumbs, exist_ok=True)
tpl = open("/tmp/ogbuild/mock-template.html").read()
sections = []
for slug, name in pages:
    cards = []
    for alt in "abc":
        if not os.path.exists(f"{out}/{slug}/{alt}/index.html"): continue
        imgs = []
        for mode in ("light","dark","mobile"):
            src = f"/tmp/mock/{slug}-{alt}-{mode}.png"
            if os.path.exists(src):
                dst = f"{thumbs}/{slug}-{alt}-{mode}.jpg"
                w = "260x" if mode == "mobile" else "720x"
                subprocess.run(["magick", src, "-crop", "x1800+0+0" if mode!="mobile" else "x1700+0+0", "+repage", "-resize", w, "-quality", "80", dst], check=True)
                imgs.append(f'<img src="/mockups/_thumbs/{slug}-{alt}-{mode}.jpg" alt="{name} {alt.upper()} {mode}" class="g-{mode}" loading="lazy">')
        cards.append(f'<article class="g-card"><header><span class="lab-eyebrow">Alternative {alt.upper()}</span>'
                     f'<a href="/mockups/{slug}/{alt}/">Open live mockup ↗</a></header><div class="g-shots">{"".join(imgs)}</div></article>')
    if cards:
        sections.append(f'<section class="g-page" id="{slug}"><h2>{name}</h2><div class="g-row">{"".join(cards)}</div></section>')
nav = " · ".join(f'<a href="#{s}">{n}</a>' for s, n in pages)
body = f'''<style>
.g-wrap{{max-width:1500px;margin:0 auto;padding:48px 24px}}
.g-wrap h1{{font-family:var(--lab-heading);font-weight:700;font-size:56px;margin:8px 0 12px}}
.g-nav{{font-family:var(--lab-mono);font-size:13px;margin-bottom:40px}}
.g-page{{margin:56px 0;border-top:1px solid var(--lab-rule);padding-top:28px}}
.g-page h2{{font-family:var(--lab-heading);font-weight:700;font-size:34px;margin:0 0 20px}}
.g-row{{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}}
.g-card{{background:var(--lab-surface);border-radius:20px;padding:16px}}
.g-card header{{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;font-size:14px}}
.g-shots{{display:grid;grid-template-columns:1fr 1fr 80px;gap:8px;align-items:start}}
.g-shots img{{width:100%;border-radius:10px;border:1px solid var(--lab-rule)}}
@media (max-width:1000px){{.g-row{{grid-template-columns:1fr}}}}
</style>
<div class="g-wrap"><p class="lab-eyebrow">Throwaway mockups · pick one per page</p><h1>Page alternatives</h1>
<p>Each card shows desktop light, desktop dark and mobile. Open the live mockup to try the Catppuccin/Fireside switch and dark mode.</p>
<p class="g-nav">{nav}</p>{"".join(sections)}</div>'''
open(f"{out}/index.html","w").write(tpl.replace("<!--MOCK-->", body).replace("MOCK_TITLE","Page alternatives"))
print(len(sections), "pages in gallery")
