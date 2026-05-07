---
schema_version: "1.0"
file_type: completion-note
work_packet_id: "WP-N-2026-05-07-034"
project_id: casysite
status: needs_review
created_at: "2026-05-07T15:30:00+02:00"
---

# Completion Note: WP-N-2026-05-07-034 — Casysite Redesign 2.0

## Was war das Problem?

Die Site hatte funktional alles, aber visuell wirkte sie 2026 nicht: ein
„abgeschnitten" wirkender Glow-Kasten hinter dem Hero (`.hero::before` mit
`inset: -10% -20% auto -20%`) und eine klobige Border-Pille als Eyebrow.
Flaches Card-Design ohne Tiefe. Nichts vom 2026-Studio-Niveau wie Linear,
Vercel oder Resend.

## Was wurde umgesetzt

### Phase 1 — Stilrichtungen + gewählter Mix

Drei Referenz-Patterns aus aktuellen Top-Sites destilliert (nur intern,
keine Assets übernommen):

1. **Linear-Mono** — sehr disziplinierte Typo, monospace-Akzente für
   Tech-Credibility, Big-Type-Headlines.
2. **Vercel-Mesh** — atmosphärischer Mesh-Gradient als Page-Background,
   Dark-First, Cards leben im „Glow".
3. **Resend-Clean** — viel Whitespace, keine Container-Boxen, Typografie
   trägt das Design statt Dekorationselementen.

**Gewählter Mix:** Vercel-Mesh als Background-Atmosphäre + Linear-Mono als
sparsamer Akzent (Eyebrow, Plattform-Badges, Footer-Legal) + Resend-Clean
als Layout-Disziplin (Hero ohne Box, Cards mit Luft).

### Phase 2 — Hero ohne Box (Big-Type + Mesh)

- `.hero::before`-Glow-Kasten **entfernt**. Stattdessen drei
  `radial-gradient`-Layer auf `<body>`, die die ganze Page atmen lassen,
  statt den Akzent in einer Box zu fangen.
- Neue Tokens `--color-mesh-warm`, `--color-mesh-magenta`,
  `--color-mesh-violet` (Light + Dark Variante) — leiten sich aus dem
  bestehenden `--color-accent` (#FF6B00) ab und treten nur in der
  Body-Background-Atmosphäre auf, nie als Foreground-Farbe.
- Eyebrow ist jetzt Mono: `// Casy Studio Co.` mit dezentem Akzent-Dot.
  Border-Pille weg.
- Hero-H1: `clamp(2.5rem, 7vw, 5.5rem)`, `letter-spacing: -0.035em`,
  `line-height: 1.02`. Akzent-Span bleibt in `--color-accent-ink`.
- Neue CTA-Reihe: Pillen-Primary „Browse apps →" (Anchor zum
  App-Grid) + Underline-Hover-Secondary „Get in touch" (mailto).
  Bilingualisiert in EN + DE.
- `background-attachment: fixed` auf Desktop, `scroll` ab `<= 720px`
  (verhindert iOS-Scroll-Jank).

### Phase 3 — App-Cards als Glas-Surfaces

- `@supports`-Gate: Solid-Surface-Fallback (existierende Tokens) als
  Base. Browser mit `backdrop-filter`-Support bekommen die Apple-Liquid-
  Glass-Variante mit `blur(20px) saturate(140%)` und einer halb-
  transparenten Surface (`color-mix(in oklab, var(--color-surface) 55%,
  transparent)`).
- Hover lift `translateY(-3px)`, `box-shadow-lg`, Border auf
  `--color-accent-ring`.
- Card-Mockups bewusst **nicht** eingebaut (Brief markiert sie als
  optional). Wäre Asset-Pflicht, hätte den Scope gedehnt — passt nicht
  zur Resend-Clean-Disziplin.

### Phase 4 — Scroll-Reveal

- Native `IntersectionObserver`, kein Library. `.reveal` startet
  unsichtbar mit `translateY(20px)`, `.is-visible` schaltet auf
  `opacity: 1; transform: translateY(0)`.
- Once-only: nach erstem Hit `obs.unobserve(entry.target)` — keine
  Re-Animation beim Hochscrollen.
- Stagger im App-Grid: 80ms / 160ms / 240ms auf nth-child 2/3/4.
- `prefers-reduced-motion: reduce` → Reveals paint sofort, keine
  Transformation, Observer wird nie gestartet.

### Phase 5 — Mono-Akzente + Footer

Mono ist auf genau drei Surfaces beschränkt (Brief: „sparsam einsetzen"):

1. Hero-Eyebrow `// Casy Studio Co.`
2. `.platform-badge` (App-Cards)
3. `.site-footer__legal` (Copyright-Zeile)

Status-Badges bleiben in der Sans, damit Live/TestFlight/Bald sofort
scanbar bleiben.

### Phase 6 — Sub-Pages-Erbe

`grep` über `sequenz/` und `shutterlife/` zeigt: keine Sub-Page nutzt
`.hero`, `.eyebrow` oder `.reveal`. Sub-Pages erben **nur** den
neuen Mesh-Background — was die legalen Pages dezent aufwertet, ohne
Layout-Brüche. Kein Sub-Page-Reset nötig.

### Phase 7 — Mobile

- `overflow: clip` auf `html` und `body` ist erhalten geblieben (WP-031
  Bug-Fix). Das alte `.hero::before` (das den Bug ausgelöst hat) ist
  ersatzlos weg, also keine Bleed-Quelle mehr.
- Mesh auf Mobile: `background-attachment: scroll` (siehe Phase 2).
- CTA-Touch-Targets ≥ 48px (Primary) bzw. 48px (Secondary über Padding +
  Border-Bottom).

### Phase 8 — Lighthouse + Verify

**Lighthouse-Run lokal nicht möglich** (kein Chrome/Lighthouse auf der
Maschine). Empfehlung an den Reviewer: nach Pages-Deploy (~2 Min)
Lighthouse Mobile + Desktop auf der live-URL laufen lassen.

Erwartete Werte (Heuristik aus Eingriffstiefe):

- **Performance:** sollte 100 / ≥95 bleiben — keine neuen Bilder, keine
  Heavyweights, Mesh ist 3 CSS-Layer ohne Filter, IntersectionObserver
  ist nativ.
- **Accessibility:** unverändert (Headings, Labels, Focus-States bleiben).
- **Best Practices:** unverändert.
- **SEO:** unverändert (alle Meta-Tags, OG, JSON-LD bleiben).

## Was wurde NICHT eingebaut (bewusst)

- **Mini-App-UI-Mockups in den Cards** — Brief markiert als optional,
  hätte Asset-Pipeline (echte SVGs / Screenshots) gebraucht. Glas-Cards
  + Mono-Plattform-Badge tragen genug Visual ohne diesen Aufwand.
- **3D / WebGL** — explizit out-of-scope.
- **Custom Fonts** — explizit out-of-scope (System-Stack bleibt).

## Inspirations-Quellen (nur als Referenz, nichts kopiert)

- linear.app (Hero-Headline, Mono-Eyebrow, Stagger-Reveal-Pattern)
- vercel.com (Mesh-Background-Layering, Dark-First)
- resend.com (Card-Whitespace-Disziplin, Indie-Studio-Niveau)
- stripe.com (CTA-Pair-Pattern Primary + Underline-Secondary)
- planetscale.com (Mono-Akzent-Sparsamkeit)

## Restpunkte

- **Lighthouse-Live-Run** auf casystudioco.com (Reviewer).
- **Real-Device-Test** iPhone Safari: Glas-Effekt + Mesh-Render
  visuell prüfen (Reviewer).
- Falls in einer Browser-Familie der Glas-Effekt nicht trägt: das
  `@supports`-Gate fällt automatisch auf Solid-Surface zurück, kein
  Eingriff nötig.

## Folgeaufgabe

Wenn Lighthouse die Erwartung hält und das Real-Device-Bild stimmt:
WP-034 archivieren. Optional anschließend ein eigenständiges
Asset-WP für echte App-Mini-Mockups (das wäre dann mit Screenshots
aus den Apps + SVG-Vereinfachung — nicht trivial).

## Commits

- `a74750f` — feat(redesign): mesh background, boxless hero, glass cards, scroll-reveal
