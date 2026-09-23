# Agents / Design notes

## Same house, a quieter room

The live folio was inspected before this build. Agents carries its warm paper, charcoal, orange accent and editorial contrast into a more precise environment. The large identity becomes a single word. Travel imagery and cinematic pacing give way to numbered evidence, thin rules and deliberate pauses.

Paper: #eeeae1. Ink: #262620. Accent: #a6381c. Muted text: #67635b. Rules: #bdb7ab. The deeper accent remains readable against paper.

Arial/Helvetica provide the plain editorial sans. Georgia supplies occasional italic emphasis. Courier appears only in secondary labels. These relate to the folio's typographic language without introducing technology-brand fonts or external font loading.

## Rhythm and hierarchy

The opening is quiet: AGENTS, a short thought, space. Website Recovery leads with the largest first visual. The audit changes the rhythm with a portrait document offset beside its context. The tracker adds working interaction. A typographic pause separates those operational tools from the two creative workflows. Content Supply Chain closes the sequence at a wider scale, then the page returns to a small About note.

Ma informs the empty space. Kanso informs the reduction to problem, system and evidence. Shibui informs the restrained palette and small details. Jo-ha-kyu informs the progression from quiet introduction through more involved systems to a brief close. There are no decorative Japanese symbols.

## Evidence choices

- Website Recovery: actual Designer Dental hero, including its doctor portrait and consultation route. The capture retains the start of the next section. No invented comparison or before image.
- Reputation: the complete supplied audit, kept upright, uncropped and readable through enlargement. Its date is visible in text outside the image as well.
- Missed Enquiry: the actual supplied tracker code, rendered in a contained, labelled sample-data frame. It demonstrates Today, Follow-ups and Report instead of presenting an invented dashboard. The frame keeps its original internal design.
- BCCL: the public case-study run showing choice, feedback and prior/revised copy. This is more informative than an initial brief form. It is labelled as a captured case-study run and an offline generator.
- Content Supply Chain: a real capture at the localisation stage, with two market versions and several formats. It shows progression and a human approval gate.

WebP assets preserve native proportions. Each has a smaller responsive source. The main site never crops screenshot evidence into a uniform card ratio. Native-resolution enlargement is available with keyboard-operable controls and direct-image fallback without JavaScript.

## Honesty

The first three builds use the conservative Prototype label. The final two are Work samples. BCCL / Times of India nonaffiliation and the absence of an Accenture commission are visible near the work, as well as on detail pages. Offline generator limitations remain explicit. Sample tracker numbers are never presented as patient or business outcomes.

## Responsive behaviour

At tablet widths, typography and margins reduce before the compositions collapse. On small screens, section numbers sit in the margin; title and context align beside them while evidence returns to the wider page edge. The audit remains narrower and offset, the tracker keeps its own reading width, and the final console expands again. The interlude and ending keep their pauses. Evidence enlargement allows inspection of dense interfaces without pretending their small mobile thumbnails are fully readable.

## Motion and accessibility

Motion is limited to native smooth anchor scrolling, disabled for reduced-motion preferences. No scroll reveals hide content. No hover zoom, parallax or autoplay. Semantic sections, one main heading per page, a skip link, visible focus, descriptive image alternatives, iframe title and text equivalents support access. The native dialog provides Escape dismissal and focus returns to the evidence link. The original tracker is an embedded artifact with its own controls.

## Build system

The site is static-first, with one content file and a small standard-library Python generator. It can be hosted separately from the folio. Nginx serves the output on Railway. No application server or database is needed. Adding a build extends the generated sequence and routes without adding filters or navigation categories.

## Verification boundary

The live folio and source demos were inspected in-browser. A side-by-side browser comparison with the completed Agents build was not possible because local browser access was blocked and there was no supported static preview. Shared tokens and typography were checked in source; actual desktop, tablet and mobile rendering remains a deployment check, not a claimed pass.

## V1.1 refinement

The original layout stylesheet remains intact. External demo links now come first and use specific verbs. The two work samples keep two CTA links; their titles provide the quieter internal detail route. Small footer site notes use the existing typography and add no legal-page template. Social artwork reuses the same paper, charcoal, orange punctuation and oversized title.

No analytics or decorative interface was added. Main-site text contrast passes AA; three tracker colours were deepened for readable labels. Tracker dialog focus handling and reduced-motion support are accessibility changes, not a visual rework. Original screenshot pixels are unchanged. Source review confirms the existing family relationship to the live folio; final side-by-side rendered comparison remains open.
