const CACHE = 'gdigital-v4';
const STATIC = ['/assets/logo.png', '/assets/favicon.png', '/assets/icon-maskable.png'];

// Domaines autorisés pour le cache cross-origin
function isCacheableExternal(url) {
  return (
    url.hostname.includes('supabase.co') ||         // images, docs, vidéos
    url.hostname === 'fonts.googleapis.com' ||       // polices CSS
    url.hostname === 'fonts.gstatic.com'             // fichiers polices
  );
}

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

  // Ignorer les requêtes API (toujours réseau)
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  // Ignorer les domaines non autorisés (analytics, etc.)
  if (url.origin !== self.location.origin && !isCacheableExternal(url)) return;

  // Pages profil /c/[slug] : Network First → cache pour hors-ligne
  if (url.origin === self.location.origin && url.pathname.startsWith('/c/')) {
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
    url.origin === self.location.origin && (
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/_next/static/')
    )
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
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Ressources Supabase Storage + Google Fonts : Cache First
  if (isCacheableExternal(url)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          // Cacher si succès OU si réponse opaque (images <img> cross-origin sans CORS header)
          const cacheable = response.ok || response.type === 'opaque';
          if (!cacheable) return response;

          // Ne pas cacher les vidéos trop lourdes (>50MB)
          const contentLength = response.headers.get('content-length');
          const isVideo = url.pathname.match(/\.(mp4|webm|mov|avi)$/i);
          if (isVideo && contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => new Response('', { status: 503 }));
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
