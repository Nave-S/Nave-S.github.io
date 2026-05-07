# Projekt-Agent-Protokoll — CasyStudioCo Site (Nave-S.github.io)

Dieses Dokument beschreibt deine Rolle als **Projekt-Agent** in einer dedizierten Claude-Session im Repo `Nave-S.github.io` *(GitHub Pages, casystudioco.com)*. Vor jeder Arbeit komplett lesen.

## Rolle

Du arbeitest **genau ein Work Packet (WP)** ab, das als Symlink in `.mentor/inbox/<WP-ID>-task-brief.md` liegt. Eine WP — eine Session.

**Was du NICHT machst:** `.ops/`-Änderungen im business-hub, eigenmächtige WPs anlegen, Mentor-Scripts aufrufen.

## Pflichten

### Vor Arbeitsbeginn
1. Diese Datei komplett lesen
2. `.mentor/inbox/<WP-ID>-task-brief.md` komplett lesen
3. `.mentor/state/project-state.md` für Kontext
4. Kurze Bestätigung an User (max. 10 Zeilen)

### Während der Arbeit
- Strikt nach Brief, kein Scope-Creep
- Sprache: Deutsch (Chat), Englisch (Code + Commits)
- Kleine thematische Commits *(`feat:`, `fix:`, `style:`, `chore:`)*
- **Nie `git add -A`** — gezielt mit Pfad
- Keine `--no-verify` Commits
- Bei Unsicherheit: Eskalation, nicht raten
- HTML/CSS-Edits: vor Commit visuell im Browser kontrollieren *(file://-Url)*

### Nach Abschluss
- Completion Note in `.mentor/outbox/<WP-ID>-completion.md`
- Push auf `origin/main` *(GitHub Pages deployt automatisch nach 1-2 Min)*
- `status: needs_review` im Brief-Frontmatter

## Eskalation

Schreibe **Escalation Note** statt Completion und setze `status: escalated` wenn:
- Architektur/Tech-Stack-Frage *(z.B. „sollte das ein Static-Site-Generator sein?")*
- Brand-/Design-Entscheidung die ohne Stakeholder nicht trefflich
- Scope >2× Effort
- Brief widerspricht sich

## Projekt-Spezifika CasyStudioCo Site

- **Stack:** Single-Page-Site, Vanilla HTML/CSS/JS, kein Build-Step. `index.html` lädt `config.json` für die App-Liste.
- **Hosting:** GitHub Pages, Domain `casystudioco.com`
- **Sprachen:** EN (Default) + DE *(via Sprach-Switch oben rechts)*
- **Struktur:**
  - `index.html` — Landing
  - `style.css` — globale Styles
  - `config.json` — App-Liste *(wird in JS geladen)*
  - `favicon.svg`
  - `sequenz/` — Sequence Lite App-Page *(Privacy/Support/About)*
  - `shutterlife/` — ShutterLife App-Page
- **Brand:** Casy-Studio-Branding, Akzent-Farbe Orange `#FF6B00`
- **Design-Status (Stand 2026-05-07):** funktional, aber *„viel besser nötig"* — siehe Initial-Design-WP
- **GitHub:** `Nave-S/Nave-S.github.io`
- **Memory-Querverweise:**
  - `feedback_talktome_coding_conventions.md` *(Studio-Code-Standards, soweit übertragbar)*
  - `project_talktome_recorder.md`, `project_talktome.md` *(Apps die hier gelistet sind)*
