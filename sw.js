/* POCKET ROM LIBRARY — オフライン用（アプリ本体・エミュレーター・フォントを端末に保存） */
const V = 'prl-v2';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('google.com') || u.hostname.endsWith('googleusercontent.com')) return; // APIは毎回ネットへ
  const cdn = /jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if (cdn) { // 変わらないもの：保存版を優先
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; })));
    return;
  }
  if (u.origin === location.origin) { // アプリ本体：ネット優先、だめなら保存版
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(h => h || caches.match('index.html'))));
  }
});
