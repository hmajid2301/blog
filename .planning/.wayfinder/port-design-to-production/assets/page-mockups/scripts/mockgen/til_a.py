from lib import *
top=[t for t,_ in tagcount.most_common(9)]
years=collections.OrderedDict()
for p in til: years.setdefault(p['date'][:4],[]).append(p)
chips=''.join(f'<button type="button" class="tila-chip" data-tag="{t}" aria-pressed="false">{t}<span>{tagcount[t]}</span></button>' for t in top)
secs=''
for y,ps in years.items():
    rows=''.join(f'''<li data-tags="{' '.join(ntags(p))}"><time datetime="{p['date']}">{fmt(p['date'],'%d %b')}</time><a href="{url(p)}">{ttl(p)}</a><span class="tila-tags">{''.join(f'<span>#{t}</span>' for t in ntags(p)[:3])}</span></li>''' for p in ps)
    secs+=f'<section class="tila-year" aria-labelledby="y{y}"><h2 id="y{y}">{y}<small><span class="tila-yc">{len(ps)}</span> {'note' if len(ps)==1 else 'notes'}</small></h2><ol>{rows}</ol></section>'
body=f'''<style>
html .mock-til-a{{max-width:1100px;margin:0 auto}}
html .mock-til-a .tila-head{{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:48px;align-items:end;background:var(--lab-surface);border-radius:26px;padding:44px 48px}}
html .mock-til-a .tila-head h1{{font-size:clamp(44px,6vw,76px);font-weight:700;letter-spacing:-.055em;line-height:1.02;margin:18px 0 20px}}
html .mock-til-a .tila-head h1 span{{color:var(--lab-muted)}}
html .mock-til-a .tila-head p.lab-intro{{font-size:19px;margin:0}}
html .mock-til-a .tila-latest{{border-left:1px solid var(--lab-rule);padding-left:24px;font-size:15px;line-height:1.5}}
html .mock-til-a .tila-latest b{{display:block;font:11px/1.6 var(--lab-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--lab-muted);font-weight:400;margin-bottom:8px}}
html .mock-til-a .tila-latest a{{font:600 18px/1.3 var(--lab-heading);letter-spacing:-.02em;color:var(--lab-text);text-decoration:underline;text-decoration-color:var(--lab-rule);text-underline-offset:4px}}
html .mock-til-a .tila-latest a:hover{{color:var(--lab-accent);text-decoration-color:currentColor}}
html .mock-til-a .tila-latest time{{display:block;margin-top:8px;font:12px var(--lab-mono);color:var(--lab-muted)}}
html .mock-til-a .tila-filter{{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:44px 0 10px;padding-bottom:22px;border-bottom:1px solid var(--lab-rule)}}
html .mock-til-a .tila-filter-label{{font:11px var(--lab-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--lab-muted);margin-right:8px;white-space:nowrap;flex:none}}
html .mock-til-a .tila-chip{{font:13px/1 var(--lab-mono);color:var(--lab-text);background:transparent;border:1px solid var(--lab-rule);border-radius:999px;padding:8px 12px;cursor:pointer;display:inline-flex;gap:8px;align-items:center}}
html .mock-til-a .tila-chip span{{color:var(--lab-muted);font-size:11px}}
html .mock-til-a .tila-chip:hover{{border-color:var(--lab-accent);color:var(--lab-accent)}}
html .mock-til-a .tila-chip[aria-pressed=true]{{background:var(--lab-accent);border-color:var(--lab-accent);color:var(--lab-bg)}}
html .mock-til-a .tila-chip[aria-pressed=true] span{{color:inherit;opacity:.75}}
html .mock-til-a .tila-chip:focus-visible{{outline:2px solid var(--lab-accent);outline-offset:3px}}
html .mock-til-a .tila-status{{font:12px var(--lab-mono);color:var(--lab-muted);margin:0 0 8px}}
html .mock-til-a .tila-year{{display:grid;grid-template-columns:150px minmax(0,1fr);gap:24px;padding:34px 0 10px}}
html .mock-til-a .tila-year h2{{font-size:34px;font-weight:700;letter-spacing:-.04em;margin:0;position:sticky;top:90px;align-self:start}}
html .mock-til-a .tila-year small{{display:block;font:11px/2 var(--lab-mono);letter-spacing:.06em;color:var(--lab-muted);font-weight:400;margin-top:4px}}
html .mock-til-a ol{{list-style:none;margin:0;padding:0}}
html .mock-til-a li{{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:18px;align-items:baseline;padding:11px 0;border-bottom:1px solid var(--lab-rule)}}
html .mock-til-a li[hidden],html .mock-til-a .tila-year[hidden]{{display:none}}
html .mock-til-a li time{{font:12px var(--lab-mono);color:var(--lab-muted)}}
html .mock-til-a li a{{color:var(--lab-text);font-size:17px;line-height:1.45;text-decoration:none;background-image:linear-gradient(currentColor,currentColor);background-size:0 1px;background-repeat:no-repeat;background-position:0 100%;transition:background-size .3s cubic-bezier(.25,1,.5,1),color .15s}}
html .mock-til-a li a:hover,html .mock-til-a li a:focus-visible{{color:var(--lab-accent);background-size:100% 1px}}
html .mock-til-a li code{{font:.86em var(--lab-mono);background:color-mix(in srgb,var(--lab-accent) 12%,transparent);padding:1px 5px;border-radius:5px}}
html .mock-til-a .tila-tags{{display:flex;gap:10px;font:12px var(--lab-mono);color:var(--lab-muted);white-space:nowrap}}
@media (max-width:760px){{
 html .mock-til-a .tila-head{{grid-template-columns:1fr;padding:28px 22px;gap:28px;border-radius:22px}}
 html .mock-til-a .tila-latest{{border-left:0;border-top:1px solid var(--lab-rule);padding:20px 0 0}}
 html .mock-til-a .tila-filter{{flex-wrap:nowrap;overflow-x:auto;margin:30px -20px 10px;padding:0 20px 18px;scrollbar-width:none}}
 html .mock-til-a .tila-chip{{flex:none}}
 html .mock-til-a .tila-year{{grid-template-columns:1fr;gap:4px;padding-top:26px}}
 html .mock-til-a .tila-year h2{{position:static;display:flex;align-items:baseline;gap:12px;font-size:28px}}
 html .mock-til-a li{{grid-template-columns:56px minmax(0,1fr);gap:4px 12px}}
 html .mock-til-a .tila-tags{{grid-column:2;flex-wrap:wrap;white-space:normal}}
}}
</style>
<div class="mock-til-a">
<header class="tila-head"><div><p class="lab-eyebrow">TIL / today I learned</p><h1>Small fixes,<br><span>written down.</span></h1><p class="lab-intro">{len(til)} short notes since {fmt(til[-1]['date'],'%B %Y')}: one-off fixes and tricks from Nix, Neovim, GitLab CI and friends, kept so nobody has to rediscover them.</p></div>
<aside class="tila-latest" aria-label="Latest note"><b>Latest note</b><a href="{url(til[0])}">{ttl(til[0])}</a><time datetime="{til[0]['date']}">{fmt(til[0]['date'])}</time></aside></header>
<div class="tila-filter" role="group" aria-label="Filter notes by topic"><span class="tila-filter-label">Filter</span><button type="button" class="tila-chip" data-tag="" aria-pressed="true">all<span>{len(til)}</span></button>{chips}</div>
<p class="tila-status" aria-live="polite">Showing all {len(til)} notes</p>
{secs}
</div>
<script>
(()=>{{const r=document.querySelector('.mock-til-a'),bs=r.querySelectorAll('.tila-chip'),st=r.querySelector('.tila-status');
bs.forEach(b=>b.addEventListener('click',()=>{{const t=b.dataset.tag;bs.forEach(x=>x.setAttribute('aria-pressed',x===b));let n=0;
r.querySelectorAll('.tila-year').forEach(s=>{{let c=0;s.querySelectorAll('li').forEach(li=>{{const ok=!t||li.dataset.tags.split(' ').includes(t);li.hidden=!ok;if(ok)c++}});s.hidden=!c;s.querySelector('.tila-yc').textContent=c;s.querySelector('.tila-yc').nextSibling.textContent=c==1?' note':' notes';n+=c}});
st.textContent=t?`Showing ${{n}} notes tagged #${{t}}`:`Showing all ${{n}} notes`}}))}})();
</script>'''
write('til','a','TIL',body)
