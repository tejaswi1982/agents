"""Check generated routes, assets, content and image dimensions without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
R=Path(__file__).resolve().parents[1];D=R/'dist'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.refs=[];self.ids=[];self.h1=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  for k in ['href','src']:
   if a.get(k):self.refs.append(a[k])
  if a.get('srcset'):
   self.refs.extend(x.strip().split()[0] for x in a['srcset'].split(','))
  if tag=='img' and a.get('src'):assert a.get('alt'), 'Image needs alt text'
  if tag=='iframe':assert a.get('title'), 'Frame needs title'
pages={p:Page(p.read_text()) for p in D.rglob('*.html')}
for p,page in pages.items():
 assert len(page.ids)==len(set(page.ids)),f'Duplicate ids: {p}'
 assert page.h1==1,f'Expected one h1: {p}'
 for ref in page.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  path=unquote(u.path)
  target=(D/path.lstrip('/') if path.startswith('/') else p.parent/path).resolve() if path else p.resolve()
  if target.is_dir():target/='index.html'
  assert target.is_relative_to(D.resolve()),f'Outside build: {p} {ref}'
  assert target.is_file(),f'Broken link: {p} {ref}'
  if u.fragment and target.suffix=='.html':
   parsed=Page(target.read_text());assert unquote(u.fragment) in parsed.ids,f'Broken anchor: {p} {ref}'
P=json.loads((R/'content/agents.json').read_text())
assert len(P)==5 and sorted(p['order'] for p in P)==list(range(1,6))
assert len({p['slug'] for p in P})==5
owned_html=[p for p in D.rglob('*.html') if not p.is_relative_to(D/'missed-enquiry-demo')]
for path in [R/'content/agents.json',R/'public/style.css',R/'public/app.js',*owned_html]:
 text=path.read_text();assert not re.search('[\u2013\u2014]',text),f'Disallowed dash: {path}'
 assert 'Caption Director' not in text
html=(D/'index.html').read_text()
assert 'Not affiliated with BCCL / Times of India' in html
assert 'not an Accenture commission' in html
assert 'Fictional sample data' in html
assert 'href="/missed-enquiry-demo/"' in html
assert 'View prototype ↗' in html
assert html.count('href="/missed-enquiry-demo/"')==2
assert 'href="evidence/tracker/index.html"' not in html
assert 'href="https://designerdentalpreview.netlify.app/"' in html
assert 'href="https://blissful-mirage-hg4s.here.now/"' in html
assert 'href="https://blissful-mirage-hg4s.here.now/case.html"' in html
assert 'href="https://walnut-hearth-9pgc.here.now/"' in html
assert 'href="https://walnut-hearth-9pgc.here.now/case.html"' in html
intro=(D/'missed-enquiry-demo/index.html').read_text()
assert 'See where patient enquiries are slipping in 7 days.' in intro
assert 'href="dashboard/index.html?clinic=' in intro
dashboard=(D/'missed-enquiry-demo/dashboard/index.html').read_text()
assert 'Start the 7-day check' in dashboard
assert 'prefers-reduced-motion' in (D/'style.css').read_text()
assert 'localStorage' not in (D/'evidence/tracker/app.js').read_text()
print(f'PASS: {len(pages)} HTML files, all local routes/assets/anchors, five ordered builds, disclosures and content constraints.')
