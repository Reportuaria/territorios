const CACHE_NAME = 'territorios-v5'; // Mudei para v4 para aplicar as correções agora
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icone-192.png',
  './icone-512.png'
];

self.addEventListener('install', (e) => {
  // Força o novo Service Worker a se tornar ativo imediatamente
  self.skipWaiting();
  
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => console.log("Aviso: Ícones locais ainda não enviados"));
    })
  );
});

// NOVO: Limpa os caches antigos (v1, v2, v3) automaticamente ao ativar
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Apagando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle das páginas abertas na hora
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('script.google.com')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    }).catch(() => {
      return fetch(e.request);
    })
  );
});
