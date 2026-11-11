import re,sys,os
tpl=open('/tmp/ogbuild/mock-template.html').read()
home=open('/tmp/ogbuild/index.html').read()
i=home.find('<div class=social-icons>'); j=home.find('</div>',i)+6
SOC=home[i:j]
PHOTO='/talks/gophercon-htmx-go-web-app/images/1Q2A7438_hu_5770169478addbc5.webp'
names=sys.argv[1:] or [f[:-5] for f in os.listdir('/tmp/mock/src') if f.endswith('.html')]
for n in names:
    page,alt=n.split('-')
    body=open(f'/tmp/mock/src/{n}.html').read().replace('{{SOCIALS}}',SOC).replace('{{PHOTO}}',PHOTO)
    title=('About' if page=='about' else 'Now')+f' ({alt.upper()}) | Haseeb Majid'
    out=tpl.replace('MOCK_TITLE',title).replace('<!--MOCK-->',body)
    d=f'/tmp/ogbuild/mockups/{page}/{alt}'; os.makedirs(d,exist_ok=True)
    open(d+'/index.html','w').write(out); print('built',d)
