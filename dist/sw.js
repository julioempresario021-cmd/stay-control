const CACHE = 'staycontrol-quiz-v10';
const APP = [
  './', './index.html', './style.css', './theme.css', './model.js', './app.js',
  './docs/residencia/index.html', './docs/residencia/essencial.html', './docs/residencia/premium.html',
  './docs/hotel/index.html', './docs/hotel/essencial.html', './docs/hotel/premium.html',
  './favicon.svg', './manifest.webmanifest', './assets/staycontrol-logo.jpg',
  './celular.html','./celular.css','./celular.js','./celular.webmanifest','./assets/mobile-icon-192.png','./assets/mobile-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});

self.addEventListener('push',event=>{let data={title:'STAYCONTROL',body:'Nova notificação da sua casa.'};try{data=event.data.json();}catch{}event.waitUntil(self.registration.showNotification(data.title||'STAYCONTROL',{body:data.body||'Nova notificação',tag:data.id||'staycontrol',icon:'./assets/mobile-icon-192.png',data:{url:'./celular.html'}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.openWindow(new URL('./celular.html',self.location.origin).href));});



