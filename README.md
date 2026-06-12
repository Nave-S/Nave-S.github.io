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

## Design ändern

Nur `style.css` bearbeiten — wirkt auf alle Seiten.

## URLs für App Store Connect

```
Privacy:  https://nave-s.github.io/sequenz/privacy
Terms:    https://nave-s.github.io/sequenz/terms
Support:  https://nave-s.github.io/sequenz/support
```
