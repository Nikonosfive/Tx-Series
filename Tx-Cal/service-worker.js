const CACHE_NAME = 'calculator-cache-v1';
const urlsToCache = [
    '/',
    '/Tx-Calculator/',
    '/index.html',
    '/styles.css',
    '/Tx-Calculator/styles.css',
    '/Tx-Calculator/script.js',
    '/script.js',
    '/Tx-Calculator/index.html',
    '/Tx-Calculator/manifest.json',
    '/manifest.json',
    '/Tx-Calculator/icon-192x192.png',
    '/Tx-Calculator/icon-512x512.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
