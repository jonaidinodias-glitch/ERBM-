/* Évolud · ERBM – cache hors ligne · conçu et développé par Saïd OUFQIR
   Réseau d'abord (mise à jour immédiate), cache si pas de réseau. Changer C à chaque mise en ligne n'est pas nécessaire. */
const C = 'erbm-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const local = u.origin === location.origin, lib = /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host);
  if (!local && !lib) return;   // serveur Google (synchro) et photos Drive : jamais mis en cache
  e.respondWith(fetch(e.request, local ? { cache: 'no-cache' } : undefined).then(r => {
    if (r.ok && !r.redirected) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
