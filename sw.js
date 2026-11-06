/* GI — يحفظ غلاف التطبيق على الموبايل عشان يفتح بسرعة. البيانات نفسها دايمًا من Google (أونلاين). */
var V = 'gi-shell-1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  // الغلاف: من النت لو متاح (عشان أي تحديث يوصل)، ولو مفيش نت من النسخة المحفوظة
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(V).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () {
    return caches.match(e.request, {ignoreSearch: true}).then(function (r) { return r || caches.match('./index.html'); });
  }));
});
