// ===================== KONFIGURASI JSONBIN =====================
const BIN_USERS = "6901583b43b1c97be9887dd7"; // user
const BIN_HARGA = "69016b77ae596e708f34751c"; // harga (tidak langsung dipakai)
const BIN_PRODUK = "6901673443b1c97be988af5c"; // produk
const BIN_REKENING = "6901807043b1c97be988e00f"; // rekening pembayaran
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

// ===================== SAAT HALAMAN DIMUAT =====================
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("antamaUser"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!user) {
    alert("⚠️ Silakan login terlebih dahulu.");
    window.location.href = "index.html";
    return;
  }

  const list = document.getElementById("checkoutList");
  const totalEl = document.getElementById("checkoutTotal");
  const savedBox = document.getElementById("savedBox");
  const newBox = document.getElementById("newBox");
  const savedAddress = document.getElementById("savedAddress");

  // ===================== UTILITAS FETCH =====================
  async function fetchBin(id) {
    const res = await fetch(`${BASE_URL}${id}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    return data.record;
  }

  async function updateBin(id, record) {
    await fetch(`${BASE_URL}${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(record)
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
    } catch (e) {
      console.error("Gagal ambil rekening:", e);
      return {};
    }
  }

  // ===================== RENDER KERANJANG =====================
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
        <div class="item-thumb"><img src="${item.image || 'https://via.placeholder.com/150'}" alt=""></div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>Rp ${Number(item.price).toLocaleString("id-ID")}</p>
        </div>
        <div class="item-actions">
          <button class="remove-btn" data-index="${i}">Hapus</button>
        </div>`;
      list.appendChild(el);
      total += Number(item.price) || 0;
    });

    totalEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;
  }
  renderCart();

  // Hapus item dari keranjang
  list.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const idx = e.target.dataset.index;
      cart.splice(idx, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  });

  // ===================== RENDER ALAMAT USER =====================
  async function renderSavedAddresses() {
    const users = await fetchUsers();
    const current = users.find((u) => u.email === user.email);

    if (!current || !current.addresses || current.addresses.length === 0) {
      savedBox.style.display = "none";
      newBox.style.display = "block";
      document.querySelector("input[value='new']").checked = true;
      savedAddress.innerHTML = "<p>Belum ada alamat tersimpan.</p>";
      return;
    }

    savedBox.style.display = "block";
    newBox.style.display = "none";
    document.querySelector("input[value='saved']").checked = true;
    savedAddress.innerHTML = "";

    current.addresses.forEach((addr, i) => {
      const div = document.createElement("div");
      div.className = "alamat-item";
      div.innerHTML = `
        <label>
          <input type="radio" name="savedAddr" value="${i}" ${addr.isDefault ? "checked" : ""}>
          <strong>${addr.label}</strong><br>${addr.alamat}
        </label>`;
      savedAddress.appendChild(div);
    });

    const phone = current.phone || user.phone || "-";
    savedAddress.innerHTML += `<p>📞 ${phone}</p>`;
  }
  await renderSavedAddresses();

  // Ganti mode alamat
  document.querySelectorAll("input[name='addressOpt']").forEach((opt) => {
    opt.addEventListener("change", (e) => {
      if (e.target.value === "new") {
        savedBox.style.display = "none";
        newBox.style.display = "block";
      } else {
        savedBox.style.display = "block";
        newBox.style.display = "none";
      }
    });
  });

  // ===================== STEP 1 → STEP 2 =====================
  const step1 = document.getElementById("checkoutStep1");
  const step2 = document.getElementById("checkoutStep2");
  const paymentInfo = document.getElementById("paymentInfo");
  const finalTotal = document.getElementById("finalTotal");

  document.getElementById("nextToPayment").addEventListener("click", async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    const addrOpt = document.querySelector("input[name='addressOpt']:checked").value;
    const payMethod = document.querySelector("input[name='payment']:checked").value;

    // Validasi alamat baru
    if (addrOpt === "new") {
      const name = document.getElementById("checkoutName").value.trim();
      const email = document.getElementById("checkoutEmail").value.trim();
      const phone = document.getElementById("checkoutPhone").value.trim();
      const alamat = document.getElementById("checkoutAlamat").value.trim();
      if (!name || !email || !phone || !alamat) {
        alert("Lengkapi semua data alamat terlebih dahulu!");
        return;
      }
    }

    const total = cart.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    finalTotal.textContent = `Rp ${total.toLocaleString("id-ID")}`;

    const rekening = await fetchRekening();

    if (payMethod === "transfer") {
      paymentInfo.innerHTML = `
        <p>Silakan transfer ke rekening berikut:</p>
        <p><strong>${rekening.bank || "Bank"}</strong><br>
        No. Rekening: <strong>${rekening.nomor || "-"}</strong><br>
        a/n ${rekening.nama || "-"}<br>
        <small>${rekening.catatan || ""}</small></p>`;
    } else {
      paymentInfo.innerHTML = `
        <p>Pembayaran via E-Wallet:</p>
        <p><strong>DANA / OVO / GoPay</strong><br>
        No. 0812-1234-5678 a/n PT ANTAMA</p>`;
    }

    step1.style.display = "none";
    step2.style.display = "grid";
  });

  // ===================== KONFIRMASI PEMBAYARAN =====================
  document.getElementById("confirmPayment").addEventListener("click", async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    const addrOpt = document.querySelector("input[name='addressOpt']:checked").value;
    const payment = document.querySelector("input[name='payment']:checked").value;
    const note = document.getElementById("orderNote").value.trim();
    const total = cart.reduce((s, i) => s + (Number(i.price) || 0), 0);

    let shipping = {};
    const users = await fetchUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    let currentUser = users[idx];

    if (addrOpt === "saved") {
      const selected = document.querySelector("input[name='savedAddr']:checked");
      if (!selected) return alert("Pilih salah satu alamat tersimpan.");
      const addr = currentUser.addresses[selected.value];
      shipping = {
        name: user.name,
        email: user.email,
        phone: currentUser.phone || user.phone || "-",
        alamat: addr.alamat
      };
    } else {
      shipping = {
        name: document.getElementById("checkoutName").value.trim(),
        email: document.getElementById("checkoutEmail").value.trim(),
        phone: document.getElementById("checkoutPhone").value.trim(),
        alamat: document.getElementById("checkoutAlamat").value.trim()
      };

      // Tambahkan alamat baru
      currentUser.addresses = currentUser.addresses || [];
      currentUser.addresses.push({
        label: "Alamat Baru",
        alamat: shipping.alamat,
        isDefault: false
      });
    }

    const order = {
      id: "ORD-" + Date.now(),
      date: new Date().toLocaleString("id-ID"),
      items: cart.map((i) => ({
        name: i.name,
        price: Number(i.price),
        image: i.image || ""
      })),
      total,
      payment,
      note,
      shipping,
      status: "Menunggu Konfirmasi"
    };

    currentUser.orders = currentUser.orders || [];
    currentUser.orders.push(order);
    users[idx] = currentUser;

    try {
      await updateUsers(users);
      localStorage.removeItem("cart");
      alert("✅ Pesanan berhasil dikirim! Admin akan memverifikasi pembayaran.");
      window.location.href = "akun.html";
    } catch (e) {
      console.error(e);
      alert("❌ Gagal menyimpan pesanan, coba lagi nanti.");
    }
  });
});
