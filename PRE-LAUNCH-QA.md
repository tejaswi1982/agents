# Agents V1.1 / Pre-launch QA

Checked 23 September 2026. This report separates verified package checks from browser and account-dependent checks. V1's composition, agent order, image scale and screenshot bytes are preserved.

## Release status

Implementation complete. Not yet signed off for launch: the main/contact destination returned 502 in this browser, and this environment could not render the new local site for desktop/mobile testing or run Docker. These are open checks, not passes.

## Completed package checks

| Check | Result |
| --- | --- |
| Five agents, order 01 to 05, no public future-agent placeholder | Pass |
| Required project descriptions, British spelling, process labels | Pass |
| Website Recovery: View website | Pass, primary external CTA |
| BCCL: Try agent / Case study | Pass, in that order |
| Console: Try console / Case study | Pass, in that order |
| Work-sample and noncommission disclosures | Pass, retained near work and on detail pages |
| Internal links, anchors, scripts, styles, images, responsive variants, iframe | Pass, every generated HTML reference resolves |
| Unique titles/descriptions, canonical URLs, Open Graph | Pass |
| Social image | Pass, inspected at 1200 x 630, PNG 68,733 bytes |
| Favicon, sitemap, robots, custom 404 | Pass; 404 no-indexed; evidence excluded from sitemap |
| Frontend secrets | No credentials, key patterns, internal URLs or environment values found in public code |
| HTTPS-safe resources | Pass; public links use HTTPS. SVG namespace identifiers are not HTTP fetches |
| External new-tab links | Pass, noopener and noreferrer; demo links announce new-tab behaviour |
| Image alternatives and reserved dimensions | Pass, real evidence preserved and described |
| JavaScript syntax | Pass, main script, tracker and tracker accessibility enhancement |
| Tracker report logic | Pass, supplied sample and empty-state cases |
| Main text contrast on paper | Ink 12.67:1, orange 5.46:1, muted 4.98:1, all meet AA normal-text threshold |
| Tracker contrast | Muted, teal and ochre labels darkened without changing layout |
| Reduced motion | Present in main site and embedded tracker |
| Keyboard accessibility, source review | Skip link, focus styles, native evidence dialog, focusable image scroll region; tracker dialogs now have focus entry, Tab containment, Escape and focus return |
| No em/en dashes | Pass across generated text and public code; original screenshot pixels retained faithfully |
| Forms/spam | No submission form, backend or email field on showcase. Local tracker demonstration forms remain local and show save feedback. No CAPTCHA added |
| Analytics/cookies | None added; no credentials or consent banner needed for this implementation |
| Privacy/site-use information | One short linked page, covering hosting requests, external destinations, ephemeral demo data and ownership |

## External destination checks

These checks establish that the destination pages loaded. They are not an end-to-end certification of every external tool.

| Destination | Browser result |
| --- | --- |
| https://designerdentalpreview.netlify.app/ | Pass, website rendered |
| https://blissful-mirage-hg4s.here.now/ | Pass, offline-generator demo rendered |
| https://blissful-mirage-hg4s.here.now/case.html | Pass, full captured run rendered |
| https://walnut-hearth-9pgc.here.now/ | Pass, offline-generator console rendered |
| https://walnut-hearth-9pgc.here.now/case.html | Pass, captured run populated after asynchronous load |
| https://portfolio.abhinandantejaswi.com/ | Pass, folio rendered |
| https://portfolio.abhinandantejaswi.com/about/ | Pass, but no published email address supplied |
| https://abhinandantejaswi.com/ | Open issue, returned 502 Bad Gateway in this browser |

The existing Main site and Say hello destinations are retained because no valid replacement contact address was supplied. Do not claim the complete external-link checklist passed. Supply a preferred email address or restore the main-site contact route, then update `content/site.json`. No address has been guessed.

## Performance review

Homepage HTML: 13,402 bytes. Main CSS: 13,814 bytes. Main interaction JS: 1,215 bytes. Entire uncompressed production output: approximately 0.75 MB, including all detail pages, both image sizes, social artwork and prototype code.

Existing native WebP screenshots are approximately 91 to 131 KB each; mobile variants approximately 25 to 37 KB. All are lazy-loaded with intrinsic dimensions. No external fonts, analytics, framework hydration, API calls or decorative animation libraries are introduced. Native PNG social artwork is referenced by metadata, not downloaded as a page image. Nginx gzip is configured for text. No synthetic loading skeleton is needed for static content. Live Core Web Vitals and Lighthouse scores have not been measured.

## Anti-template audit

The showcase adds none of the 30 flagged signals: no gradients, icon library, white base, rainbow palette, shadows, equal feature cards, emoji, glass, forbidden dashes, startup fonts, coloured stripes, fabricated testimonials, bento sections, terminal decoration, contrastive slogan, checkmark lists, pricing tiers, fake UI, rounded containers, purple/black treatment, orbs, dot grids, sparkle icons, animated arrows, hover zooms, neon or generic SaaS sections.

Skeleton loaders are unnecessary for this static shell. Concise site notes now cover the relevant privacy and ownership facts. Real evidence remains central. Original artifacts can contain their own cards, white surfaces, icons and shadows; removing those would misrepresent the work. Tracker changes are limited to accessibility. Japanese influence remains in space, pacing and restraint, with no new decorative motifs.

## Mobile, interaction and runtime checks still open

The original responsive CSS is byte-for-byte preserved as the prefix of the V1.1 stylesheet; additions concern CTA clarity, legal text, keyboard focus and footer wrapping. Source review covers header, hero, every project, About and footer. This is not a substitute for rendered mobile QA.

Local-file browser access was blocked during V1, no supported static preview is available here, and the browser API does not expose viewport emulation. No alternate browser or network workaround was used. Mobile QA has NOT passed. Desktop rendering, focus behaviour, page console errors and observed layout-shift checks likewise require a running preview. Docker/Nginx execution was unavailable.

Once served locally or on Railway, check at 320, 390, 768, 1024 and 1440 CSS pixels:

1. Header and hero fit without overflow. All five sections retain their original scale and spacing. Footer links wrap cleanly.
2. Every CTA opens its stated destination. About and back-to-top anchors work.
3. Open evidence with the keyboard, pan/scroll it, close by button and Escape, confirm focus returns.
4. Try tracker Today, Follow-ups, Report and dialogs. Save fictional entries, close dialogs by Escape and reload to confirm reset. Test export/reset in the embedded and standalone views; sandbox restrictions may limit browser-native prompts/clipboard in the embed.
5. Check 200% zoom, portrait/landscape and reduced-motion settings. Check console and missing requests. Reserve no pass until actually observed.
6. Reload all detail routes and `/site-notes/` directly. Visit an unknown nested path and confirm a styled 404 with working return links.
7. Verify `/healthz`, HTTPS, HTTP-to-HTTPS behaviour and social-image fetch on the production host.

## Access-dependent actions

- Railway: connect/push the repository, build the Docker image, confirm health, routes and browser checks. No hosting changes were made here.
- DNS: configure only the `agents` subdomain using Railway's exact records. Verify TLS and HTTPS enforcement at the edge. Do not change portfolio records.
- Contact: provide a preferred email or working main-site contact URL. No mail server is needed for a mailto link.
- Analytics: no credentials needed now. If added later, choose a provider and update site notes and consent handling to match its actual collection.
- External demo accounts: needed only to repair upstream demo behaviour. This pass preserves the supplied destinations and does not alter those external projects.
