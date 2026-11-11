from lib import *
import json as J
N=len(til)
rows=''.join(f'''<li><a href="{url(p)}" data-i="{i}" data-q="{E((plain(p)+' '+' '.join(ntags(p))).lower())}"><time datetime="{p['date']}">{p['date']}</time><span class="tilc-t">{ttl(p)}</span><span class="tilc-tg">{' '.join(ntags(p)[:2])}</span></a></li>''' for i,p in enumerate(til))
data=J.dumps([dict(t=plain(p),d=p['date'],g=ntags(p),u=url(p),dir=p['dir']) for p in til]).replace('</','<\\/')
body=f'''<style>
html .mock-til-c{{max-width:1100px;margin:0 auto}}
html .mock-til-c .tilc-head{{display:flex;justify-content:space-between;align-items:end;gap:40px;padding:10px 0 34px}}
html .mock-til-c .tilc-head h1{{font-size:clamp(44px,6vw,72px);font-weight:700;letter-spacing:-.055em;line-height:1;margin:16px 0 0}}
html .mock-til-c .tilc-head .lab-intro{{font-size:18px;margin:0;max-width:40ch}}
html .mock-til-c .tilc-win{{background:var(--lab-surface);border-radius:26px;padding:22px;font-family:var(--lab-mono)}}
html .mock-til-c .tilc-grid{{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:14px}}
html .mock-til-c .tilc-box{{position:relative;border:1px solid var(--lab-rule);border-radius:12px;background:var(--lab-bg)}}
html .mock-til-c .tilc-box>.tilc-title{{position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:var(--lab-bg);padding:0 8px;font-size:12px;line-height:16px;color:var(--lab-muted);white-space:nowrap}}
html .mock-til-c .tilc-prompt{{display:flex;align-items:center;gap:10px;padding:14px 16px;margin-bottom:14px;border-color:var(--lab-accent)}}
html .mock-til-c .tilc-prompt .tilc-title{{color:var(--lab-accent)}}
html .mock-til-c .tilc-prompt span[aria-hidden]{{color:var(--lab-accent);font-weight:700}}
html .mock-til-c .tilc-prompt input{{flex:1;min-width:0;border:0;background:transparent;font:15px var(--lab-mono);color:var(--lab-text);outline:none;caret-color:var(--lab-accent)}}
html .mock-til-c .tilc-prompt input::placeholder{{color:var(--lab-muted)}}
html .mock-til-c .tilc-count{{font-size:12px;color:var(--lab-muted)}}
html .mock-til-c .tilc-prompt:focus-within{{box-shadow:0 0 0 3px color-mix(in srgb,var(--lab-accent) 22%,transparent)}}
html .mock-til-c .tilc-results{{padding:14px 6px 8px}}
html .mock-til-c .tilc-results ul{{list-style:none;margin:0;padding:0;max-height:600px;overflow:auto;scrollbar-width:thin}}
html .mock-til-c .tilc-results a{{display:grid;grid-template-columns:14px 92px minmax(0,1fr);gap:10px;align-items:baseline;padding:6px 10px;border-radius:7px;font-size:13px;line-height:1.5;color:var(--lab-text);text-decoration:none}}
html .mock-til-c .tilc-results a::before{{content:"";color:var(--lab-accent);font-weight:700}}
html .mock-til-c .tilc-results a time{{color:var(--lab-muted)}}
html .mock-til-c .tilc-t{{font-family:var(--lab-body);font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
html .mock-til-c .tilc-t code{{font:.85em var(--lab-mono)}}
html .mock-til-c .tilc-tg{{display:none}}
html .mock-til-c .tilc-rel{{margin:22px 0 0;padding:16px 0 0;border-top:1px dashed var(--lab-rule);font-size:12px;color:var(--lab-muted)}}
html .mock-til-c .tilc-rel ul{{list-style:none;margin:8px 0 0;padding:0}}
html .mock-til-c .tilc-rel li{{padding:3px 0}}
html .mock-til-c .tilc-rel a{{font:14px/1.4 var(--lab-body);color:var(--lab-text)}}
html .mock-til-c .tilc-rel a:hover{{color:var(--lab-accent)}}
html .mock-til-c .tilc-results a.is-sel,html .mock-til-c .tilc-results a:focus-visible{{background:color-mix(in srgb,var(--lab-accent) 16%,transparent);outline:none}}
html .mock-til-c .tilc-results a.is-sel::before{{content:">"}}
html .mock-til-c .tilc-results a:hover .tilc-t{{color:var(--lab-accent)}}
html .mock-til-c .tilc-results li[hidden]{{display:none}}
html .mock-til-c .tilc-empty{{padding:20px 12px;color:var(--lab-muted);font-size:13px}}
html .mock-til-c .tilc-preview{{padding:26px 24px 22px;display:flex;flex-direction:column}}
html .mock-til-c .tilc-fm{{font-size:13px;line-height:1.9;margin:0;color:var(--lab-muted);white-space:pre-wrap}}
html .mock-til-c .tilc-fm b{{color:var(--lab-accent);font-weight:400}}
html .mock-til-c .tilc-fm i{{color:var(--lab-text);font-style:normal}}
html .mock-til-c .tilc-preview h2{{font-family:var(--lab-heading);font-size:30px;font-weight:700;letter-spacing:-.04em;line-height:1.1;margin:22px 0 14px;color:var(--lab-text)}}
html .mock-til-c .tilc-path{{font-size:12px;color:var(--lab-muted);word-break:break-all;margin:0}}
html .mock-til-c .tilc-open{{margin-top:auto;padding-top:24px}}
html .mock-til-c .tilc-open a{{display:inline-flex;gap:10px;align-items:center;padding:10px 16px;border-radius:999px;background:var(--lab-accent);color:var(--lab-bg);font-size:13px;text-decoration:none}}
html .mock-til-c .tilc-open a:hover{{background:var(--lab-text)}}
html .mock-til-c .tilc-open a:focus-visible{{outline:2px solid var(--lab-accent);outline-offset:3px}}
html .mock-til-c .tilc-keys{{display:flex;flex-wrap:wrap;gap:18px;margin:16px 6px 0;font-size:12px;color:var(--lab-muted)}}
html .mock-til-c kbd{{font:12px var(--lab-mono);color:var(--lab-text);background:var(--lab-bg);border:1px solid var(--lab-rule);border-radius:5px;padding:1px 6px;margin-right:4px}}
@media (max-width:760px){{
 html .mock-til-c .tilc-head{{display:block}}
 html .mock-til-c .tilc-head .lab-intro{{margin-top:16px}}
 html .mock-til-c .tilc-win{{padding:14px;border-radius:20px;margin:0 -6px}}
 html .mock-til-c .tilc-grid{{grid-template-columns:1fr}}
 html .mock-til-c .tilc-preview,html .mock-til-c .tilc-keys{{display:none}}
 html .mock-til-c .tilc-results a{{grid-template-columns:10px minmax(0,1fr);gap:2px 8px;padding:8px}}
 html .mock-til-c .tilc-results a time{{grid-column:2;grid-row:2;font-size:11px}}
 html .mock-til-c .tilc-t{{grid-column:2;grid-row:1;white-space:normal}}
 html .mock-til-c .tilc-tg{{display:none}}
 html .mock-til-c .tilc-results ul{{max-height:none}}
}}
</style>
<div class="mock-til-c">
<header class="tilc-head"><div><p class="lab-eyebrow">:Telescope til</p><h1>Today I learned</h1></div><p class="lab-intro">{N} short fixes and tricks. Start typing to fuzzy-find one, the way I'd find it in Neovim.</p></header>
<div class="tilc-win">
<div class="tilc-grid">
<div>
<div class="tilc-box tilc-prompt"><span class="tilc-title">Find TIL</span><span aria-hidden="true">&gt;</span><label for="tilc-q" class="visually-hidden" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Search TIL notes</label><input id="tilc-q" type="search" autocomplete="off" placeholder="nix, neovim, gitlab…" aria-controls="tilc-list"><span class="tilc-count" aria-live="polite">{N} / {N}</span></div>
<div class="tilc-box tilc-results"><span class="tilc-title">Results</span><ul id="tilc-list">{rows}</ul><p class="tilc-empty" hidden>No matches. Try a tag like <b>nix</b> or <b>tmux</b>.</p></div>
</div>
<section class="tilc-box tilc-preview" aria-live="polite" aria-label="Preview"><span class="tilc-title">Preview</span><div id="tilc-pv"></div></section>
</div>
<p class="tilc-keys"><span><kbd>↑</kbd><kbd>↓</kbd>move</span><span><kbd>Enter</kbd>open</span><span><kbd>Esc</kbd>clear</span><span><kbd>/</kbd>focus search</span></p>
</div>
</div>
<script>
(()=>{{const D={data},r=document.querySelector('.mock-til-c'),q=r.querySelector('#tilc-q'),as=[...r.querySelectorAll('.tilc-results a')],pv=r.querySelector('#tilc-pv'),ct=r.querySelector('.tilc-count'),em=r.querySelector('.tilc-empty');let sel=0;
const esc=s=>s.replace(/[&<>"]/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}})[c]);
function show(i){{as.forEach(a=>a.classList.toggle('is-sel',+a.dataset.i===i));sel=i;const p=D[i];if(!p){{pv.innerHTML='';return}}
pv.innerHTML=`<pre class="tilc-fm">---\n<b>title:</b> <i>${{esc(p.t)}}</i>\n<b>date:</b>  <i>${{p.d}}</i>\n<b>tags:</b>  <i>[${{p.g.join(', ')}}]</i>\n<b>series:</b> <i>[TIL]</i>\n---</pre><h2>${{esc(p.t)}}</h2><p class="tilc-path">content/posts/${{esc(p.dir)}}/index.md</p>${{rel(i)}}<p class="tilc-open"><a href="${{p.u}}">Open note <span aria-hidden="true">↗</span></a></p>`}}
function rel(i){{const p=D[i],g=p.g[0];if(!g)return '';const o=D.filter((x,j)=>j!==i&&x.g.includes(g)).slice(0,4);return o.length?`<div class="tilc-rel">Also tagged <b>#${{g}}</b><ul>${{o.map(x=>`<li><a href="${{x.u}}">${{esc(x.t)}}</a></li>`).join('')}}</ul></div>`:''}}
function vis(){{return as.filter(a=>!a.parentNode.hidden)}}
q.addEventListener('input',()=>{{const w=q.value.toLowerCase().split(/\\s+/).filter(Boolean);let n=0;as.forEach(a=>{{const ok=w.every(x=>a.dataset.q.includes(x));a.parentNode.hidden=!ok;if(ok)n++}});ct.textContent=n+' / '+D.length;em.hidden=!!n;const v=vis();show(v.length?+v[0].dataset.i:-1)}});
q.addEventListener('keydown',e=>{{const v=vis(),k=v.findIndex(a=>+a.dataset.i===sel);if(e.key==='ArrowDown'||e.key==='ArrowUp'){{e.preventDefault();const n=v[Math.max(0,Math.min(v.length-1,k+(e.key==='ArrowDown'?1:-1)))];if(n){{show(+n.dataset.i);n.scrollIntoView({{block:'nearest'}})}}}}else if(e.key==='Enter'&&v[k]){{location.href=v[k].href}}else if(e.key==='Escape'){{q.value='';q.dispatchEvent(new Event('input'))}}}});
as.forEach(a=>{{a.addEventListener('mouseenter',()=>show(+a.dataset.i));a.addEventListener('focus',()=>show(+a.dataset.i))}});
document.addEventListener('keydown',e=>{{if(e.key==='/'&&document.activeElement!==q&&!/input|textarea/i.test(document.activeElement.tagName)){{e.preventDefault();q.focus()}}}});
show(0)}})();
</script>'''
write('til','c','TIL',body)
