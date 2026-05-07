---
schema_version: "1.0"
file_type: escalation-note
work_packet_id: "WP-N-2026-05-07-030"
project_id: casysite
status: escalated
created_at: "2026-05-07T11:55:00+02:00"
local_fix_possible: false
mentor_required: true
---

# Escalation Note: WP-N-2026-05-07-030 — Inter-Variable Self-Host

## Grund der Eskalation

**Phase 1 Stakeholder-Klärung** (Brief: „Vor Implementation: kurz mit Nawied/Studio-Owner Brand-Frage … Wenn unklar → Eskalation, NICHT eigenmächtig wählen") ist erfolgt und ergab eine **Entscheidung gegen jede Custom-Font**.

User-Antwort (Nawied, 2026-05-07 ~11:55):
> „System-Stack lassen — kein Custom-Font."

Damit kann der WP-Output („Inter Variable self-hosted im Repo, mit Variable-Axes aktiv genutzt") **nicht erreicht** werden. Da Phase 1 als Gate vor allen weiteren Phasen definiert ist, fällt der gesamte Implementations-Scope (Phasen 2–5) ersatzlos weg.

## Was wurde gemacht

- Stakeholder-Klärung durchgeführt (Phase 1 abgeschlossen)
- Keine Bytes heruntergeladen, kein Code-Edit, kein Commit auf der `main` für diesen WP
- Audit der Optionen vorbereitet (Inter / Geist / IBM Plex / System-Stack) — Stakeholder hat sich klar für System-Stack entschieden

## Begründung des Stakeholders (übernommen aus Frage-Antwort-Pattern)

System-Stack-Vorteile, die für die Entscheidung sprachen:
- Spart 80–120 KB an Font-Bytes (Performance-Buffer für künftige Features)
- Keine FOUT-/Swap-Risiken auf langsamem Netz
- Native Render-Konsistenz mit App-Look (SF Pro auf Apple-Plattformen, Segoe UI auf Windows, Roboto auf Android)
- Studio-Brand baut sich aktuell über andere Tokens auf (Akzentfarbe, Spacing, Wordmark-Mark) — Schrift-Identität ist nicht der primäre Hebel

## Optionen für Mentor-Entscheidung

| Option | Was passiert mit dem WP | Aufwand |
|---|---|---|
| **A: Archivieren als „decided: no-font-change"** *(Empfehlung)* | WP-Status `completed` mit Note „Stakeholder-Entscheidung Phase 1: System-Stack bleibt". Kein Implementation-Bedarf. | 0 (nur Status) |
| B: Splitten + Re-Open für anderen Hebel | Neuen WP anlegen für Brand-Polish ohne Font-Change (z.B. eigene Wordmark-Schrift als SVG-Sprite, oder Custom Display-Font nur für H1-Hero). | ~2–4h für Re-Scope-Brief |
| C: Decision später re-evaluieren | WP-Status `blocked` mit Re-Check-Datum (z.B. 2026-08-01) wenn Sequence-Lite live + ShutterLife stable und Brand-Visibility wichtiger wird. | 0 jetzt, evtl. 4h später |

## Empfehlung Worker (mich)

**Option A**: Stakeholder-Entscheidung war klar und unmissverständlich. Sub-Pages und Landing rendern aktuell mit dem WP-023-Token-System bereits sauber (Lighthouse 100/100/100/100). Der Brand-Sprung, den der WP als „nice-to-have" markierte, ist explizit nicht gewollt.

Wenn der Mentor zustimmt: WP via `wp-status.sh WP-N-2026-05-07-030 completed --force` schließen mit Bezug auf diese Escalation Note, anschließend `archived`.

## Erwartung an Mentor

- Bestätigen, ob Option A korrekt ist (oder Option B/C bevorzugt wird)
- Status entsprechend setzen (`completed` + `archived`, oder `blocked` mit Re-Check-Datum)
- Bei Option B: neuen WP-Scope skizzieren (Brand-Polish-Hebel-Liste ohne Font-Change)

## Kein Code-Impact

- Keine Bytes herunterzuladen / kein Bytes-Cleanup nötig
- Keine `style.css`-Änderungen nötig (Font-Tokens bleiben System-Stack)
- Keine `index.html`-Änderungen nötig (kein Preload zu entfernen)
- Sub-Pages bleiben unangetastet (sind erst gerade in WP-029 frisch migriert)

## Querverweis

- Voraus: WP-N-2026-05-07-023 (Brand-Token-System mit System-Stack)
- Parallel: WP-N-2026-05-07-029 (Sub-Pages-Pattern erbt vom Token-System — keine Font-Wechsel-Erwartung dort)
