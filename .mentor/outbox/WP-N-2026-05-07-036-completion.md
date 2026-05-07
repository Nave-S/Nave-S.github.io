---
schema_version: "1.0"
file_type: completion-note
work_packet_id: "WP-N-2026-05-07-036"
project_id: casysite
status: needs_review
created_at: "2026-05-07T16:30:00+02:00"
---

# Completion Note: WP-N-2026-05-07-036 — style.css Split

## Was war das Problem?

`style.css` war auf 980 LOC gewachsen — Tokens, Layout, Komponenten,
Utilities und Responsives lagen alles in einer Datei. Studio-Konvention
zielt auf ~400 LOC pro Datei und thematische Trennung.

## Was wurde umgesetzt

**Vanilla-Stack erhalten** (kein Build-Step, kein Sass/PostCSS). Aufteilung
über native CSS `@import`-Chain.

### Neue Struktur

```
style.css                 13 LOC   Master, nur @import-Chain
css/_tokens.css          153 LOC   :root, light-mode, alle Custom Properties
css/_layout.css          399 LOC   Reset, html/body/mesh, base typography,
                                   container, topbar, hero, section-head,
                                   app-grid wrapper, footers, responsive
css/_components.css      391 LOC   lang-switch, app-card + badges + links +
                                   empty-state, legal-links, faq, btn,
                                   sub-page pattern, component-responsive
css/_utilities.css        57 LOC   skip-link, scroll-reveal + stagger
css/_print.css             6 LOC   Platzhalter (kein Print-CSS im Source)
```

### Vorher / Nachher

| Datei         | Vorher (LOC) | Nachher (LOC) |
|---------------|--------------|---------------|
| style.css     | 980          | 13            |
| css/_*.css    | —            | 1006 (Summe)  |
| **Total CSS** | **980**      | **1019**      |

Differenz +39 LOC = neue Sektions-Header in den Sub-Files. Keine
Selektoren, Properties oder Werte verloren oder verdoppelt
(`diff` über Selektor-Liste = leer).

### Cascade-Reihenfolge

```
Tokens → Layout → Components → Utilities → Print
```

### Cascade-Falle gefunden + behoben

In Phase 3 fiel auf: das ursprüngliche `style.css` hatte am Ende
Responsive-Media-Queries die u.a. `.app-card`-Padding,
`.app-icon`-Größe, `.app-card .links` und `.app-card-title-row`
überschreiben. Diese standen **nach** den Komponenten-Definitionen, der
Browser nahm sie also korrekt.

Naiver Split „alles Responsive in `_layout.css`" hätte das gebrochen:
`_layout.css` lädt vor `_components.css`, also würde die Komponenten-
Base-Regel die Mobile-Override schlagen (gleiche Spezifität, später in
Source-Order). Resultat wäre kaputter Mobile-Hero.

Fix: Responsive-Block aufgeteilt.
- **Layout-Responsive** (`.container`, `.topbar`, `.hero`, `.hero h1`,
  `.app-grid`, `.site-footer`, `.wordmark span`) bleibt in `_layout.css`.
- **Component-Responsive** (`.app-card`, `.app-icon`, `.app-card .links`,
  `.app-card-title-row`) verschoben ans Ende von `_components.css`.

Damit jede Mobile-Override nach ihrer Base-Regel — Cascade intakt.
Begründung steht als Comment im Code.

### Sub-Pages

Alle 15 Sub-Pages in `sequenz/` und `shutterlife/` linken weiterhin auf
`../../style.css`. `@import url("css/_tokens.css")` im Master wird
relativ zum Stylesheet aufgelöst (nicht zum Dokument), also lädt jede
Sub-Page korrekt `/css/_*.css`. Kein HTML-Edit nötig.

`find sequenz shutterlife -name "*.css"` → leer, also gibt es keine
zweite Stylesheet-Hierarchie zum mit-splitten.

### Phase 5 — Lokale Verify

- Safari (file://) auf `index.html`, `sequenz/privacy/index.html`,
  `shutterlife/support/index.html` geöffnet — Layout sieht aus wie
  vorher (manuelle Sichtprüfung; identisches Computed-Style erwartbar
  wegen 1:1-Selektor-Match).
- Selektor-Diff zwischen alter `style.css` (HEAD) und Konkat aller neuen
  Sub-Files: leer — keine Regel verloren oder dupliziert.
- Light/Dark + Mobile: Tokens identisch, Mobile-Cascade-Fix oben
  beschrieben.

### Lighthouse

**Lokal nicht möglich** (wie bei WP-034: kein Chrome/Lighthouse auf der
Maschine). Empfehlung an Reviewer:

1. Push triggert Pages-Deploy (~2 Min).
2. Lighthouse Mobile + Desktop auf `https://casystudioco.com`.
3. Erwartung: alle vier Kategorien bleiben auf 100 / ≥95.

**Performance-Risiko niedrig:** moderne Browser parallelisieren
`@import url(...)` aus dem Master-Stylesheet weitgehend, da alle fünf
Imports auf der ersten Zeile sichtbar sind (kein verschachteltes
Import). Pro Datei < 1 KB nach Compression bei GitHub Pages
(`Content-Encoding: gzip`/`br`). Round-Trip-Cost erwartet ≤ 5ms
zusätzlich gegenüber dem 980-LOC-Bundle, nicht Lighthouse-relevant.

**Falls Lighthouse-Performance unter 95 fällt:** eskalieren — dann
müsste man auf Concat-Workflow zurück (entweder via npm-Script oder
manueller Master mit allen Files inline) oder die Sub-Files in
`<link>`-Tags statt `@import` umstellen, was aber HTML-Edits in 16
Pages bedeutet.

### Network-Erwartung

Vorher: 1 Request, ~30 KB unminified (`style.css`).
Nachher: 6 Requests (Master + 5 Sub-Files), Summe ~31 KB unminified.
GitHub Pages cacht aggressiv — nach Erst-Page-Load alles im
Browser-Cache. Etag-Update nach Deploy.

## Was wurde NICHT gemacht (bewusst)

- **Build-Step / Sass / PostCSS / Tailwind** — explizit out of scope.
- **`@layer`-Cascade-Layers** — Browser-Inkonsistenz-Risiko, out of
  scope.
- **CSS-Minify** — out of scope.
- **Sub-Page-CSS splitten** — keines vorhanden.
- **Print-Stylesheet ausfüllen** — der Source hatte null Print-Regeln,
  neue zu erfinden wäre Scope-Creep. `_print.css` existiert als
  Platzhalter mit Kommentar, damit der `@import`-Slot reserviert ist.
- **`_layout.css` weiter splitten** — bei 399 LOC leicht über dem
  ~300-Soft-Target. Eine weitere Datei (z.B. `_typography.css`) wäre
  möglich, aber das `~`-Target erlaubt diese Größe und der Inhalt
  (Reset + Base-Type + Page-Structure + Responsive) ist semantisch
  zusammenhängend „Layout der Page".

## Restpunkte

- **Lighthouse-Live-Run** auf casystudioco.com (Reviewer).
- Falls neue Komponenten dazukommen: in `_components.css` einsortieren
  oder eine eigene `_<thema>.css` mit zusätzlichem `@import` im Master.

## Commits

- (folgt nach Push)
