"""Dependency-free HTML builder. Content and presentation stay separate."""
from pathlib import Path
from html import escape
from urllib.parse import quote
import json,shutil
R=Path(__file__).resolve().parents[1];D=R/'dist'; BASE='https://agents.abhinandantejaswi.com'
P=sorted(json.loads((R/'content/agents.json').read_text()),key=lambda p:p['order'])
SITE=json.loads((R/'content/site.json').read_text())
def e(s):return escape(str(s),quote=True)
def head(title,description,path,prefix=''):
 icon="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='#eeeae1'/><text x='5' y='29' font-family='Georgia' font-size='29' fill='#262620'>a</text><rect x='29' y='25' width='5' height='5' fill='#a6381c'/></svg>"
 robots='<meta name="robots" content="noindex">' if path=='/404.html' else ''
 return f'''<!doctype html><html lang="en"><head><meta charset="utf-8">{robots}<meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} | Abhinandan Tejaswi</title><meta name="description" content="{e(description)}"><meta name="theme-color" content="#eeeae1"><link rel="canonical" href="{BASE}{path}"><meta property="og:title" content="{e(title)} | Abhinandan Tejaswi"><meta property="og:description" content="{e(description)}"><meta property="og:type" content="website"><meta property="og:url" content="{BASE}{path}"><meta property="og:image" content="{BASE}/assets/agents-og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Agents. Abhinandan Tejaswi. Things that do things."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)} | Abhinandan Tejaswi"><meta name="twitter:description" content="{e(description)}"><meta name="twitter:image" content="{BASE}/assets/agents-og.png"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,{quote(icon)}"><link rel="stylesheet" href="{prefix}style.css"><script defer src="{prefix}app.js"></script></head><body id="top"><a class="skip" href="#main">Skip to content</a>'''
def nav(prefix=''):
 home=prefix or './'
 return f'<header class="site-header"><a class="identity" href="{home}">Abhinandan Tejaswi<span>.</span></a><nav aria-label="Primary"><a href="{home}#builds">Agents</a><a href="{home}#about">About</a><a href="{e(SITE['mainSiteUrl'])}" target="_blank" rel="noopener noreferrer" aria-label="Main site (opens in a new tab)">Main site <span aria-hidden="true">↗</span></a></nav></header>'
def footer(prefix=''):
 return f'''<footer class="footer"><span>© 2026 Abhinandan Tejaswi</span><span class="footer-links"><a href="https://portfolio.abhinandantejaswi.com/" target="_blank" rel="noopener noreferrer" aria-label="Creative folio (opens in a new tab)">Creative folio ↗</a><a href="{prefix}site-notes/">Privacy / Site use</a></span><a href="#top">Back to top ↑</a></footer><dialog class="lightbox" aria-labelledby="lightbox-title"><div class="lightbox-bar"><h2 id="lightbox-title">The evidence</h2><button type="button" data-close>Close ×</button></div><div class="lightbox-scroll" tabindex="0" role="region" aria-label="Full-size evidence, scroll to inspect"><img alt=""></div><p class="lightbox-caption"></p></dialog></body></html>'''
def process(p):return '<p class="process">'+' <span aria-hidden="true">/</span> '.join(e(x) for x in p['process'])+'</p>'
def visual(p,prefix=''):
 a=p['primaryVisual']
 if a.get('type')=='interactive':
  prototype_url=p.get('liveUrl') or prefix+a['src']
  prototype_label=p.get('ctaLabel') or 'Open prototype'
  return f'''<figure class="evidence tracker-evidence"><div class="artifact-label"><span>Interactive prototype</span><span>Fictional data</span></div><iframe src="{prefix}{a['src']}" title="{e(a['title'])}" loading="lazy" sandbox="allow-scripts allow-downloads" referrerpolicy="no-referrer" width="620" height="740"></iframe><figcaption><span>{e(p['caption'])}</span><a href="{e(prototype_url)}" target="_blank" rel="noopener noreferrer">{e(prototype_label)} ↗</a></figcaption></figure>'''
 src=prefix+'assets/'+a['src'];stem=src.rsplit('.',1)[0]
 return f'''<figure class="evidence"><a class="evidence-link" href="{src}" data-enlarge data-caption="{e(p['caption'])}" aria-label="Enlarge evidence: {e(p['title'])}"><img src="{src}" srcset="{stem}-640.webp 640w, {src} {a['width']}w" sizes="(max-width:700px) 92vw, {'46vw' if p['layout']=='paper' else '85vw'}" width="{a['width']}" height="{a['height']}" alt="{e(a['alt'])}" loading="lazy" decoding="async"></a><figcaption><span>{e(p['caption'])}</span><a href="{src}" data-enlarge data-caption="{e(p['caption'])}" aria-label="Enlarge evidence: {e(p['title'])}">Enlarge +</a></figcaption></figure>'''
def links(p,prefix='',detail=False):
 result=''
 if p['liveUrl']:
  label=p.get('ctaLabel') or 'Open demo'
  result+=f'<a class="primary-link" href="{e(p["liveUrl"])}" target="_blank" rel="noopener noreferrer" aria-label="{e(label)}: {e(p["title"])} (opens in a new tab)">{e(label)} ↗</a>'
 if p['caseStudyUrl']:result+=f'<a href="{e(p["caseStudyUrl"])}" target="_blank" rel="noopener noreferrer" aria-label="Case study: {e(p["title"])} (opens in a new tab)">Case study ↗</a>'
 if not detail and not p['caseStudyUrl']:result+=f'<a href="builds/{p["slug"]}/">Build notes <span aria-hidden="true">↗</span></a>'
 return '<div class="project-links">'+result+'</div>'
def section(p):
 return f'''<section class="agent agent--{p['layout']}" id="{p['slug']}" aria-labelledby="title-{p['slug']}"><div class="agent-number"><span>{p['order']:02d}</span><span class="vertical-note">{e(p['status'])}</span></div><div class="agent-heading"><p class="eyebrow">{e(p['status'])}</p><h2 id="title-{p['slug']}"><a href="builds/{p['slug']}/">{e(p['title'])}</a></h2></div><div class="agent-summary"><p class="description">{e(p['description'])}</p>{process(p)}{links(p)}</div>{visual(p)}<div class="agent-note"><p>{e(p['note'])}</p><p class="disclosure">{e(p['disclosure'])}</p></div></section>'''
# Rebuild owned output so removed projects cannot leave stale public routes.
if D.exists():shutil.rmtree(D)
shutil.copytree(R/'public',D)
intro=f'''<main id="main"><section class="intro" aria-labelledby="agents-title"><div class="intro-top"><span class="eyebrow">Independent builds / {len(P):02d} selected systems</span><span class="eyebrow">Mumbai, India</span></div><div class="intro-title"><span class="intro-number">00</span><h1 id="agents-title">AGENTS<span>.</span></h1></div><div class="intro-bottom"><p class="tagline">Things that<br><em>do things.</em></p><div><p>Small systems built around<br>actual problems.</p><a class="text-link" href="#builds">See the builds ↓</a></div></div><p class="build-note">Built with code, language models<br>and human judgement.</p></section><div id="builds" class="builds">'''
body=intro
for i,p in enumerate(P):
 body+=section(p)
 if i==2:body+='''<aside class="interlude"><span class="eyebrow">A working principle</span><p>Small systems.<br><em>Real friction.</em></p><span class="interlude-note">Leave room for judgement.</span></aside>'''
body+=f'''</div><section class="about" id="about"><div><span class="eyebrow">A little context</span><h2>Still making.</h2></div><div><p>I’m a creative director who started building small systems around problems I kept noticing.</p><p class="about-note">Some are internal tools. Some are prototypes.<br>All started with a real use case.</p><a class="text-link" href="{e(SITE['contactUrl'])}" aria-label="{e(SITE['contactAriaLabel'])}">{e(SITE['contactLabel'])} ↗</a></div></section><nav class="ecosystem-next" aria-label="Next"><span class="eyebrow">NEXT</span><a href="https://projects.abhinandantejaswi.com/">Projects ↗</a><a href="https://products.abhinandantejaswi.com/">Products ↗</a></nav></main>'''
(D/'index.html').write_text(head('Agents','Independent agent and automation builds by Abhinandan Tejaswi. Small systems built around real problems.','/')+nav()+body+footer())
for i,p in enumerate(P):
 prefix='../../';path=f'/builds/{p["slug"]}/'; dest=D/path.strip('/');dest.mkdir(parents=True,exist_ok=True)
 body=f'''<main id="main" class="detail"><a class="back-link" href="../../#{p['slug']}">← All builds</a><header class="detail-intro"><span class="eyebrow">{p['order']:02d} / {e(p['status'])}</span><h1>{e(p['title'])}</h1><p>{e(p['description'])}</p></header><div class="detail-context"><div><h2>The problem</h2><p>{e(p['problem'])}</p></div><div><h2>The build</h2><p>{e(p['build'])}</p></div></div><div class="detail-evidence"><h2 class="eyebrow">The evidence</h2>{visual(p,prefix)}</div><div class="detail-end"><div><h2 class="eyebrow">How it moves</h2>{process(p)}{links(p,prefix,True)}</div><div><h2 class="eyebrow">{e(p['status'])}</h2><p>{e(p['disclosure'])}</p></div></div><a class="next-build" href="../{P[(i+1)%len(P)]['slug']}/"><span class="eyebrow">Next build</span><span>{e(P[(i+1)%len(P)]['title'])} ↗</span></a></main>'''
 (dest/'index.html').write_text(head(p['title'],p['description'],path,prefix)+nav(prefix)+body+footer(prefix))
(D/'404.html').write_text(head('Page not found','Back to the builds.','/404.html','/')+nav('/')+'<main id="main" class="not-found"><span class="eyebrow">404</span><h1>Wrong turn.</h1><a class="text-link" href="/">Back to Agents ↗</a></main>'+footer('/'))
notes=D/'site-notes';notes.mkdir(exist_ok=True)
notes_body='''<main id="main" class="detail site-notes"><a class="back-link" href="../">← Back to Agents</a><header class="detail-intro"><span class="eyebrow">Site notes / Updated September 2026</span><h1>Privacy / Site use</h1></header><section><h2>Privacy</h2><p>This showcase uses no analytics, advertising trackers or site cookies. It has no contact form or account system.</p><p>The enquiry tracker uses fictional sample data. Edits stay in this page's memory and reset on reload. Nothing is automatically sent. Please use fictional information only. Copy and export controls act only when you choose them.</p><p>The hosting service may process technical request data, such as IP addresses and browser information, to deliver and protect the site. Linked external websites have their own privacy practices. This note will be updated if analytics or other data collection is added.</p></section><section><h2>Site use</h2><p>This is a personal showcase. Original work belongs to its creator; client materials and trademarks remain the property of their respective owners. Display here does not grant permission to reuse them.</p><p>Work samples and speculative demos are labelled. They do not imply endorsement or commissioning by the brands shown. Prototypes and archived outputs are provided for demonstration.</p></section></main>'''
(notes/'index.html').write_text(head('Privacy / Site use','A short note on privacy, prototypes and ownership.','/site-notes/','../')+nav('../')+notes_body+footer('../'))
paths=['/','/site-notes/']+[f'/builds/{p["slug"]}/' for p in P]
(D/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{BASE}{x}</loc></url>' for x in paths)+'</urlset>')
(D/'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /evidence/\nSitemap: '+BASE+'/sitemap.xml\n')
print(f'Built {len(paths)} pages, custom 404 and evidence prototype.')

