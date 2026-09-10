# Toko Kasir / POS — Mobile-first WebApp

WebApp kasir mobile-first. Frontend statis (HTML/CSS/JS murni, tanpa framework/build
step) siap di-deploy ke **GitHub Pages**. Backend + database berjalan di
**Google Apps Script + Google Sheets**, dipanggil dari frontend sebagai API JSON.

## Struktur folder

```
.
├── index.html              ← halaman utama (markup saja)
├── css/
│   └── style.css           ← semua styling
├── js/
│   ├── config.js           ← isi URL Web App Apps Script Anda di sini
│   ├── api.js               ← wrapper fetch() ke backend
│   ├── utils.js              ← helper (format rupiah, tanggal, toast, state global)
│   ├── nav.js                 ← bottom navigation, menu ☰, bottom sheet
│   ├── main.js                 ← bootstrap saat halaman dimuat
│   └── pages/
│       ├── auth.js              ← login, logout, ganti password
│       ├── dashboard.js          ← Beranda
│       ├── kasir.js               ← Kasir/POS, keranjang, pembayaran, struk, tahan transaksi
│       ├── produk.js               ← Produk, kategori, stok
│       ├── keuangan.js              ← Pengeluaran & menu keuangan
│       ├── laporan.js                ← Laporan penjualan
│       ├── riwayat.js                 ← Riwayat transaksi
│       └── users.js                    ← User & Kasir, placeholder Pelanggan/Supplier
├── backend/
│   ├── Code.gs               ← backend Apps Script (API JSON + setup Google Sheets)
│   └── DEPLOY.md              ← panduan deploy backend
└── README.md                    ← file ini
```

`js/` dan `css/` sengaja dipisah dari root agar rapi untuk repo GitHub — `index.html`
di root hanya memuat markup dan tag `<script src="...">` / `<link rel="stylesheet">`.

## Cara menjalankan (2 tahap)

### 1. Deploy backend (API + database)
Ikuti **`backend/DEPLOY.md`** — buat Google Sheet, paste `backend/Code.gs` ke Apps
Script, jalankan `setupDatabase()`, lalu Deploy sebagai Web App. Anda akan mendapat
URL seperti:
```
https://script.google.com/macros/s/AKfycb.../exec
```

### 2. Isi konfigurasi frontend
Buka `js/config.js`, ganti:
```js
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycb.../exec'
};
```

### 3. Deploy frontend ke GitHub Pages
1. Push seluruh folder ini (kecuali isi tetap disertakan `backend/` untuk referensi)
   ke repository GitHub.
2. Buka **Settings → Pages** pada repo tersebut.
3. Source: **Deploy from a branch** → pilih branch (misalnya `main`) dan folder **/(root)**.
4. Simpan. GitHub akan memberi URL seperti `https://namauser.github.io/nama-repo/`.
5. Buka URL tersebut dari HP — bisa juga di-"Add to Home Screen" agar terasa seperti
   aplikasi native.

Login pertama kali: **owner** / **owner123** (segera ganti lewat menu ☰ → Ganti Password).

## Cakupan fitur (Prioritas 1 sesuai dokumen spesifikasi)
- Login & role (Owner/Admin/Kasir) dengan pembatasan hak akses
- Produk & Kategori — validasi SKU/barcode unik, harga tidak boleh negatif
- Stok otomatis berkurang saat jual + penyesuaian stok manual (tercatat sebagai stock movement)
- Kasir/POS: cari produk, keranjang, diskon, transaksi ditahan
- Pembayaran: Tunai (auto hitung kembalian, tidak bisa kurang bayar), QRIS, Debit, Transfer, Kredit
- Struk siap cetak (font monospace, cocok printer thermal)
- Riwayat transaksi, Beranda/dashboard, Keuangan (pengeluaran), Laporan ringkas,
  User & Kasir management, Audit log otomatis
- Bottom navigation 5 menu + menu ☰ sesuai spesifikasi

Modul Prioritas 2–3 (Supplier, Pembelian, Hutang/Piutang penuh, Stok Opname, Retur,
Promo, Shift Kasir, Backup otomatis) belum dibuat — kerangka sheet-nya sudah ada di
`backend/Code.gs`, tinggal ditambahkan endpoint + halaman `js/pages/...` baru mengikuti
pola yang sudah ada.

## Catatan penting
- Karena frontend (GitHub Pages) dan backend (Apps Script) berada di domain berbeda,
  semua panggilan API memakai `Content-Type: text/plain` agar terhindar dari
  preflight CORS yang tidak didukung Apps Script — jangan diubah (lihat penjelasan
  di `backend/DEPLOY.md`).
- Password di-hash (SHA-256 + salt per user) di sisi server, tidak plaintext.
- Semua validasi penting (stok, harga, hak akses per role) dilakukan di server
  (`backend/Code.gs`), bukan hanya di frontend — sesuai bagian "25. Validasi" &
  "28. Keamanan" pada dokumen spesifikasi.
- WebApp ini wajib online (tidak ada mode offline) karena bergantung pada Apps
  Script + Google Sheets sebagai backend.
