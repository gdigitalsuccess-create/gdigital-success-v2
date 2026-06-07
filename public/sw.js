const CACHE = 'gdigital-v2';
const STATIC = ['/assets/logo.png', '/assets/favicon.png', '/assets/icon-maskable.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Ignorer les routes API et de tracking (toujours réseau)
  if (url.pathname.startsWith('/api/')) return;

  // Pages profil /c/[slug] : Network First → cache pour hors-ligne
  if (url.pathname.startsWith('/c/')) {
    // Ignorer les requêtes RSC internes de Next.js (navigation client-side)
    const isRSC = event.request.headers.get('RSC') === '1'
      || event.request.headers.get('Next-Router-Prefetch') === '1';

    if (isRSC) return;

    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets statiques Next.js et publics : Cache First
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 503 }));
      })
    );
    return;
  }
});

// Notifications push
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  data.icon  || '/assets/logo-gdigital.png',
      badge: data.badge || '/assets/logo-gdigital.png',
      data:  { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) event.waitUntil(clients.openWindow(url));
});
