# Sub-Pages Audit — 2026-05-07 (WP-N-2026-05-07-029)

## Inventar (vor Migration)

| App | Page | Lang | Datei | LOC | Layout-Status |
|---|---|---|---|---|---|
| sequenz | privacy | en | `sequenz/privacy/index.html` | 70 | Legacy: `.container` (full-width), `.back`, `.lang-switch <a>`, einfacher `<footer>` |
| sequenz | privacy | de | `sequenz/privacy/de.html` | 70 | dito |
| sequenz | support | en | `sequenz/support/index.html` | 58 | dito + `.faq` Karten |
| sequenz | support | de | `sequenz/support/de.html` | 58 | dito |
| sequenz | terms | en | `sequenz/terms/index.html` | 63 | dito |
| sequenz | terms | de | `sequenz/terms/de.html` | 63 | dito |
| shutterlife | privacy | en | `shutterlife/privacy/index.html` | 70 | dito + Footer-Link Legal Notice (inline-styled `color:#FF6B00`) |
| shutterlife | privacy | de | `shutterlife/privacy/de.html` | 70 | dito |
| shutterlife | support | en | `shutterlife/support/index.html` | 71 | dito |
| shutterlife | support | de | `shutterlife/support/de.html` | 71 | dito |
| shutterlife | terms | en | `shutterlife/terms/index.html` | 56 | dito |
| shutterlife | terms | de | `shutterlife/terms/de.html` | 56 | dito |
| shutterlife | impressum | en | `shutterlife/impressum/index.html` | 50 | dito (Adresse + Disclaimer) |
| shutterlife | impressum | de | `shutterlife/impressum/de.html` | 50 | dito |

**Total: 14 Files, ~876 LOC.**

## Beobachtete Probleme (vor Migration)

1. **Kein Topbar mit Wordmark** — Sub-Pages hatten keine Casy-Studio-Markenführung (Wordmark + CS-Mark), nur eine Mini-„Back"-Link-Zeile.
2. **Inkonsistenter Footer** — schlichter `&copy; 2026 SQNZ. All rights reserved.`-Block ohne Brand-Mark, ohne Studio-Links (Contact / Legal / GitHub) — Reviewer landet auf einer „leeren" Page.
3. **Inline-Styles** in ShutterLife-Footern (`<a style="color:#FF6B00;text-decoration:none">`) — Brand-Token-System untergraben.
4. **Keine Meta-Tags** — keine Description, kein OG, kein Canonical, kein hreflang. Apple-Reviewer / Suchmaschine bekommen nur den Titel.
5. **Volle Container-Breite** — Lange Legal-Texte spannten sich über die volle `--container-max` Breite, was die Lesbarkeit auf großen Bildschirmen massiv verschlechtert.
6. **Kein Skip-Link** — Tab-Navigation startete direkt im Top-Link, kein A11y-Sprungziel.
7. **Theme-Color / color-scheme fehlten** — Status-Bar / OS-UI in Safari iOS war heller/dunkler als das Page-Hintergrund.

## Pattern (nach Migration)

**Einheitliches Sub-Page-Layout:**

```
┌────────────────────────────────────────────────┐
│  Skip-Link (focus-only)                         │
│  ┌──────────────────────────────────────────┐  │
│  │ Topbar  [CS] Casy Studio    [EN][DE]     │  │
│  └──────────────────────────────────────────┘  │
│  ← All Apps                                     │
│  SQNZ · SEQUENZ                                 │  ← .subpage-eyebrow
│  Privacy Policy                                 │  ← h1.page-title (text-3xl)
│  Last updated: April 7, 2026                    │  ← .date
│                                                  │
│  <article class="legal-content">                │
│    H2 (Section, mit Border-Top als Trenner)     │
│    Text…                                         │
│    H2 (next Section)                             │
│    …                                             │
│  </article>                                      │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ site-footer: Brand-Block + Studio-Links  │  │
│  │ Contact · Legal Notice · GitHub          │  │
│  │ © 2026 Casy Studio                       │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
   `.container.container--narrow` (max-width 720px)
```

**CSS-Erweiterungen** (in `style.css`, zusätzlich zu bestehenden Tokens):
- `.subpage-eyebrow` — Akzent-Pill-Eyebrow (uppercase, accent-ink)
- `.back-link` — neue Klasse (statt Legacy `.back`), liegt im Main statt vor Topbar
- `.container--narrow h1.page-title` — H1 auf `--text-3xl` skaliert
- `.legal-content > h2` — Section-Trenner via `border-top: 1px solid` zwischen Abschnitten

**Pro Page eingebaut:**
- `<meta name="theme-color">` (light + dark)
- `<meta name="color-scheme" content="dark light">`
- `<meta name="description">` (lang-spezifisch)
- `<link rel="canonical">`
- `<meta property="og:*">` (type=article, site_name, title, description, url, image, locale, locale:alternate)
- `<link rel="alternate" hreflang="en|de">`
- `<link rel="icon">` + `<link rel="apple-touch-icon">`
- `<a class="skip-link">` als erstes fokussierbares Element

## Inhalts-Garantie

**Keine Legal-Texte editiert.** Alle `<h2>`-Überschriften, `<p>`-Absätze, `<ul>`/`<li>`-Listen, Adressen und Datumszeilen sind 1:1 aus den Originalen übernommen. Geändert wurde ausschließlich:
- Die H1 (vorher: `SQNZ / Sequenz — Privacy Policy` → neu: Eyebrow `SQNZ · Sequenz` + H1 `Privacy Policy`)
- Die Sub-Title-Zeile (`We're here to help.`) bleibt wo vorhanden
- Der Footer-Block (vom Sub-Page-spezifischen `&copy;`-One-Liner zum studio-weiten `site-footer`)

## Sitemap

`sitemap.xml` erweitert um `xhtml:link rel="alternate" hreflang="en|de"` Hinweise pro Page-URL und um den bisher fehlenden `shutterlife/impressum/`-Eintrag.
