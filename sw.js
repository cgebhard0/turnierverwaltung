// SC Steindorf Turnierverwaltung – Service Worker
// Die Version wird automatisch aus APP_VERSION in index.html übernommen.
// Beim Deployment: APP_VERSION in index.html hochzählen → sw.js NICHT
// manuell anfassen. Der Service Worker liest die Version beim Install aus
// dem Cache-Manifest und invalidiert den Cache automatisch.

const CACHE_VERSION = 'sc-steindorf'; // Basisname – Version wird dynamisch ermittelt
let CACHE_NAME = CACHE_VERSION + '-unknown';

const APP_SHELL = [
    '/turnierverwaltung/',
    '/turnierverwaltung/index.html',
    '/turnierverwaltung/tennisball.png',
    '/turnierverwaltung/icon-192.png',
    '/turnierverwaltung/icon-512.png',
    '/turnierverwaltung/apple-touch-icon.png',
    '/turnierverwaltung/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js',
];

// ── Install: Version aus index.html lesen, dann cachen ─────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        fetch('/turnierverwaltung/index.html')
            .then(r => r.text())
            .then(html => {
                const m = html.match(/APP_VERSION\s*=\s*["']([^"']+)["']/);
                CACHE_NAME = CACHE_VERSION + '-v' + (m ? m[1] : Date.now());
                console.log('[SW] Installiere Version:', CACHE_NAME);
                return caches.open(CACHE_NAME).then(cache =>
                    cache.addAll(APP_SHELL).catch(err =>
                        console.warn('[SW] Einige Ressourcen nicht gecacht:', err)
                    )
                );
            })
            .then(() => self.skipWaiting()) // Sofort übernehmen, kein Warten auf Nutzerbestätigung
    );
});

// ── Activate: Alte Caches löschen, alle Tabs übernehmen ────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k.startsWith(CACHE_VERSION) && k !== CACHE_NAME)
                    .map(k => { console.log('[SW] Alter Cache gelöscht:', k); return caches.delete(k); })
            )
        ).then(() => self.clients.claim()) // Alle offenen Tabs übernehmen
    );
});

// ── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Firebase → immer Netzwerk
    if (url.hostname.includes('firebasedatabase.app') ||
        url.hostname.includes('firebase.google.com') ||
        url.hostname.includes('googleapis.com')) return;

    // index.html → Network-First: immer frisch vom Server holen, Cache als Fallback
    if (event.request.mode === 'navigate' ||
        url.pathname === '/turnierverwaltung/' ||
        url.pathname === '/turnierverwaltung/index.html') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Versions-Checks (index.html?cb=…) nicht cachen – sonst wächst der Cache
                    if (response && response.status === 200 && !url.search) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Alle anderen Ressourcen → Cache-First
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response && response.status === 200 && response.type !== 'opaque') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                if (event.request.mode === 'navigate')
                    return caches.match('/turnierverwaltung/index.html');
            });
        })
    );
});
