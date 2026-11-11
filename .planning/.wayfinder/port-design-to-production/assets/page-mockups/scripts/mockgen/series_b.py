from lib import *
def row(k,v):
    parts=''.join(f'<li><span class="serb-pn">{i:02d}</span><a href="{url(p)}">{ptitle(p)}</a><time datetime="{p["date"]}">{fmt(p["date"],"%d %b %Y")}</time></li>' for i,p in enumerate(v['posts'],1))
    tags=' '.join(f'#{t}' for t in v['tags'][:3])
    return f'''<details class="serb-item"{' open' if k==1 else ''}><summary><span class="serb-num" aria-hidden="true">{k:02d}</span><span class="serb-name"><h2>{E(v['name'])}</h2><span class="serb-tags">{tags}</span></span><span class="serb-meta"><b>{v['n']} {'part' if v['n']==1 else 'parts'}</b>{span(v)}</span><span class="serb-icon" aria-hidden="true"></span></summary>
<div class="serb-body"><ol class="serb-parts">{parts}</ol><p class="serb-foot"><a href="{url(v['posts'][0])}">Start at part 1 →</a><a href="/series/{v['slug']}/">Series page</a></p></div></details>'''
items=''.join(row(k,v) for k,v in enumerate(S,1))
body=f'''<style>
html .mock-ser-b{{max-width:1100px;margin:0 auto}}
html .mock-ser-b .serb-head{{background:var(--lab-surface);border-radius:26px;padding:44px 48px;display:grid;display:block}}
html .mock-ser-b .serb-head h1{{font-size:clamp(44px,6vw,76px);font-weight:700;letter-spacing:-.055em;line-height:1;margin:16px 0 18px}}
html .mock-ser-b .serb-head .lab-intro{{font-size:18px;margin:0;max-width:52ch}}
html .mock-ser-b .serb-stats{{display:flex;gap:36px;margin:0}}
html .mock-ser-b .serb-stats div{{display:grid}}
html .mock-ser-b .serb-stats dt{{font:11px var(--lab-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--lab-muted);order:2}}
html .mock-ser-b .serb-stats dd{{font:700 44px/1 var(--lab-heading);letter-spacing:-.05em;margin:0 0 6px}}
html .mock-ser-b .serb-bar{{display:flex;justify-content:space-between;align-items:center;margin:44px 0 0;padding-bottom:14px;border-bottom:1px solid var(--lab-text)}}
html .mock-ser-b .serb-bar p{{margin:0;font:11px var(--lab-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--lab-muted)}}
html .mock-ser-b .serb-toggle{{font:12px var(--lab-mono);color:var(--lab-accent);background:none;border:0;padding:4px 0;cursor:pointer;text-decoration:underline;text-underline-offset:4px}}
html .mock-ser-b .serb-toggle:focus-visible,html .mock-ser-b summary:focus-visible{{outline:2px solid var(--lab-accent);outline-offset:4px;border-radius:8px}}
html .mock-ser-b .serb-item{{border-bottom:1px solid var(--lab-rule)}}
html .mock-ser-b summary{{list-style:none;display:grid;grid-template-columns:64px minmax(0,1fr) 190px 28px;gap:20px;align-items:center;padding:24px 0;cursor:pointer}}
html .mock-ser-b summary::-webkit-details-marker{{display:none}}
html .mock-ser-b .serb-num{{font:13px var(--lab-mono);color:var(--lab-muted)}}
html .mock-ser-b .serb-name h2{{font-size:28px;font-weight:700;letter-spacing:-.04em;line-height:1.15;margin:0;transition:color .15s}}
html .mock-ser-b summary:hover h2,html .mock-ser-b [open] h2{{color:var(--lab-accent)}}
html .mock-ser-b .serb-tags{{display:block;font:12px var(--lab-mono);color:var(--lab-muted);margin-top:6px}}
html .mock-ser-b .serb-meta{{display:grid;font:12px/1.6 var(--lab-mono);color:var(--lab-muted);text-align:right}}
html .mock-ser-b .serb-meta b{{font:600 17px var(--lab-heading);color:var(--lab-text);letter-spacing:-.02em}}
html .mock-ser-b .serb-icon{{width:28px;height:28px;border-radius:50%;border:1px solid var(--lab-rule);position:relative;transition:transform .4s cubic-bezier(.16,1,.3,1),background .2s}}
html .mock-ser-b .serb-icon::before,html .mock-ser-b .serb-icon::after{{content:"";position:absolute;left:8px;right:8px;top:13px;height:1.5px;background:var(--lab-text)}}
html .mock-ser-b .serb-icon::after{{transform:rotate(90deg)}}
html .mock-ser-b [open] .serb-icon{{transform:rotate(45deg);background:var(--lab-accent);border-color:var(--lab-accent)}}
html .mock-ser-b [open] .serb-icon::before,html .mock-ser-b [open] .serb-icon::after{{background:var(--lab-bg)}}
html .mock-ser-b .serb-body{{padding:0 0 30px 84px}}
html .mock-ser-b .serb-parts{{list-style:none;margin:0;padding:0;counter-reset:p}}
html .mock-ser-b .serb-parts li{{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:16px;align-items:baseline;padding:10px 0;border-top:1px dashed var(--lab-rule)}}
html .mock-ser-b .serb-pn{{font:12px var(--lab-mono);color:var(--lab-accent)}}
html .mock-ser-b .serb-parts a{{color:var(--lab-text);font-size:17px;line-height:1.45}}
html .mock-ser-b .serb-parts a:hover{{color:var(--lab-accent)}}
html .mock-ser-b .serb-parts time{{font:12px var(--lab-mono);color:var(--lab-muted);white-space:nowrap}}
html .mock-ser-b .serb-foot{{display:flex;gap:24px;margin:18px 0 0;font:13px var(--lab-mono)}}
html .mock-ser-b .serb-foot a{{color:var(--lab-accent)}}
html .mock-ser-b .serb-foot a+a{{color:var(--lab-muted)}}
html .mock-ser-b .serb-til{{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:20px;align-items:center;padding:24px 0;border-bottom:1px solid var(--lab-rule);color:var(--lab-text);text-decoration:none}}
html .mock-ser-b .serb-til strong{{font:700 28px/1.15 var(--lab-heading);letter-spacing:-.04em}}
html .mock-ser-b .serb-til small{{display:block;font:12px var(--lab-mono);color:var(--lab-muted);margin-top:6px}}
html .mock-ser-b .serb-til em{{font:normal 13px var(--lab-mono);color:var(--lab-accent)}}
html .mock-ser-b .serb-til:hover strong{{color:var(--lab-accent)}}
@media (max-width:760px){{
 html .mock-ser-b .serb-head{{grid-template-columns:1fr;padding:28px 22px;border-radius:22px;gap:26px}}
 html .mock-ser-b .serb-stats dd{{font-size:34px}}
 html .mock-ser-b summary{{grid-template-columns:minmax(0,1fr) 28px;gap:6px 14px;padding:20px 0}}
 html .mock-ser-b .serb-num{{display:none}}
 html .mock-ser-b .serb-name h2{{font-size:23px}}
 html .mock-ser-b .serb-meta{{grid-row:2;display:flex;gap:10px;text-align:left;align-items:baseline}}
 html .mock-ser-b .serb-meta b{{font-size:14px}}
 html .mock-ser-b .serb-icon{{grid-row:1/3;grid-column:2}}
 html .mock-ser-b .serb-body{{padding:0 0 24px}}
 html .mock-ser-b .serb-parts li{{grid-template-columns:30px minmax(0,1fr);gap:2px 10px}}
 html .mock-ser-b .serb-parts time{{grid-column:2}}
 html .mock-ser-b .serb-til{{grid-template-columns:1fr;gap:8px}}
 html .mock-ser-b .serb-til>span:first-child{{display:none}}
}}
</style>
<div class="mock-ser-b">
<header class="serb-head"><div><p class="lab-eyebrow">{len(S)} series / {NPARTS} parts / since {min(v['first'] for v in S)[:4]}</p><h1>Series</h1><p class="lab-intro">Topics that needed more than one post: Nix dev environments, a Pi cluster, building in public. Open one to see every part in reading order.</p></div></header>
<div class="serb-bar"><p>Most recently updated first</p><button type="button" class="serb-toggle" aria-expanded="false">Expand all</button></div>
{items}
<a class="serb-til" href="/til/"><span class="serb-num" aria-hidden="true">→</span><span><strong>Today I Learned</strong><small>78 short notes, now on their own page</small></span><em>/til/ ↗</em></a>
</div>
<script>
(()=>{{const r=document.querySelector('.mock-ser-b'),b=r.querySelector('.serb-toggle'),ds=[...r.querySelectorAll('details')];
b.addEventListener('click',()=>{{const o=b.getAttribute('aria-expanded')!=='true';ds.forEach(d=>d.open=o);b.setAttribute('aria-expanded',o);b.textContent=o?'Collapse all':'Expand all'}})}})();
</script>'''
write('series','b','Series',body)
