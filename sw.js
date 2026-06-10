const CACHE_NAME = 'territorios-v2'; // 
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icone-192.png',
  './icone-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => console.log("Aviso: Ícones locais ainda não enviados"));
    })
  );
});

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
    }).then(() => self.clients.claim())
  );
});

// ==========================================================================
// EVENTO FETCH CORRIGIDO E BLINDADO CONTRA LOOP
// ==========================================================================
self.addEventListener('fetch', (e) => {
  // CORREÇÃO CORS: Só intercepta arquivos do seu próprio site no GitHub Pages
  if (!e.request.url.startsWith(self.location.origin)) {
    return; // Deixa o navegador lidar normalmente com requisições externas (Google, Google Scripts, etc)
  }
  
  e.respondWith(
    caches.match(e.request).then((response) => {
      // CORREÇÃO MULTI-USE: Se o arquivo estiver no cache, devolve. Se não, clona o pedido para a rede
      return response || fetch(e.request.clone());
    }).catch(() => {
      return fetch(e.request.clone());
    })
  );
});
