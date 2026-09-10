/* ============================ USER & KASIR ============================ */
function renderUserMgmt() {
  if (STATE.currentUser.role !== 'owner') {
    document.getElementById('content').innerHTML = '<div class="card muted">Hanya Owner yang dapat mengelola user.</div>';
    return;
  }
  API.call('listUsers', {}).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    const list = res.data;
    document.getElementById('content').innerHTML =
      '<button class="btn btn-primary" style="margin-bottom:12px;" onclick="openUserForm()">+ Tambah User</button>' +
      list.map(function (u) {
        return '<div class="card"><div class="list-item"><div><b>' + u.name + '</b><div class="muted">' + u.username + ' • ' + roleLabel(u.role) + '</div></div>' +
          '<button class="btn btn-sm ' + (u.active ? 'btn-red' : 'btn-outline') + '" onclick="toggleUserActive(\'' + u.id + '\',' + !u.active + ')">' + (u.active ? 'Nonaktifkan' : 'Aktifkan') + '</button></div></div>';
      }).join('');
  }).catch(showErr);
}
function openUserForm() {
  openFormSheet(
    '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">Tambah User</div>' +
    '<label>Nama</label><input id="uf-name">' +
    '<label>Username</label><input id="uf-username">' +
    '<label>Password</label><input type="password" id="uf-password">' +
    '<label>Role</label><select id="uf-role"><option value="kasir">Kasir</option><option value="admin">Admin</option><option value="owner">Owner</option></select>' +
    '<button class="btn btn-primary" onclick="submitUser()">Simpan</button>'
  );
}
function submitUser() {
  const data = {
    name: document.getElementById('uf-name').value.trim(),
    username: document.getElementById('uf-username').value.trim(),
    password: document.getElementById('uf-password').value,
    role: document.getElementById('uf-role').value
  };
  if (!data.name || !data.username || !data.password) { toast('Lengkapi semua field'); return; }
  API.call('addUser', { actorRole: STATE.currentUser.role, data: data }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    toast('User ditambahkan'); closeFormSheet(); renderUserMgmt();
  }).catch(showErr);
}
function toggleUserActive(id, active) {
  API.call('setUserActive', { actorRole: STATE.currentUser.role, userId: id, active: active }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    renderUserMgmt();
  }).catch(showErr);
}

/* ============================ PELANGGAN / SUPPLIER (placeholder Prioritas 2) ============================ */
function renderPelanggan() {
  document.getElementById('content').innerHTML = '<div class="card muted">Modul Pelanggan (riwayat belanja, piutang) termasuk Prioritas 2 — akan ditambahkan pada tahap pengembangan berikutnya.</div>';
}
function renderSupplier() {
  document.getElementById('content').innerHTML = '<div class="card muted">Modul Supplier (hutang, riwayat pembelian) termasuk Prioritas 2 — akan ditambahkan pada tahap pengembangan berikutnya.</div>';
}
