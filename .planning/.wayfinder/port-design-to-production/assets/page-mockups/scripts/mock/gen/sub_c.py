import sys; sys.path.insert(0,'/tmp/mock')
from gen_shared import *
def cmd(path, label):
    return f"""<div class=sc-cmd><code><span class=sc-p>$</span> curl {SITE}<b>{path}</b></code><button type=button class=sc-copy data-copy="{SITE}{path}" aria-label="Copy {label} feed URL">copy</button></div>"""
topics = "".join(f"""<li><span class=sc-n>{c:>2}</span><a href=/tags/{s}/index.xml>tags/<b>{s}</b>/index.xml</a><button type=button class=sc-copy data-copy="{SITE}/tags/{s}/index.xml" aria-label="Copy {l} feed URL">copy</button></li>""" for s,l,c in TOPICS)
outl = "\n".join(f'    &lt;outline type="rss" text="{l}" xmlUrl="{SITE}/tags/{s}/index.xml"/&gt;' for s,l,c in TOPICS[:3])
socials = "".join(f"<li><a href={u} rel=me>{n}</a> <span>{h}</span></li>" for n,h,u in SOCIALS)
body = f"""<div class=mock-sub-c data-mock-wide>
<style>
{WIDE}
.mock-sub-c{{font-family:var(--lab-body);color:var(--lab-text)}}
.mock-sub-c a{{color:inherit;text-decoration:none}}
.mock-sub-c h1,.mock-sub-c h2,.mock-sub-c h3{{font-family:var(--lab-heading);font-weight:700;color:var(--lab-text);margin:0}}
.mock-sub-c code,.mock-sub-c pre{{font-family:var(--lab-mono);background:none;padding:0;margin:0;color:inherit;border:0}}
.mock-sub-c :focus-visible{{outline:2px solid var(--lab-accent);outline-offset:2px}}
.sc-head{{display:flex;justify-content:space-between;align-items:end;gap:40px;padding:20px 0 40px}}
.sc-head h1{{font-size:clamp(42px,5.6vw,72px);line-height:1.02;letter-spacing:-.055em;margin-top:18px}}
.sc-head .lab-intro{{margin:0;font-size:18px;max-width:40ch}}
.sc-grid>*{{min-width:0}}.mock-sub-c pre,.mock-sub-c code{{font-variant-ligatures:none}}.sc-grid{{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:48px;align-items:start}}
.sc-term{{background:var(--lab-surface);border-radius:24px;overflow:hidden;font-family:var(--lab-mono);font-size:14px}}
.sc-bar{{display:flex;justify-content:space-between;gap:12px;padding:14px 24px;border-bottom:1px solid var(--lab-rule);font-size:12px;color:var(--lab-muted)}}
.sc-bar b{{color:var(--lab-accent);font-weight:500}}
.sc-body{{padding:24px 24px 28px}}
.sc-c{{color:var(--lab-muted);margin:0 0 8px}}
.sc-c+.sc-cmd{{margin-bottom:22px}}
.sc-cmd{{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:10px 14px;margin:0 -14px;border-radius:12px}}
.sc-cmd:hover{{background:color-mix(in srgb,var(--lab-accent) 8%,transparent)}}
.sc-cmd code{{font-size:15px;overflow-wrap:anywhere}}
.sc-cmd b,.sc-topics b{{color:var(--lab-accent);font-weight:500}}
.sc-p{{color:var(--lab-accent);user-select:none}}
.sc-copy{{flex:none;font:500 12px var(--lab-mono);color:var(--lab-muted);background:var(--lab-bg);border:1px solid var(--lab-rule);border-radius:8px;padding:4px 10px;cursor:pointer}}
.sc-copy:hover,.sc-copy[data-state]{{color:var(--lab-accent);border-color:var(--lab-accent)}}
.sc-topics{{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;column-gap:28px}}
.sc-topics{{font-size:13px}}.sc-topics li{{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:10px;align-items:center;padding:7px 0;border-bottom:1px dashed var(--lab-rule)}}
.sc-n{{color:var(--lab-muted);text-align:right;white-space:pre}}
.sc-topics a{{overflow-wrap:anywhere}}
.sc-topics a:hover{{text-decoration:underline;text-decoration-color:var(--lab-accent)}}
.sc-opml{{margin-top:20px;border:1.5px dashed var(--lab-rule);border-radius:24px;padding:24px}}
.sc-opml-head{{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap}}
.sc-opml h2{{font-size:22px;letter-spacing:-.02em}}
.sc-opml p{{color:var(--lab-muted);margin:8px 0 16px;font-size:15px}}
.sc-opml pre{{font-size:12px;line-height:1.7;color:var(--lab-muted);overflow-x:auto;white-space:pre}}
.sc-opml pre em{{font-style:normal;color:var(--lab-accent)}}
html[data-design] .mock-sub-c .sc-dl{{font:500 13px var(--lab-mono);color:var(--lab-accent);border-bottom:1px dashed var(--lab-accent)}}
.sc-aside h2{{font-size:22px;letter-spacing:-.02em;margin:10px 0 10px}}
.sc-aside p{{color:var(--lab-muted);line-height:1.65;margin:0 0 12px;font-size:16px}}
.sc-aside section+section{{margin-top:34px;padding-top:28px;border-top:1px solid var(--lab-rule)}}
.sc-aside ul{{list-style:none;padding:0;margin:0}}
.sc-aside li{{padding:9px 0;border-bottom:1px solid var(--lab-rule);display:flex;justify-content:space-between;gap:10px}}
.sc-aside li a{{font-weight:500;border-bottom:1px solid var(--lab-accent)}}
.sc-aside li span{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted)}}
.sc-aside code{{font-size:13px;color:var(--lab-text)}}
@media (max-width:900px){{.sc-grid{{grid-template-columns:1fr}}.sc-head{{flex-direction:column;align-items:start;gap:18px}}}}
@media (max-width:600px){{.sc-topics{{grid-template-columns:1fr}}.sc-body{{padding:18px}}.sc-bar{{padding:12px 18px}}.sc-cmd code{{font-size:13px}}.sc-term{{font-size:13px}}.sc-cmd{{align-items:start}}}}
</style>
<header class=sc-head><div><p class=lab-eyebrow>Subscribe / ~/feeds</p><h1>Pipe it into<br>your reader.</h1></div><p class=lab-intro>{RSS_LINE}</p></header>
<div class=sc-grid>
<div>
<section class=sc-term aria-labelledby=sc-feeds><div class=sc-bar><h2 id=sc-feeds style="font:inherit;color:inherit">~/feeds</h2><span><b>12</b> feeds &middot; plain RSS 2.0</span></div>
<div class=sc-body>
<p class=sc-c># everything I write &middot; 225 posts</p>{cmd("/index.xml","everything")}
<p class=sc-c># just the talks &middot; 10 talks, with slides</p>{cmd("/talks/index.xml","talks")}
<p class=sc-c># or one topic &middot; ls tags/ --sort=posts | head -10</p>
<ul class=sc-topics>{topics}</ul>
</div></section>
<section class=sc-opml aria-labelledby=sc-opml-t><div class=sc-opml-head><h2 id=sc-opml-t>Grab them all as OPML</h2><a class=sc-dl href=#opml>[subscriptions.opml — not generated yet]</a></div>
<p>Most readers can import an OPML file: one upload subscribes you to every feed above. Pick and choose afterwards.</p>
<pre>&lt;opml version="2.0"&gt;
  &lt;head&gt;&lt;title&gt;<em>haseebmajid.dev feeds</em>&lt;/title&gt;&lt;/head&gt;
  &lt;body&gt;
    &lt;outline type="rss" text="Everything" xmlUrl="{SITE}/index.xml"/&gt;
    &lt;outline type="rss" text="Talks" xmlUrl="{SITE}/talks/index.xml"/&gt;
{outl}
    <em>&lt;!-- …and the other 7 topics --&gt;</em>
  &lt;/body&gt;
&lt;/opml&gt;</pre></section>
</div>
<aside class=sc-aside aria-label="About RSS and other channels">
<section><p class=lab-eyebrow>What's a feed?</p><h2>Like a podcast, but posts.</h2><p>Subscribe once in a feed reader and new posts arrive there. Nothing to sign up for, and you can leave whenever you like.</p><p>Living in the terminal? <code>newsboat</code> reads these just fine.</p></section>
<section><p class=lab-eyebrow>Elsewhere</p><h2>Not a feed person?</h2><ul>{socials}</ul></section>
</aside>
</div>
{COPY_JS}
</div>"""
write("subscribe","c","Subscribe",body)
