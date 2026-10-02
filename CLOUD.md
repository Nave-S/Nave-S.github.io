# Arbeiten in der Cloud-Sitzung (Studio-Website)

Diese Datei gilt für jede Cloud-Sitzung (Claude Code im Browser) in diesem Repo. Sie ersetzt für dich die
Abschnitte jeder `CLAUDE.md` oder Anweisung, die von Mentor, business-hub, `.mentor/`, `.ops/`, Worktrees,
Skills, `haende-weg.sh` und Pfaden wie `~/DEV/…` oder `/Users/…` handeln: **das alles gibt es in der Cloud
nicht.**

## Wo du bist
- **Linux, kein Mac.** Das hier ist eine reine Website (HTML, CSS, JS), dafür brauchst du nichts davon.
- Du siehst **nur dieses Repo**. Die Apps, über die die Seite spricht, siehst du nicht.
- **Die Seite ist live, sobald etwas auf `main` liegt** (GitHub Pages, `casystudio.com`). Deshalb nur auf
  deinem Zweig arbeiten. Vorschau lokal per `python3 -m http.server` im Repo-Ordner, dann im Browser
  `http://localhost:8000` ansehen.

## Deine Aufgabe
Die Aufgabe nennt der Owner im Chat. Nennt er einen Zweig, arbeite auf dessen Stand:
`git fetch origin <zweig> && git reset --hard origin/<zweig>` (nur auf deinem frischen Zweig), danach
`git log -1` als Beleg. Nennt er keinen, gilt der Standardzweig. Ist die Aufgabe mehrdeutig: fragen,
nicht die plausibelste Lesart bauen.

## Regeln
- Arbeite auf deinem eigenen Zweig. **Nie in `main` mergen**, nie in fremde Zweige pushen. Ein Push auf
  `main` veröffentlicht sofort.
- Nach jedem abgeschlossenen Schritt committen und pushen. Bricht die Sitzung ab, ist der Stand sicher.
- `git add` immer mit Pfad, nie `-A` oder `.`.
- **Nie „funktioniert" schreiben, was du nicht geprüft hast.** Geprüft heißt: lokal per
  `python3 -m http.server` geöffnet und angesehen. „Geschrieben, ungeprüft" ist die richtige Angabe.
- **Keine Gedankenstriche** (– oder —) als Satzzeichen in Texten, die Nutzer sehen.
- Nichts ins Web außer dem, was der Owner ausdrücklich will, keine veröffentlichten Artifacts. Keine
  privaten Inhalte, Schlüssel oder Screenshots mit privaten Daten ins Repo.

## Rückmeldung (Pflicht, bevor du aufhörst)
Datei `cloud/<JJJJ-MM-TT>-<kurzname>.md` auf deinem Zweig, committet und gepusht:

    ---
    zweig: "<dein Zweig>"
    basis: "<Commit, auf dem du angefangen hast>"
    status_vorschlag: needs_review   # oder blocked
    ---
    ## Was gemacht wurde          (je Punkt: erledigt / teilweise / offen)
    ## Belege                     (Befehle und Ausgaben wörtlich, git diff --stat)
    ## Ungeprüfte Stellen         (Datei:Zeile, was du nicht im Browser gesehen hast)
    ## Offene Fragen              (für den Owner)
    ## Prüfschritte am Mac        (was der Owner vor dem Merge nach main ansehen muss, in Reihenfolge)

Der Mentor am Mac findet deinen Zweig und diese Datei beim nächsten Start.

## Diese Seite
- **Studio-Website `casystudio.com`:** reines HTML, CSS und JS auf GitHub Pages, kein Build-Schritt, kein
  Framework. Auf `main` liegt die Live-Seite. Die Domain steht in `CNAME`.
- **Ordner:** `index.html` und `de.html` (Startseite englisch/deutsch), `sequenz/` und `shutterlife/` (je Startseite
  plus `privacy/`, `terms/`, `support/`, `impressum/`), `impressum/`, `datenschutz/`, `kontakt/` (je `index.html` und
  `de.html`), `assets/` (`casy.css`, `casy.js`, `casy-kopf.js`, Schriften, Bilder, App-Store-Badges),
  `tools/` (zwei Hilfsskripte), `404.html`, `sitemap.xml`, `robots.txt`.
- **Was hier prüfbar ist:** Ansehen per `python3 -m http.server`, Links und Seitenstruktur per Skript. Kein
  `swift test`.
- **Rechtstexte** (Impressum, Datenschutz, und je App `privacy/`, `terms/`, `support/`): **nie ohne ausdrücklichen
  Owner-Auftrag ändern**, auch nicht kleine Korrekturen. Wenn dir dort etwas falsch vorkommt, melde es in der
  Rückmeldung.
- **Die Website muss dem Stand der Apps entsprechen.** Behauptungen über eine App (Funktionen, Preise, Daten,
  Plattformen, Sprachen) nur ändern, wenn der Owner den Stand nennt. Nichts erfinden, was die App nicht kann.
- Beide Sprachen pflegen: Wer `index.html` ändert, prüft `de.html` und umgekehrt.
