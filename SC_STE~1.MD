# SC Steindorf – Turnierverwaltung
## Projektdokumentation

---

## 1. Projektübersicht

**Projektname:** SC Steindorf Turnierverwaltung  
**Typ:** Single-Page Web-App (eine einzige HTML-Datei)  
**Zweck:** Verwaltung und Anzeige von Tennisturnieren (Doppel & Einzel) für den SC Steindorf  
**URL:** https://cgebhard0.github.io/turnierverwaltung/  
**Deployment:** GitHub Pages  
**Echtzeit-Datenbank:** Firebase Realtime Database  
**Version:** `1.5.0` (Build: 2026-05-29)  
**Entwickler:** Christian Gebhard

---

## 2. Technische Architektur

### 2.1 Stack
- **Frontend:** Vanilla HTML + CSS + JavaScript (keine Frameworks)
- **Datenbank:** Firebase Realtime Database (firebase-compat v10.8.0)
- **PDF-Export:** jsPDF 2.5.1 + qrcode@1.5.3 (CDN)
- **Authentifizierung:** PIN-basiert (4-stellig, im JS-Quelltext gespeichert)
- **Session-Persistenz:** `sessionStorage` (bleibt bis Tab geschlossen wird)
- **Einstellungen:** `localStorage` für Bewerb- und Gruppenwahl

### 2.2 Firebase-Konfiguration
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDpI-0rnr8Z-DW9jW3ebfuXjSPKksb81mc",
    authDomain: "steindorf-turnier.firebaseapp.com",
    databaseURL: "https://steindorf-turnier-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "steindorf-turnier",
};
```

### 2.3 Firebase Datenbankstruktur
```
Firebase Realtime Database
├── turnier/
│   └── {Bewerb}_{Gruppe}/   z.B. "Doppel_A", "Einzel_B"
│       └── [{match-Array}]  gespielt, ergebnisse, detailErgebnis, ...
└── config/
    ├── spielerListen
    ├── playerPins
    └── gruppenStruktur
```

### 2.4 Firebase Security Rules
```json
{
  "rules": {
    "turnier": { ".read": true, ".write": true },
    "config":  { ".read": true, ".write": true }
  }
}
```

---

## 3. Datenstrukturen

### 3.1 Spielerlisten
```
Doppel A: Gast, Franky, Andreas, Elmar, Andy, Nina, Pedro, Günther, Hannes, Stefan P, Köste, Peter, Robi
Doppel B: Gast, Christian, Simone, Zippe, Gabi, Sandra, Stefan T, Wolfi, Dietmar
Doppel C: Gast, Anna B, Anna K, Sabrina, Mandy, Silke, Michaela, Bici, Mister X
Einzel A:  Gast, Nina, Peter, Pedro, Franky
Einzel B:  Gast, Elmar, Andreas, Günther, Stefan P, Robi
Einzel C:  Gast, Hannes, Christian, Sandra, Köste, Stefan T
Einzel D:  Gast, Michaela, Silke, Zippe, Sabrina
Einzel E:  Gast, Simone, Bici, Anna B, Anna K
```

### 3.2 PIN-Verzeichnis (Stand Mai 2026)
```
Admin: 1301    Franky: 8472    Andreas: 3910   Elmar: 5201
Andy: 7749     Nina: 1038      Pedro: 6621     Günther: 9345
Hannes: 2184   Stefan P: 4092  Köste: 8133     Peter: 5509
Robi: 7291     Christian: 1301 Simone: 3920    Zippe: 1184
Gabi: 5039     Sandra: 8274    Wolfi: 6305     Dietmar: 2847
Anna B: 9156   Anna K: 3478    Sabrina: 6820   Mandy: 1593
Silke: 4721    Michaela: 8365  Bici: 2048      Mister X: 9931
Stefan T: 5710
```

### 3.3 Match-Objekt (Firebase)
```javascript
{
    id: "d_A_0",
    runde: "Runde 1",
    datum: "22.5.–31.5.",
    spieler: ["Nina", "Günther", "Stefan P", "Köste"],
    gespielt: false,
    cancelled: false,
    ergebnisse: {},        // { "Nina": 12, "Günther": 8, ... }
    detailErgebnis: "",    // z.B. "6:4, 3:6, 10:8"
    eingetragenVon: "",
    eingetragenAm: ""
}
```

---

## 4. Authentifizierung & Session

| Verhalten | Details |
|-----------|---------|
| Erststart | Immer „Gast" (sessionStorage leer) |
| Login | PIN via `prompt()` → Vergleich mit `playerPins[name]` |
| Session | `sessionStorage` → bleibt bis Tab geschlossen |
| Gruppenwechsel | User bleibt eingeloggt; Gruppenmitglieder erhalten ✦ im Dropdown |
| Abmelden | Dropdown auf „Gast" → sessionStorage geleert |
| Berechtigung | Nur beteiligte Spieler oder Admin dürfen Ergebnisse eintragen |

---

## 5. Features

### Benutzer
| Feature | Beschreibung |
|---------|-------------|
| Spielplan | Runden & Spiele der gewählten Gruppe |
| Ergebnis eintragen/bearbeiten | Nach PIN-Login, nur eigene Spiele |
| Rangliste | Automatisch nach Games (Doppel) / Sätze (Einzel) |
| Gesamt-Ranking | Gruppenübergreifend |
| Fortschrittsbalken | % gespielter Matches |
| PDF-Export | Vollständiger Ergebnisbericht mit Deckblatt, QR-Code, Ranglisten |
| WhatsApp-Share | Ergebnis nach Eintrag teilen |
| Live-Sync | Echtzeit via Firebase |

### Admin
| Feature | Beschreibung |
|---------|-------------|
| Backup erstellen/laden | JSON-Export/-Import |
| Spielerliste CSV | Name + PIN aller Spieler |
| Spielplan CSV exportieren | Alle Gruppen |
| Spielplan CSV importieren | Neuen Spielplan laden |
| Spieler verwalten | Anlegen, PIN ändern, löschen |
| Konfiguration synchronisieren | Config in Firebase pushen |
| Gruppe zurücksetzen | Ergebnisse einer Gruppe löschen |
| Gesamtes Turnier löschen | Alle Firebase-Daten entfernen |

---

## 6. PDF-Export (Stand v1.5.0)

Der PDF-Export (`exportErgebnissePDF()`) generiert einen vollständigen Turnierbericht:

| Seite | Inhalt |
|-------|--------|
| 1 | **Deckblatt** – Tennisball-Foto, Titel, QR-Code, Datum-Badge, Kacheln (Spiele/Gespielt/Fortschritt), Gruppen-Übersicht |
| 2+ | **Trennseite Doppel** – Bewerb-Name, Fortschrittsbalken, Gruppen-Übersicht |
| 3+ | **Doppel-Matches** – pro Gruppe: Spieltabelle (Runde, Team 1, Team 2, Sätze, Games) + Gruppenrangliste |
| n | **Trennseite Einzel** |
| n+ | **Einzel-Matches** – Spieltabelle (Sätze, Ranking-Sätze) + Gruppenrangliste |
| n+1 | **Gesamtranking Doppel** |
| n+2 | **Gesamtranking Einzel** |
| Letzte | **Zusammenfassung** – Kacheln, Fortschrittsbalken, Gruppen-Fortschritt |

**Design-Merkmale:**
- Deckblatt: Tennisplatz-Rot (Clay), eingebettetes Tennisball-Foto, QR-Code zur App
- Farbstreifen links an Zeilen: Grün = gespielt, Orange = offen
- 100%-Badge im Gruppen-Header bei vollständig gespielten Gruppen
- Gruppen-Akzentfarben: A=Türkis, B=Blau, C=Lila, D=Orange, E=Rot
- Top-3 in Ranglisten mit Gold-/Silber-/Bronze-Kreisen

---

## 7. CSV-Format (Spielplan-Import)

**Trennzeichen:** `;`  **Encoding:** UTF-8 mit BOM

```
Bewerb;Gruppe;Runde;Datum;Team1_Spieler1;Team1_Spieler2;Team2_Spieler1;Team2_Spieler2;Organisator

Doppel;A;1;22.5.-31.5.;Nina;Günther;Stefan P;Köste;Nina
Einzel;A;1;;Nina;;Peter;;
```

---

## 8. Wichtige JS-Funktionen

| Funktion | Zweck |
|----------|-------|
| `initApp()` | App-Start, Firebase-Config laden |
| `startAppLogic()` | Spielpläne generieren, Listener starten |
| `generiereStandardSpiele()` | Spielplan → spiele[]-Array |
| `listenToFirebase()` | Echtzeit-Listener |
| `renderSpiele()` | Spielkarten-UI |
| `openModal(id)` | Ergebnis-Modal öffnen |
| `saveScore()` | Ergebnis in Firebase schreiben |
| `berechneRangliste()` | Gruppenrangliste |
| `berechneGesamtrangliste()` | Gesamtranking |
| `changeUser()` | PIN-Prüfung + Session |
| `exportErgebnissePDF()` | PDF-Ergebnisbericht (jsPDF + QR) |
| `findFirebaseResult()` | Match in Firebase-Array suchen |
| `parseSpielplanCSV()` | CSV → Spielplan-Objekte |
| `openSpielerModal()` | Spielerverwaltung |
| `openWaShareModal()` | WhatsApp-Share nach Ergebnis |

---

## 9. Behobene Bugs

| # | Bug | Fix |
|---|-----|-----|
| 1 | `auditHTML` fehlte in card.innerHTML | Variable eingefügt |
| 2 | `prompt()` → `null` bei Abbruch | null-Check eingebaut |
| 3 | Tab-Erkennung per DOM-Index (fragil) | `currentTab`-Variable |
| 4 | Admin-Session bei Gruppenwechsel verloren | `isAdminLoggedIn` + sessionStorage |
| 5 | `openModal()` bei abgesagten Spielen | cancelled-Check eingebaut |
| 6 | PDF-Export zeigte alle Spiele als „offen" | Firebase-Schlüssel korrigiert (`Doppel_A` statt `Doppel A`), `gespielt`-Property statt `offen` |

---

## 10. Deployment

1. `index.html` in GitHub-Repository hochladen (vorherige ersetzen)
2. Erreichbar unter `https://cgebhard0.github.io/turnierverwaltung/`
3. **Cache:** Nach Upload `Strg+Shift+R` oder Inkognito-Tab verwenden

---

## 11. Sicherheit

| Punkt | Status |
|-------|--------|
| PINs im JS-Quelltext | ⚠️ Für Vereinsbetrieb akzeptabel |
| Firebase `.write: true` | ⚠️ Keine serverseitige Authentifizierung |
| sessionStorage statt localStorage | ✅ Session endet mit Tab |
| Berechtigungsprüfung client-seitig | ⚠️ Umgehbar per Konsole |

---

## 12. Offene Ideen

- Ergebnis korrigieren durch Admin (ohne Reset)
- Spieler umbenennen ohne Neu-Import
- Spielplan-Vorschau vor CSV-Import
- URL-Parameter `?gruppe=Doppel-A` für Direktlink
- PWA / Offline-Modus
- Firebase Authentication
- Dunkelmodus

---

*Dokumentation aktualisiert: Mai 2026 · Entwickelt von Christian Gebhard*
