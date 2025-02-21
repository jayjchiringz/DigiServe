//static/service-worker.js
const CACHE_NAME = 'digiserve-cache-v1';
const DYNAMIC_CACHE_NAME = 'digiserve-dynamic-cache-v1';
const urlsToCache = [
    '/',
	'https://cdn.jsdelivr.net/npm/chart.js',
	'/accounts/login/',
	'/dashboard/',
	'/sales/businesses/',
	'/static/manifest.json',
    '/static/js/chart.js', 
    '/static/css/style_2.css',
	'/static/css/style.css',
    '/static/icons/icon-192x192.png',
    '/static/icons/icon-512x512.png',
	'/static/service-worker.js', 
	'https://cdn.jsdelivr.net/npm/pouchdb@7.3.1/dist/pouchdb.min.js', 
];

const OFFLINE_URL = '/static/offline.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching pre-defined resources...');
            return cache.addAll([
                ...urlsToCache, // Ensure `/dashboard/` and dependencies are included
                OFFLINE_URL,
            ]);
        })
    );
});

// Fetch Event: Serve from cache, fetch from network, and cache dynamically
self.addEventListener('fetch', (event) => {
	const requestUrl = new URL(event.request.url);
	console.log(`Handling fetch request for: ${requestUrl.pathname}`);
	
    // Explicitly handle `/accounts/login/` for offline
    if (requestUrl.pathname === '/accounts/login/') {
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    console.log('Serving cached login page.');
                    return response;
                }
                console.warn('Login page not found in cache.');
                return fetch(event.request).catch(() => caches.match(OFFLINE_URL));
            })
        );
        return;
    }

    // Handle `/dashboard/` requests
    if (requestUrl.pathname === '/dashboard/') {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return (
                    response || 
                    fetch(event.request)
                        .then((networkResponse) => {
                            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                        })
                        .catch(() => caches.match(OFFLINE_URL))
                );
            })
        );
        return;
    }
	
    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // Cache only valid responses
                    if (!networkResponse || !networkResponse.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request.url, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Serve `/sales/businesses/` from cache if offline
    if (requestUrl.pathname === '/sales/businesses/') {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((networkResponse) => {
                    return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => caches.match(OFFLINE_URL));
            })
        );
        return;
    }

	// Default handling for other requests
	event.respondWith(
		caches.match(event.request).then((response) => {
			if (response) {
				console.log(`Cache hit for: ${event.request.url}`);
				return response;
			}

			console.log(`Network fetch for: ${event.request.url}`);
			return fetch(event.request)
				.then((networkResponse) => {
					// Dynamically cache only specific assets
					if (
						event.request.destination === 'script' ||
						event.request.destination === 'style' ||
						event.request.destination === 'image'
					) {
						return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
							cache.put(event.request, networkResponse.clone());
							return networkResponse;
						});
					}
					return networkResponse;
				})
				.catch(() => {
					// Handle navigation requests offline fallback
					if (event.request.mode === 'navigate') {
						console.warn(`Offline fallback for navigation request: ${event.request.url}`);
						return caches.match(OFFLINE_URL);
					}
					console.warn(`Fallback to offline for: ${event.request.url}`);
					return caches.match(OFFLINE_URL);
				});
		})
	);

    // Add logs to confirm matching cache entries
    caches.match(event.request).then((response) => {
        if (response) {
            console.log(`Cache hit for: ${event.request.url}`);
        } else {
            console.log(`Cache miss for: ${event.request.url}`);
        }
    });
});

// Activation: Clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
