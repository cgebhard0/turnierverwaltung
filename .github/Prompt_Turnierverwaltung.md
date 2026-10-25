# Prompt: SC Steindorf Turnierverwaltung entwickeln

> Dieser Prompt beschreibt die App so vollständig, dass Claude sie in ihrem aktuellen
> Funktionsumfang (v1.7.1) neu erstellen kann. Einfach an Claude geben.

---

## Rolle & Ziel

Du bist ein erfahrener Frontend-Entwickler. Entwickle eine **Single-Page-Web-App** zur
Verwaltung von Vereins-Tennisturnieren (Doppel & Einzel) für den **SC Steindorf**.
Die gesamte App lebt in **einer einzigen `index.html`** (plus PWA-Dateien) – **keine
Frameworks, keine Build-Tools**. Reines HTML + CSS + Vanilla JavaScript.

Die App muss auf dem Handy (primär) und Desktop laufen, mobil-optimiert (portrait),
und über GitHub Pages unter `https://<user>.github.io/turnierverwaltung/` deploybar sein.

---

## Tech-Stack (verbindlich)

- **Frontend:** Vanilla HTML/CSS/JS, eine Datei, keine Frameworks
- **Datenbank:** Firebase Realtime Database (`firebase-compat` v10.8.0, per CDN)
- **PDF-Export:** jsPDF 2.5.1 + qrcode 1.5.3 (CDN)
- **Auth:** PIN-basiert (4-stellig), PINs/Config in Firebase `config`-Knoten
- **Session:** `sessionStorage` (Login endet beim Tab-Schließen)
- **Einstellungen:** `localStorage` für zuletzt gewählten Bewerb + Gruppe
- **PWA:** `manifest.json` + Service Worker (`sw.js`), offline-fähig, installierbar

Firebase-Konfiguration als Platzhalter einbauen (apiKey, authDomain, databaseURL
europe-west1, projectId). Security Rules: `turnier` und `config` jeweils
`.read: true` / `.write: true` (Vereinsbetrieb, bewusst offen).

---

## Datenmodell (Firebase)

```
turnier/
  {Bewerb}_{Gruppe}/        z.B. "Doppel_A", "Einzel_B"   ← Unterstrich, kein Leerzeichen!
    [ {match}, {match}, ... ]
config/
  spielerListen
  playerPins
  gruppenStruktur
```

Match-Objekt:
```js
{
  id: "d_A_0", runde: "Runde 1", datum: "22.5.–31.5.",
  spieler: ["Nina","Günther","Stefan P","Köste"],   // Doppel = 4, Einzel = 2
  gespielt: false, cancelled: false,
  ergebnisse: {},          // Doppel: Games je Spieler · Einzel: Gewinnsätze je Spieler (abgeleitet)
  saetze: [],              // nur Einzel: Satz-Spielstände, z.B. [[6,4],[4,6],[7,5]]
  detailErgebnis: "",      // "6:4, 4:6, 7:5" (Einzel: aus saetze generiert)
  eingetragenVon: "", eingetragenAm: ""
}
```

Turnierstruktur: **Doppel** = Gruppen A, B, C · **Einzel** = Gruppen A, B, C, D, E.

**Einzel-Wertung:** Eingabe satzweise als Games-Spielstand (Best of 3, bei 1:1 ein voller 3. Satz).
Gewinnsätze, Sieger und gewonnene Games werden daraus berechnet (`einzelStatsFromMatch()`); die
Games-Summe entsteht aus `saetze` bzw. ersatzweise geparst aus `detailErgebnis`. Rangliste-Sortierung
Einzel: **Siege → Sätze → Games** (`cmpEinzel()`).

---

## Funktionen – Spieler

- **Spielplan:** Runden & Matches der gewählten Gruppe als Karten; Auswahl von
  Bewerb (Doppel/Einzel) und Gruppe über Dropdowns/Tabs. Fortschrittsbalken
  (% gespielter Matches).
- **Login:** Dropdown oben rechts mit allen Spielernamen. Auswahl → `prompt()` für
  4-stelligen PIN → Abgleich mit `playerPins[name]`. Bei Abbruch (`null`) sauber
  abbrechen. Eingeloggte Gruppenmitglieder im Dropdown mit ✦ markieren.
- **Ergebnis eintragen/bearbeiten:** Nur für am Match beteiligte Spieler **oder**
  Admin. **Doppel:** Modal mit Games je Spieler + freiem Detailergebnis-Feld.
  **Einzel:** Modal mit Spielstand je Satz (Satz 1/2/3, je 2 Game-Felder); Gewinnsätze,
  Sieger und Games werden abgeleitet. Bei abgesagten Matches (`cancelled`) kein Eintragen.
- **Rangliste (pro Gruppe):** automatisch – Doppel nach **Games**, Einzel nach
  **Siegen → Sätzen → Games**. Top 3 mit Gold-/Silber-/Bronze-Markierung. Spiele ohne
  erfassten Spielstand sind mit `*` markiert (Games dort unbekannt).
- **Gesamt-Ranking:** gruppenübergreifend, getrennt für Doppel und Einzel.
- **Live-Sync:** Echtzeit-Listener auf Firebase – Änderungen erscheinen sofort auf
  allen Geräten.
- **WhatsApp-Share:** nach Eintragen eines Ergebnisses Teilen-Option.
- **PDF-Export** (siehe unten).

## Funktionen – Admin (PIN „Admin")

- Backup erstellen/laden (JSON-Export/-Import)
- Spielerliste als CSV (Name + PIN)
- Spielplan CSV exportieren / importieren (alle Gruppen)
- Spieler verwalten: anlegen, PIN ändern, löschen
- Konfiguration nach Firebase pushen (synchronisieren)
- Gruppe zurücksetzen (Ergebnisse einer Gruppe löschen)
- Gesamtes Turnier löschen (alle Firebase-Daten)
- Admin-Session bleibt auch bei Gruppenwechsel erhalten (`isAdminLoggedIn` +
  sessionStorage).

---

## PDF-Export (`exportErgebnissePDF()`)

Vollständiger Turnierbericht mit jsPDF:

1. **Deckblatt** – Tennisplatz-Rot (Clay-Look), eingebettetes Tennisball-Foto,
   QR-Code zur App, Datum-Badge, Kacheln (Spiele / Gespielt / Fortschritt),
   Gruppen-Übersicht.
2. **Trennseite Doppel** → pro Gruppe Spieltabelle (Runde, Team 1, Team 2, Sätze,
   Games je Spieler) + Gruppenrangliste.
3. **Trennseite Einzel** → analog (Sätze, Games je Spieler; Rangliste Siege/Sätze/Games).
4. **Gesamtranking Doppel** und **Gesamtranking Einzel**.
5. **Zusammenfassung** – Kacheln, Fortschrittsbalken, Gruppen-Fortschritt.

Design: Farbstreifen links an Zeilen (Grün = gespielt, Orange = offen),
100%-Badge bei vollständig gespielten Gruppen, Gruppen-Akzentfarben
A=Türkis, B=Blau, C=Lila, D=Orange, E=Rot.

---

## CSV-Format (Spielplan-Import)

Trennzeichen `;`, UTF-8 **mit BOM**:
```
Bewerb;Gruppe;Runde;Datum;Team1_Spieler1;Team1_Spieler2;Team2_Spieler1;Team2_Spieler2;Organisator
Doppel;A;1;22.5.-31.5.;Nina;Günther;Stefan P;Köste;Nina
Einzel;A;1;;Nina;;Peter;;
```

---

## PWA / Offline

- `manifest.json`: name, short_name „Turnier SC", standalone, portrait, theme/
  background `#a03c1e`, Icons 192 + 512 (maskable).
- `sw.js`: liest `APP_VERSION` aus index.html, baut Cache-Namen daraus, cached
  App-Shell (HTML, Icons, CDN-Libs) **Cache-First**, lässt Firebase/googleapis
  **immer ans Netz**, löscht alte Caches beim Activate, informiert Clients per
  `postMessage({type:'SW_UPDATED'})`.
- In der App: **Offline-Banner** (oben, rot) und **Update-Banner** (unten) mit
  Reload-Button.

---

## Design

Clay-Tennis-Optik. CSS-Variablen z.B. `--primary:#16a085`, `--secondary:#2c3e50`,
`--accent:#e74c3c`, `--bg:#f8f9fa`. Theme-Farbe `#a03c1e`. Mobil-first,
Tap-Highlights aus, große Touch-Targets, Spielkarten-Layout.

---

## Wichtige Funktionsnamen (zur Orientierung)

`initApp`, `startAppLogic`, `generiereStandardSpiele`, `listenToFirebase`,
`renderSpiele`, `openModal`, `saveScore`, `berechneRangliste`,
`berechneGesamtrangliste`, `changeUser`, `exportErgebnissePDF`,
`findFirebaseResult`, `parseSpielplanCSV`, `openSpielerModal`, `openWaShareModal`.

---

## Achtung / häufige Fehlerquellen

- Firebase-Schlüssel mit **Unterstrich** bilden (`Doppel_A`, nicht `Doppel A`).
- `gespielt`-Property nutzen (nicht „offen"); sonst zeigt der PDF-Export alles als offen.
- `prompt()`-Abbruch (`null`) abfangen.
- Tab-Zustand in eigener Variable (`currentTab`) halten, nicht über DOM-Index.

---

## Sicherheits-Hinweis (bewusst akzeptiert)

PINs und offene Firebase-Rules sind für den internen Vereinsbetrieb okay. Die
Berechtigungsprüfung ist client-seitig und damit über die Konsole umgehbar – das
ist für diesen Anwendungsfall akzeptabel und soll so bleiben.

---

## Liefergegenstand

`index.html` (komplette App), `manifest.json`, `sw.js`, Icons. Versioniere über
eine `APP_VERSION`-Konstante in index.html (Zielstand: **v1.7.1**). Deployment
über GitHub Pages.
