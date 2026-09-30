"""Release checks for metadata, links, contrast and obvious client-side secrets."""
from pathlib import Path
from html.parser import HTMLParser
import json,re
from urllib.parse import urlsplit
R=Path(__file__).resolve().parents[1];D=R/'dist'
class Tags(HTMLParser):
 def __init__(self,text):super().__init__();self.tags=[];self.feed(text)
 def handle_starttag(self,t,a):self.tags.append((t,dict(a)))
for p in D.rglob('*.html'):
 parsed=Tags(p.read_text());a=parsed.tags
 for t,attr in a:
  for k in ['href','src']:
   value=attr.get(k,'');assert not value.startswith('http://'),f'Insecure resource in {p}'
  if t=='a' and attr.get('target')=='_blank':
   assert {'noopener','noreferrer'}<=set(attr.get('rel','').split()),f'Unsafe external link in {p}'
 if 'evidence' not in p.parts and 'missed-enquiry-demo' not in p.parts:
  meta={x.get('name',x.get('property')):x.get('content') for t,x in a if t=='meta'}
  assert meta.get('description') and meta.get('og:title') and meta.get('og:description')
  assert meta.get('og:image')=='https://agents.abhinandantejaswi.com/assets/agents-og.png'
  assert meta.get('twitter:card')=='summary_large_image'
  assert meta.get('twitter:title')==meta.get('og:title')
  assert meta.get('twitter:description')==meta.get('og:description')
  assert any(t=='link' and x.get('rel')=='icon' for t,x in a)
  if p==D/'index.html':
   assert next(x for t,x in a if t=='link' and x.get('rel')=='canonical').get('href')=='https://agents.abhinandantejaswi.com/'
   assert meta.get('og:url')=='https://agents.abhinandantejaswi.com/'
   assert 'href="https://www.abhinandantejaswi.com/#hello"' in p.read_text()
  for t,x in a:
   if t=='img' and x.get('src'):assert x.get('width') and x.get('height'),f'Unreserved image dimensions: {p}'
patterns=[r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY',r'\bAKIA[0-9A-Z]{16}\b',r'\b(?:sk-proj-|sk-ant-|ghp_|github_pat_)[A-Za-z0-9_-]{15,}',r'(?i)(?:api[_-]?key|password|secret|access[_-]?token)\s*[:=]\s*[\"\'][^\"\']{10,}[\"\']']
for p in D.rglob('*'):
 if 'missed-enquiry-demo' in p.parts:continue
 if p.suffix not in ['.html','.css','.js','.json','.svg','.txt']:continue
 text=p.read_text()
 assert not re.search('[\u2013\u2014]',text),f'Disallowed dash in {p}'
 assert not any(re.search(pattern,text) for pattern in patterns),f'Potential secret requires review: {p.name}'
 assert not re.search(r'(?:localhost|127\.0\.0\.1|railway\.internal)',text),f'Internal address in {p}'
 assert not re.search(r'(?:gtag\(|googletagmanager|google-analytics|mixpanel|segment\.com|document\.cookie)',text),f'Tracking requires review: {p}'
def lum(h):
 c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 c=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c]
 return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
for name,h in [('ink','262620'),('accent','a6381c'),('muted','67635b')]:
 a,b=sorted([lum(h),lum('eeeae1')]);ratio=(b+.05)/(a+.05)
 assert ratio>=4.5
 print(f'{name} on paper: {ratio:.2f}:1')
projects=json.loads((R/'content/agents.json').read_text());html=(D/'index.html').read_text()
for slug,label in [('website-recovery','View website'),('brand-voice','Try agent'),('content-supply-chain','Try console')]:
 item=next(x for x in projects if x['slug']==slug)
 assert item['ctaLabel']==label and label+' ↗' in html
print('PASS: metadata, social image references, HTTPS-safe links, external-link attributes, image space, secret-pattern scan, no tracking and text contrast.')

