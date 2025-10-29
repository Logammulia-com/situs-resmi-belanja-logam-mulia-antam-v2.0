// ============================
// KONFIGURASI JSONBIN
// ============================
const BIN_PRODUCTS = "6901673443b1c97be988af5c"; // produk
const BIN_PRICES = "69016b77ae596e708f34751c"; // harga
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

// ============================
// CEK LOGIN (boleh tanpa login)
// ============================
function isLoggedIn() {
  return localStorage.getItem("antamaUser") !== null;
}

// ============================
// ELEMEN UTAMA
// ============================
const tabButtons = document.querySelectorAll(".nav-btn[data-target]");
const sections = document.querySelectorAll("main section");

// ============================
// NAVIGASI ANTAR TAB
// ============================
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

// ============================
// LINK KE HALAMAN LAIN
// ============================
// Tombol harga di bawah
document.getElementById("hargaBtn").addEventListener("click", () => {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("hargaSection").classList.add("active");
});

// Tombol akun di navigasi bawah
document.getElementById("akunBtn").addEventListener("click", () => {
  if (isLoggedIn()) {
    // kalau sudah login, buka halaman akun
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("akunSection").classList.add("active");
  } else {
    // kalau belum login, ke index.html
    alert("Silakan login terlebih dahulu untuk mengakses akun Anda.");
    window.location.href = "index.html";
  }
});

// ============================
// AMBIL DATA DARI JSONBIN
// ============================
async function fetchBin(id) {
  const res = await fetch(`${BASE_URL}${id}/latest`, {
    headers: { "X-Master-Key": API_KEY },
  });
  const data = await res.json();
  return data.record;
}

// ============================
// PRODUK & PENCARIAN
// ============================
let allProducts = [];

async function renderProducts(keyword = "") {
  const data = await fetchBin(BIN_PRODUCTS);
  allProducts = data.products || [];
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  if (filtered.length === 0) {
    grid.innerHTML = "<p>Tidak ada produk ditemukan.</p>";
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="clickable">
      <h3>${p.name}</h3>
      <p class="price">Rp ${p.price.toLocaleString("id-ID")}</p>
      <div class="product-actions">
        <button class="btn add-cart">+ Keranjang</button>
        <button class="btn buy-now">Beli Sekarang</button>
      </div>
    `;

    // Klik gambar → buka modal detail
    card.querySelector(".clickable").addEventListener("click", () => {
      const modal = document.getElementById("productModal");
      modal.querySelector("img").src = p.image;
      modal.querySelector("h3").textContent = p.name;
      modal.querySelector("#modalPrice").textContent = `Harga: Rp ${p.price.toLocaleString("id-ID")}`;
      modal.style.display = "flex";
    });

    // Tambah ke keranjang → wajib login
    card.querySelector(".add-cart").addEventListener("click", () => {
      if (!isLoggedIn()) {
        alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
        window.location.href = "index.html";
        return;
      }
      addToCart(p);
    });

    // Beli sekarang → wajib login
    card.querySelector(".buy-now").addEventListener("click", () => {
      if (!isLoggedIn()) {
        alert("Silakan login terlebih dahulu untuk melakukan pembelian.");
        window.location.href = "index.html";
        return;
      }
      localStorage.setItem("cart", JSON.stringify([p]));
      window.location.href = "checkout.html";
    });

    grid.appendChild(card);
  });
}

// ============================
// MODAL PRODUK
// ============================
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("productModal").style.display = "none";
});
document.getElementById("productModal").addEventListener("click", e => {
  if (e.target.id === "productModal") e.target.style.display = "none";
});

// ============================
// SEARCH BOX
// ============================
document.getElementById("searchInput").addEventListener("input", e => {
  renderProducts(e.target.value);
});
document.getElementById("searchIcon").addEventListener("click", () => {
  document.getElementById("searchInput").focus();
});

// ============================
// RENDER HARGA
// ============================
async function renderPrices() {
  const data = await fetchBin(BIN_PRICES);
  const list = document.getElementById("hargaList");
  if (!list) return;
  list.innerHTML = "";
  (data.harga || []).forEach(h => {
    const div = document.createElement("div");
    div.className = "harga-item";
    div.innerHTML = `<span>${h.gram} Gram</span><strong>Rp ${h.price.toLocaleString("id-ID")}</strong>`;
    list.appendChild(div);
  });
}

// ============================
// KERANJANG BELANJA
// ============================
function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${item.name} ditambahkan ke keranjang`);
  renderCart();
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const list = document.getElementById("cartContainer");
  list.innerHTML = "";
  if (cart.length === 0) {
    list.innerHTML = "<p>Keranjang kosong.</p>";
    return;
  }
  cart.forEach(i => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${i.name}</span>
      <strong>Rp ${i.price.toLocaleString("id-ID")}</strong>
    `;
    list.appendChild(div);
  });
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!isLoggedIn()) {
    alert("Silakan login terlebih dahulu untuk melanjutkan ke checkout.");
    window.location.href = "index.html";
    return;
  }
  window.location.href = "checkout.html";
});

// ============================
// INISIALISASI
// ============================
renderProducts();
renderPrices();
renderCart();

// ============================
// REGISTRASI SERVICE WORKER
// ============================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("✅ Service Worker terdaftar"))
    .catch(err => console.log("❌ Gagal daftar Service Worker:", err));
}

// ============================
// KLIK IKON PROFIL DI HEADER
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const headerAccountIcon = document.getElementById("headerAccountIcon");
  if (headerAccountIcon) {
    headerAccountIcon.style.cursor = "pointer";
    headerAccountIcon.addEventListener("click", () => {
      if (!isLoggedIn()) {
        alert("Silakan login terlebih dahulu untuk melakukan transaksi.");
        window.location.href = "index.html";
      } else {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        document.getElementById("akunSection").classList.add("active");
      }
    });
  }
});
