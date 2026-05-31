const CACHE_NAME = 'territorios-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instala o aplicativo no celular
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa o aplicativo
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

// Gerencia a internet (Regra para o Chrome liberar a instalação)
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
