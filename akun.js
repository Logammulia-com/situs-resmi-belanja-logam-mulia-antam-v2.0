// ============================
// 🔱 AKUN.JS - SISTEM LOGIN ANTAMA (FINAL)
// ============================

// KONFIGURASI JSONBIN
const BIN_USERS = "6901583b43b1c97be9887dd7";
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

// ============================
// UTILITAS LOGIN
// ============================
function isLoggedIn() {
  return localStorage.getItem("antamaUser") !== null;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("antamaUser"));
}

// ============================
// AMBIL DATA USER DARI JSONBIN
// ============================
async function fetchUsers() {
  const res = await fetch(`${BASE_URL}${BIN_USERS}/latest`, {
    headers: { "X-Master-Key": API_KEY },
  });
  const data = await res.json();
  return data.record.users || [];
}

async function updateUsers(users) {
  await fetch(`${BASE_URL}${BIN_USERS}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify({ users }),
  });
}

// ============================
// LOGIN
// ============================
async function login(email, password) {
  const users = await fetchUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!found) {
    alert("Email atau password salah.");
    return false;
  }

  localStorage.setItem("antamaUser", JSON.stringify(found));
  alert("Login berhasil!");

  // Jika user datang dari aksi transaksi, lanjutkan
  const redirect = localStorage.getItem("redirectAfterLogin");
  if (redirect === "checkout") {
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = "checkout.html";
  } else if (redirect === "add_to_cart") {
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = "home.html";
  } else {
    window.location.href = "home.html";
  }

  return true;
}

// ============================
// DAFTAR USER BARU
// ============================
async function register(name, email, password) {
  const users = await fetchUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    alert("Email sudah terdaftar!");
    return false;
  }

  const newUser = { name, email, password };
  users.push(newUser);
  await updateUsers(users);

  localStorage.setItem("antamaUser", JSON.stringify(newUser));
  alert("Pendaftaran berhasil!");

  window.location.href = "home.html";
  return true;
}

// ============================
// PROFIL
// ============================
function loadProfile() {
  const user = getCurrentUser();
  if (!user) {
    console.log("Mode pengunjung: belum login, profil kosong.");
    document.querySelector(".akun-box").innerHTML = `
      <p>Anda belum login.</p>
      <button class="btn" id="goLogin">Login Sekarang</button>
    `;
    document.getElementById("goLogin").addEventListener("click", () => {
      window.location.href = "index.html";
    });
    return;
  }

  document.getElementById("userName").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("phoneInput").value = user.phone || "";
  document.getElementById("alamatInput").value = user.alamat || "";
}

// ============================
// SIMPAN PROFIL
// ============================
document.getElementById("saveProfileBtn")?.addEventListener("click", async () => {
  const user = getCurrentUser();
  if (!user) {
    alert("Silakan login terlebih dahulu untuk menyimpan profil.");
    window.location.href = "index.html";
    return;
  }

  const alamat = document.getElementById("alamatInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();

  const updated = { ...user, alamat, phone };
  localStorage.setItem("antamaUser", JSON.stringify(updated));
  alert("Profil berhasil disimpan!");
});

// ============================
// LOGOUT
// ============================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("antamaUser");
  alert("Anda telah logout.");
  window.location.href = "index.html";
});

// ============================
// SAAT HALAMAN SELESAI DIMUAT
// ============================
document.addEventListener("DOMContentLoaded", loadProfile);
