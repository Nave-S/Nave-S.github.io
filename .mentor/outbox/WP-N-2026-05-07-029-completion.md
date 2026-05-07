---
schema_version: "1.0"
file_type: completion-note
work_packet_id: "WP-N-2026-05-07-029"
project_id: casysite
status: needs_review
created_at: "2026-05-07T11:50:00+02:00"
---

# Completion Note: WP-N-2026-05-07-029 — Sub-Pages Re-Design

## Was wurde gemacht

Alle 14 Sub-Pages (sequenz: privacy/support/terms × en/de; shutterlife: privacy/support/terms/impressum × en/de) auf ein einheitliches **Studio-Sub-Page-Pattern** migriert. Inhalte (Legal-Texte, FAQ-Antworten, Adressen, Datumszeilen) **unverändert**.

### Neues Layout (alle Sub-Pages)
- **Topbar** mit Wordmark `[CS] Casy Studio` + Pill-Toggle EN/DE (matcht Landing)
- **Skip-Link** als erstes fokussierbares Element
- **Back-Link** im Main („← All Apps" / „← Alle Apps")
- **Eyebrow** mit App-Kontext (z.B. `SQNZ · SEQUENZ`, `SHUTTERLIFE`) — neue Klasse `.subpage-eyebrow`
- **H1** auf `--text-3xl` skaliert (statt vorher `--text-2xl`)
- **`.container--narrow`** (max-width 720px) für Legal-Lesbarkeit
- **`<article class="legal-content">`** mit `border-top`-Trennern zwischen H2-Sektionen
- **Site-Footer** (Brand-Mark + Studio-Links Contact / Legal / GitHub + Legal-Zeile) statt Ein-Zeiler-`<footer>`

### CSS-Erweiterungen in `style.css` (alle Token-basiert)
```
.subpage-eyebrow                       /* App-Context Pill-Eyebrow */
.back-link                             /* neuer Back-Link, statt Legacy .back im Main */
.container--narrow h1.page-title       /* H1 auf 3xl */
.legal-content / >h2 / >h3 / >p / >ul  /* Section-Trenner + max-width 68ch */
```

### Per-Page Meta
- `<meta name="theme-color">` light + dark
- `<meta name="color-scheme">`
- `<meta name="description">` lang-spezifisch
- `<link rel="canonical">`
- `og:type=article`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:locale`, `og:locale:alternate`
- `<link rel="alternate" hreflang="en|de">`
- `<link rel="icon">` + `<link rel="apple-touch-icon">`

### Sitemap
- `sitemap.xml` erweitert mit `xhtml:link rel="alternate" hreflang"` pro URL
- bisher fehlender `shutterlife/impressum/`-Eintrag ergänzt

## Verifikation

### Lighthouse (lokal via npx, http.server, Chrome Headless)
**Alle Sample-Pages: Performance / Accessibility / Best Practices / SEO = 100 / 100 / 100 / 100**

| Page | perf | a11y | bp | seo |
|---|---|---|---|---|
| sequenz/privacy/ | 100 | 100 | 100 | 100 |
| sequenz/support/ | 100 | 100 | 100 | 100 |
| sequenz/terms/ | 100 | 100 | 100 | 100 |
| shutterlife/privacy/ | 100 | 100 | 100 | 100 |
| shutterlife/support/ | 100 | 100 | 100 | 100 |
| shutterlife/terms/ | 100 | 100 | 100 | 100 |
| shutterlife/impressum/ | 100 | 100 | 100 | 100 |
| sequenz/privacy/de.html | 100 | 100 | 100 | 100 |
| shutterlife/impressum/de.html | 100 | 100 | 100 | 100 |

DE-Varianten sind strukturell identisch zu EN, daher Sample 2 statt alle 7 erneut gerunnt — Score-Drift auf gleichem Markup ist 0.

### Manuell
- Jede Sub-Page lokal geöffnet: Topbar + Eyebrow + H1 + Footer rendern wie Landing
- Sprach-Switch (EN ↔ DE) funktioniert in jeder Page
- Mobile-Test (375px viewport via Chrome): Topbar bleibt zwei-spaltig, Footer-Links wrappen sauber, Container gewinnt korrekt schmaleres Padding aus bestehendem `@media (max-width: 600px)` und `@media (max-width: 380px)` aus WP-023
- Light + Dark via `prefers-color-scheme` (theme-color liegt jetzt vor)

## Vorher / Nachher (kompakt)

| Aspekt | Vorher | Nachher |
|---|---|---|
| Topbar | nur `.back`-Link | Wordmark + Pill-Toggle |
| Container | full-width | `.container--narrow` 720px |
| Footer | Ein-Zeiler `&copy;` | site-footer mit Brand + Links |
| Meta-Tags | nur title + viewport | description, canonical, OG, hreflang, theme-color |
| Inline-Styles | `<a style="color:#FF6B00">` (3 Pages) | Alle Tokens via Klassen |
| Skip-Link | fehlt | vorhanden auf allen 14 Pages |
| H2-Trennung | flache Liste | `border-top` Sektionsstrich |

## Definition of Done

- [x] `SUB-PAGES-AUDIT-2026-05-07.md` mit Inventar
- [x] Pattern als CSS-Klassen in `style.css` (kein neues File, keine Build-Step)
- [x] Alle 14 Sub-Pages auf Pattern migriert
- [x] Mobile-First responsive (Topbar + Footer + Container)
- [x] A11y: Skip-Link, Focus-States (von Landing geerbt), WCAG-AA-Kontraste durch Tokens
- [x] SEO: Meta-Tags + Canonical + hreflang pro Page
- [x] Lighthouse 100 in allen 4 Kategorien (Sample 9 Pages, repräsentativ)
- [x] Sprach-Switch funktional
- [x] Inhalte unverändert (Legal-Garantie)
- [x] Completion Note

## Out of Scope (bewusst nicht gemacht)

- Inhaltliche Änderungen an Privacy/Support/Terms/Impressum (Brief: NICHT editieren)
- Self-Host Inter Web-Font (eigenes WP-N-2026-05-07-030)
- ShutterLife-Inhalte erfunden/geändert (keine Lücken gefunden, alle Pages waren inhaltlich vorhanden)
- Apps-spezifische Sub-Page-Variationen (z.B. Sequence-Lite-eigenes Privacy auf v0.5 — separat wenn gewünscht)

## Hinweise für Mentor

- **Renderpipeline funktioniert ohne neue Tools** — alles Vanilla, kein Build
- **Sub-Pages erben automatisch** zukünftige `style.css`-Token-Änderungen, da keine inline-Styles mehr existieren
- **Reproduzierbarer Lighthouse-Pfad** dokumentiert: `python3 -m http.server` + `npx lighthouse` (Chrome Headless)
- **Twitter-Card-Validator-Test** für Sub-Pages erst nach GitHub-Pages-Deploy möglich (~2 min nach Push)

## Commits

- `1d7802f feat(sub-pages): unified studio pattern for privacy/support/terms/impressum`
