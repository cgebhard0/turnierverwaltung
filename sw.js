// SC Steindorf Turnierverwaltung – Service Worker
// Version entspricht APP_VERSION in index.html
const CACHE_NAME = 'sc-steindorf-v1.6.2';

// App-Shell: alles was für die Grundfunktion nötig ist
const APP_SHELL = [
    '/turnierverwaltung/',
    '/turnierverwaltung/index.html',
    '/turnierverwaltung/icon-192.png',
    '/turnierverwaltung/icon-512.png',
    '/turnierverwaltung/apple-touch-icon.png',
    '/turnierverwaltung/manifest.json',
    // CDN-Ressourcen
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js',
];

// ── Install: App-Shell in Cache legen ──────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] App-Shell wird gecacht …');
            // CDN-Ressourcen einzeln cachen (Fehler tolerieren)
            return cache.addAll(APP_SHELL).catch(err => {
                console.warn('[SW] Einige Ressourcen konnten nicht gecacht werden:', err);
            });
        })
    );
    self.skipWaiting();
});

// ── Activate: Alte Caches löschen ──────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Alter Cache gelöscht:', key);
                        return caches.delete(key);
                    })
            )
        )
    );
    self.clients.claim();
});

// ── Fetch: Strategie je nach Anfrage-Typ ───────────────────────────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Firebase Realtime Database → immer Netzwerk (Live-Daten!)
    if (url.hostname.includes('firebasedatabase.app') ||
        url.hostname.includes('firebase.google.com') ||
        url.hostname.includes('googleapis.com')) {
        return; // Browser übernimmt
    }

    // App-Shell & CDN → Cache-First mit Netzwerk-Fallback
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request)
                .then(response => {
                    // Erfolgreiche Antworten in Cache aufnehmen
                    if (response && response.status === 200 && response.type !== 'opaque') {
                        const toCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                    }
                    return response;
                })
                .catch(() => {
                    // Offline: index.html als Fallback
                    if (event.request.mode === 'navigate') {
                        return caches.match('/turnierverwaltung/index.html');
                    }
                });
        })
    );
});
