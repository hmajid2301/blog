from lib import *
tree=''.join(f'<li><a href="#qf-{v["slug"]}"><span class="serc-ic" aria-hidden="true">▸</span><span class="serc-s">{v["slug"]}</span><span class="serc-n">{v["n"]}</span></a></li>' for v in S)
buf=''
for v in S:
    buf+=f'''<section class="serc-sec" id="qf-{v['slug']}" aria-labelledby="h-{v['slug']}"><div class="serc-l serc-fold"><h2 id="h-{v['slug']}"><span aria-hidden="true">▾ </span><a href="/series/{v['slug']}/">{E(v['name'])}</a></h2><span class="serc-info">{v['n']} {'part' if v['n']==1 else 'parts'} · {v['first'][:7]} → {v['last'][:7]} · {' '.join('#'+t for t in v['tags'][:3])}</span></div><ol>'''
    buf+=''.join(f'''<li class="serc-l"><span class="serc-f" aria-hidden="true">{v['slug']}</span><span class="serc-p">|{i:02d}|</span><time datetime="{p['date']}">{p['date']}</time><a href="{url(p)}">{ptitle(p)}</a></li>''' for i,p in enumerate(v['posts'],1))
    buf+='</ol></section>'
buf+='<section class="serc-sec" aria-labelledby="h-til"><div class="serc-l serc-fold"><h2 id="h-til"><span aria-hidden="true">▸ </span><a href="/til/">Today I Learned</a></h2><span class="serc-info">78 notes · moved to their own page → /til/</span></div></section>'
body=f'''<style>
html .mock-ser-c{{max-width:1100px;margin:0 auto}}
html .mock-ser-c .serc-head{{display:flex;justify-content:space-between;align-items:end;gap:40px;padding:10px 0 34px}}
html .mock-ser-c .serc-head h1{{font-size:clamp(44px,6vw,72px);font-weight:700;letter-spacing:-.055em;line-height:1;margin:16px 0 0}}
html .mock-ser-c .serc-head .lab-intro{{font-size:18px;margin:0;max-width:42ch}}
html .mock-ser-c .serc-head code{{font:.9em var(--lab-mono);color:var(--lab-accent)}}
html .mock-ser-c .serc-win{{background:var(--lab-surface);border-radius:26px;overflow:hidden;font:13px/1.5 var(--lab-mono)}}
html .mock-ser-c .serc-tabs{{display:flex;gap:2px;padding:12px 16px 0;border-bottom:1px solid var(--lab-rule)}}
html .mock-ser-c .serc-tabs span{{padding:7px 14px;border-radius:10px 10px 0 0;color:var(--lab-muted)}}
html .mock-ser-c .serc-tabs span.on{{background:var(--lab-bg);color:var(--lab-text)}}
html .mock-ser-c .serc-split{{display:grid;grid-template-columns:270px minmax(0,1fr)}}
html .mock-ser-c .serc-tree{{border-right:1px solid var(--lab-rule);padding:16px 10px}}
html .mock-ser-c .serc-tree p{{margin:0 8px 8px;color:var(--lab-accent)}}
html .mock-ser-c .serc-tree ul{{list-style:none;margin:0;padding:0;position:sticky;top:90px}}
html .mock-ser-c .serc-tree a{{display:flex;gap:8px;padding:4px 8px;border-radius:6px;color:var(--lab-text);text-decoration:none;white-space:nowrap;font-size:12px}}
html .mock-ser-c .serc-tree .serc-s{{overflow:hidden;text-overflow:ellipsis;min-width:0}}
html .mock-ser-c .serc-tree a:hover,html .mock-ser-c .serc-tree a:focus-visible{{background:color-mix(in srgb,var(--lab-accent) 16%,transparent);outline:none}}
html .mock-ser-c .serc-ic{{color:var(--lab-muted)}}
html .mock-ser-c .serc-n{{margin-left:auto;color:var(--lab-muted);padding-left:8px}}
html .mock-ser-c .serc-buf{{background:var(--lab-bg);padding:14px 0 18px;counter-reset:ln;min-width:0}}
html .mock-ser-c .serc-buf ol{{list-style:none;margin:0;padding:0}}
html .mock-ser-c .serc-sec{{scroll-margin-top:90px}}
html .mock-ser-c .serc-l{{counter-increment:ln;display:grid;grid-template-columns:44px 160px 34px 88px minmax(0,1fr);gap:0 10px;align-items:baseline;padding:3px 18px 3px 0}}
html .mock-ser-c .serc-l::before{{content:counter(ln);text-align:right;color:var(--lab-muted);opacity:.6}}
html .mock-ser-c li.serc-l:hover,html .mock-ser-c li.serc-l:focus-within{{background:color-mix(in srgb,var(--lab-accent) 9%,transparent)}}
html .mock-ser-c li.serc-l:hover::before,html .mock-ser-c li.serc-l:focus-within::before{{color:var(--lab-accent);opacity:1}}
html .mock-ser-c .serc-f{{color:var(--lab-accent);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}}
html .mock-ser-c .serc-p,html .mock-ser-c .serc-l time{{color:var(--lab-muted)}}
html .mock-ser-c li.serc-l a{{font:15px/1.5 var(--lab-body);color:var(--lab-text);text-decoration:none}}
html .mock-ser-c li.serc-l a:hover,html .mock-ser-c li.serc-l a:focus-visible{{color:var(--lab-accent);text-decoration:underline;text-underline-offset:3px;outline:none}}
html .mock-ser-c .serc-fold{{grid-template-columns:44px auto minmax(0,1fr);gap:0 14px;margin-top:12px;padding-top:6px;padding-bottom:6px}}
html .mock-ser-c .serc-sec:first-child .serc-fold{{margin-top:0}}
html .mock-ser-c .serc-fold h2{{font:700 19px/1.3 var(--lab-heading);letter-spacing:-.025em;margin:0}}
html .mock-ser-c .serc-fold h2 span{{color:var(--lab-muted);font-family:var(--lab-mono);font-weight:400}}
html .mock-ser-c .serc-fold h2 a{{color:var(--lab-text);text-decoration:none}}
html .mock-ser-c .serc-fold h2 a:hover{{color:var(--lab-accent)}}
html .mock-ser-c .serc-info{{color:var(--lab-muted);font-size:12px;min-width:0}}
html .mock-ser-c .serc-status{{display:flex;align-items:center;gap:14px;padding:0 16px 0 0;border-top:1px solid var(--lab-rule);font-size:12px;color:var(--lab-muted)}}
html .mock-ser-c .serc-mode{{background:var(--lab-accent);color:var(--lab-bg);font-weight:700;padding:6px 14px}}
html .mock-ser-c .serc-status .r{{margin-left:auto}}
html .mock-ser-c .serc-cmd{{padding:8px 16px 12px;font-size:12px;color:var(--lab-muted);margin:0}}
html .mock-ser-c .serc-cmd b{{color:var(--lab-text);font-weight:400}}
@media (max-width:860px){{
 html .mock-ser-c .serc-split{{grid-template-columns:1fr}}
 html .mock-ser-c .serc-tree{{display:none}}
}}
@media (max-width:760px){{
 html .mock-ser-c .serc-head{{display:block}}
 html .mock-ser-c .serc-head .lab-intro{{margin-top:16px}}
 html .mock-ser-c .serc-win{{border-radius:20px;margin:0 -6px}}
 html .mock-ser-c .serc-l{{grid-template-columns:30px minmax(0,1fr);gap:0 10px;padding-right:14px}}
 html .mock-ser-c .serc-f,html .mock-ser-c .serc-p{{display:none}}
 html .mock-ser-c li.serc-l time{{grid-column:2;grid-row:2;font-size:11px}}
 html .mock-ser-c li.serc-l a{{grid-column:2;grid-row:1}}
 html .mock-ser-c .serc-fold{{grid-template-columns:30px minmax(0,1fr)}}
 html .mock-ser-c .serc-info{{grid-column:2}}
 html .mock-ser-c .serc-status .h{{display:none}}
 html .mock-ser-c .serc-tabs span:not(.on){{display:none}}
}}
</style>
<div class="mock-ser-c">
<header class="serc-head"><div><p class="lab-eyebrow">:copen series</p><h1>Series</h1></div><p class="lab-intro">Every multi-part series as a quickfix list, parts in reading order. Pick a file on the left or <code>:cnext</code> your way down.</p></header>
<div class="serc-win">
<div class="serc-tabs" aria-hidden="true"><span class="on">[Quickfix List]</span><span>neo-tree</span></div>
<div class="serc-split">
<nav class="serc-tree" aria-label="Jump to series"><p aria-hidden="true">  content/series/</p><ul>{tree}</ul></nav>
<div class="serc-buf">{buf}</div>
</div>
<div class="serc-status"><span class="serc-mode">NORMAL</span><span>[Quickfix List]</span><span class="h">:vimgrep /series:/ content/posts/**</span><span class="r">{NPARTS} parts · {len(S)} series</span></div>
<p class="serc-cmd"><b>:cnext</b> next part &nbsp;·&nbsp; <b>:cprev</b> previous &nbsp;·&nbsp; <b>&lt;CR&gt;</b> open</p>
</div>
</div>'''
write('series','c','Series',body)
