import sys; sys.path.insert(0,'/tmp/mock')
from gen_shared import *
mx = max(c for _,_,c in TOPICS)
tiles = "".join(f"""<li class=sa-topic><div class=sa-topic-top><h3><a href=/tags/{s}/>{l}</a></h3><span>{c} posts</span></div>
<div class=sa-bar aria-hidden=true><i style="width:{round(c/mx*100)}%"></i></div>
<div class=sa-topic-foot><a href=/tags/{s}/index.xml aria-label="{l} RSS feed">Feed ↗</a><button type=button class=sa-copy data-copy="{SITE}/tags/{s}/index.xml" aria-label="Copy {l} feed URL" title="{SITE}/tags/{s}/index.xml">Copy URL</button></div></li>""" for s,l,c in TOPICS)
socials = "".join(f"<li><a href={u} rel=me>{n}</a><span>{h}</span></li>" for n,h,u in SOCIALS)
body = f"""<div class=mock-sub-a data-mock-wide>
<style>
{WIDE}
.mock-sub-a{{font-family:var(--lab-body);color:var(--lab-text)}}
.mock-sub-a a{{color:inherit;text-decoration:none}}
.mock-sub-a h1,.mock-sub-a h2,.mock-sub-a h3{{font-family:var(--lab-heading);font-weight:700;color:var(--lab-text);margin:0}}
.mock-sub-a code{{font-family:var(--lab-mono);background:none;padding:0;color:inherit}}
.sa-hero{{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:48px;align-items:end;background:var(--lab-surface);border-radius:24px;padding:48px}}
.sa-hero h1{{font-size:clamp(40px,5.2vw,68px);line-height:1.04;letter-spacing:-.05em;margin:20px 0 22px}}
.sa-hero h1 span{{color:var(--lab-muted)}}
.sa-hero .lab-intro{{margin:0;font-size:19px}}
.sa-feed{{background:var(--lab-bg);border-radius:20px;padding:26px}}
.sa-feed-label{{display:flex;justify-content:space-between;gap:12px;font-family:var(--lab-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--lab-muted)}}
.sa-feed-label b{{color:var(--lab-accent);font-weight:500}}
.sa-url{{display:block;margin:14px 0 20px;font-size:clamp(17px,1.8vw,22px);word-break:break-all}}
.sa-url span{{color:var(--lab-muted)}}
.sa-actions{{display:flex;flex-wrap:wrap;gap:10px}}
html[data-design] .mock-sub-a .sa-btn{{display:inline-flex;align-items:center;font:500 14px var(--lab-body);border-radius:999px;padding:10px 18px;cursor:pointer;border:1px solid var(--lab-accent);transition:background-color .2s cubic-bezier(.25,1,.5,1)}}
.sa-btn-primary{{background:var(--lab-accent);color:var(--lab-bg)}}
.sa-btn-primary:hover{{background:color-mix(in srgb,var(--lab-accent) 85%,var(--lab-text))}}
.sa-btn-ghost{{background:transparent;color:var(--lab-text);border-color:var(--lab-rule)}}
.sa-btn-ghost:hover{{border-color:var(--lab-accent)}}
.sa-also{{margin-top:18px;padding-top:16px;border-top:1px solid var(--lab-rule);display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:15px}}
.sa-also a{{border-bottom:1px solid var(--lab-accent)}}
.sa-also code{{font-size:13px;color:var(--lab-muted)}}
.sa-section{{margin-top:72px}}
.sa-section .lab-section-head h2{{font-size:clamp(28px,3vw,36px);letter-spacing:-.03em}}
.sa-section .lab-section-head a{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent)}}
.sa-section-lede{{color:var(--lab-muted);margin:14px 0 0;max-width:60ch}}
.sa-topics{{list-style:none;padding:0;margin:28px 0 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}}
.sa-topic{{border:1px solid var(--lab-rule);border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:14px;transition:border-color .2s}}
.sa-topic:hover{{border-color:var(--lab-accent)}}
.sa-topic-top{{display:flex;justify-content:space-between;align-items:baseline;gap:8px}}
.sa-topic h3{{font-size:19px;letter-spacing:-.02em}}
.sa-topic-top span{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted);white-space:nowrap}}
.sa-bar{{height:4px;border-radius:4px;background:color-mix(in srgb,var(--lab-accent) 15%,transparent)}}
.sa-bar i{{display:block;height:100%;border-radius:4px;background:var(--lab-accent)}}
.sa-topic-foot{{display:flex;justify-content:space-between;align-items:center;gap:8px}}
.sa-topic-foot a{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted)}}.sa-topic-foot a:hover{{color:var(--lab-accent)}}
.sa-copy{{font:500 12px var(--lab-mono);background:none;color:var(--lab-accent);border:1px solid color-mix(in srgb,var(--lab-accent) 40%,transparent);border-radius:999px;padding:4px 11px;cursor:pointer;flex:none}}
.sa-copy:hover,.sa-copy[data-state]{{background:color-mix(in srgb,var(--lab-accent) 15%,transparent)}}
.mock-sub-a :focus-visible{{outline:2px solid var(--lab-accent);outline-offset:3px}}
.sa-bottom{{display:grid;grid-template-columns:1.3fr 1fr;gap:56px;margin-top:72px;padding-top:36px;border-top:1px solid var(--lab-rule)}}
.sa-bottom h2{{font-size:26px;letter-spacing:-.03em;margin:12px 0 18px}}
.sa-social{{list-style:none;padding:0;margin:0}}
.sa-social li{{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--lab-rule)}}
.sa-social a{{font-weight:500;border-bottom:1px solid var(--lab-accent)}}
.sa-social span{{font-family:var(--lab-mono);font-size:13px;color:var(--lab-muted)}}
.sa-placeholder{{border:1.5px dashed var(--lab-rule);border-radius:20px;padding:24px;color:var(--lab-muted)}}
.sa-placeholder p{{margin:10px 0 0;font-size:15px}}
@media (max-width:860px){{.sa-hero{{grid-template-columns:1fr;padding:28px 22px;gap:28px}}.sa-bottom{{grid-template-columns:1fr;gap:40px}}.sa-section{{margin-top:52px}}}}
@media (max-width:480px){{.sa-feed{{padding:20px}}.sa-also{{flex-direction:column;align-items:flex-start}}.sa-topics{{grid-template-columns:1fr 1fr;gap:10px}}.sa-topic{{padding:16px;border-radius:16px}}.sa-topic-top{{flex-direction:column;gap:2px}}.sa-topic h3{{font-size:18px}}.sa-topic-foot a{{display:none}}.sa-url{{font-size:16px}}.sa-section .lab-section-head{{flex-wrap:wrap}}}}
</style>
<section class=sa-hero aria-labelledby=sa-title>
<div><p class=lab-eyebrow>Subscribe / RSS feeds</p>
<h1 id=sa-title>New posts, delivered.<br><span>No algorithm.</span></h1>
<p class=lab-intro>{RSS_LINE}</p></div>
<div class=sa-feed>
<div class=sa-feed-label><span>The main feed</span><b>All 225 posts</b></div>
<code class=sa-url><span>haseebmajid.dev</span>/index.xml</code>
<div class=sa-actions><button type=button class="sa-btn sa-btn-primary" data-copy="{SITE}/index.xml">Copy feed URL</button><a class="sa-btn sa-btn-ghost" href=/index.xml>Open feed ↗</a></div>
<div class=sa-also><span>Just the <a href=/talks/>talks</a>? <code>/talks/index.xml</code></span><button type=button class=sa-copy data-copy="{SITE}/talks/index.xml" aria-label="Copy talks feed URL">Copy</button></div>
</div>
</section>
<section class=sa-section aria-labelledby=sa-topics>
<div class=lab-section-head><h2 id=sa-topics>Just one topic?</h2><a href=/tags/>All topics ↗</a></div>
<p class=sa-section-lede>Every tag has its own feed. These are the ten I write about most; the bar shows how much there already is to catch up on.</p>
<ul class=sa-topics>{tiles}</ul>
</section>
<section class=sa-bottom aria-label="Other ways to follow">
<div><p class=lab-eyebrow>Follow along</p><h2>Elsewhere on the web</h2><ul class=sa-social>{socials}</ul></div>
<div><p class=lab-eyebrow>Email</p><h2>By email</h2><div class=sa-placeholder><code>[newsletter? — not set up]</code><p>Placeholder only. There is no newsletter today; RSS is the way to get every post.</p></div></div>
</section>
{COPY_JS}
</div>"""
write("subscribe","a","Subscribe",body)
