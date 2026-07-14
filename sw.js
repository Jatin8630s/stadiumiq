const CACHE_NAME = 'stadiumiq-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/global.css',
  '/styles/animations.css',
  '/styles/components.css',
  '/utils/venue-data.js',
  '/utils/websocket-mock.js',
  '/ai/gemini-client.js',
  '/pages/fan/fan-dashboard.html',
  '/pages/fan/fan-nav.js',
  '/pages/fan/fan-assistant.js',
  '/pages/fan/fan-transport.js',
  '/pages/staff/staff-dashboard.html',
  '/pages/staff/crowd-intelligence.js',
  '/pages/staff/accessibility-hub.js',
  '/pages/volunteer/volunteer-dashboard.html',
  '/pages/volunteer/volunteer-assistant.js',
  '/pages/organizer/organizer-hub.html',
  '/pages/organizer/decision-support.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
