/* ============================ HELPERS ============================ */
function rupiah(n) {
  n = Number(n || 0);
  return 'Rp' + n.toLocaleString('id-ID');
}

function fmtDate(d) {
  const x = new Date(d);
  return x.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
    x.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) { console.log(msg); return; }
  t.innerText = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () { t.classList.remove('show'); }, 2200);
}

function showErr(e) { toast('Error: ' + (e && e.message ? e.message : e)); }

function roleLabel(r) { return r === 'owner' ? 'Owner' : r === 'admin' ? 'Admin' : 'Kasir'; }

function statCard(label, value) {
  return '<div class="stat"><div class="v">' + value + '</div><div class="l">' + label + '</div></div>';
}

/* ============================ GLOBAL STATE ============================ */
const STATE = {
  currentUser: null,   // {id, username, name, role}
  cart: [],             // {product_id, name, price, qty, stock}
  cartDiscount: 0,
  cartCustomer: '',
  productsCache: [],
  categoriesCache: []
};
