from lib import *
N=len(til)
def card(p,i):
    tg=''.join(f'<li>{t}</li>' for t in ntags(p)[:3])
    return f'''<article class="tilb-card"><p class="tilb-meta"><span>TIL #{N-i:03d}</span><time datetime="{p['date']}">{fmt(p['date'])}</time></p><h3><a href="{url(p)}">{ttl(p)}</a></h3>{f'<ul class="tilb-tags" aria-label="Tags">{tg}</ul>' if tg else ''}</article>'''
years=collections.OrderedDict()
for i,p in enumerate(til[1:],1): years.setdefault(p['date'][:4],[]).append((i,p))
items=''.join(f'<section class="tilb-ysec" aria-labelledby="by{y}"><header class="tilb-year"><h2 id="by{y}">{y}</h2><p>{len(v)} {"note" if len(v)==1 else "notes"}</p></header><div class="tilb-wall">{"".join(card(p,i) for i,p in v)}</div></section>' for y,v in years.items())
cur=None
yc=collections.Counter(p['date'][:4] for p in til)
for i,p in []:
    y=p['date'][:4]
    if y!=cur:
        cur=y;items+=f'<div class="tilb-year" role="presentation"><h2>{y}</h2><p>{yc[y]} {"note" if yc[y]==1 else "notes"}</p></div>'
    items+=card(p,i)
L=til[0]
body=f'''<style>
html .mock-til-b{{max-width:1100px;margin:0 auto}}
html .mock-til-b .tilb-head{{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:end;padding:20px 0 40px;border-bottom:1px solid var(--lab-rule)}}
html .mock-til-b .tilb-head h1{{font-size:clamp(48px,7.4vw,96px);font-weight:700;letter-spacing:-.06em;line-height:.95;margin:16px 0 0}}
html .mock-til-b .tilb-head h1 em{{font-style:normal;color:var(--lab-accent)}}
html .mock-til-b .tilb-head .lab-intro{{font-size:18px;margin:0}}
html .mock-til-b .tilb-lead{{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:32px;align-items:center;margin:40px 0 36px;padding:36px 40px;border-radius:28px;background:color-mix(in srgb,var(--lab-accent) 13%,var(--lab-surface))}}
html .mock-til-b .tilb-lead .tilb-big{{font:700 88px/0.8 var(--lab-heading);letter-spacing:-.06em;color:var(--lab-accent)}}
html .mock-til-b .tilb-lead h2{{font-size:clamp(26px,3vw,38px);font-weight:700;letter-spacing:-.04em;margin:10px 0 0;line-height:1.1}}
html .mock-til-b .tilb-lead a{{color:var(--lab-text);text-decoration:none}}
html .mock-til-b .tilb-lead a::after{{content:"";position:absolute;inset:0;border-radius:inherit}}
html .mock-til-b .tilb-lead:hover h2 a{{color:var(--lab-accent)}}
html .mock-til-b .tilb-lead .tilb-go{{font:13px var(--lab-mono);color:var(--lab-accent);white-space:nowrap}}
html .mock-til-b .tilb-wall{{columns:3 300px;column-gap:18px}}
html .mock-til-b .tilb-card{{break-inside:avoid;margin:0 0 18px;border-radius:22px}}
html .mock-til-b .tilb-card{{position:relative;background:var(--lab-surface);padding:22px 24px 20px;border:1px solid transparent;transition:transform .35s cubic-bezier(.16,1,.3,1),border-color .2s}}
html .mock-til-b .tilb-card:hover{{transform:translateY(-3px);border-color:color-mix(in srgb,var(--lab-accent) 45%,transparent)}}
html .mock-til-b .tilb-card:focus-within{{border-color:var(--lab-accent)}}
html .mock-til-b .tilb-meta{{display:flex;justify-content:space-between;gap:12px;font:11px/1 var(--lab-mono);letter-spacing:.06em;color:var(--lab-muted);margin:0 0 14px;text-transform:uppercase}}
html .mock-til-b .tilb-meta span{{color:var(--lab-accent)}}
html .mock-til-b .tilb-card h3{{font-size:21px;font-weight:600;line-height:1.22;letter-spacing:-.025em;margin:0}}
html .mock-til-b .tilb-card h3 a{{color:var(--lab-text);text-decoration:none;outline:none}}
html .mock-til-b .tilb-card h3 a::after{{content:"";position:absolute;inset:0;border-radius:inherit}}
html .mock-til-b .tilb-card:hover h3 a{{color:var(--lab-accent)}}
html .mock-til-b .tilb-card code{{font:.82em var(--lab-mono);background:color-mix(in srgb,var(--lab-accent) 12%,transparent);padding:1px 5px;border-radius:5px}}
html .mock-til-b .tilb-tags{{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:18px 0 0;padding:0}}
html .mock-til-b .tilb-tags li{{font:11px/1 var(--lab-mono);padding:6px 9px;border-radius:999px;background:var(--lab-bg);color:var(--lab-muted)}}
html .mock-til-b .tilb-ysec{{margin-top:22px}}
html .mock-til-b .tilb-year{{display:flex;align-items:baseline;gap:18px;margin:0 0 20px}}
html .mock-til-b .tilb-year::after{{content:"";flex:1;border-top:1px solid var(--lab-rule);transform:translateY(-8px);order:1}}
html .mock-til-b .tilb-year p{{order:2}}
html .mock-til-b .tilb-year h2{{font-size:46px;font-weight:700;letter-spacing:-.05em;margin:0;line-height:1}}
html .mock-til-b .tilb-year p{{font:11px var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-muted);margin:0}}
@media (max-width:760px){{
 html .mock-til-b .tilb-head{{grid-template-columns:1fr;gap:20px;padding-top:6px}}
 html .mock-til-b .tilb-lead{{grid-template-columns:1fr;gap:14px;padding:26px 22px;margin:28px 0 24px;border-radius:22px}}
 html .mock-til-b .tilb-lead .tilb-big{{font-size:56px}}
 html .mock-til-b .tilb-wall{{columns:1}}
 html .mock-til-b .tilb-year h2{{font-size:36px}}
}}
</style>
<div class="mock-til-b">
<header class="tilb-head"><div><p class="lab-eyebrow">Today I learned</p><h1>{N} things<br>I <em>didn't know</em><br>yesterday.</h1></div><p class="lab-intro">Bite-sized notes, usually one problem and one fix. Mostly Nix, Neovim and CI, written the day I hit them.</p></header>
<article class="tilb-lead"><span class="tilb-big" aria-hidden="true">№{N:03d}</span><div><p class="lab-eyebrow">Newest / {fmt(L['date'])}</p><h2><a href="{url(L)}">{ttl(L)}</a></h2></div><span class="tilb-go" aria-hidden="true">Read it →</span></article>
{items}
</div>'''
write('til','b','TIL',body)
