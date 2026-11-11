from lib import *
multi=[v for v in S if v['n']>1]
multi.sort(key=lambda v:-v['n']*(v is max(multi,key=lambda x:x['n']))) if False else None
feat=max(multi,key=lambda x:x['n']);multi=[feat]+[v for v in multi if v is not feat]; single=[v for v in S if v['n']==1]
def card(v,feat=False):
    segs=''.join(f'<li><a href="{url(p)}" title="Part {i}: {ptitle(p)}" aria-label="Part {i}: {ptitle(p)}"></a></li>' for i,p in enumerate(v['posts'],1))
    tags=''.join(f'<li>#{t}</li>' for t in v['tags'][:3])
    f=v['posts'][0]
    return f'''<article class="sera-card{' is-feat' if feat else ''}"><p class="sera-meta"><span>{v['n']} parts</span><span>{span(v)}</span></p>
<h2><a href="/series/{v['slug']}/">{E(v['name'])}</a></h2><ul class="sera-tags" aria-label="Topics">{tags}</ul>
<div class="sera-track"><ol aria-label="Parts of {E(v['name'])}">{segs}</ol></div>
<p class="sera-start"><span>Start with part 1</span><a href="{url(f)}">{ptitle(f)} <span aria-hidden="true">→</span></a></p></article>'''
cards=card(multi[0],True)+''.join(card(v) for v in multi[1:])
singles=''.join(f'<li><time datetime="{v["first"]}">{fmt(v["first"],"%b %Y")}</time><a href="{url(v["posts"][0])}">{ptitle(v["posts"][0])}</a><span>{E(v["name"])}</span></li>' for v in single)
body=f'''<style>
html .mock-ser-a{{max-width:1100px;margin:0 auto}}
html .mock-ser-a .sera-head{{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:48px;align-items:end;padding:10px 0 40px}}
html .mock-ser-a .sera-head h1{{font-size:clamp(46px,6.4vw,82px);font-weight:700;letter-spacing:-.055em;line-height:1;margin:16px 0 0}}
html .mock-ser-a .sera-head h1 span{{color:var(--lab-muted)}}
html .mock-ser-a .sera-head .lab-intro{{font-size:18px;margin:0}}
html .mock-ser-a .sera-grid{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}}
html .mock-ser-a .sera-card{{background:var(--lab-surface);border-radius:24px;padding:26px 26px 24px;display:flex;flex-direction:column}}
html .mock-ser-a .sera-card.is-feat{{grid-column:1/-1;padding:40px 44px 36px;background:color-mix(in srgb,var(--lab-accent) 11%,var(--lab-surface))}}
html .mock-ser-a .sera-meta{{display:flex;justify-content:space-between;gap:12px;font:11px/1 var(--lab-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--lab-muted);margin:0}}
html .mock-ser-a .sera-meta span:first-child{{color:var(--lab-accent)}}
html .mock-ser-a .sera-card h2{{font-size:25px;font-weight:700;letter-spacing:-.04em;line-height:1.1;margin:16px 0 12px}}
html .mock-ser-a .is-feat h2{{font-size:clamp(34px,4.4vw,52px);letter-spacing:-.05em}}
html .mock-ser-a .sera-card h2 a{{color:var(--lab-text);text-decoration:none}}
html .mock-ser-a .sera-card h2 a:hover{{color:var(--lab-accent)}}
html .mock-ser-a .sera-tags{{list-style:none;display:flex;flex-wrap:wrap;gap:12px;margin:0;padding:0;font:12px var(--lab-mono);color:var(--lab-muted)}}
html .mock-ser-a .sera-track{{margin:26px 0 22px}}
html .mock-ser-a .sera-track ol{{list-style:none;display:flex;gap:4px;margin:0;padding:0}}
html .mock-ser-a .sera-track li{{flex:1}}
html .mock-ser-a .sera-track a{{display:block;height:10px;border-radius:3px;background:color-mix(in srgb,var(--lab-accent) 30%,transparent);transition:background .2s,transform .3s cubic-bezier(.16,1,.3,1)}}
html .mock-ser-a .sera-track li:first-child a{{background:var(--lab-accent)}}
html .mock-ser-a .sera-track a:hover,html .mock-ser-a .sera-track a:focus-visible{{background:var(--lab-accent);transform:scaleY(1.6);outline:none}}
html .mock-ser-a .is-feat .sera-track a{{height:14px}}
html .mock-ser-a .sera-start{{margin:auto 0 0;padding-top:16px;border-top:1px solid var(--lab-rule);display:grid;gap:4px}}
html .mock-ser-a .sera-start>span{{font:11px var(--lab-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--lab-muted)}}
html .mock-ser-a .sera-start a{{font-size:17px;line-height:1.4;color:var(--lab-text);text-decoration:underline;text-decoration-color:var(--lab-rule);text-underline-offset:4px}}
html .mock-ser-a .sera-start a:hover{{color:var(--lab-accent);text-decoration-color:currentColor}}
html .mock-ser-a .sera-start a span{{color:var(--lab-accent)}}
html .mock-ser-a .sera-singles{{margin-top:64px}}
html .mock-ser-a .sera-singles ul{{list-style:none;margin:8px 0 0;padding:0}}
html .mock-ser-a .sera-singles li{{display:grid;grid-template-columns:90px minmax(0,1fr) auto;gap:18px;align-items:baseline;padding:13px 0;border-bottom:1px solid var(--lab-rule)}}
html .mock-ser-a .sera-singles time,html .mock-ser-a .sera-singles li>span{{font:12px var(--lab-mono);color:var(--lab-muted)}}
html .mock-ser-a .sera-singles a{{color:var(--lab-text)}}
html .mock-ser-a .sera-singles a:hover{{color:var(--lab-accent)}}
html .mock-ser-a .sera-til{{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:56px;padding:24px 30px;border:1px dashed var(--lab-rule);border-radius:24px}}
html .mock-ser-a .sera-til p{{margin:0;font-size:17px}}
html .mock-ser-a .sera-til strong{{font-family:var(--lab-heading)}}
html .mock-ser-a .sera-til a{{font:13px var(--lab-mono);color:var(--lab-accent);white-space:nowrap}}
@media (max-width:980px){{html .mock-ser-a .sera-grid{{grid-template-columns:repeat(2,minmax(0,1fr))}}}}
@media (max-width:760px){{
 html .mock-ser-a .sera-head{{grid-template-columns:1fr;gap:18px;padding-bottom:28px}}
 html .mock-ser-a .sera-grid{{grid-template-columns:1fr;gap:14px}}
 html .mock-ser-a .sera-card,html .mock-ser-a .sera-card.is-feat{{padding:24px 22px;border-radius:22px}}
 html .mock-ser-a .sera-singles li{{grid-template-columns:1fr;gap:2px}}
 html .mock-ser-a .sera-til{{flex-direction:column;align-items:flex-start;padding:22px}}
}}
</style>
<div class="mock-ser-a">
<header class="sera-head"><div><p class="lab-eyebrow">Series / longer reads in parts</p><h1>Read it<br><span>in order.</span></h1></div><p class="lab-intro">{len(S)} series, {NPARTS} parts. Each bar below is one post; hover to see it, or start from part 1.</p></header>
<div class="sera-grid">{cards}</div>
<section class="sera-singles" aria-labelledby="sera-s"><div class="lab-section-head"><div><p class="lab-eyebrow">Standalone, so far</p><h2 id="sera-s">One-part series</h2></div></div><ul>{singles}</ul></section>
<aside class="sera-til"><p><strong>Looking for TIL?</strong> The 78 short "today I learned" notes now have their own page.</p><a href="/til/">Browse TIL →</a></aside>
</div>'''
write('series','a','Series',body)
