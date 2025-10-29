// ============================
// 🔱 SERVICE WORKER ANTAMA (v3)
// ============================

// Versi cache — ubah setiap kali kamu update file agar browser ambil versi baru
const CACHE_NAME = "antama-cache-v3";

// File penting yang akan disimpan ke cache
const urlsToCache = [
  "home.html",
  "home.css",
  "home.js",
  "akun.html",
  "akun.css",
  "akun.js",
  "admin.html",
  "admin.css",
  "admin.js",
  "icon-512.png",
  "favicon.ico",
  "manifest.json"
];

// Saat service worker di-install pertama kali
self.addEventListener("install", event => {
  console.log("🟡 [ANTAMA] Service Worker terpasang");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Menyimpan file ke cache:", urlsToCache);
      return cache.addAll(urlsToCache);
    })
  );
});

// Saat fetch data — gunakan strategi "Network First, Cache Fallback"
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan salinan terbaru ke cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // Jika offline → ambil dari cache
  );
});

// Saat aktivasi service worker baru
self.addEventListener("activate", event => {
  console.log("🔄 [ANTAMA] Aktivasi service worker baru — membersihkan cache lama...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log("🧹 Menghapus cache lama:", name);
            return caches.delete(name);
          })
      );
    })
  );
});

// Opsional: tangani update manual untuk favicon & manifest
self.addEventListener("message", event => {
  if (event.data === "updateFavicon") {
    caches.open(CACHE_NAME).then(cache => {
      cache.delete("icon-512.png");
      cache.delete("favicon.ico");
      cache.addAll(["icon-512.png", "favicon.ico"]);
      console.log("🪄 Favicon diperbarui di cache");
    });
  }
});
