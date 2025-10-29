const BIN_USERS = "6901583b43b1c97be9887dd7";
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

document.addEventListener("DOMContentLoaded", async () => {
  const userData = JSON.parse(localStorage.getItem("antamaUser"));
  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  // ============================
  // FETCH & SAVE FUNCTIONS
  // ============================
  async function fetchUsers() {
    const res = await fetch(`${BASE_URL}${BIN_USERS}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    return data.record.users || [];
  }

  async function saveUsers(users) {
    await fetch(`${BASE_URL}${BIN_USERS}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify({ users })
    });
  }

  // ============================
  // RENDER PROFIL
  // ============================
  async function renderUserProfile() {
    const users = await fetchUsers();
    const user = users.find(u => u.email === userData.email);
    if (!user) return;

    console.log("👤 Data user aktif:", user);

    document.getElementById("nameInput").value = user.name;
    document.getElementById("emailInput").value = user.email;
    document.getElementById("phoneInput").value = user.phone || "";

    renderAlamat(user.addresses || []);
    renderOrders(user.orders || []);
  }

  // ============================
  // SIMPAN PROFIL
  // ============================
  document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const phone = document.getElementById("phoneInput").value.trim();
    const users = await fetchUsers();
    const index = users.findIndex(u => u.email === userData.email);
    if (index === -1) return alert("User tidak ditemukan.");

    users[index].phone = phone;
    await saveUsers(users);
    localStorage.setItem("antamaUser", JSON.stringify(users[index]));
    alert("✅ Profil berhasil diperbarui!");
  });

  // ============================
  // RENDER ALAMAT
  // ============================
  function renderAlamat(addresses) {
    const list = document.getElementById("alamatList");
    list.innerHTML = "";

    if (!addresses || addresses.length === 0) {
      list.innerHTML = "<p>Belum ada alamat tersimpan.</p>";
      return;
    }

    addresses.forEach((a, i) => {
      const div = document.createElement("div");
      div.className = "alamat-item";
      div.innerHTML = `
        <strong>${a.label}</strong> ${a.isDefault ? "<span style='color:#c1a14a;'>(Utama)</span>" : ""}
        <p>${a.alamat}</p>
        <div class="alamat-action">
          <button onclick="setDefaultAlamat(${i})">Jadikan Utama</button>
          <button onclick="hapusAlamat(${i})" style="background:#c14343;">Hapus</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  // ============================
  // TAMBAH ALAMAT
  // ============================
  document.getElementById("addAlamatBtn").addEventListener("click", () => {
    document.getElementById("alamatForm").style.display = "block";
  });

  document.getElementById("saveAlamatBtn").addEventListener("click", async () => {
    const label = document.getElementById("labelInput").value.trim();
    const nama = document.getElementById("namaPenerimaInput").value.trim();
    const telepon = document.getElementById("teleponPenerimaInput").value.trim();
    const alamat = document.getElementById("alamatInput").value.trim();
    const kota = document.getElementById("kotaInput").value.trim();
    const provinsi = document.getElementById("provinsiInput").value.trim();
    const kodepos = document.getElementById("kodeposInput").value.trim();
    const isDefault = document.getElementById("defaultAlamat").checked;

    if (!label || !alamat) {
      alert("⚠️ Label dan Alamat wajib diisi!");
      return;
    }

    const alamatLengkap = `${nama ? nama + " - " : ""}${telepon ? telepon + " | " : ""}${alamat}${kota ? ", " + kota : ""}${provinsi ? ", " + provinsi : ""}${kodepos ? " " + kodepos : ""}`;

    const users = await fetchUsers();
    const i = users.findIndex(u => u.email === userData.email);
    if (i === -1) return alert("User tidak ditemukan.");

    if (!users[i].addresses) users[i].addresses = [];
    if (isDefault) users[i].addresses.forEach(a => a.isDefault = false);

    users[i].addresses.push({
      label,
      alamat: alamatLengkap,
      isDefault
    });

    await saveUsers(users);
    alert("✅ Alamat baru berhasil disimpan!");
    renderAlamat(users[i].addresses);
    document.getElementById("alamatForm").style.display = "none";
  });

  // ============================
  // SET DEFAULT & HAPUS ALAMAT
  // ============================
  window.setDefaultAlamat = async function (index) {
    const users = await fetchUsers();
    const i = users.findIndex(u => u.email === userData.email);
    users[i].addresses.forEach(a => a.isDefault = false);
    users[i].addresses[index].isDefault = true;
    await saveUsers(users);
    renderAlamat(users[i].addresses);
  };

  window.hapusAlamat = async function (index) {
    const users = await fetchUsers();
    const i = users.findIndex(u => u.email === userData.email);
    users[i].addresses.splice(index, 1);
    await saveUsers(users);
    renderAlamat(users[i].addresses);
  };

  // ============================
  // RENDER PESANAN
  // ============================
  function renderOrders(orders) {
    const list = document.getElementById("orderList");
    list.innerHTML = "";
    if (!orders || orders.length === 0) {
      list.innerHTML = "<p>Belum ada pesanan.</p>";
      return;
    }

    orders.forEach(o => {
      const div = document.createElement("div");
      div.className = "order-item";
      div.innerHTML = `
        <h4>${o.id}</h4>
        <p>Tanggal: ${o.date}</p>
        <p>Status: <strong>${o.status}</strong></p>
        <p>Total: Rp ${o.total.toLocaleString("id-ID")}</p>
      `;
      list.appendChild(div);
    });
  }

  // ============================
  // LOGOUT
  // ============================
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("antamaUser");
    window.location.href = "index.html";
  });

  // Jalankan render setelah semua siap
  await renderUserProfile();
});
