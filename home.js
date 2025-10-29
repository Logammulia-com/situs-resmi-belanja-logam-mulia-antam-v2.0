// ============================
// KONFIGURASI JSONBIN
// ============================
const BIN_PRODUCTS = "6901673443b1c97be988af5c"; // produk
const BIN_PRICES = "69016b77ae596e708f34751c";  // harga
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

// ============================
// CEK LOGIN
// ============================
function isLoggedIn() {
  return localStorage.getItem("antamaUser") !== null;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("antamaUser"));
}

// ============================
// AMBIL DATA JSONBIN
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

    // klik gambar → modal
    card.querySelector(".clickable").addEventListener("click", () => {
      const modal = document.getElementById("productModal");
      modal.querySelector("img").src = p.image;
      modal.querySelector("h3").textContent = p.name;
      modal.querySelector("#modalPrice").textContent = `Harga: Rp ${p.price.toLocaleString("id-ID")}`;
      modal.style.display = "flex";
    });

    // tambah ke keranjang
    card.querySelector(".add-cart").addEventListener("click", () => {
      if (!isLoggedIn()) {
        alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
        window.location.href = "index.html";
        return;
      }
      addToCart(p);
      if (confirm("Produk ditambahkan ke keranjang. Lihat keranjang sekarang?")) {
        window.location.href = "checkout.html";
      }
    });

    // beli sekarang
    card.querySelector(".buy-now").addEventListener("click", () => {
      if (!isLoggedIn()) {
        alert("Silakan login terlebih dahulu untuk melakukan pembelian.");
        window.location.href = "index.html";
        return;
      }
      addToCart(p, true);
    });

    grid.appendChild(card);
  });
}

// ============================
// KERANJANG
// ============================
function getCart() {
  const user = getCurrentUser();
  const key = `cart_${user.email}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveCart(cart) {
  const user = getCurrentUser();
  const key = `cart_${user.email}`;
  localStorage.setItem(key, JSON.stringify(cart));
}

function addToCart(item, directBuy = false) {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
  if (directBuy) window.location.href = "checkout.html";
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
// HARGA EMAS
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
// PROFIL / AKUN
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const headerAccountIcon = document.getElementById("headerAccountIcon");
  if (headerAccountIcon) {
    headerAccountIcon.style.cursor = "pointer";
    headerAccountIcon.addEventListener("click", () => {
      if (isLoggedIn()) {
        window.location.href = "akun.html";
      } else {
        window.location.href = "index.html";
      }
    });
  }
});

// ============================
// INISIALISASI
// ============================
renderProducts();
renderPrices();
