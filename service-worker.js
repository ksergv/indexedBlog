const CACHE_NAME = 'posts-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/post-page.html',
    '/css/styles.css',
    '/js/script.js',
    '/js/app.js',
    '/js/main.js',
    '/img/6 Мечей.jpg',
    '/img/4 Мечей.jpg',
    '/img/blog.jpg',
    '/img/tsc.jpg',
    '/img/light_body.jpg',
    '/img/profile.jpg',
];

self.addEventListener('install', event => {
    console.log('Service worker installed');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    console.log('Service worker fetch', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
