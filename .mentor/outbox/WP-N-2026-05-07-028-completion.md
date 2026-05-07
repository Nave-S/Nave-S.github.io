---
schema_version: "1.0"
file_type: completion-note
work_packet_id: "WP-N-2026-05-07-028"
project_id: casysite
status: needs_review
created_at: "2026-05-07T11:15:00+02:00"
---

# Completion Note: WP-N-2026-05-07-028 — 1200×630 OG-Image

## Was wurde gemacht
- `og-image.jpg` neu gerendert auf **1200×630** (vorher 1200×1200, qlmanage-Quadrat).
- Quelle: existierendes `og-image.svg` (war bereits korrekt 1200×630, viewBox + width/height).
- Render-Pfad: Headless Google Chrome → PNG-Screenshot → `sips` JPEG-Export (Q88).
  - Tooling-Stand: kein `rsvg-convert`/`inkscape`/`puppeteer` installiert → Chrome-Headless gewählt (ist auf Mac vorhanden, kein Brew nötig).
- `index.html`: `og:image:height` von `1200` → `630` korrigiert. Pfade unverändert (`og-image.jpg`).

## Verifikation
- `sips -g pixelWidth -g pixelHeight og-image.jpg` → 1200×630 ✓
- Datei lokal geöffnet: Wordmark + Tagline + URL korrekt platziert, Brand-Gradient + Akzente sauber gerendert.
- Filesize 88 KB (vorher 151 KB) — schneller Social-Preview.
- Twitter-Card-Validator-Test offen bis nach GitHub-Pages-Deploy (2 min nach push).

## Definition of Done
- [x] og-image.jpg 1200×630 im Repo-Root
- [x] Brand-konsistent (CS-Mark + „Small apps, made with care." + URL)
- [x] index.html Meta-Tag-Höhe korrigiert (1200 → 630)
- [x] Smoke-Test lokal
- [x] Commit `feat(seo): branded 1200x630 og-image`
- [x] Completion Note

## Out of Scope (nicht gemacht)
- DE/EN-Variante des OG-Bildes
- Sub-Pages-eigene OG-Images
- Twitter-Card-Validator (post-deploy, optional)

## Hinweis für Mentor
- Render-Pipeline reproduzierbar: SVG ist die Quelle, Re-Render via Chrome-Headless braucht kein neues Tooling. Falls Reproduzierbarkeit als Doc gewünscht, separates WP.
