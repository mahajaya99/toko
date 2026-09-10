/* ============================ BOOTSTRAP ============================ */
window.addEventListener('load', function () {
  const saved = sessionStorage.getItem('pos_user');
  if (saved) {
    STATE.currentUser = JSON.parse(saved);
    showMain();
    goPage('beranda');
  } else {
    document.getElementById('view-login').classList.remove('hidden');
  }
});
