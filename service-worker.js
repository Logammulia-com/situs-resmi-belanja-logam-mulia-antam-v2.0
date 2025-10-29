// ============================
// SERVICE WORKER UNTUK ANTAMA
// ============================

// Versi cache agar mudah update
const CACHE_NAME = "antama-cache-v1";

// File yang akan disimpan ke cache
const urlsToCache = [
  "home.html",
  "home.css",
  "home.js",
  "akun.html",
  "akun.css",
  "akun.js",
  "icon-512.png",
  "manifest.json"
];

// Saat service worker dipasang (install)
self.addEventListener("install", event => {
  console.log("🟡 Service Worker: Terpasang");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Menyimpan file ke cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Saat fetch data (membuka halaman / file)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika ada di cache, ambil dari cache
      return response || fetch(event.request);
    })
  );
});

// Saat ada versi baru, hapus cache lama
self.addEventListener("activate", event => {
  console.log("🔄 Service Worker: Aktivasi baru");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
