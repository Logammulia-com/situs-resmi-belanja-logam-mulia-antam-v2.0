const BIN_PRICES = "69016b77ae596e708f34751c";
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

async function loadHarga() {
  try {
    const res = await fetch(`${BASE_URL}${BIN_PRICES}/latest`, {
      headers: { "X-Master-Key": API_KEY },
    });
    const data = await res.json();
    const list = document.getElementById("hargaContainer");
    list.innerHTML = "";

    (data.record.harga || []).forEach(h => {
      const div = document.createElement("div");
      div.className = "harga-item";
      div.innerHTML = `
        <span>${h.gram} Gram</span>
        <strong>Rp ${h.price.toLocaleString("id-ID")}</strong>
      `;
      list.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    alert("Gagal memuat harga.");
  }
}

document.addEventListener("DOMContentLoaded", loadHarga);
