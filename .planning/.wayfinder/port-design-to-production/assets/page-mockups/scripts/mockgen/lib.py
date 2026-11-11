import json,re,html,collections,datetime
posts=json.load(open('/tmp/mockgen/posts.json'))
E=html.escape
SMALL={'a','an','and','the','with','in','of','on','to','for','or','vs'}
def tcase(s):
    w=s.split()
    return ' '.join(x if (x[0].isupper() or (i and x.lower() in SMALL)) else x[0].upper()+x[1:] for i,x in enumerate(w))
def strip_til(t):
    return re.sub(r'^\s*TIL\s*[:\-–—]\s*','',t,flags=re.I).strip()
def is_til(p): return any(s.lower()=='til' for s in p['series'])
til=sorted([p for p in posts if is_til(p)],key=lambda p:p['date'],reverse=True)
def fmt(d,f='%d %b %Y'): return datetime.date.fromisoformat(d).strftime(f)
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def taglabel(t): return t.lower()
series=collections.OrderedDict()
for p in sorted(posts,key=lambda p:p['date']):
    for s in p['series']:
        if s.lower()=='til': continue
        series.setdefault(tcase(s),dict(raw=s,posts=[]))['posts'].append(p)
for k,v in series.items():
    ps=v['posts'];v['name']=k;v['n']=len(ps);v['first']=ps[0]['date'];v['last']=ps[-1]['date']
    v['slug']=slug(v['raw']);v['tags']=[t for t,_ in collections.Counter(t.lower() for p in ps for t in p['tags']).most_common(4)]
TEMPLATE=open('/tmp/ogbuild/mock-template.html').read()
def write(page,alt,title,body):
    import os
    t=TEMPLATE.replace('MOCK_TITLE',title).replace('<!--MOCK-->',body).replace('class="main post"','class="main"')
    d=f'/tmp/ogbuild/mockups/{page}/{alt}';os.makedirs(d,exist_ok=True)
    open(d+'/index.html','w').write(t)
ALIAS={'nvim':'neovim','golang':'go','ci/cd':'ci-cd','test':'testing','home-manager':'home-manager'}
def ntags(p):
    out=[]
    for t in p['tags']:
        t=ALIAS.get(t.lower(),t.lower())
        if t not in out: out.append(t)
    return out
def ttl(p):
    s=E(strip_til(p['title']))
    return re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
def plain(p): return strip_til(p['title']).replace('`','')
def url(p): return f"/posts/{p['dir']}/"
tagcount=collections.Counter(t for p in til for t in ntags(p))
S=sorted(series.values(),key=lambda v:v['last'],reverse=True)
NPARTS=sum(v['n'] for v in S)
def span(v,f='%b %Y'):
    a,b=fmt(v['first'],f),fmt(v['last'],f)
    return a if a==b else f'{a} – {b}'
def ptitle(p): return E(p['title'])
