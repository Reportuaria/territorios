const CACHE_NAME = 'territorios-v4';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Instalação do Service Worker e cache inicial dos arquivos locais
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições com correção para o CORS do Google
self.addEventListener('fetch', function(e) {
  const url = new URL(e.request.url);

  // CORREÇÃO: Ignora as URLs do Google Apps Script para não quebrar o redirecionamento do CORS
  if (url.hostname === '://google.com' || url.hostname === '://googleusercontent.com') {
    return; // Deixa o navegador fazer o fetch padrão diretamente pela rede
  }

  // Estratégia de rede primeiro para os seus arquivos locais (HTML, JSON, etc.)
  e.respondWith(
    fetch(e.request).catch(function() {
      // Se estiver offline ou a rede falhar, busca do cache
      return caches.match(e.request);
    })
  );
});
