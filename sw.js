// Cache dell'app per l'uso offline. Cambia VERSION a ogni aggiornamento.
const VERSION = 'vienna-v9';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './img/aeroporto.jpg', './img/appartamenti.jpg', './img/belvedere.jpg',
  './img/castello-bratislava.jpg', './img/duomo-bratislava.jpg', './img/gloriette.jpg',
  './img/hbf.jpg', './img/hundertwasser.jpg', './img/justiz.jpg', './img/karlskirche.jpg',
  './img/mercatino-bratislava.jpg', './img/mercatino-schoenbrunn.jpg', './img/moebel.jpg',
  './img/naschmarkt.jpg', './img/parlament.jpg', './img/raimund.jpg', './img/rathaus.jpg',
  './img/riesenrad.jpg', './img/sachertorte.jpg', './img/schnitzel.jpg',
  './img/schoenbrunn.jpg', './img/stephansdom.jpg',
  './img/mercatino-stephansplatz.jpg', './img/mercatino-karlsplatz.jpg', './img/mercatino-spittelberg.jpg', './img/klanglicht.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Rete prima per la pagina (così gli aggiornamenti arrivano), cache prima per il resto.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put('./index.html', copy)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
