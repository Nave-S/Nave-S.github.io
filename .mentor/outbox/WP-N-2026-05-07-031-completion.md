---
schema_version: "1.0"
file_type: completion-note
work_packet_id: "WP-N-2026-05-07-031"
project_id: casysite
status: needs_review
created_at: "2026-05-07T13:30:00+02:00"
---

# Completion Note: WP-N-2026-05-07-031 — Mobile Horizontal-Overflow Bug

## Root-Cause

`.hero::before` (Pseudo-Element für den Akzent-Glow hinter der Headline) hat
`inset: -10% -20% auto -20%` — d.h. der Gradient ragt 20% der Hero-Breite
über jede Seite hinaus *(bewusst, für den weichen „Bleed"-Effekt)*.

`.hero` hatte aber kein `overflow`-Containment. Das Element war zwar
`position: absolute` mit `z-index: -1` und `pointer-events: none`, aber das
verhindert nur Clicks und Stacking — **nicht den Layout-Overflow**. Der
Bleed schob das Document auf Mobile-Viewports nach rechts hinaus.

**Rechenbeispiel iPhone 16 (393pt):**
- Container-Padding: `clamp(1rem, 4vw, 2.25rem)` = 16px (4vw = 15.7px → min 1rem)
- Hero-Breite ≈ 361px
- `::before` extends: 20% × 361px ≈ 72px pro Seite
- Rechte Kante des `::before` ≈ 16 + 361 + 72 = **449px > 393px Viewport** → horizontaler Scroll

## Fix

`style.css`:

1. **`.hero { overflow: clip; }`** — Root-Cause-Fix. Containt den Gradient-Bleed
   am verursachenden Element. `clip` statt `hidden`, damit kein
   Scroll-Container entsteht *(robuster, kein `overflow: hidden`-Cascading-Problem)*.

2. **`html, body { overflow-x: clip; }`** — Defense-in-depth-Notbremse für
   alle Pages, die `style.css` teilen *(Sub-Pages haben kein `.hero`,
   profitieren aber vom Schutznetz, falls dort jemals etwas überläuft)*.

3. **`.hero h1 { overflow-wrap: break-word; hyphens: auto; }`** — Headline-
   Schutznetz für lange DE-Wörter *(z.B. „Sorgfalt" auf 375pt SE)*. Brief
   verlangte das explizit als Sicherheits-Netz für Clamp-Headlines.

## Was geprüft

- Diff lokal in Safari mit Web-Inspector → Responsive-Mode iPhone SE / 16 / Pro Max:
  kein horizontaler Scroll mehr, Hero-Glow weiterhin sichtbar (clipped, kein
  visueller Verlust)
- Sub-Pages (sequenz/privacy, shutterlife/support) — bleiben clean,
  `overflow-x: clip` greift global ohne Layout-Regression
- Desktop 1280pt+ → keine sichtbare Veränderung *(Hero-Glow war vorher nie
  über Viewport, jetzt einfach extra-sicher)*

## Was bewusst nicht enthalten

- **Andere Mobile-Bugs** *(Tap-Highlights, Scroll-Performance)* — Scope Out
- **Komplettes Mobile-Re-Design** — Scope Out, nur Overflow-Fix
- **Lighthouse Re-Run** — kein Code-/Asset-Wechsel, der Score beeinflussen
  würde *(nur 3 CSS-Properties dazu)*; bei Verifikation auf echtem iPhone
  wird das eh re-validiert

## Restpunkte / Folgeaufgaben

- **Mitarbeiter-Verifikation auf echtem iPhone** *(Owner-Test nach Pages-Deploy ~2 min)*
- Falls Owner-Test grün: `verify.sh WP-N-2026-05-07-031 --complete`

## Commits

- `fix(mobile): contain hero gradient bleed to prevent horizontal overflow`
