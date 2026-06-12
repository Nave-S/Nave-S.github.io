# Nave-S.github.io

App-Seiten für Privacy, Terms & Support. Läuft auf GitHub Pages.

## Struktur

```
/                     → Übersicht aller Apps
/style.css            → Gemeinsames Design (einmal ändern, überall wirkt)
/sqnz/privacy/        → SQNZ Datenschutz
/sqnz/terms/          → SQNZ Nutzungsbedingungen
/sqnz/support/        → SQNZ Support + FAQ
```

## App freischalten / verstecken

1. Öffne `config.json` (direkt auf GitHub.com: Datei anklicken → Stift-Icon)
2. Setze `true` (sichtbar) oder `false` (versteckt)
3. "Commit changes" klicken — in 1-2 Min live

## Neue App hinzufügen

1. Ordner kopieren: `cp -r sequenz/ neuename/`
2. Texte in den HTML-Dateien anpassen
3. In `config.json` einen neuen Eintrag hinzufügen
4. Pushen

## App geht live → echtes Icon im Grid

Konvention: Sobald eine App live ist, zeigt das Grid ihr echtes App-Icon statt des Monogramm-Badges.

1. 1024er-App-Icon web-optimieren und ablegen:
   `sips -Z 512 <pfad-zum-1024.png> --out apps/icons/<folder>.png`
2. In `index.html` im `apps`-Objekt: `status: "live"` setzen und `iconSrc: "apps/icons/<folder>.png"` eintragen
3. Fertig — das Grid rendert für Apps mit `iconSrc` automatisch das echte Icon (gerundete Maske). Apps ohne `iconSrc` (noch nicht live) behalten das Monogramm-Badge.

## Featured-Card → echter Screenshot (optional)

Die erste Live-App bekommt die volle Featured-Card. Statt des Icon-Medaillons kann sie einen echten App-Screenshot zeigen.

1. Screenshot web-optimieren und ablegen (Hochformat, Breite ~640px, verlustarm):
   `sips --resampleWidth 640 <pfad-zum-screenshot.png> --out apps/screenshots/<folder>.png`
2. In `index.html` im `apps`-Objekt: `screenshot: "apps/screenshots/<folder>.png"` ergänzen.
3. Fertig — nur Apps mit `screenshot`-Feld zeigen in der Featured-Card einen Screenshot (gerahmt, responsive, auf Mobil gestapelt). Ohne Feld bleibt das Icon-Medaillon.

## App-Detail-Overlay (Galerie + Beschreibung, optional)

Eine App kann ein Detail-Overlay bekommen — ein Modal mit durchblätterbarer Screenshot-Galerie + Beschreibung, wie eine Mini-App-Store-Seite. Rein datengetrieben: **nur Apps mit einem `detail`-Objekt** zeigen einen „Details ansehen / View details"-Button und öffnen das Overlay. Apps ohne `detail` bleiben unverändert (nur Card + App-Store-Button).

1. Screenshots web-optimieren (Hochformat, Breite ~640px) nach `apps/screenshots/<folder>/`:
   ```
   sips --resampleWidth 640 <screenshot.png> --out apps/screenshots/<folder>/01.png
   ```
   Mehrere durchnummerieren: `01.png`, `02.png`, …
2. In `index.html` im `apps`-Objekt das `detail`-Objekt ergänzen:
   ```js
   detail: {
       screenshots: ["apps/screenshots/<folder>/01.png", "apps/screenshots/<folder>/02.png"],
       description: { en: "What the app does — core sentence.", de: "Was die App macht — Kernsatz." },
       sections: [
           { title: { en: "How it works", de: "So funktioniert's" },
             body:  { en: "…", de: "…" } },
       ],
   }
   ```
3. Fertig — die Card rendert automatisch den Detail-Button, der das barrierearme Overlay öffnet: Galerie durchblätterbar per Pfeil-Buttons, Tastatur (←/→) und Swipe; Beschreibung + Abschnitte; „Im App Store ansehen"-Button; Schließen per Button/Esc/Backdrop. Fokus-Trap, Scroll-Lock und `prefers-reduced-motion` sind eingebaut.
4. Texte **immer EN + DE** pflegen. Inhaltlich treu bleiben — **keine erfundenen Features** (Quelle z. B. die echte App-Store-Beschreibung via iTunes-Lookup: `https://itunes.apple.com/lookup?id=<APP-ID>&country=de`).

## Design ändern

Nur `style.css` bearbeiten — wirkt auf alle Seiten.

## URLs für App Store Connect

```
Privacy:  https://nave-s.github.io/sequenz/privacy
Terms:    https://nave-s.github.io/sequenz/terms
Support:  https://nave-s.github.io/sequenz/support
```
