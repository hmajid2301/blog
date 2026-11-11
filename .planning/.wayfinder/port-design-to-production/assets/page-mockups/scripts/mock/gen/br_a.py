import sys; sys.path.insert(0,'/tmp/mock')
from gen_shared import *
nav = "".join(f"<a href=#bra-{c.lower()}>{c}</a>" for c,_ in BR_CATS)
def entry():
    return f"""<li><div><h3><a href=#example>{BR_NAME}</a> <span class=bra-url>{BR_URL}</span></h3><p>{BR_NOTE}</p></div><a class=bra-feed href=#example aria-label="RSS feed for {BR_NAME}">{BR_FEED}</a></li>"""
secs = "".join(f"""<section class=bra-group id=bra-{c.lower()} aria-labelledby=bra-h-{c.lower()}><header><h2 id=bra-h-{c.lower()}>{c}</h2><small>{n} blogs</small></header><ul>{"".join(entry() for _ in range(n))}</ul></section>""" for c,n in BR_CATS)
body = f"""<div class=mock-br-a data-mock-wide>
<style>
{WIDE}
.mock-br-a{{font-family:var(--lab-body);color:var(--lab-text);max-width:1000px;margin:0 auto}}
.mock-br-a a{{color:inherit;text-decoration:none}}
.mock-br-a h1,.mock-br-a h2,.mock-br-a h3{{font-family:var(--lab-heading);font-weight:700;color:var(--lab-text);margin:0}}
.mock-br-a :focus-visible{{outline:2px solid var(--lab-accent);outline-offset:3px}}
.bra-head{{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:56px;align-items:end;padding:24px 0 40px;border-bottom:1px solid var(--lab-rule)}}
.bra-head h1{{font-size:clamp(44px,6vw,76px);line-height:1;letter-spacing:-.055em;margin:16px 0 22px}}
.bra-head .lab-intro{{margin:0;font-size:19px;max-width:48ch}}
.bra-note{{background:color-mix(in srgb,var(--lab-accent) 12%,transparent);border-radius:20px;padding:20px 22px}}
.bra-note strong{{display:block;font-family:var(--lab-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--lab-accent);font-weight:500}}
.bra-note p{{margin:8px 0 0;font-size:15px;line-height:1.55}}
html[data-design] .bra-nav{{display:flex;flex-wrap:wrap;gap:10px;margin:28px 0 8px}}
html[data-design] .mock-br-a .bra-nav a{{border:1px solid var(--lab-rule);border-radius:999px;padding:6px 14px;font-size:14px}}
html[data-design] .mock-br-a .bra-nav a:hover{{border-color:var(--lab-accent);background:color-mix(in srgb,var(--lab-accent) 12%,transparent)}}
.bra-group{{display:grid;grid-template-columns:220px minmax(0,1fr);gap:40px;padding:40px 0;border-bottom:1px solid var(--lab-rule)}}
.bra-group header h2{{font-size:30px;letter-spacing:-.035em}}
.bra-group header small{{display:block;font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted);margin-top:6px}}
.bra-group ul{{list-style:none;margin:0;padding:0}}
.bra-group li{{display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:16px 0;border-top:1px solid var(--lab-rule)}}
.bra-group li:first-child{{border-top:0;padding-top:4px}}
.bra-group h3{{font-size:19px;letter-spacing:-.015em}}
.bra-group h3 a{{border-bottom:1px solid var(--lab-accent)}}
.bra-url{{font:400 12px var(--lab-mono);color:var(--lab-muted);margin-left:8px;letter-spacing:0}}
.bra-group p{{margin:6px 0 0;color:var(--lab-muted);font-size:16px}}
html[data-design] .mock-br-a .bra-feed{{flex:none;font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent)}}
.bra-feed:hover{{text-decoration:underline}}
.bra-foot{{display:grid;grid-template-columns:1fr 1fr;gap:56px;padding:44px 0 8px}}
.bra-foot h2{{font-size:24px;letter-spacing:-.03em;margin:12px 0 10px}}
.bra-foot p{{color:var(--lab-muted);margin:0 0 14px;line-height:1.6}}
.bra-foot .lab-home-links{{margin-top:6px}}
.bra-foot code{{font-family:var(--lab-mono);background:none;padding:0;font-size:13px;color:var(--lab-text)}}
@media (max-width:860px){{.bra-head,.bra-group,.bra-foot{{grid-template-columns:1fr;gap:20px}}.bra-head{{gap:28px}}}}
@media (max-width:520px){{.bra-group li{{flex-direction:column;gap:8px}}.bra-url{{display:block;margin:4px 0 0}}.bra-group{{padding:30px 0}}}}
</style>
<header class=bra-head><div><p class=page-lab-kicker>Blogroll</p><h1>Blogs worth your feed reader.</h1><p class=lab-intro>Other people's corners of the web that I read and learn from, grouped by topic. Each one has an RSS feed if you want to follow along.</p></div>
<aside class=bra-note role=note><strong>{EXAMPLE_NOTE}</strong><p>Every name, note and feed below is a placeholder showing the layout. Nothing here is a real recommendation yet.</p></aside></header>
<nav class=bra-nav aria-label="Blogroll topics">{nav}</nav>
{secs}
<section class=bra-foot aria-label="Take the list with you">
<div><p class=lab-eyebrow>Take the list</p><h2>Subscribe to all of them</h2><p>An OPML file can export the whole blogroll, so a reader imports every feed in one go.</p><div class=lab-home-links><a href=#opml>[Download blogroll.opml]</a></div></div>
<div><p class=lab-eyebrow>And this blog</p><h2>Add me to yours</h2><p>The feed for this site is <code>haseebmajid.dev/index.xml</code>. More options on the subscribe page.</p><div class=lab-home-links><a href=/subscribe/>Subscribe ↗</a></div></div>
</section>
</div>"""
write("blogroll","a","Blogroll",body)
