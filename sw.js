// Funziona anche offline: l'app si apre dalla cache, Firebase sincronizza quando torna la rete.
const C = 'csm-v34';
const SHELL = ['./', './index.html', './style.css', './app.js', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(SHELL))) });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const put = r => { if (r && r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)) } return r };
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
  } else if (/gstatic\.com\/firebasejs|fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net\/npm\/tesseract/.test(u.href)) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(put)));
  }
});
