import sys; sys.path.insert(0,'/tmp/mock')
from gen_shared import *
BR_CATS=[('Go',3),('Nix',3),('Neovim',2),('Homelab',2),('Engineering',2)]
chips = '<button type=button aria-pressed=true data-f=all>All <span>12</span></button>' + "".join(f'<button type=button aria-pressed=false data-f="{c}">{c} <span>{n}</span></button>' for c,n in BR_CATS)
cards = "".join(f"""<li class=brb-card data-cat="{c}"><div class=brb-top><span class=brb-fav aria-hidden=true>{c[0]}</span><span class=brb-cat>{c}</span></div>
<h3><a href=#example>{BR_NAME}</a></h3><p class=brb-url>{BR_URL}</p><p class=brb-note>{BR_NOTE}</p>
<p class=brb-latest><span>Latest</span>{BR_LATEST} <time>[date]</time></p>
<div class=brb-links><a href=#example>Visit ↗</a><a href=#example aria-label="RSS feed for {BR_NAME}">{BR_FEED}</a></div></li>""" for c,n in BR_CATS for _ in range(n))
body = f"""<div class=mock-br-b data-mock-wide>
<style>
{WIDE}
.mock-br-b{{font-family:var(--lab-body);color:var(--lab-text)}}
.mock-br-b a{{color:inherit;text-decoration:none}}
.mock-br-b h1,.mock-br-b h2,.mock-br-b h3{{font-family:var(--lab-heading);font-weight:700;color:var(--lab-text);margin:0}}
.mock-br-b :focus-visible{{outline:2px solid var(--lab-accent);outline-offset:3px}}
.brb-hero{{background:var(--lab-surface);border-radius:28px;padding:48px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:end}}
.brb-hero h1{{font-size:clamp(42px,5.6vw,72px);line-height:1.02;letter-spacing:-.055em;margin:18px 0 20px}}
.brb-hero .lab-intro{{margin:0;font-size:19px;max-width:50ch}}
.brb-hero-side{{display:flex;flex-direction:column;align-items:flex-start;gap:12px;font-size:14px;color:var(--lab-muted);max-width:240px}}
html[data-design] .mock-br-b .brb-opml{{display:inline-flex;gap:8px;align-items:center;background:var(--lab-accent);color:var(--lab-bg);border-radius:999px;padding:11px 20px;font-weight:500;font-size:15px}}
.brb-bar{{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;margin:40px 0 20px}}
.brb-chips{{display:flex;flex-wrap:wrap;gap:8px}}
.brb-chips button{{font:500 14px var(--lab-body);color:var(--lab-text);background:none;border:1px solid var(--lab-rule);border-radius:999px;padding:7px 14px;cursor:pointer}}
.brb-chips button span{{font-family:var(--lab-mono);font-size:11px;color:var(--lab-muted);margin-left:4px}}
.brb-chips button:hover{{border-color:var(--lab-accent)}}
.brb-chips button[aria-pressed=true]{{background:var(--lab-text);color:var(--lab-bg);border-color:var(--lab-text)}}
.brb-chips button[aria-pressed=true] span{{color:inherit;opacity:.7}}
.brb-example{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent);border:1.5px dashed color-mix(in srgb,var(--lab-accent) 50%,transparent);border-radius:999px;padding:6px 14px}}
.brb-grid{{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}}
.brb-card{{border:1px solid var(--lab-rule);border-radius:22px;padding:22px;display:flex;flex-direction:column;transition:border-color .2s cubic-bezier(.25,1,.5,1)}}
.brb-card:hover{{border-color:var(--lab-accent)}}
.brb-card[hidden]{{display:none}}
.brb-top{{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}}
.brb-fav{{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--lab-accent) 15%,transparent);color:var(--lab-accent);font:700 16px var(--lab-heading);border:1.5px dashed color-mix(in srgb,var(--lab-accent) 45%,transparent)}}
.brb-cat{{font-family:var(--lab-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--lab-muted)}}
.brb-card h3{{font-size:21px;letter-spacing:-.02em}}
.brb-url{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-muted);margin:4px 0 12px}}
.brb-note{{margin:0 0 18px;line-height:1.55;font-size:16px}}
.brb-latest{{margin:auto 0 0;padding-top:14px;border-top:1px solid var(--lab-rule);font-size:14px;color:var(--lab-muted);line-height:1.5}}
.brb-latest span{{display:block;font-family:var(--lab-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--lab-accent);margin-bottom:3px}}
.brb-latest time{{font-family:var(--lab-mono);font-size:12px}}
.brb-links{{display:flex;gap:18px;margin-top:16px;font-size:14px}}
html[data-design] .mock-br-b .brb-links a{{border-bottom:1px solid var(--lab-accent);padding-bottom:2px}}
html[data-design] .mock-br-b .brb-links a+a{{font-family:var(--lab-mono);font-size:12px;color:var(--lab-accent);border:0}}
@media (max-width:960px){{.brb-grid{{grid-template-columns:repeat(2,minmax(0,1fr))}}.brb-hero{{grid-template-columns:1fr;padding:32px 26px}}.brb-hero-side{{max-width:none}}}}
@media (max-width:560px){{.brb-grid{{grid-template-columns:1fr}}.brb-hero{{padding:28px 22px;border-radius:24px}}.brb-chips{{flex-wrap:nowrap;overflow-x:auto;margin:0 -12px;padding:2px 12px}}.brb-chips button{{flex:none}}.brb-bar{{margin-top:30px}}}}
</style>
<section class=brb-hero aria-labelledby=brb-title><div><p class=lab-eyebrow>Blogroll / sites I read</p><h1 id=brb-title>Other people<br>worth reading.</h1><p class=lab-intro>Personal sites I keep coming back to for Go, Nix, Neovim and homelab ideas, each with a feed you can follow too.</p></div>
<div class=brb-hero-side><a class=brb-opml href=#opml>[Download OPML]</a><span>An OPML export of this list lets you add every feed to a reader in one go.</span></div></section>
<div class=brb-bar><div class=brb-chips role=group aria-label="Filter by topic">{chips}</div><p class=brb-example role=note>{EXAMPLE_NOTE}</p></div>
<ul class=brb-grid>{cards}</ul>
<script>
(function(){{var bs=document.querySelectorAll('.brb-chips button'),cs=document.querySelectorAll('.brb-card');
bs.forEach(function(b){{b.addEventListener('click',function(){{var f=b.dataset.f;bs.forEach(function(x){{x.setAttribute('aria-pressed',x===b)}});
cs.forEach(function(c){{c.hidden=!(f==='all'||c.dataset.cat===f)}})}})}})}})();
</script>
</div>"""
write("blogroll","b","Blogroll",body)
