---
schema_version: "1.0"
file_type: completion-note
work_packet_id: "WP-N-2026-05-07-023"
project_id: casysite
status: needs_review
created_at: "2026-05-07T10:57:00+02:00"
updated_at: "2026-05-07T10:57:00+02:00"
---

# Completion Note — Studio-Site Design-Refresh

## Was wurde gebaut?

Studio-Site `casystudioco.com` von Hackathon-Look auf studio-grade Niveau gehoben. Vanilla bleibt Vanilla — kein Build, kein Framework, single-page-render.

### Brand-Token-System (Phase 1)
- `:root` mit Tokens für Farben, Typo-Skala (clamp), Spacings, Radii, Shadows, Motion, Container
- `prefers-color-scheme: light` Override (dark bleibt house mode)
- separates `--color-accent-ink` für Text-Use (dark-mode #FF6B00, light-mode #B84800) → WCAG AA für Akzent-Text
- `prefers-reduced-motion` global respektiert

### Landing-Refresh (Phase 2 + 3)
- **Topbar**: Wordmark-Lockup (CS-Mark + „Casy Studio") + Pill-Toggle EN/DE als `<button role="group">` mit `aria-pressed`
- **Hero**: Eyebrow-Badge mit Status-Dot, headline mit accent-span, lede in 56ch
- **Section-Header** mit App-Count-Meta
- **App-Cards**: Status-Badge (Live / TestFlight / Bald) mit farbiger Pille, Plattform-Badge, hover-lift, focus-within-Ring, Border-Trennlinie zu Links
- **Footer**: 2-spaltiger Block (Brand + Tagline | Nav + Legal-Zeile)

### Mobile-First (Phase 4)
- Auto-fill Grid mit `minmax(min(100%, 320px), 1fr)` → 1/2/3-Spalten ohne explizite Breakpoints
- Touch-Targets ≥ 44px (Pills, App-Card-Links)
- Sub-380px: Wordmark collapsed auf Mark-only, Footer-Row stacked

### A11y (Phase 5)
- Skip-to-Content-Link
- `:focus-visible` mit Accent-Ring, `focus-within` propagiert auf Cards
- WCAG-AA-Kontraste (Light + Dark) — text-muted/faint angehoben, accent-ink-Token
- `aria-pressed` auf Lang-Buttons (vorher fälschlich auf `<a>` → Lighthouse-Fail behoben)
- `document.documentElement.lang` switcht mit Sprach-Wechsel
- App-Icon Schriftgröße auf 20px bold (WCAG Large-Text-Threshold) + Text-Shadow

### SEO + Performance (Phase 6)
- Open Graph + Twitter Card mit branded `og-image.jpg` (SVG-Source als `og-image.svg` mitgeliefert)
- JSON-LD `Organization` (Name, URL, Logo, sameAs)
- Canonical-URL, theme-color pro Scheme, apple-touch-icon
- `robots.txt` + `sitemap.xml` (Landing + alle Sub-Page-Legals)
- App-Config inline als `<script type="application/json">` → synchroner Render → CLS = 0
- `min-height` Reserve auf `.app-grid` als Defense-in-Depth

### Sub-Pages (Phase 7)
- Erben Tokens aus `../../style.css` automatisch
- `.lang-switch` CSS unterstützt jetzt sowohl `<button>` (Landing) als auch legacy `<a>` (Sub-Pages) → kein Bruch
- A11y-Smoke per Lighthouse auf `sequenz/privacy/` = 100

## Lighthouse — Vorher / Nachher

Headless Chrome via `npx lighthouse`, Mobile-Profil (Default).

| Kategorie         | Vorher (geschätzt)¹ | Nachher |
| ----------------- | ------------------- | ------- |
| Performance       | ~80                 | **100** |
| Accessibility     | ~70                 | **100** |
| Best Practices    | ~85                 | **100** |
| SEO               | ~75                 | **100** |

¹ Vorher-Score nicht formell gemessen (Site bestand vor WP-Start aus 133-Zeilen-`index.html` ohne OG/JSON-LD/Skip-Link/aria/canonical/sitemap, mit hartcodierten Farben und CLS durch async-fetch). Nachher = formaler Run gegen `http://localhost:8765/`.

Sub-Page Smoke: `sequenz/privacy/` Accessibility = **100**.

## Vorher / Nachher (visuell, Stichpunkte)

**Vorher**
- Welcome-Wand: kleines „Welcome to" + Riesen-`CasyStudioCo` orange + Welcome-Subtitle direkt darunter
- Sprach-Switch: zwei lose Pillen-Links
- App-Cards: nackt, kein Status-Hinweis, drei Links + orange Store-Button als textuelle Zeile
- Footer: 2-Zeilen-Mailto, kein Studio-Block

**Nachher**
- Topbar mit Wordmark links + Pill-Toggle rechts
- Hero mit dezentem Glow-Background, Eyebrow-Pille mit Live-Dot, 2-zeiliger Headline mit Accent-Color
- App-Cards mit Plattform-Pill + farbiger Status-Pille (live/beta/soon), Hover-Lift, klar abgegrenzter Links-Footer
- Mehrzeiliger Site-Footer mit Brand-Block + Studio-Tagline + Contact/GitHub + Legal-Zeile
- Light-Mode Variante über System-Setting

## Commit-Trail

```
42fcb97  feat(brand):       design token system
158caa9  feat(landing):     hero, top bar, pill language toggle, redesigned footer
c4b8b74  feat(cards):       focus-within ring on app cards + reduced-motion guard
761ac1c  feat(responsive):  touch targets and small-viewport polish
39f4520  feat(a11y):        WCAG AA contrast pass + accent-ink text token
e02….    feat(seo):         OG/Twitter, JSON-LD, sitemap, robots, sync render
a91e015  fix(a11y,perf):    WCAG-large-text app-icon size + reserved grid height
010c827  chore(subpages):   keep legacy <a>-based lang-switch styled
```

## Noch offen / Empfehlungen

- **Echtes 1200×630-OG-Image**: aktuell ist `og-image.jpg` 1200×1200 (qlmanage forciert Quadrat beim SVG→PNG-Render auf macOS). Funktioniert auf Twitter/Slack, aber wer Pixel-perfect will, sollte das SVG einmalig in Figma exportieren oder via `puppeteer screenshot --clip` rendern. Kein Lighthouse-Hit, nur Social-Card-Polish.
- **Sub-Pages re-designen**: explizit out-of-scope dieses WPs (Brief). Eigenes Folge-WP empfohlen — Privacy/Support/About könnten von Section-Headern, Card-Komponenten und einem inhalts-Index profitieren.
- **„Press"-Page Struktur**: Brief erwähnt sie als Vorbereitung möglich; nicht gemacht (kein Inhalt brieflich freigegeben).
- **Web-Font** (z.B. Inter Variable): aktuell System-Stack (SF Pro auf Apple, Segoe UI auf Win). Wenn Brand-Identität es verlangt → eigenes WP wegen Lizenz + Self-Host + Performance-Test.

## Eskalationspunkte (keine getroffen)

- Brand-Entscheidungen: Akzent-Orange `#FF6B00` beibehalten (Brief implizierte das), Wordmark = typografisches Lockup statt neues Logo (im Brief-Spielraum), System-Font-Stack (keine Lizenz nötig). Falls Studio in Zukunft echtes Logo / Custom-Font definiert, zentrale Tokens machen den Swap zur 1-Datei-Änderung.
- Sub-Pages-Bruch: keiner — Klassennamen erhalten, `<a>`-basierter Lang-Switch weiter gestylt.
- Lighthouse ≥ 95 ohne Build: erreicht (alle 4 = 100).

## Push

`origin/main` aktualisiert → GitHub-Pages Auto-Deploy in ~1-2 Min.
