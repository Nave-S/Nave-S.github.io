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

## Design ändern

Nur `style.css` bearbeiten — wirkt auf alle Seiten.

## URLs für App Store Connect

```
Privacy:  https://nave-s.github.io/sequenz/privacy
Terms:    https://nave-s.github.io/sequenz/terms
Support:  https://nave-s.github.io/sequenz/support
```
