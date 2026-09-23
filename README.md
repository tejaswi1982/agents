# Abhinandan Tejaswi / Agents V1.1

Independent static showcase for https://agents.abhinandantejaswi.com.
Five selected builds, five short detail pages, real captured evidence, and an embedded sample-data tracker. This project deploys independently of the creative folio.

## Run locally

Requires Python 3.10 or newer. No packages or installation step.

```sh
python scripts/build.py
python -m http.server 8000 --directory dist
```

On Windows, use `py` instead of `python` if that is how Python is installed. Open http://localhost:8000. Use the local server rather than opening HTML files directly.

`dist/` is also included as a ready-built static output. It can be served without rebuilding.

## Verify

```sh
python scripts/check.py
node --check public/app.js
node --check public/evidence/tracker/app.js
node scripts/check-tracker.cjs
python scripts/check-launch.py
```

Node is only needed for JavaScript checks. It is not a build or hosting dependency.

## Edit content

Edit `content/agents.json`, then run the build. Every project has a title, slug, status, concise context, process list, visual, links, disclosure and order. Future builds can be appended with the next order number and a unique slug. The homepage, detail routes, next-project links and sitemap are generated together.

Images live in `public/assets/`. Keep full-size WebP and a 640-pixel-wide version named `name-640.webp`. Set the correct native width and height in the content record. Use actual outputs and screenshots. Available compositions: `wide`, `paper`, `tracker`, `voice`, `console`. They control presentation, not categories.

`public/style.css` holds design tokens and responsive layouts. `public/app.js` handles evidence enlargement. The small Python generator lives in `scripts/build.py`.

## GitHub and Railway

1. Extract this complete project folder.
2. Use GitHub Desktop to create a repository from this folder and publish it to your GitHub account. Commit the entire project together. Do not upload folders individually through the website. Do not commit private source datasets or secrets.
3. In Railway, create a **separate service** connected to this new repository. Do not replace the folio service.
4. Keep the repository root as the root directory. Railway reads `railway.json` and builds the supplied `Dockerfile`. Leave custom build and start command overrides empty.
5. The image builds static HTML with Python, then serves it with Nginx. The standard Nginx entrypoint substitutes Railway's `PORT` into the server template. Default local port: 8080. Health check: `/healthz`.
6. Open Railway's generated domain first. Complete the browser checklist in `PRE-LAUNCH-QA.md`.
7. Add `agents.abhinandantejaswi.com` as the service's custom domain. At your DNS provider, add the exact CNAME target and any verification record Railway gives you. The host will usually be `agents`. Do not change the portfolio DNS record. Wait for Railway's domain verification and HTTPS certificate.
8. Later, commit and push changes. With automatic deployments enabled, Railway redeploys the connected branch.

Railway reference: https://docs.railway.com/guides/dockerfiles

Optional local container check, where Docker is installed:

```sh
docker build -t abhinandan-agents .
docker run --rm -p 8080:8080 -e PORT=8080 abhinandan-agents
```

## Evidence and limits

- Designer Dental, BCCL and Content Supply Chain visuals are real browser captures from the supplied URLs.
- The reputation visual is the supplied audit, dated 28 July 2026. It is an archived snapshot, not a live metric.
- The actual VIBGYOR tracker is embedded because a matching screenshot was not available. Its supplied fictional sample data loads automatically. Edits are in memory and reset on reload. The original tracker files were not changed.
- Both creative work samples identify their offline generators. These pages do not imply production AI services, client commissions or achieved business outcomes.
- Source and adaptation details are in `docs/EVIDENCE.md`.
- There is no backend, database, analytics, API key, contact form or paid font dependency in this showcase.
- The main/contact link returned 502 during this pass. Set a confirmed email or contact URL in `content/site.json` before launch. No email address has been invented.

## Delivery status

V1.1 refines CTA order and labels, adds social metadata/artwork and concise site notes, and improves keyboard access and tracker contrast. The static build, local references, content constraints, metadata, contrast, secret patterns, JavaScript syntax and tracker report logic were checked. All five demo/case-study destinations and the folio loaded in the browser; the main site returned 502. Browser rendering of this new site and the Docker image were not verified in this environment. See `PRE-LAUNCH-QA.md` for the exact remaining checks. The package is ready for a Railway deployment; no repository, hosting service or DNS record has been changed by this build.

## V1.1 launch details

Social artwork is bundled at `public/assets/agents-og.png` (1200 x 630), with an editable SVG source. It does not add a build dependency. `scripts/social-image.py` is an optional Pillow-based regeneration helper using local Arial-compatible fonts.

Site notes live at `/site-notes/`. No analytics, cookies or public submission form were added. HTTPS is handled at Railway's public edge: verify the custom-domain certificate and HTTP-to-HTTPS behaviour after DNS resolves. Reference: https://docs.railway.com/networking/public-networking

CTA labels are data fields (`ctaLabel`). Live demo links take priority over case studies. For the two demos, their project titles still link to internal detail pages, avoiding a third CTA. To add a future first/hero build, insert its data entry with order 1 and layout `wide`, increment the other orders and update the release-specific five-project assertion in `scripts/check.py`. No public placeholder is shipped.
