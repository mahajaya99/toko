/* ============================ NAV / MENU / SHEETS ============================ */
const PAGE_TITLES = {
  beranda: 'Beranda', kasir: 'Kasir', produk: 'Produk', keuangan: 'Keuangan', laporan: 'Laporan',
  pelanggan: 'Pelanggan', supplier: 'Supplier', riwayat: 'Riwayat Transaksi', ditahan: 'Transaksi Ditahan',
  user: 'User & Kasir', 'ganti-password': 'Ganti Password'
};

function openMenu() {
  document.getElementById('menu-overlay').classList.add('show');
  document.getElementById('menu-sheet').classList.add('show');
}
function closeMenu() {
  document.getElementById('menu-overlay').classList.remove('show');
  document.getElementById('menu-sheet').classList.remove('show');
}
function closeFormSheet() {
  document.getElementById('form-overlay').classList.remove('show');
  document.getElementById('form-sheet').classList.remove('show');
}
function openFormSheet(html) {
  document.getElementById('form-sheet-content').innerHTML = html;
  document.getElementById('form-overlay').classList.add('show');
  document.getElementById('form-sheet').classList.add('show');
}

function goPage(page) {
  closeMenu();
  document.getElementById('page-title').innerText = PAGE_TITLES[page] || page;
  document.querySelectorAll('.nav-item').forEach(function (el) {
    el.classList.toggle('active', el.dataset.page === page);
  });
  const renderers = {
    beranda: renderBeranda, kasir: renderKasir, produk: renderProduk, keuangan: renderKeuangan,
    laporan: renderLaporan, riwayat: renderRiwayat, ditahan: renderDitahan, user: renderUserMgmt,
    'ganti-password': renderGantiPassword, pelanggan: renderPelanggan, supplier: renderSupplier
  };
  document.getElementById('content').innerHTML = '<div class="loading-spinner">Memuat...</div>';
  (renderers[page] || function () {
    document.getElementById('content').innerHTML = '<div class="card">Halaman tidak ditemukan</div>';
  })();
}

function showMain() {
  document.getElementById('view-login').classList.add('hidden');
  document.getElementById('view-main').classList.remove('hidden');
  document.getElementById('bottom-nav').classList.remove('hidden');
  document.getElementById('menu-user-name').innerText = STATE.currentUser.name;
  document.getElementById('menu-user-role').innerText = roleLabel(STATE.currentUser.role);
}
