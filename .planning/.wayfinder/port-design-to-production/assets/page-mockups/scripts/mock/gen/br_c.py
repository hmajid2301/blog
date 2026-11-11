import sys; sys.path.insert(0,'/tmp/mock')
from gen_shared import *
def ent():
    return f"""<li><div class=brc-line><a href=#example>{BR_NAME}</a><i aria-hidden=true></i><a class=brc-feed href=#example aria-label="RSS feed for {BR_NAME}">{BR_FEED}</a></div><p>{BR_NOTE}</p></li>"""
groups = "".join(f"""<section class=brc-group aria-labelledby=brc-{c.lower()}><h2 id=brc-{c.lower()}><span>{c}</span><small>{n:02d}</small></h2><ul>{"".join(ent() for _ in range(n))}</ul></section>""" for c,n in BR_CATS)
buttons = "".join('<span class=brc-88>[88×31]</span>' for _ in range(6))
body = f"""<div class=mock-br-c data-mock-wide>
<style>
{WIDE}
.mock-br-c{{font-family:var(--lab-body);color:var(--lab-text)}}
.mock-br-c a{{color:inherit;text-decoration:none}}
.mock-br-c h1,.mock-br-c h2{{font-family:var(--lab-heading);font-weight:700;color:var(--lab-text);margin:0}}
.mock-br-c :focus-visible{{outline:2px solid var(--lab-accent);outline-offset:3px}}
.brc-head{{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:48px;align-items:end;padding:20px 0 36px}}
.brc-head h1{{font-size:clamp(46px,6.4vw,84px);line-height:.98;letter-spacing:-.06em;margin:16px 0 0}}
.brc-head .lab-intro{{margin:0 0 6px;font-size:18px}}
.brc-ring{{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;background:var(--lab-surface);border-radius:999px;padding:8px;margin-bottom:56px}}
html[data-design] .mock-br-c .brc-ring a{{border-radius:999px;padding:10px 18px;font-size:15px;font-weight:500;background:var(--lab-bg)}}
html[data-design] .mock-br-c .brc-ring a:hover{{color:var(--lab-accent)}}
.brc-ring p{{margin:0;text-align:center;font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted)}}
.brc-ring p b{{display:block;font-family:var(--lab-heading);font-size:16px;color:var(--lab-text);letter-spacing:-.01em}}
.brc-dir-head{{display:flex;justify-content:space-between;align-items:baseline;gap:20px;flex-wrap:wrap;border-bottom:2px solid var(--lab-text);padding-bottom:12px}}
.mock-br-c .brc-dir-head h2{{font-size:15px;font-family:var(--lab-mono);font-weight:500;text-transform:uppercase;letter-spacing:.1em}}
.brc-flag{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent);background:color-mix(in srgb,var(--lab-accent) 14%,transparent);border-radius:6px;padding:4px 10px;margin:0}}
.brc-dir{{columns:2;column-gap:64px;padding-top:28px}}
.brc-group{{break-inside:avoid;margin-bottom:34px}}
.brc-group h2{{display:flex;justify-content:space-between;align-items:baseline;font-size:22px;letter-spacing:-.025em;padding-bottom:8px;border-bottom:1px solid var(--lab-rule)}}
.brc-group h2 small{{font-family:var(--lab-mono);font-size:12px;font-weight:400;color:var(--lab-muted)}}
.brc-group ul{{list-style:none;margin:0;padding:0}}
.brc-group li{{padding:11px 0 9px;border-bottom:1px dotted var(--lab-rule)}}
.brc-line{{display:flex;align-items:baseline;gap:8px}}
.brc-line a:first-child{{font-weight:500;font-size:17px}}
.brc-line a:first-child:hover{{color:var(--lab-accent)}}
.brc-line i{{flex:1;border-bottom:2px dotted color-mix(in srgb,var(--lab-muted) 45%,transparent);transform:translateY(-4px)}}
html[data-design] .mock-br-c .brc-feed{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent)}}
.brc-group p{{margin:2px 0 0;font-size:14px;color:var(--lab-muted)}}
.brc-foot{{display:grid;grid-template-columns:1.4fr 1fr;gap:56px;border-top:1px solid var(--lab-rule);padding-top:36px;margin-top:12px}}
.brc-foot h2{{font-size:22px;letter-spacing:-.025em;margin:10px 0 10px}}
.brc-foot p{{color:var(--lab-muted);margin:0 0 14px;line-height:1.6}}
.brc-88s{{display:flex;flex-wrap:wrap;gap:8px}}
.brc-88{{width:88px;height:31px;display:grid;place-items:center;border:1.5px dashed var(--lab-rule);font-family:var(--lab-mono);font-size:10px;color:var(--lab-muted)}}
.brc-foot .lab-home-links{{margin-top:4px}}
@media (max-width:860px){{.brc-head,.brc-foot{{grid-template-columns:1fr;gap:24px}}.brc-dir{{columns:1}}}}
@media (max-width:520px){{.brc-ring{{grid-template-columns:1fr 1fr;border-radius:24px}}.brc-ring p{{grid-column:1/-1;grid-row:1;padding:8px 0 2px}}html[data-design] .mock-br-c .brc-ring a{{text-align:center}}.brc-ring{{margin-bottom:40px}}}}
</style>
<header class=brc-head><div><p class=lab-eyebrow>Blogroll / links</p><h1>The neighbourhood.</h1></div><p class=lab-intro>A directory of small, personal sites in the same corner of the web: people writing about Go, Nix, Neovim and running their own servers.</p></header>
<nav class=brc-ring aria-label="Webring"><a href=#example>← [prev site]</a><p><b>[webring name]</b>a webring placeholder</p><a href=#example>[next site] →</a></nav>
<div class=brc-dir-head><h2>Directory &middot; by topic</h2><p class=brc-flag role=note>{EXAMPLE_NOTE}</p></div>
<div class=brc-dir>{groups}</div>
<section class=brc-foot aria-label="Badges and export">
<div><p class=lab-eyebrow>Buttons</p><h2>The old-web wall</h2><p>Many personal sites offer an 88×31 badge. A row of them would sit here, each linking to its site.</p><div class=brc-88s>{buttons}</div></div>
<div><p class=lab-eyebrow>Export</p><h2>One file, every feed</h2><p>An OPML download could export this whole list so any feed reader can import it at once.</p><div class=lab-home-links><a href=#opml>[blogroll.opml]</a><a href=/subscribe/>This site's feeds ↗</a></div></div>
</section>
</div>"""
write("blogroll","c","Blogroll",body)
