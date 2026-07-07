// Altere o número da versão (ex: v1 para v1) sempre que fizer uma atualização grande no site!
const CACHE_NAME = 'territorios-cache-v2'; 
const URLS_TO_CACHE = [
  './',
  './index.html', // ou o nome do seu arquivo principal
  './manifest.json'
];

// Instalação: Salva os arquivos essenciais, mas força a nova versão a assumir o controle
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting(); // Força o novo Service Worker a ativar na hora
    })
  );
});

// Ativação: Deleta TODOS os caches antigos automaticamente (Resolve o problema do travamento)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Assume o controle da página imediatamente
    })
  );
});

// Busca de arquivos (Fetch): Tenta buscar da internet primeiro, se falhar/tiver offline usa o cache
self.addEventListener('fetch', event => {
  // CORREÇÃO AQUI: Ignora a API do Google Sheets e requisições POST para não quebrar o envio de dados
  if (event.request.url.includes('script.google.com') || event.request.method === 'POST') {
    return; // Deixa a requisição passar direto para a internet sem interferência do cache
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta for válida, guarda uma cópia atualizada no cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se o usuário estiver sem internet, entrega o que está salvo no cache
        return caches.match(event.request);
      })
  );
});

