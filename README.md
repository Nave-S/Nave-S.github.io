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

## Design ändern

Nur `style.css` bearbeiten — wirkt auf alle Seiten.

## URLs für App Store Connect

```
Privacy:  https://nave-s.github.io/sequenz/privacy
Terms:    https://nave-s.github.io/sequenz/terms
Support:  https://nave-s.github.io/sequenz/support
```
