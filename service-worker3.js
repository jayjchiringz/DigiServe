//service-worker.js
const CACHE_NAME = 'digiserve-cache-v1';
const DYNAMIC_CACHE_NAME = 'digiserve-dynamic-cache-v1';
const OFFLINE_URL = '/static/offline.html';

const urlsToCache = [
    '/',
    '/accounts/login/',
    '/dashboard/',
	'/dashboard1/',
    '/sales/businesses/',
    '/static/manifest.json',
    '/static/js/chart.js',
    '/static/css/style_2.css',
    '/static/css/style.css',
    '/static/icons/icon-192x192.png',
    '/static/icons/icon-512x512.png',
    '/service-worker.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.3.1/dist/pouchdb.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns',
    OFFLINE_URL,
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event triggered.');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                urlsToCache.map((url) =>
                    fetch(url)
                        .then((response) => {
                            if (response.redirected) {
                                const resolvedUrl = response.url;
                                console.warn(`Following redirect for: ${url} -> ${resolvedUrl}`);
                                return fetch(resolvedUrl).then((finalResponse) => cache.put(url, finalResponse));
                            }
                            return cache.put(url, response);
                        })
                        .catch((error) => {
                            console.error(`Failed to cache ${url}:`, error);
                        })
                )
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    console.log(`Intercepting fetch: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log(`Serving from cache: ${event.request.url}`);
                return cachedResponse;
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse.redirected) {
                        const resolvedUrl = networkResponse.url;
                        console.warn(`Redirect detected for: ${event.request.url}, resolved to: ${resolvedUrl}`);
                        return fetch(resolvedUrl).then((finalResponse) => {
                            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                                cache.put(event.request, finalResponse.clone());
                                return finalResponse;
                            });
                        });
                    }

                    return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch((error) => {
                    console.error(`Fetch error for: ${event.request.url}`, error);
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    return new Response('Offline and resource not found.', { status: 404 });
                });
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event triggered.');
    const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            ).then(() => {
                // Remove redirected responses from dynamic cache
                return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                    return cache.keys().then((requests) => {
                        return Promise.all(
                            requests.map((request) => {
                                return cache.match(request).then((response) => {
                                    if (response?.redirected) {
                                        console.warn(`Deleting redirected response: ${request.url}`);
                                        return cache.delete(request);
                                    }
                                });
                            })
                        );
                    });
                });
            });
        })
    );
});
