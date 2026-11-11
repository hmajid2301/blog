import os,re,json,glob
B='/home/haseebmajid/Documents/blog/content/posts'
def unq(s):
    s=s.strip()
    if len(s)>1 and s[0]==s[-1] and s[0] in '"\'':
        s=s[1:-1]
        if s and False: pass
    return s.replace("''","'")
def parse(fm):
    out={};key=None
    for line in fm.split('\n'):
        m=re.match(r'^([A-Za-z_]+):\s*(.*)$',line)
        if m:
            key=m.group(1);v=m.group(2).strip()
            if v.startswith('['):
                out[key]=[unq(x) for x in v.strip('[]').split(',') if x.strip()]
            elif v=='': out[key]=[]
            else: out[key]=unq(v)
        else:
            m=re.match(r'^\s+-\s+(.*)$',line)
            if m and key and isinstance(out.get(key),list): out[key].append(unq(m.group(1)))
    return out
posts=[]
for f in sorted(glob.glob(B+'/*/index.md')):
    t=open(f).read()
    m=re.match(r'^\s*---\n(.*?)\n---',t,re.S)
    if not m: print('NOFM',f); continue
    fm=parse(m.group(1))
    if str(fm.get('draft','')).lower()=='true': continue
    d=os.path.basename(os.path.dirname(f))
    s=fm.get('series') or []
    if isinstance(s,str): s=[s]
    tg=fm.get('tags') or []
    if isinstance(tg,str): tg=[tg]
    posts.append(dict(dir=d,title=fm.get('title',''),date=str(fm.get('date',''))[:10],tags=tg,series=s))
json.dump(posts,open('/tmp/mockgen/posts.json','w'),indent=0)
print(len(posts))
from collections import Counter
c=Counter(s for p in posts for s in p['series'])
for k,v in sorted(c.items(),key=lambda x:x[0].lower()): print(repr(k),v)
