# SC Steindorf – Turnierverwaltung

Eine einfache Web-App zur Verwaltung von Tennisturnieren (Doppel & Einzel) für den **SC Steindorf**.

🎾 **App öffnen:** [cgebhard0.github.io/turnierverwaltung](https://cgebhard0.github.io/turnierverwaltung/)

---

## Features

- **Spielplan** – Alle Runden und Matches je Gruppe auf einen Blick
- **Ergebnisse eintragen** – PIN-geschützt, nur für beteiligte Spieler
- **Live-Sync** – Echtzeit-Aktualisierung über Firebase für alle Geräte gleichzeitig
- **Rangliste** – Automatische Berechnung nach Games (Doppel) bzw. Siegen (Einzel)
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
| `Spieler_Anleitung.pdf` | Anleitung für alle Spieler |
| `Admin_Anleitung.pdf` | Handbuch für den Administrator |
| `SC_STE~1.MD` | Projektdokumentation |

---

## Version

**v1.6.0** · Build 2026-05-29

---

*Entwickelt von Christian Gebhard · SC Steindorf 2026*
