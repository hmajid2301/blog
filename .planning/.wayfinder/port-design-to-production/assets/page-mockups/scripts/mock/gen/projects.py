import sys
sys.path.insert(0, "/tmp/mock/gen")
from data import PROJECTS, PH, COMMON_CSS, render, fdate
from html import escape as e

BY = {p["slug"]: p for p in PROJECTS}
TOTAL_POSTS = len({x["href"] for p in PROJECTS for x in p["posts"]})


def chips(stack, cls="chips"):
    return f'<ul class="{cls}" aria-label="Stack">' + "".join(f"<li>{e(s)}</li>" for s in stack) + "</ul>"


def links(p, cls="links"):
    out = []
    if p["site"]:
        out.append(f'<a href="{p["site"]}">{e(p["site"].split("//")[1])} <span aria-hidden="true">↗</span></a>')
    if p["repo"]:
        out.append(f'<a href="{p["repo"]}">Source on GitLab <span aria-hidden="true">↗</span></a>')
    else:
        out.append('<span class="closed">Closed source</span>')
    return f'<div class="{cls}">' + "".join(out) + "</div>"


def nposts(p):
    n = len(p["posts"])
    return f'{n} post{"s" if n != 1 else ""}'


# ---------------------------------------------------------------- A: showcase
def alt_a():
    css = COMMON_CSS + """
.mpa .page-lab-header{border:0;margin-bottom:28px}
.mpa .page-lab-header h1{margin-bottom:14px}
.mpa .chips{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0}
.mpa .chips li{font:12px/1 var(--lab-mono);padding:6px 9px;border-radius:999px;margin:0;
  background:color-mix(in srgb,var(--lab-accent) 12%,transparent);color:var(--lab-text)}
.mpa .links{display:flex;flex-wrap:wrap;gap:8px 20px;font:13px/1.4 var(--lab-mono)}
.mpa .links a{color:var(--lab-accent);text-decoration:underline;text-underline-offset:.2em;text-decoration-thickness:1px}
.mpa .closed{color:var(--lab-muted)}
.mpa .row{display:flex;justify-content:space-between;align-items:center;gap:12px}

.mpa .feature{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:48px;align-items:center;
  background:var(--lab-surface);border-radius:28px;padding:48px;margin-bottom:72px}
.mpa .feature h2{font:700 clamp(44px,6vw,76px)/1 var(--lab-heading);letter-spacing:-.05em;margin:18px 0 20px}
.mpa .feature .lede{font-size:19px;line-height:1.6;margin:0 0 12px;color:var(--lab-text)}
.mpa .feature .more{color:var(--lab-muted);line-height:1.7;margin:0 0 24px;font-size:15px}
.mpa .feature .chips{margin-bottom:28px}
.mpa .shot{margin:0;border-radius:18px;overflow:hidden;aspect-ratio:4/3.4;background:var(--lab-bg);
  box-shadow:0 30px 60px -36px color-mix(in srgb,var(--lab-text) 45%,transparent)}
.mpa .shot img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.mpa .stage{margin-top:28px;padding-top:22px;border-top:1px solid var(--lab-rule)}
.mpa .stage h3{font:11px/1 var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-muted);margin:0 0 12px}
.mpa .stage ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}
.mpa .stage li{margin:0;display:flex;justify-content:space-between;gap:16px;font-size:15px}
.mpa .stage li span{font:12px/1.6 var(--lab-mono);color:var(--lab-muted);white-space:nowrap}
.mpa .stage a:hover,.mpa .card h3 a:hover,.mpa .latest a:hover{color:var(--lab-accent)}

.mpa .lab-section-head{margin-bottom:8px}
.mpa .bento{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:20px;margin-top:20px}
.mpa .card{background:var(--lab-surface);border-radius:22px;padding:30px;display:flex;flex-direction:column;gap:16px;min-width:0}
.mpa .card.wide{grid-column:span 4;padding:0;overflow:hidden;gap:0}
.mpa .card.wide>div{display:flex;flex-direction:column;gap:16px;padding:30px;flex:1}
.mpa .card.narrow{grid-column:span 2}
.mpa .card.half{grid-column:span 3}
.mpa .card h3{font:700 34px/1.05 var(--lab-heading);letter-spacing:-.035em;margin:0}
.mpa .card .desc{margin:0;line-height:1.65;color:var(--lab-muted);font-size:15px}
.mpa .card .shot{aspect-ratio:1852/600;border-radius:0;box-shadow:none;border-bottom:1px solid var(--lab-rule)}
.mpa .card .shot img{object-position:left top}
.mpa .latest{margin-top:auto;border-top:1px solid var(--lab-rule);padding-top:16px}
.mpa .latest p{font:11px/1 var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-muted);margin:0 0 10px}
.mpa .latest ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.mpa .latest li{margin:0;font-size:15px;line-height:1.4}
.mpa .count{font:12px/1 var(--lab-mono);color:var(--lab-accent);white-space:nowrap}
@media (max-width:900px){
 .mpa .feature{grid-template-columns:1fr;padding:28px;gap:28px;border-radius:22px}
 .mpa .bento{grid-template-columns:1fr}
 .mpa .card.wide,.mpa .card.narrow,.mpa .card.half{grid-column:auto}
 .mpa .card .shot{aspect-ratio:16/8}
}
@media (max-width:480px){.mpa .card{padding:24px}.mpa .stage li{flex-direction:column;gap:2px}}
"""
    f = BY["banterbus"]

    def latest(p, k=2):
        items = "".join(f'<li><a href="{x["href"]}">{e(x["title"])}</a></li>' for x in p["posts"][:k])
        return f'<div class="latest"><p>Latest writing</p><ul>{items}</ul></div>'

    def card(p, size):
        head = (f'<div class="row"><p class="lab-eyebrow">{e(p["kind"])}</p>{PH("status")}</div>'
                f'<h3><a href="{p["repo"] or p["site"]}">{e(p["name"])}</a></h3>'
                f'<p class="desc">{e(p["desc"])}</p>{chips(p["stack"])}')
        foot = f'<div class="row">{links(p)}<span class="count">{nposts(p)}</span></div>' + latest(p)
        if size == "wide":
            return (f'<article class="card wide" aria-labelledby="pa-{p["slug"]}"><figure class="shot"><img src="{p["img"]}" alt="{e(p["img_alt"])}"></figure>'
                    f'<div>{head.replace("<h3>", f"<h3 id=pa-{p['slug']}>")}{foot}</div></article>')
        return f'<article class="card {size}" aria-labelledby="pa-{p["slug"]}">{head.replace("<h3>", f"<h3 id=pa-{p['slug']}>")}{foot}</article>'

    talks = "".join(f'<li><a href="{h}">{e(t)}</a><span>{e(ev)}</span></li>' for t, h, ev in f["talks"])
    html = f"""<style>{css}</style>
<div data-mock-wide class="mock-wrap mpa">
<header class="page-lab-header"><p class="page-lab-kicker">Things I've built</p><h1>Projects</h1>
<p>Side projects I've written about. Most started as an excuse to learn something, and each one links to the posts that tell its story.</p></header>

<section class="feature" aria-labelledby="pa-feature">
 <div>
  <div class="row"><p class="lab-eyebrow">Featured / {e(f["kind"])}</p>{PH("status")}</div>
  <h2 id="pa-feature">{e(f["name"])}</h2>
  <p class="lede">{e(f["desc"])}</p>
  <p class="more">{e(f["long"])}</p>
  {chips(f["stack"])}
  <div class="row">{links(f)}<a class="count" href="#">{nposts(f)} <span aria-hidden="true">↗</span></a></div>
  <div class="stage"><h3>Also a talk</h3><ul>{talks}</ul></div>
 </div>
 <figure class="shot"><img src="{f["img"]}" alt="{e(f["img_alt"])}"></figure>
</section>

<section aria-labelledby="pa-more">
 <div class="lab-section-head"><div><p class="lab-eyebrow">{len(PROJECTS)-1} more</p><h2 id="pa-more">Everything else</h2></div><a href="/archive/">All writing ↗</a></div>
 <div class="bento">
  {card(BY["voxicle"], "wide")}
  {card(BY["nixicle"], "narrow")}
  {card(BY["optinix"], "half")}
  {card(BY["lettucego"], "half")}
 </div>
</section>
</div>"""
    render("projects", "a", "Projects (a) | Haseeb Majid", html)


# ---------------------------------------------------------------- B: ledger
def alt_b():
    css = COMMON_CSS + """
.mpb .top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px;align-items:end;padding-bottom:28px;border-bottom:2px solid var(--lab-text)}
.mpb .year:first-of-type{border-top:0}
.mpb .top h1{font:700 clamp(56px,9vw,120px)/.9 var(--lab-heading);letter-spacing:-.06em;margin:14px 0 0}
.mpb .top p.intro{max-width:46ch;line-height:1.7;color:var(--lab-muted);margin:18px 0 0}
.mpb .tally{list-style:none;margin:0;padding:0;display:flex;gap:28px;font:12px/1.4 var(--lab-mono);color:var(--lab-muted)}
.mpb .tally li{margin:0;display:grid;gap:4px}
.mpb .tally b{font:700 34px/1 var(--lab-heading);color:var(--lab-text);letter-spacing:-.03em}
.mpb .year{display:grid;grid-template-columns:120px minmax(0,1fr);border-bottom:1px solid var(--lab-rule)}
.mpb .year>h2{font:700 15px/1 var(--lab-mono);color:var(--lab-accent);margin:0;padding-top:30px;letter-spacing:0}
.mpb .proj{padding:26px 0;border-top:1px solid var(--lab-rule)}
.mpb .proj:first-child{border-top:0}
.mpb .line{display:grid;grid-template-columns:minmax(0,220px) minmax(0,1fr) auto;gap:28px;align-items:baseline}
.mpb .proj h3{font:700 30px/1.05 var(--lab-heading);letter-spacing:-.035em;margin:0}
.mpb .proj h3 a:hover{color:var(--lab-accent)}
.mpb .kind{display:block;font:12px/1.5 var(--lab-mono);color:var(--lab-muted);margin-top:8px}
.mpb .desc{margin:0;line-height:1.65;max-width:58ch}
.mpb .stack{font:12.5px/1.6 var(--lab-mono);color:var(--lab-muted);margin:8px 0 0}
.mpb .stack b{color:var(--lab-text);font-weight:500}
.mpb .side{display:grid;justify-items:end;gap:6px;font:12.5px/1.5 var(--lab-mono);text-align:right;white-space:nowrap}
.mpb .side a{color:var(--lab-accent);text-decoration:underline;text-underline-offset:.2em;text-decoration-thickness:1px}
.mpb .side .closed{color:var(--lab-muted)}
.mpb details{grid-column:2/-1;margin-top:14px}
.mpb summary{cursor:pointer;font:12.5px/1.5 var(--lab-mono);color:var(--lab-text);list-style:none;display:inline-flex;gap:10px;align-items:center;
  padding:6px 12px 6px 10px;border:1px solid var(--lab-rule);border-radius:999px}
.mpb summary::-webkit-details-marker{display:none}
.mpb summary .stack{margin:0;font-size:inherit}
.mpb summary::before{content:'+';color:var(--lab-accent);width:1ch;text-align:center}
.mpb details[open] summary::before{content:'−'}
.mpb summary:hover{border-color:var(--lab-accent)}
.mpb summary:focus-visible{outline:2px solid var(--lab-accent);outline-offset:2px}
.mpb details ol{list-style:none;margin:12px 0 0;padding:0}
.mpb details li{display:grid;grid-template-columns:88px minmax(0,1fr);gap:16px;padding:9px 0;border-bottom:1px dashed var(--lab-rule);margin:0;font-size:15px;line-height:1.45}
.mpb details li:last-child{border-bottom:0}
.mpb details time{font:12px/1.6 var(--lab-mono);color:var(--lab-muted)}
.mpb details a:hover{color:var(--lab-accent)}
.mpb .note{font:12px/1.6 var(--lab-mono);color:var(--lab-muted);margin-top:22px}
@media (max-width:820px){
 .mpb .top{grid-template-columns:1fr}
 .mpb .year{grid-template-columns:1fr}
 .mpb .key{display:none}
 .mpb .year>h2{padding:24px 0 0}
 .mpb .line{grid-template-columns:1fr;gap:10px}
 .mpb .side{justify-items:start;text-align:left;grid-auto-flow:column;justify-content:start;gap:18px;white-space:normal}
 .mpb details{grid-column:1}
 .mpb details li{grid-template-columns:1fr;gap:2px}
}
"""
    groups = {}
    for p in PROJECTS:
        y = min(x["date"] for x in p["posts"])[:4]
        groups.setdefault(y, []).append(p)

    def row(p, open_):
        posts = "".join(f'<li><time datetime="{x["date"]}">{fdate(x["date"])}</time><a href="{x["href"]}">{e(x["title"])}</a></li>' for x in p["posts"])
        side = [f'<span>{PH("status")}</span>']
        if p["site"]:
            side.append(f'<a href="{p["site"]}">{e(p["site"].split("//")[1])}</a>')
        side.append(f'<a href="{p["repo"]}">Source</a>' if p["repo"] else '<span class="closed">Closed source</span>')
        talk = ""
        if p["talks"]:
            talk = f' <span class="stack">· {len(p["talks"])} talk{"s" if len(p["talks"])>1 else ""}</span>'
        return f"""<article class="proj" aria-labelledby="pb-{p['slug']}">
 <div class="line">
  <div><h3 id="pb-{p['slug']}"><a href="{p['repo'] or p['site']}">{e(p['name'])}</a></h3><span class="kind">{e(p['kind'])}</span></div>
  <div><p class="desc">{e(p['desc'])}</p><p class="stack"><b>Stack</b> {' / '.join(e(s) for s in p['stack'])}</p></div>
  <div class="side">{''.join(side)}</div>
 </div>
 <div class="line"><span></span><details{' open' if open_ else ''}><summary>{nposts(p)}{talk}</summary><ol>{posts}</ol></details></div>
</article>"""

    body = ""
    first = True
    for y in sorted(groups, reverse=True):
        rows = "".join(row(p, first and i == 0) for i, p in enumerate(groups[y]))
        first = False
        body += f'<section class="year" aria-labelledby="pb-y{y}"><h2 id="pb-y{y}">{y}</h2><div>{rows}</div></section>'

    html = f"""<style>{css}</style>
<div data-mock-wide class="mock-wrap mpb">
<header class="top">
 <div><p class="lab-eyebrow">Index of side projects</p><h1>Projects</h1>
 <p class="intro">Grouped by the year I first wrote about them. Open a row to see every post that mentions it.</p></div>
 <ul class="tally"><li><b>{len(PROJECTS)}</b>projects</li><li><b>{TOTAL_POSTS}</b>posts</li><li><b>{len({t[1] for p in PROJECTS for t in p['talks']})}</b>talks</li></ul>
</header>
{body}
<p class="note">Status is not tracked yet: {PH("status")} marks where it would go.</p>
</div>"""
    render("projects", "b", "Projects (b) | Haseeb Majid", html)


# ---------------------------------------------------------------- C: neovim buffers
def alt_c():
    css = COMMON_CSS + """
.mpc{--nv-gutter:52px}
.mpc .page-lab-header{border:0;margin-bottom:24px}
.mpc .page-lab-header .page-lab-kicker{font-family:var(--lab-mono);text-transform:none;letter-spacing:0;color:var(--lab-accent)}
.mpc .layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:28px;align-items:start}
.mpc .tree{position:sticky;top:24px;background:var(--lab-surface);border-radius:20px;padding:18px 0;font:13px/1.5 var(--lab-mono)}
.mpc .tree h2{font:11px/1 var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-muted);margin:0 20px 12px}
.mpc .tree ul{list-style:none;margin:0;padding:0}
.mpc .tree li{margin:0}
.mpc .tree a{display:flex;justify-content:space-between;gap:8px;padding:7px 20px;color:var(--lab-text)}
.mpc .tree a:hover,.mpc .tree a[aria-current]{background:color-mix(in srgb,var(--lab-accent) 14%,transparent)}
.mpc .tree a[aria-current]{box-shadow:inset 3px 0 0 var(--lab-accent)}
.mpc .tree a span{color:var(--lab-muted)}
.mpc .tree .dir{padding:4px 20px 8px;color:var(--lab-accent)}
.mpc .tree .foot{border-top:1px solid var(--lab-rule);margin:12px 0 0;padding:12px 20px 0;color:var(--lab-muted);font-size:12px}

.mpc .buffers{display:grid;gap:28px}
.mpc .buf{background:var(--lab-surface);border-radius:22px;overflow:hidden;scroll-margin-top:24px}
.mpc .tabline{display:flex;align-items:stretch;font:12.5px/1 var(--lab-mono);border-bottom:1px solid var(--lab-rule)}
.mpc .tabline .tab{padding:13px 18px;background:var(--lab-bg);color:var(--lab-text);border-right:1px solid var(--lab-rule)}
.mpc .tabline .tab b{color:var(--lab-accent);font-weight:500;margin-right:8px}
.mpc .tabline .path{padding:13px 18px;color:var(--lab-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mpc .code{padding:22px 32px 26px var(--nv-gutter)}
.mpc .text{min-width:0;counter-reset:ln}
.mpc .text>:not(dl),.mpc .text dt{position:relative;counter-increment:ln}
.mpc .text>:not(dl)::before,.mpc .text dt::before{content:counter(ln);position:absolute;left:calc(-1 * var(--nv-gutter));width:calc(var(--nv-gutter) - 18px);
  text-align:right;font:400 12.5px/1 var(--lab-mono);letter-spacing:0;color:color-mix(in srgb,var(--lab-muted) 70%,transparent);top:.55em}
.mpc .text>h2::before{color:var(--lab-accent);top:.9em}
.mpc .text dt::before{top:.6em}
.mpc .text h2{font:700 clamp(32px,4vw,44px)/1.05 var(--lab-heading);letter-spacing:-.04em;margin:0 0 4px}
.mpc .text h2 .hash{font-family:var(--lab-mono);font-weight:400;color:var(--lab-accent);font-size:.6em;margin-right:12px;letter-spacing:0;vertical-align:.15em}
.mpc .text h2 a:hover{color:var(--lab-accent)}
.mpc .text .kind{font:12.5px/1.6 var(--lab-mono);color:var(--lab-muted);margin:0 0 14px}
.mpc .text .kind i{font-style:normal;color:var(--lab-accent)}
.mpc .text p.d{margin:0 0 8px;line-height:1.65;max-width:64ch;font-size:17px}
.mpc .text p.l{margin:0 0 16px;line-height:1.65;max-width:64ch;color:var(--lab-muted);font-size:15px}
.mpc .kv{font:13px/1.9 var(--lab-mono);margin:0;display:grid;grid-template-columns:max-content minmax(0,1fr);gap:0 14px}
.mpc .kv dt{color:var(--lab-accent)}
.mpc .kv dd{margin:0;overflow-wrap:anywhere}
.mpc .kv dd a{text-decoration:underline;text-underline-offset:.2em;text-decoration-thickness:1px}
.mpc .kv dd a:hover{color:var(--lab-accent)}
.mpc .kv .str{color:var(--lab-text)}
.mpc .kv .str::before,.mpc .kv .str::after{content:'"';color:var(--lab-muted)}
.mpc .kv .sep{color:var(--lab-muted)}

.mpc .status{display:flex;align-items:stretch;font:12px/1 var(--lab-mono);background:color-mix(in srgb,var(--lab-text) 6%,var(--lab-surface));min-height:34px}
.mpc .status>*{display:flex;align-items:center;padding:0 14px;white-space:nowrap}
.mpc .status .mode{background:var(--lab-accent);color:var(--lab-bg);font-weight:700;letter-spacing:.06em}
.mpc .status .name{background:color-mix(in srgb,var(--lab-accent) 18%,transparent);font-weight:600}
.mpc .status .muted{color:var(--lab-muted)}
.mpc .status .fill{flex:1;padding:0}
.mpc .status .ph .mock-ph{border:0;padding:0}

.mpc details{border-top:1px solid var(--lab-rule)}
.mpc summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:12px;padding:14px 22px;font:13px/1.4 var(--lab-mono)}
.mpc summary::-webkit-details-marker{display:none}
.mpc summary::before{content:'▸';color:var(--lab-accent);transition:transform .2s cubic-bezier(.25,1,.5,1)}
.mpc details[open] summary::before{transform:rotate(90deg)}
.mpc summary kbd{font:11px/1 var(--lab-mono);border:1px solid var(--lab-rule);border-radius:5px;padding:3px 6px;color:var(--lab-muted);margin-left:auto}
.mpc summary:hover{color:var(--lab-accent)}
.mpc summary:focus-visible{outline:2px solid var(--lab-accent);outline-offset:-2px}
.mpc .picker{margin:0 22px 22px;border:1px solid var(--lab-rule);border-radius:14px;overflow:hidden;background:var(--lab-bg)}
.mpc .prompt{display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--lab-rule);font:12.5px/1.4 var(--lab-mono)}
.mpc .prompt span:first-child{color:var(--lab-accent)}
.mpc .prompt span:last-child{color:var(--lab-muted)}
.mpc .picker ol{list-style:none;margin:0;padding:6px 0;max-height:260px;overflow:auto}
.mpc .picker li{margin:0}
.mpc .picker a{display:grid;grid-template-columns:96px minmax(0,1fr);gap:14px;padding:7px 14px;font-size:15px;line-height:1.4}
.mpc .picker a time{font:12px/1.7 var(--lab-mono);color:var(--lab-muted)}
.mpc .picker li:first-child a,.mpc .picker a:hover{background:color-mix(in srgb,var(--lab-accent) 14%,transparent)}
.mpc .picker li:first-child a{box-shadow:inset 3px 0 0 var(--lab-accent)}
@media (max-width:860px){
 .mpc .layout{grid-template-columns:minmax(0,1fr)}
 .mpc .tree,.mpc .buffers{min-width:0}
 .mpc .tree{position:static}
 .mpc .tree ul{display:flex;overflow-x:auto}
 .mpc .tree a{white-space:nowrap;padding:8px 14px}
 .mpc .tree a span,.mpc .tree .dir,.mpc .tree .foot{display:none}
}
@media (max-width:520px){
 .mpc{--nv-gutter:34px}
 .mpc .code{padding-right:18px}
 .mpc .text>:not(dl)::before,.mpc .text dt::before{width:calc(var(--nv-gutter) - 10px)}
 .mpc .status .hide-sm{display:none}
 .mpc .kv{grid-template-columns:1fr}
 .mpc .kv dd{margin-bottom:6px}
 .mpc .picker{margin:0 12px 16px}
 .mpc .picker a{grid-template-columns:1fr;gap:0}
 .mpc .tabline .path{display:none}
}
"""

    def buf(p, i):
        kv = [("stack", '<span class="sep">, </span>'.join(f'<span class="str">{e(s)}</span>' for s in p["stack"]))]
        if p["repo"]:
            kv.append(("repo", f'<a href="{p["repo"]}">{e(p["repo"].split("//")[1])}</a>'))
        else:
            kv.append(("repo", '<span class="muted">closed source</span>'))
        if p["site"]:
            kv.append(("site", f'<a href="{p["site"]}">{e(p["site"].split("//")[1])}</a>'))
        for t, h, ev in p["talks"]:
            kv.append(("talk", f'<a href="{h}">{e(t)}</a> <span class="sep">· {e(ev)}</span>'))
        kvh = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in kv)
        posts = "".join(f'<li><a href="{x["href"]}"><time datetime="{x["date"]}">{x["date"]}</time>{e(x["title"])}</a></li>' for x in p["posts"])
        return f"""<article class="buf" id="{p['slug']}" aria-labelledby="pc-{p['slug']}">
 <div class="tabline" aria-hidden="true"><span class="tab"><b>{i}</b>{p['slug']}.md</span><span class="path">~/projects/{p['slug']}/README.md</span></div>
 <div class="code">
  <div class="text">
   <h2 id="pc-{p['slug']}"><span class="hash" aria-hidden="true">#</span><a href="{p['repo'] or p['site']}">{e(p['name'])}</a></h2>
   <p class="kind"><i aria-hidden="true">&gt; </i>{e(p['kind'])}</p>
   <p class="d">{e(p['desc'])}</p>
   <p class="l">{e(p['long'])}</p>
   <dl class="kv">{kvh}</dl>
  </div>
 </div>
 <div class="status" aria-label="Summary for {e(p['name'])}">
  <span class="mode">NORMAL</span><span class="name">{p['slug']}</span><span class="muted hide-sm">{p['ft']}</span>
  <span class="fill"></span><span class="ph">{PH('status')}</span><span class="muted">{nposts(p)}</span>
 </div>
 <details{' open' if i == 1 else ''}>
  <summary>Related posts ({len(p['posts'])})<kbd aria-hidden="true">&lt;leader&gt;fp</kbd></summary>
  <div class="picker"><div class="prompt" aria-hidden="true"><span>&gt; {p['slug']}</span><span>{len(p['posts'])} / {len(p['posts'])}</span></div><ol>{posts}</ol></div>
 </details>
</article>"""

    tree = "".join(f'<li><a href="#{p["slug"]}"{" aria-current=true" if i == 0 else ""}>{p["slug"]}<span>{len(p["posts"])}</span></a></li>' for i, p in enumerate(PROJECTS))
    bufs = "".join(buf(p, i + 1) for i, p in enumerate(PROJECTS))
    html = f"""<style>{css}</style>
<div data-mock-wide class="mock-wrap mpc">
<header class="page-lab-header"><p class="page-lab-kicker">:e ~/projects/</p><h1>Projects</h1>
<p>Things I've built and written about, one buffer each. Open the picker under a project to jump to its posts.</p></header>
<div class="layout">
 <nav class="tree" aria-label="Projects"><h2>Explorer</h2><div class="dir" aria-hidden="true">~/projects/</div><ul>{tree}</ul>
 <p class="foot">{len(PROJECTS)} projects · {TOTAL_POSTS} posts</p></nav>
 <div class="buffers">{bufs}</div>
</div>
</div>"""
    render("projects", "c", "Projects (c) | Haseeb Majid", html)


alt_a(); alt_b(); alt_c()
print("ok", TOTAL_POSTS)
