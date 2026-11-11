import sys, json
sys.path.insert(0, "/tmp/mock/gen")
from data import DECKS, PH, COMMON_CSS, render, fdate, INTRO
from html import escape as e

# Treatment mirrors each deck's real theme: dark (Slidev dark / dracula), tint (catppuccin), plain (zoe / none)
THEME = {"go-labs-eda-go-kafka": "dark", "python-to-go-concurrency": "dark", "an-intro-to-pocketbase": "dark",
         "gitlab-runners-and-dind": "plain", "my-journey-using-docker-as-a-developer-tool": "plain",
         "faster-go-tests-and-postgres": "plain"}
for d in DECKS:
    d["theme"] = THEME.get(d["slug"], "tint")
    if d["slug"] == "gitlab-runners-and-dind":
        d["topic"] = "ci"


def ev(d):
    return e(d["event"]) if d["event"] else PH("event")


def slides_href(d):
    return d["res"][0][1]


def chips(d, cls="page-lab-resources", only=None):
    items = [(k, v) for k, v in d["res"] if not only or k in only]
    return (f'<ul class="{cls}" aria-label="Resources for {e(d["title"])}">' +
            "".join(f'<li><a href="{v}" aria-label="{k}: {e(d["title"])}">{k}</a></li>' for k, v in items) + "</ul>")


THUMB_CSS = """
.thumb{container-type:inline-size;aspect-ratio:16/9;border-radius:16px;position:relative;overflow:hidden;display:block;
  background:var(--lab-surface);color:var(--lab-text);border:1px solid var(--lab-rule);
  transition:transform .35s cubic-bezier(.25,1,.5,1),box-shadow .35s cubic-bezier(.25,1,.5,1)}
.thumb .in{position:absolute;inset:0;padding:7cqi 7.5cqi;display:flex;flex-direction:column}
.thumb .ev{font:500 max(9px,2.9cqi)/1.2 var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-accent)}
.thumb .t{font:700 max(13px,7.4cqi)/1.04 var(--lab-heading);letter-spacing:-.035em;margin-top:auto;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-wrap:balance}
.thumb .ft{display:flex;justify-content:space-between;margin-top:5cqi;font:max(9px,2.6cqi)/1 var(--lab-mono);opacity:.7}
.thumb::after{content:'';position:absolute;right:-12cqi;top:-12cqi;width:38cqi;height:38cqi;border-radius:50%;
  background:color-mix(in srgb,var(--lab-accent) 14%,transparent)}
.thumb.tint{background:color-mix(in srgb,var(--lab-accent) 13%,var(--lab-surface));border-color:transparent}
.thumb.tint::after{background:color-mix(in srgb,var(--lab-accent) 22%,transparent)}
.thumb.dark{background:var(--lab-text);color:var(--lab-bg);border-color:transparent}
.thumb.dark .ev{color:color-mix(in srgb,var(--lab-accent) 55%,var(--lab-bg))}
.thumb.dark::after{background:color-mix(in srgb,var(--lab-accent) 35%,transparent)}
html[data-mode=dark] .thumb.dark{background:var(--lab-bg);color:var(--lab-text);border-color:color-mix(in srgb,var(--lab-accent) 35%,transparent)}
html[data-mode=dark] .thumb.dark .ev{color:var(--lab-accent)}
a:hover>.thumb,a:focus-visible>.thumb{transform:translateY(-3px);box-shadow:0 18px 34px -22px color-mix(in srgb,var(--lab-text) 55%,transparent)}
"""


def thumb(d, extra=""):
    return (f'<span class="thumb {d["theme"]} {extra}" aria-hidden="true"><span class="in">'
            f'<span class="ev">{e(d["event"] or "Talk")} · {d["date"][:4]}</span>'
            f'<span class="t">{e(d["title"])}</span>'
            f'<span class="ft"><span>Haseeb Majid</span><span>01</span></span></span></span>')


# ---------------------------------------------------------------- A: gallery
def alt_a():
    css = COMMON_CSS + THUMB_CSS + """
.msa .page-lab-header{border:0;margin-bottom:36px}
.msa .page-lab-header p a{color:var(--lab-accent);text-decoration:underline;text-underline-offset:.2em}
.msa .lead{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:44px;align-items:center;
  background:var(--lab-surface);border-radius:28px;padding:36px;margin-bottom:64px}
.msa .lead .thumb{border-radius:18px}
.msa .lead h2{font:700 clamp(28px,3.2vw,40px)/1.08 var(--lab-heading);letter-spacing:-.04em;margin:14px 0 14px}
.msa .lead h2 a:hover{color:var(--lab-accent)}
.msa .lead p.s{color:var(--lab-muted);line-height:1.7;margin:0 0 6px}
.msa .meta{font:12.5px/1.6 var(--lab-mono);color:var(--lab-muted);margin:0}
.msa .lab-section-head{margin-bottom:28px}
.msa .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:44px 28px}
.msa .deck{display:flex;flex-direction:column;min-width:0}
.msa .deck>a{display:block;border-radius:16px}
.msa .deck h3{font:700 19px/1.3 var(--lab-heading);letter-spacing:-.015em;margin:18px 0 6px}
.msa .deck h3 a:hover{color:var(--lab-accent)}
.msa .deck .page-lab-resources{margin-top:12px;gap:6px}
.msa .deck .page-lab-resources a{min-height:32px;padding:4px 10px;font-size:12px}
.msa .year{grid-column:1/-1;display:flex;align-items:center;gap:18px;font:700 13px/1 var(--lab-mono);color:var(--lab-accent);margin-bottom:-18px}
.msa .year::after{content:'';flex:1;height:1px;background:var(--lab-rule)}
@media (max-width:980px){.msa .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:760px){
 .msa .lead{grid-template-columns:1fr;padding:22px;gap:22px;border-radius:22px}
 .msa .grid{grid-template-columns:1fr;gap:36px}
}
"""
    lead, rest = DECKS[0], DECKS[1:]
    cards, year = "", None
    for d in rest:
        y = d["date"][:4]
        if y != year:
            cards += f'<h2 class="year" id="sa-{y}">{y}</h2>'
            year = y
        cards += f"""<article class="deck" aria-labelledby="sa-{d['slug']}">
 <a href="{slides_href(d)}" tabindex="-1">{thumb(d)}</a>
 <h3 id="sa-{d['slug']}"><a href="{slides_href(d)}">{e(d['title'])}</a></h3>
 <p class="meta">{ev(d)} · <time datetime="{d['date']}">{fdate(d['date'])}</time></p>
 {chips(d)}
</article>"""
    html = f"""<style>{css}</style>
<div data-mock-wide class="mock-wrap msa">
<header class="page-lab-header"><p class="page-lab-kicker">Speaking / decks</p><h1>Slides</h1><p>{INTRO}</p></header>
<section class="lead" aria-labelledby="sa-lead">
 <a href="{slides_href(lead)}" tabindex="-1">{thumb(lead)}</a>
 <div><p class="lab-eyebrow">Newest deck</p>
  <h2 id="sa-lead"><a href="{slides_href(lead)}">{e(lead['title'])}</a></h2>
  <p class="s">{e(lead['summary'])}</p>
  <p class="meta">{ev(lead)} · <time datetime="{lead['date']}">{fdate(lead['date'])}</time> · {lead['engine']}</p>
  {chips(lead)}
 </div>
</section>
<div class="lab-section-head"><div><p class="lab-eyebrow">{len(rest)} more</p><h2>Every deck</h2></div><a href="/talks/">Talk pages ↗</a></div>
<div class="grid">{cards}</div>
</div>"""
    render("slides", "a", "Slides (a) | Haseeb Majid", html)


# ---------------------------------------------------------------- B: table
def alt_b():
    css = COMMON_CSS + """
.msb .head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:end;margin-bottom:30px}
.msb .head h1{font:700 clamp(48px,7vw,88px)/.95 var(--lab-heading);letter-spacing:-.055em;margin:12px 0 0}
.msb .head p{margin:0;line-height:1.7;color:var(--lab-muted)}
.msb .head p a{color:var(--lab-accent);text-decoration:underline;text-underline-offset:.2em}
.msb .filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:16px 0;border-top:1px solid var(--lab-rule);border-bottom:1px solid var(--lab-rule)}
.msb .filters span{font:11px/1 var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-muted);margin-right:6px}
.msb .filters button{font:13px/1 var(--lab-mono);color:var(--lab-text);background:transparent;border:1px solid var(--lab-rule);border-radius:999px;
  padding:9px 14px;cursor:pointer;min-height:36px}
.msb .filters button:hover{border-color:var(--lab-accent)}
.msb .filters button[aria-pressed=true]{background:var(--lab-text);color:var(--lab-bg);border-color:var(--lab-text)}
.msb .filters button:focus-visible{outline:2px solid var(--lab-accent);outline-offset:2px}
.msb .filters b{font-weight:400;opacity:.6;margin-left:6px}
.msb table{width:100%;border-collapse:collapse;margin-top:8px;font-size:15px}
.msb caption{text-align:left;font:12px/1.6 var(--lab-mono);color:var(--lab-muted);padding:12px 0 0;caption-side:bottom}
.msb thead th{font:11px/1 var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-muted);text-align:left;font-weight:400;padding:18px 12px 12px 0;border-bottom:1px solid var(--lab-rule)}
.msb tbody th[scope=rowgroup]{font:700 22px/1 var(--lab-heading);letter-spacing:-.02em;text-align:left;padding:30px 0 10px;color:var(--lab-accent);border-bottom:1px solid var(--lab-rule)}
.msb td{padding:16px 12px 16px 0;border-bottom:1px solid var(--lab-rule);vertical-align:top;line-height:1.45}
.msb td.date{font:12.5px/1.7 var(--lab-mono);color:var(--lab-muted);white-space:nowrap;width:76px}
.msb td.deck a{font:600 17px/1.35 var(--lab-heading);letter-spacing:-.01em}
.msb td.deck a:hover{color:var(--lab-accent)}
.msb td.ev{white-space:nowrap;width:150px}
.msb td.eng{font:12px/1.7 var(--lab-mono);color:var(--lab-muted);white-space:nowrap;width:96px}
.msb td.res{width:300px}
.msb .r{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:0;padding:0}
.msb .r li{margin:0}
.msb .r a{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:4px 10px;border-radius:6px;font:12.5px/1 var(--lab-mono);
  color:var(--lab-accent);background:color-mix(in srgb,var(--lab-accent) 10%,transparent)}
.msb .r a:hover{background:color-mix(in srgb,var(--lab-accent) 22%,transparent)}
.msb .r a[data-k=Slides]{background:var(--lab-accent);color:var(--lab-bg)}
.msb .r .none{font:12.5px/2.4 var(--lab-mono);color:var(--lab-muted)}
.msb tr[hidden]{display:none}
.msb .rerun{display:inline-block;margin-left:8px;font:11px/1 var(--lab-mono);color:var(--lab-muted);border:1px solid var(--lab-rule);border-radius:999px;padding:3px 7px;vertical-align:2px}
@media (max-width:820px){
 .msb .head{grid-template-columns:1fr;gap:16px}
 .msb caption{display:block;padding-top:18px}
 .msb .filters{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-right:-24px;padding-right:24px}
 .msb .filters button,.msb .filters span{white-space:nowrap;flex:none}
 .msb thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
 .msb table,.msb tbody,.msb tr,.msb td{display:block;width:auto}
 .msb tbody th[scope=rowgroup]{display:block}
 .msb tr{padding:16px 0;border-bottom:1px solid var(--lab-rule);display:grid;grid-template-columns:auto 1fr;gap:6px 12px}
 .msb td{border:0;padding:0}
 .msb td.deck{grid-column:1/-1;order:-1}
 .msb td.date,.msb td.ev{width:auto}
 .msb td.eng{display:none}
 .msb td.res{grid-column:1/-1;width:auto;margin-top:6px}
 .msb tbody tr:first-child{padding-top:0}
 .msb tbody tr.yr{display:block;padding:0;border:0}
}
"""
    events = {}
    for d in DECKS:
        k = d["event"] or "Other"
        events[k] = events.get(k, 0) + 1
    titles = {}
    for d in DECKS:
        titles[d["title"]] = titles.get(d["title"], 0) + 1
    btns = f'<button type="button" aria-pressed="true" data-f="*">All<b>{len(DECKS)}</b></button>' + "".join(
        f'<button type="button" aria-pressed="false" data-f="{e(k)}">{e(k)}<b>{n}</b></button>' for k, n in sorted(events.items(), key=lambda x: (-x[1], x[0])))
    body, year = "", None
    seen = {}
    for d in DECKS:
        y = d["date"][:4]
        if y != year:
            if year:
                body += "</tbody>"
            body += f'<tbody><tr class="yr"><th scope="rowgroup" colspan="5">{y}</th></tr>'
            year = y
        rr = ""
        if titles[d["title"]] > 1:
            seen[d["title"]] = seen.get(d["title"], 0) + 1
            rr = f'<span class="rerun">run {titles[d["title"]] - seen[d["title"]] + 1} of {titles[d["title"]]}</span>'
        res = "".join(f'<li><a data-k="{k}" href="{v}" aria-label="{k}: {e(d["title"])}">{k}</a></li>' for k, v in d["res"])
        body += f"""<tr data-ev="{e(d['event'] or 'Other')}"><td class="date"><time datetime="{d['date']}">{fdate(d['date'], True)}</time></td>
<td class="deck"><a href="{slides_href(d)}">{e(d['title'])}</a>{rr}</td><td class="ev">{ev(d)}</td><td class="eng">{d['engine']}</td>
<td class="res"><ul class="r">{res}</ul></td></tr>"""
    body += "</tbody>"
    js = """document.querySelectorAll('.msb .filters button').forEach(b=>b.addEventListener('click',()=>{
const f=b.dataset.f;document.querySelectorAll('.msb .filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));
document.querySelectorAll('.msb tbody tr:not(.yr)').forEach(r=>r.hidden=!(f==='*'||r.dataset.ev===f));
document.querySelectorAll('.msb tbody').forEach(t=>t.hidden=!t.querySelector('tr:not(.yr):not([hidden])'));}));"""
    html = f"""<style>{css}</style>
<div data-mock-wide class="mock-wrap msb">
<header class="head"><div><p class="lab-eyebrow">Index / {len(DECKS)} decks</p><h1>Slides</h1></div><p>{INTRO} Every deck, with its slides, PDF and recording one click away.</p></header>
<div class="filters" role="group" aria-label="Filter by event"><span>Event</span>{btns}</div>
<table><caption>Dates are from each talk page. "Other" marks decks with no event recorded.</caption>
<thead><tr><th scope="col">Date</th><th scope="col">Deck</th><th scope="col">Event</th><th scope="col">Built with</th><th scope="col">Resources</th></tr></thead>
{body}</table>
</div><script>{js}</script>"""
    render("slides", "b", "Slides (b) | Haseeb Majid", html)


# ---------------------------------------------------------------- C: presenter view + by subject
TOPICS = [("concurrency", "Concurrency, from Python to Go"), ("kafka", "Event-driven Go with Kafka"),
          ("htmx", "Web apps with Go & HTMX"), ("otel", "Observability with OTel"),
          ("testing", "Integration testing in Go"), ("nix", "Reproducible environments with Nix"),
          ("ci", "GitLab runners & Docker-in-Docker"), ("pocketbase", "PocketBase"), ("docker", "Docker as a dev tool")]

ABSTRACT = ("A 30-minute introduction to Go concurrency for developers who know Python but are new to Go. "
            "We start with a working Python HTTP service, translate it into Go, and improve it one observable problem at a time.")


def alt_c():
    css = COMMON_CSS + THUMB_CSS + """
.msc .page-lab-header{border:0;margin-bottom:30px}
.msc .page-lab-header p a{color:var(--lab-accent);text-decoration:underline;text-underline-offset:.2em}
.msc .pv{background:var(--lab-surface);border-radius:28px;padding:22px;display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:22px}
.msc .pv-top{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:2px 6px;font:12px/1 var(--lab-mono);color:var(--lab-muted)}
.msc .pv-top .live{display:inline-flex;align-items:center;gap:8px;color:var(--lab-accent);text-transform:uppercase;letter-spacing:.1em;font-size:11px}
.msc .pv-top .live::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--lab-accent)}
.msc .pv .thumb{border-radius:18px}
.msc .pv .thumb .t{font-size:max(15px,6.6cqi)}
.msc .notes{display:flex;flex-direction:column;gap:16px;min-width:0;padding:6px 6px 6px 0}
.msc .notes h2{font:700 clamp(24px,2.6vw,32px)/1.12 var(--lab-heading);letter-spacing:-.035em;margin:0}
.msc .notes h2 a:hover{color:var(--lab-accent)}
.msc .notebox{background:var(--lab-bg);border-radius:16px;padding:18px 20px;line-height:1.7;font-size:15px}
.msc .notebox p{margin:0}
.msc .notebox .lbl{font:11px/1 var(--lab-mono);text-transform:uppercase;letter-spacing:.1em;color:var(--lab-muted);margin-bottom:10px}
.msc .clock{display:flex;gap:26px;font:12px/1.4 var(--lab-mono);color:var(--lab-muted);margin:0}
.msc .clock div{display:grid;gap:4px}
.msc .clock dd{margin:0;font:600 18px/1 var(--lab-mono);color:var(--lab-text)}
.msc .clock dt{order:2}
.msc .notes .page-lab-resources{margin-top:auto}
.msc .subj{margin-top:72px}
.msc .lab-section-head{margin-bottom:6px}
.msc .topic{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr) 220px;gap:32px;padding:30px 0;border-bottom:1px solid var(--lab-rule);align-items:start}
.msc .topic h3{font:700 26px/1.12 var(--lab-heading);letter-spacing:-.03em;margin:0}
.msc .topic .n{font:12px/1.6 var(--lab-mono);color:var(--lab-muted);margin:10px 0 0}
.msc .topic .n b{color:var(--lab-accent);font-weight:500}
.msc .runs{list-style:none;margin:0;padding:0;display:grid;gap:0}
.msc .runs>li{margin:0;padding:0 0 18px 22px;position:relative;border-left:1px solid var(--lab-rule)}
.msc .runs>li:last-child{padding-bottom:0;border-left-color:transparent}
.msc .runs>li::before{content:'';position:absolute;left:-5px;top:6px;width:9px;height:9px;border-radius:50%;background:var(--lab-surface);border:2px solid var(--lab-accent);box-sizing:border-box}
.msc .runs>li:first-child::before{background:var(--lab-accent)}
.msc .run-h{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline}
.msc .run-h time{font:12.5px/1.5 var(--lab-mono);color:var(--lab-muted)}
.msc .run-h strong{font-weight:500}
.msc .run-t{margin:4px 0 0;font-size:15px;color:var(--lab-muted);line-height:1.5}
.msc .run-t a{text-decoration:underline;text-underline-offset:.2em;text-decoration-color:var(--lab-rule)}
.msc .run-t a:hover{color:var(--lab-accent)}
.msc .runs .page-lab-resources{margin-top:10px;gap:6px}
.msc .runs .page-lab-resources a{min-height:32px;padding:4px 10px;font-size:12px}
.msc .ph-img{margin:0;border-radius:16px;overflow:hidden;aspect-ratio:4/3;background:var(--lab-surface)}
.msc .ph-img img{width:100%;height:100%;object-fit:cover;display:block}
.msc .ph-img figcaption{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.msc .topic .thumb{aspect-ratio:4/3}
.msc .topic .thumb .t{font-size:max(14px,8.6cqi)}
@media (max-width:900px){
 .msc .pv{grid-template-columns:1fr;padding:16px;border-radius:22px}
 .msc .notes{padding:0 4px 4px}
 .msc .topic{grid-template-columns:minmax(0,1fr) 140px;gap:16px 20px}
 .msc .topic .runs{grid-column:1/-1;grid-row:2}
 .msc .topic .ph-img,.msc .topic>a{grid-column:2;grid-row:1}
 .msc .clock{flex-wrap:wrap;gap:16px 22px}
 .msc .topic>a{display:none}
 .msc .topic:not(:has(.ph-img)){grid-template-columns:minmax(0,1fr)}
}
@media (max-width:480px){.msc .topic{grid-template-columns:minmax(0,1fr) 104px}}
"""
    cur = next(d for d in DECKS if d["slug"] == "python-to-go-concurrency")
    cur_res = cur["res"] + [("Talk page", cur["talk"])]
    cur_chips = ('<ul class="page-lab-resources" aria-label="Resources">' +
                 "".join(f'<li><a href="{v}">{k}</a></li>' for k, v in cur_res) + "</ul>")
    topics = ""
    for key, name in TOPICS:
        ds = [d for d in DECKS if d["topic"] == key]
        photo = next((d for d in ds if d.get("photo")), None)
        runs = ""
        for d in ds:
            link = f'<a href="{d["talk"]}">{e(d["title"])}</a>' if d["talk"] else e(d["title"])
            runs += f"""<li><div class="run-h"><time datetime="{d['date']}">{fdate(d['date'])}</time><strong>{ev(d)}</strong></div>
<p class="run-t">{link}</p>{chips(d)}</li>"""
        n = len(ds)
        side = (f'<figure class="ph-img"><img src="{photo["photo"]}" alt="{e(photo["photo_alt"])}"><figcaption>{e(photo["photo_alt"])}</figcaption></figure>'
                if photo else f'<a href="{slides_href(ds[0])}" tabindex="-1">{thumb(ds[0])}</a>')
        topics += f"""<article class="topic" aria-labelledby="sc-{key}"><div><h3 id="sc-{key}">{e(name)}</h3>
<p class="n">{'<b>Given ' + str(n) + ' times</b>' if n > 1 else 'One deck'} · {ds[-1]['date'][:4]}{'–' + ds[0]['date'][:4] if ds[0]['date'][:4] != ds[-1]['date'][:4] else ''}</p></div>
<ol class="runs" reversed>{runs}</ol>{side}</article>"""
    html = f"""<style>{css}</style>
<div data-mock-wide class="mock-wrap msc">
<header class="page-lab-header"><p class="page-lab-kicker">Speaking / decks</p><h1>Slides</h1><p>{INTRO}</p></header>
<section class="pv" aria-labelledby="sc-cur">
 <div class="pv-top"><span class="live">Latest deck</span><span>{cur['engine']} deck</span></div>
 <a href="{slides_href(cur)}" tabindex="-1">{thumb(cur)}</a>
 <div class="notes">
  <h2 id="sc-cur"><a href="{slides_href(cur)}">{e(cur['title'])}</a></h2>
  <div class="notebox"><p class="lbl">Abstract</p><p>{e(ABSTRACT)}</p></div>
  <dl class="clock"><div><dd>{fdate(cur['date'])}</dd><dt>given</dt></div><div><dd>{ev(cur)}</dd><dt>where</dt></div><div><dd>{len(DECKS)}</dd><dt>decks so far</dt></div></dl>
  {cur_chips}
 </div>
</section>
<section class="subj" aria-labelledby="sc-subj">
 <div class="lab-section-head"><div><p class="lab-eyebrow">One subject, several stages</p><h2 id="sc-subj">By subject</h2></div><a href="/talks/">All talks ↗</a></div>
 {topics}
</section>
</div>"""
    render("slides", "c", "Slides (c) | Haseeb Majid", html)


alt_a(); alt_b(); alt_c()
print("ok")
