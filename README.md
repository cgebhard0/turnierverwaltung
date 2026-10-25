# SC Steindorf – Turnierverwaltung

Eine einfache Web-App zur Verwaltung von Tennisturnieren (Doppel & Einzel) für den **SC Steindorf**.

🎾 **App öffnen:** [cgebhard0.github.io/turnierverwaltung](https://cgebhard0.github.io/turnierverwaltung/)

---

## Features

- **Spielplan** – Alle Runden und Matches je Gruppe auf einen Blick
- **Ergebnisse eintragen** – PIN-geschützt, nur für beteiligte Spieler
- **Live-Sync** – Echtzeit-Aktualisierung über Firebase für alle Geräte gleichzeitig
- **Rangliste** – Automatische Berechnung nach Games (Doppel) bzw. Siegen → Sätzen → Games (Einzel)
- **Gesamt-Ranking** – Gruppenübergreifende Auswertung
- **PDF-Export** – Vollständiger Turnierbericht mit Deckblatt, Ergebnissen und Ranglisten
- **Admin-Bereich** – Spielerverwaltung, Backup, CSV-Import/-Export, Gruppen zurücksetzen

---

## Struktur

| Bewerb | Gruppen |
|--------|---------|
| Doppel | A, B, C |
| Einzel | A, B, C, D, E |

---

## Anmeldung

Jeder Spieler hat einen persönlichen 4-stelligen PIN. Die Anmeldung erfolgt über das Dropdown oben rechts in der App. Die Session bleibt bis zum Schließen des Browser-Tabs gespeichert.

📄 [Spieler-Anleitung (PDF)](Spieler_Anleitung.pdf)

---

## Technologie

- **Frontend:** Vanilla HTML / CSS / JavaScript (Single-Page-App, keine Frameworks)
- **Datenbank:** [Firebase Realtime Database](https://firebase.google.com/)
- **PDF-Export:** [jsPDF 2.5.1](https://github.com/parallax/jsPDF)
- **Hosting:** GitHub Pages

---

## Dateien

| Datei | Beschreibung |
|-------|-------------|
| `index.html` | Komplette App (eine einzige Datei) |
| `manifest.json` · `sw.js` · `*.png` | PWA-Manifest, Service Worker, Icons & Tennisball – müssen im Wurzelverzeichnis bleiben |
| `Spieler_Anleitung.pdf` | Anleitung für alle Spieler (wird aus der App verlinkt) |
| `Dokumentation/Admin_Anleitung.pdf` | Handbuch für den Administrator |
| `Dokumentation/*.src.html` | **HTML-Quellen** der beiden PDF-Anleitungen – hier bearbeiten, dann PDF neu rendern |
| `Dokumentation/SC_Steindorf_Turnier_Projektdokumentation.md` | Projektdokumentation |
| `Dokumentation/spielplan_beispiel.csv` | Beispiel-Spielplan für den CSV-Import |
| `_Archiv/SC_Steindorf_Turnierverwaltung.zip` | Archivierte Projekt-Momentaufnahme |

### Anleitungen (PDF) neu erzeugen

Die beiden PDF-Anleitungen werden aus den `*.src.html`-Dateien per Edge-Headless gerendert
(Quelle bearbeiten → PDF neu erzeugen):

```bash
"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu ^
  --no-pdf-header-footer --user-data-dir="%TEMP%\edge_pdf" ^
  --print-to-pdf="Spieler_Anleitung.pdf" "Dokumentation\Spieler_Anleitung.src.html"
```

> Hinweis: Bei bereits laufendem Edge ist der Headless-Druck unzuverlässig – frisches
> `--user-data-dir` verwenden und ggf. einmal wiederholen (klassisches `--headless`, nicht `--headless=new`).

---

## Version

**v1.7.3** · Build 2026-06-30

> Seit v1.7.0: **Einzel-Ergebnisse werden satzweise als Games-Spielstand erfasst.** Gewonnene Sätze, Sieger und gewonnene Games werden daraus automatisch berechnet; die Rangliste sortiert nach **Siegen → Sätzen → Games**. Bei Satzgleichstand 1:1 wird ein voller 3. Satz gespielt (seit v1.7.1).
>
> v1.7.2: Header-Button **„Tennisregeln"** ergänzt. · v1.7.3: **Automatische Versions-Prüfung** – beim Öffnen/Fokus vergleicht die App ihre Version mit dem Server und blendet bei einer neueren Version einen „Jetzt aktualisieren"-Banner ein (lädt mit geleertem Cache neu).

---

*Entwickelt von Christian Gebhard · SC Steindorf 2026*
