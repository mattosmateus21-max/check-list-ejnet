const CACHE_NAME = 'checklist-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/imagens/crosser.webp',
  '/imagens/factor.webp',
  '/imagens/equipamentos.webp',
  '/imagens/logo192.png',
  '/imagens/logo512.png'
];

// Instala o SW e armazena os assets em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache criado e assets armazenados');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativa o SW e limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache antigo removido:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições: tenta rede, se falhar usa cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se conectado, atualiza o cache com resposta nova
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se desconectado, usa o cache
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || new Response('Offline: recurso não encontrado em cache', {
            status: 503,
            statusText: 'Offline'
          });
        });
      })
  );
});