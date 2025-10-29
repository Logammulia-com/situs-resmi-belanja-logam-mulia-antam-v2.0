// === KONFIGURASI JSONBIN ===
const BIN_USERS = "6901583b43b1c97be9887dd7"; // user & pesanan
const BIN_REKENING = "6901807043b1c97be988e00f"; // 🏦 rekening admin (ganti sesuai ID kamu)
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("antamaUser"));
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!user) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "index.html";
    return;
  }

  const list = document.getElementById("checkoutList");
  const totalEl = document.getElementById("checkoutTotal");
  const savedAddress = document.getElementById("savedAddress");

  // === FUNGSI BANTUAN JSONBIN ===
  async function fetchBin(id) {
    const res = await fetch(`${BASE_URL}${id}/latest`, {
      headers: { "X-Master-Key": API_KEY },
    });
    const data = await res.json();
    return data.record;
  }

  async function updateBin(id, record) {
    await fetch(`${BASE_URL}${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify(record),
    });
  }

  async function fetchUsers() {
    const data = await fetchBin(BIN_USERS);
    return data.users || [];
  }

  async function updateUsers(users) {
    await updateBin(BIN_USERS, { users });
  }

  async function fetchRekening() {
    try {
      const data = await fetchBin(BIN_REKENING);
      return data.rekening || {};
    } catch {
      return {};
    }
  }

  // === RENDER KERANJANG ===
  function renderCart() {
    list.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
      list.innerHTML = "<p>Keranjang kosong.</p>";
      totalEl.textContent = "Rp 0";
      return;
    }
    cart.forEach((item, i) => {
      const el = document.createElement("div");
      el.className = "checkout-item";
      el.innerHTML = `
        <div class="item-thumb"><img src="${item.image || 'https://via.placeholder.com/150'}"></div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>Rp ${item.price.toLocaleString("id-ID")}</p>
        </div>
        <div class="item-actions">
          <button class="remove-btn" data-index="${i}">Hapus</button>
        </div>`;
      list.appendChild(el);
      total += item.price;
    });
    totalEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;
  }

  renderCart();

  // === HAPUS ITEM KERANJANG ===
  list.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      const i = e.target.dataset.index;
      cart.splice(i, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  });

  // === ALAMAT TERSIMPAN ===
  async function renderSavedAddresses() {
    const users = await fetchUsers();
    const current = users.find(u => u.email === user.email);
    const savedBox = document.getElementById("savedBox");
    const newBox = document.getElementById("newBox");

    if (!current || !current.addresses || current.addresses.length === 0) {
      document.querySelector("input[value='new']").checked = true;
      savedBox.style.display = "none";
      newBox.style.display = "block";
      savedAddress.innerHTML = "<p>Belum ada alamat tersimpan.</p>";
      return;
    }

    savedAddress.innerHTML = "";
    current.addresses.forEach((addr, i) => {
      const div = document.createElement("div");
      div.className = "alamat-item";
      div.innerHTML = `
        <label>
          <input type="radio" name="savedAddr" value="${i}" ${addr.isDefault ? "checked" : ""}>
          <strong>${addr.label}</strong><br>
          ${addr.alamat}
        </label>
      `;
      savedAddress.appendChild(div);
    });

    const phone = current.phone || user.phone || "-";
    const phoneEl = document.createElement("p");
    phoneEl.innerHTML = `📞 ${phone}`;
    savedAddress.appendChild(phoneEl);
  }

  await renderSavedAddresses();

  // === TOGGLE ALAMAT BARU VS TERSIMPAN ===
  const savedBox = document.getElementById("savedBox");
  const newBox = document.getElementById("newBox");
  document.querySelectorAll("input[name='addressOpt']").forEach(r => {
    r.addEventListener("change", e => {
      savedBox.style.display = e.target.value === "saved" ? "block" : "none";
      newBox.style.display = e.target.value === "saved" ? "none" : "block";
    });
  });

  // === STEP 1 -> STEP 2 ===
  const step1 = document.getElementById("checkoutStep1");
  const step2 = document.getElementById("checkoutStep2");
  const paymentInfo = document.getElementById("paymentInfo");
  const finalTotal = document.getElementById("finalTotal");

  document.getElementById("nextToPayment").addEventListener("click", async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    const addrOpt = document.querySelector("input[name='addressOpt']:checked").value;
    let valid = true;

    if (addrOpt === "new") {
      const name = document.getElementById("checkoutName").value.trim();
      const email = document.getElementById("checkoutEmail").value.trim();
      const phone = document.getElementById("checkoutPhone").value.trim();
      const alamat = document.getElementById("checkoutAlamat").value.trim();
      if (!name || !email || !phone || !alamat) valid = false;
    }

    if (!valid) return alert("Lengkapi data alamat terlebih dahulu.");

    const payMethod = document.querySelector("input[name='payment']:checked").value;
    const total = cart.reduce((s, i) => s + i.price, 0);
    finalTotal.textContent = `Rp ${total.toLocaleString("id-ID")}`;

    const rekening = await fetchRekening();

    if (payMethod === "transfer") {
      paymentInfo.innerHTML = `
        <p>Silakan transfer ke rekening berikut:</p>
        <p><strong>${rekening.bank || "-"}</strong><br>
        No. Rekening: <strong>${rekening.nomor || "-"}</strong><br>
        a/n ${rekening.nama || "-"}<br>
        <small>${rekening.catatan || ""}</small></p>`;
    } else {
      paymentInfo.innerHTML = `
        <p>Pembayaran via E-Wallet:</p>
        <p><strong>DANA / OVO / GoPay</strong><br>No. 0812-1234-5678 a/n PT ANTAMA</p>`;
    }

    step1.style.display = "none";
    step2.style.display = "grid";
  });

  // === SIMPAN PESANAN ===
  document.getElementById("confirmPayment").addEventListener("click", async () => {
    const addrOpt = document.querySelector("input[name='addressOpt']:checked").value;
    const payment = document.querySelector("input[name='payment']:checked").value;
    const note = document.getElementById("orderNote").value.trim();
    const total = cart.reduce((s, i) => s + i.price, 0);

    let shipping = {};

    if (addrOpt === "saved") {
      const selected = document.querySelector("input[name='savedAddr']:checked");
      if (!selected) return alert("Pilih salah satu alamat tersimpan.");
      const idx = parseInt(selected.value);
      const users = await fetchUsers();
      const current = users.find(u => u.email === user.email);
      const addr = current.addresses[idx];
      shipping = {
        name: user.name,
        email: user.email,
        phone: current.phone || user.phone,
        alamat: addr ? addr.alamat : ""
      };
    } else {
      shipping = {
        name: document.getElementById("checkoutName").value.trim(),
        email: document.getElementById("checkoutEmail").value.trim(),
        phone: document.getElementById("checkoutPhone").value.trim(),
        alamat: document.getElementById("checkoutAlamat").value.trim()
      };
    }

    const order = {
      id: "ORD-" + Date.now(),
      date: new Date().toLocaleString("id-ID"),
      items: cart.map(i => ({ name: i.name, price: i.price })),
      total,
      payment,
      note,
      shipping,
      status: "Menunggu Konfirmasi"
    };

    try {
      const users = await fetchUsers();
      let idx = users.findIndex(u => u.email === user.email);
      if (idx === -1) {
        users.push({
          name: user.name,
          email: user.email,
          password: "",
          phone: shipping.phone,
          addresses: [{ label: "Alamat Utama", alamat: shipping.alamat, isDefault: true }],
          orders: []
        });
        idx = users.length - 1;
      }

      users[idx].orders = users[idx].orders || [];
      users[idx].orders.push(order);

      if (addrOpt === "new") {
        if (!users[idx].addresses) users[idx].addresses = [];
        users[idx].addresses.push({ label: "Alamat Baru", alamat: shipping.alamat, isDefault: false });
      }

      await updateUsers(users);
      localStorage.removeItem("cart");

      alert("Pesanan berhasil dikirim.\nAdmin akan memverifikasi pembayaran kamu secara manual.");
      window.location.href = "home.html";
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan, coba lagi nanti.");
    }
  });
});
