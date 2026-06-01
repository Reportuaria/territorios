const CACHE_NAME = 'territorios-v3'; // Mudamos para v3 para forçar o Chrome a esquecer os erros antigos
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icone-192.png',
  './icone-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => console.log("Aviso: Ícones locais ainda não enviados"));
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Ignora requisições do Google Apps Script e foca apenas nos arquivos locais
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
