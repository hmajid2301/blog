import sys; sys.path.insert(0,'/tmp/mock')
from gen_shared import *
def row(name, path, meta, note=""):
    return f"""<li><div class=sb-name><a href={path}>{name}</a>{f'<small>{note}</small>' if note else ''}</div><code>{path}</code><span class=sb-meta>{meta}</span><button type=button class=sb-copy data-copy="{SITE}{path}" aria-label="Copy {name} feed URL">Copy</button></li>"""
main = row("Everything","/index.xml","225 posts","The one to pick if unsure") + row("Talks","/talks/index.xml","10 talks","Conference and meetup talks, with slides") + row("Posts","/posts/index.xml","225 posts","Same as everything, today")
topics = "".join(row(l, f"/tags/{s}/index.xml", f"{c} posts") for s,l,c in TOPICS)
socials = "".join(f"<li><a href={u} rel=me>{n}</a><span>{h}</span></li>" for n,h,u in SOCIALS)
body = f"""<div class=mock-sub-b data-mock-wide>
<style>
{WIDE}
.mock-sub-b{{font-family:var(--lab-body);color:var(--lab-text);max-width:1000px;margin:0 auto}}
.mock-sub-b a{{color:inherit;text-decoration:none}}
.mock-sub-b h1,.mock-sub-b h2{{font-family:var(--lab-heading);font-weight:700;color:var(--lab-text);margin:0}}
.mock-sub-b code{{font-family:var(--lab-mono);background:none;padding:0}}
.mock-sub-b :focus-visible{{outline:2px solid var(--lab-accent);outline-offset:3px}}
.sb-head{{padding:24px 0 44px;border-bottom:1px solid var(--lab-rule);display:grid;grid-template-columns:220px minmax(0,1fr);gap:40px}}
.sb-head .page-lab-kicker{{margin:14px 0 0}}
.sb-head h1{{font-size:clamp(44px,6vw,76px);line-height:1;letter-spacing:-.055em}}
.sb-head p.sb-lede{{font-size:20px;line-height:1.65;color:var(--lab-muted);max-width:52ch;margin:24px 0 0}}
.sb-sec{{display:grid;grid-template-columns:220px minmax(0,1fr);gap:40px;padding:44px 0;border-bottom:1px solid var(--lab-rule)}}
.sb-sec>header{{align-self:start;position:sticky;top:90px}}
.sb-sec>header span{{display:block;font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent);margin-bottom:8px}}
.sb-sec h2{{font-size:24px;letter-spacing:-.03em}}
.sb-sec>header p{{color:var(--lab-muted);font-size:15px;line-height:1.55;margin:10px 0 0}}
.sb-list{{list-style:none;margin:0;padding:0}}
.sb-list li{{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) 90px 64px;gap:16px;align-items:baseline;padding:15px 0;border-top:1px solid var(--lab-rule)}}
.sb-list li:first-child{{border-top:0;padding-top:0}}
.sb-name a{{font-weight:500;font-size:17px;border-bottom:1px solid var(--lab-accent)}}
.sb-name small{{display:block;color:var(--lab-muted);font-size:14px;margin-top:5px}}
.sb-list code{{font-size:13px;color:var(--lab-muted)}}
.sb-meta{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted);text-align:right}}
.sb-copy{{justify-self:end;font:500 12px var(--lab-mono);background:none;border:0;color:var(--lab-accent);cursor:pointer;padding:2px 0;border-bottom:1px dashed var(--lab-accent)}}
.sb-copy:hover,.sb-copy[data-state]{{border-bottom-style:solid}}
.sb-topics li{{padding:11px 0}}
.sb-topics .sb-name a{{font-size:16px}}
.sb-social{{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:12px 36px}}
.sb-social li{{display:flex;flex-direction:column;gap:4px}}
.sb-social a{{font-weight:500;font-size:17px;border-bottom:1px solid var(--lab-accent);align-self:flex-start}}
.sb-social span{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted)}}
.sb-steps{{margin:0;padding:0;list-style:none;counter-reset:s}}
.sb-steps li{{counter-increment:s;display:grid;grid-template-columns:36px 1fr;padding:0 0 14px;font-size:17px;line-height:1.6}}
.sb-steps li::before{{content:counter(s,decimal-leading-zero);font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent);padding-top:5px}}
.sb-readers{{margin:12px 0 0;color:var(--lab-muted);font-size:16px;line-height:1.7;border-left:2px solid var(--lab-accent);padding-left:16px}}
.sb-readers b{{color:var(--lab-text);font-weight:500}}
@media (max-width:860px){{.sb-head,.sb-sec{{grid-template-columns:1fr;gap:18px}}.sb-sec>header{{position:static}}.sb-head{{gap:6px}}}}
@media (max-width:600px){{.sb-list li{{grid-template-columns:minmax(0,1fr) auto;gap:6px 12px}}.sb-list code{{grid-column:1;grid-row:2;font-size:12px;word-break:break-all}}.sb-meta{{grid-column:2;grid-row:1}}.sb-copy{{grid-column:2;grid-row:2}}.sb-head p.sb-lede{{font-size:18px}}.sb-sec{{padding:34px 0}}}}
</style>
<header class=sb-head><p class=page-lab-kicker>Subscribe</p><div><h1>Read it wherever you read.</h1><p class=sb-lede>{RSS_LINE}</p></div></header>
<section class=sb-sec aria-labelledby=sb-feeds><header><span>01</span><h2 id=sb-feeds>Feeds</h2><p>Paste one URL into your reader.</p></header><ul class=sb-list>{main}</ul></section>
<section class=sb-sec aria-labelledby=sb-topics><header><span>02</span><h2 id=sb-topics>By topic</h2><p>Only care about Nix, or only Neovim? Every tag has a feed. <a href=/tags/ style="border-bottom:1px solid var(--lab-accent)">All topics</a></p></header><ul class="sb-list sb-topics">{topics}</ul></section>
<section class=sb-sec aria-labelledby=sb-else><header><span>03</span><h2 id=sb-else>Elsewhere</h2><p>Shorter thoughts, videos and code.</p></header><ul class=sb-social>{socials}</ul></section>
<section class=sb-sec aria-labelledby=sb-how><header><span>04</span><h2 id=sb-how>New to RSS?</h2><p>Two minutes, once.</p></header><div>
<ol class=sb-steps><li>Install a feed reader (most are free).</li><li>Copy a feed URL from this page and add it as a subscription.</li><li>New posts appear in the reader, in order, until you unsubscribe.</li></ol>
<p class=sb-readers>Readers people often use: <b>NetNewsWire</b> on Mac and iOS, <b>Feedly</b> or <b>Inoreader</b> in the browser, <b>Miniflux</b> if you self-host, and <b>Newsboat</b> in a terminal.</p></div></section>
{COPY_JS}
</div>"""
write("subscribe","b","Subscribe",body)
