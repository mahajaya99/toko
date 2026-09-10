/* ============================ AUTH ============================ */
function togglePw() {
  const el = document.getElementById('login-password');
  el.type = el.type === 'password' ? 'text' : 'password';
}

function doLogin() {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  if (!u || !p) { errEl.innerText = 'Isi username dan password'; return; }
  errEl.innerText = 'Memproses...';
  API.call('login', { username: u, password: p }).then(function (res) {
    if (!res.ok) { errEl.innerText = res.message; return; }
    STATE.currentUser = res.user;
    sessionStorage.setItem('pos_user', JSON.stringify(res.user));
    showMain();
    goPage('beranda');
  }).catch(function (err) { errEl.innerText = 'Error: ' + err.message; });
}

function doLogout() {
  sessionStorage.removeItem('pos_user');
  STATE.currentUser = null;
  closeMenu();
  document.getElementById('view-main').classList.add('hidden');
  document.getElementById('bottom-nav').classList.add('hidden');
  document.getElementById('view-login').classList.remove('hidden');
}

function renderGantiPassword() {
  document.getElementById('content').innerHTML =
    '<div class="card"><label>Password Lama</label><input type="password" id="cp-old">' +
    '<label>Password Baru</label><input type="password" id="cp-new">' +
    '<button class="btn btn-primary" onclick="submitChangePassword()">Simpan</button></div>';
}

function submitChangePassword() {
  const oldP = document.getElementById('cp-old').value;
  const newP = document.getElementById('cp-new').value;
  if (!newP || newP.length < 4) { toast('Password baru minimal 4 karakter'); return; }
  API.call('changePassword', { userId: STATE.currentUser.id, oldPassword: oldP, newPassword: newP })
    .then(function (res) {
      if (!res.ok) { toast(res.message); return; }
      toast('Password berhasil diubah');
      goPage('beranda');
    }).catch(showErr);
}
