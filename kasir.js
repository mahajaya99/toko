/* ============================ KASIR / POS ============================ */
function renderKasir() {
  STATE.cart = []; STATE.cartDiscount = 0; STATE.cartCustomer = '';
  document.getElementById('content').innerHTML =
    '<div class="searchbar">🔍 <input id="kasir-search" placeholder="Cari produk atau scan barcode" oninput="renderKasirProducts()"></div>' +
    '<div id="kasir-products"></div>';
  loadProductsForKasir();
}

function loadProductsForKasir() {
  API.call('listProducts', {}).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    STATE.productsCache = res.data.filter(function (p) { return p.active; });
    renderKasirProducts();
  }).catch(showErr);
}

function renderKasirProducts() {
  const q = (document.getElementById('kasir-search').value || '').toLowerCase();
  const filtered = STATE.productsCache.filter(function (p) {
    return !q || p.name.toLowerCase().indexOf(q) >= 0 || (p.sku || '').toLowerCase().indexOf(q) >= 0 || (p.barcode || '') === q;
  }).slice(0, 30);
  document.getElementById('kasir-products').innerHTML = filtered.map(function (p) {
    return '<div class="prod-row" onclick="addToCart(\'' + p.id + '\')">' +
      '<div><div class="name">' + p.name + '</div><div class="sub">' + rupiah(p.sell_price) + ' • stok ' + p.stock + '</div></div>' +
      '<button class="btn btn-outline btn-sm">+ Tambah</button></div>';
  }).join('') || '<div class="muted" style="text-align:center;padding:20px;">Produk tidak ditemukan</div>';
}

function addToCart(productId) {
  const p = STATE.productsCache.find(function (x) { return x.id === productId; });
  if (!p) return;
  if (p.stock <= 0) { toast('Stok habis'); return; }
  let item = STATE.cart.find(function (c) { return c.product_id === productId; });
  if (item) {
    if (item.qty + 1 > p.stock) { toast('Stok tidak cukup'); return; }
    item.qty++;
  } else {
    STATE.cart.push({ product_id: p.id, name: p.name, price: Number(p.sell_price), qty: 1, stock: Number(p.stock) });
  }
  toast(p.name + ' ditambahkan');
  showCartSheet();
}

function showCartSheet() {
  renderCartSheetContent();
  document.getElementById('form-overlay').classList.add('show');
  document.getElementById('form-sheet').classList.add('show');
}

function renderCartSheetContent() {
  const subtotal = STATE.cart.reduce(function (a, c) { return a + c.price * c.qty; }, 0);
  const total = Math.max(0, subtotal - STATE.cartDiscount);
  const itemsHtml = STATE.cart.map(function (c, i) {
    return '<div class="list-item"><div style="flex:1;"><div style="font-weight:600;font-size:14px;">' + c.name + '</div>' +
      '<div class="muted">' + rupiah(c.price) + ' x ' + c.qty + ' = ' + rupiah(c.price * c.qty) + '</div></div>' +
      '<div class="qty-ctrl"><button onclick="changeQty(' + i + ',-1)">-</button><span>' + c.qty + '</span>' +
      '<button onclick="changeQty(' + i + ',1)">+</button>' +
      '<button onclick="removeFromCart(' + i + ')" style="color:var(--red);border:none;background:none;font-size:16px;">🗑</button></div></div>';
  }).join('') || '<div class="muted">Keranjang kosong</div>';

  document.getElementById('form-sheet-content').innerHTML =
    '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">Keranjang</div>' +
    itemsHtml +
    '<div style="margin-top:10px;">' +
    '<label>Diskon (Rp)</label><input type="number" id="cart-discount" value="' + STATE.cartDiscount + '" oninput="updateDiscount(this.value)">' +
    '<label>Pelanggan (opsional)</label><input id="cart-customer" value="' + STATE.cartCustomer + '" placeholder="Nama pelanggan" oninput="STATE.cartCustomer=this.value">' +
    '</div>' +
    '<hr style="border:none;border-top:1px solid var(--border);margin:10px 0;">' +
    '<div class="list-item"><span>Subtotal</span><b>' + rupiah(subtotal) + '</b></div>' +
    '<div class="list-item"><span>Diskon</span><b>-' + rupiah(STATE.cartDiscount) + '</b></div>' +
    '<div class="list-item" style="font-size:16px;"><span>Total</span><b>' + rupiah(total) + '</b></div>' +
    '<div class="row" style="margin-top:12px;">' +
    '<button class="btn btn-outline" onclick="holdCart()">Tahan Transaksi</button>' +
    '<button class="btn btn-primary" onclick="goToPayment()">Bayar</button></div>';
}

function changeQty(i, delta) {
  const c = STATE.cart[i];
  const newQty = c.qty + delta;
  if (newQty <= 0) { STATE.cart.splice(i, 1); }
  else if (newQty > c.stock) { toast('Stok tidak cukup'); return; }
  else { c.qty = newQty; }
  renderCartSheetContent();
}
function removeFromCart(i) { STATE.cart.splice(i, 1); renderCartSheetContent(); }
function updateDiscount(v) { STATE.cartDiscount = Number(v || 0); renderCartSheetContent(); }

function holdCart() {
  if (STATE.cart.length === 0) { toast('Keranjang kosong'); return; }
  const subtotal = STATE.cart.reduce(function (a, c) { return a + c.price * c.qty; }, 0);
  API.call('holdTransaction', {
    cashier: STATE.currentUser.name, customer: STATE.cartCustomer, items: STATE.cart,
    subtotal: subtotal, discount: STATE.cartDiscount
  }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    toast('Transaksi ditahan');
    closeFormSheet();
    STATE.cart = []; STATE.cartDiscount = 0;
  }).catch(showErr);
}

function goToPayment() {
  if (STATE.cart.length === 0) { toast('Keranjang kosong'); return; }
  const subtotal = STATE.cart.reduce(function (a, c) { return a + c.price * c.qty; }, 0);
  const total = Math.max(0, subtotal - STATE.cartDiscount);
  document.getElementById('form-sheet-content').innerHTML =
    '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">Pembayaran</div>' +
    '<div class="card" style="text-align:center;"><div class="muted">Total Bayar</div>' +
    '<div style="font-size:26px;font-weight:800;">' + rupiah(total) + '</div></div>' +
    '<label>Metode Pembayaran</label>' +
    '<select id="pay-method" onchange="onPayMethodChange()">' +
    '<option value="tunai">Tunai</option><option value="qris">QRIS</option>' +
    '<option value="debit">Debit</option><option value="transfer">Transfer</option>' +
    '<option value="kredit">Kredit / Piutang</option></select>' +
    '<div id="pay-cash-wrap"><label>Uang Diterima</label><input type="number" id="pay-cash" oninput="updateChange(' + total + ')"></div>' +
    '<div id="pay-change" class="muted"></div>' +
    '<button class="btn btn-green" style="margin-top:14px;" onclick="confirmPayment(' + total + ')">Konfirmasi Pembayaran</button>';
}

function onPayMethodChange() {
  const m = document.getElementById('pay-method').value;
  document.getElementById('pay-cash-wrap').style.display = (m === 'tunai') ? 'block' : 'none';
}

function updateChange(total) {
  const cash = Number(document.getElementById('pay-cash').value || 0);
  const change = cash - total;
  document.getElementById('pay-change').innerText = cash > 0 ? ('Kembalian: ' + rupiah(Math.max(0, change))) : '';
}

function confirmPayment(total) {
  const method = document.getElementById('pay-method').value;
  const cash = method === 'tunai' ? Number(document.getElementById('pay-cash').value || 0) : total;
  if (method === 'tunai' && cash < total) { toast('Uang tunai kurang dari total'); return; }

  const payload = {
    items: STATE.cart, discount: STATE.cartDiscount, customer: STATE.cartCustomer,
    payment_method: method, cash_received: cash,
    cashier_id: STATE.currentUser.id, cashier_name: STATE.currentUser.name
  };
  API.call('checkout', payload).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    closeFormSheet();
    showReceipt(res.receipt);
    STATE.cart = []; STATE.cartDiscount = 0; STATE.cartCustomer = '';
  }).catch(showErr);
}

function showReceipt(r) {
  const itemsHtml = r.items.map(function (i) {
    return '<div class="rline"><span>' + i.name + ' x' + i.qty + '</span><span>' + rupiah(i.price * i.qty) + '</span></div>';
  }).join('');
  document.getElementById('content').innerHTML =
    '<div class="card" style="text-align:center;"><div style="font-size:40px;">✅</div>' +
    '<div style="font-weight:700;font-size:17px;">Pembayaran Berhasil</div></div>' +
    '<div class="receipt">' +
    '<div style="text-align:center;font-weight:700;">TOKO KASIR</div>' +
    '<div style="text-align:center;">' + r.trans_no + '</div><hr>' +
    '<div class="rline"><span>Tanggal</span><span>' + fmtDate(r.date) + '</span></div>' +
    '<div class="rline"><span>Kasir</span><span>' + r.cashier + '</span></div>' +
    (r.customer ? '<div class="rline"><span>Pelanggan</span><span>' + r.customer + '</span></div>' : '') +
    '<hr>' + itemsHtml + '<hr>' +
    '<div class="rline"><span>Subtotal</span><span>' + rupiah(r.subtotal) + '</span></div>' +
    '<div class="rline"><span>Diskon</span><span>' + rupiah(r.discount) + '</span></div>' +
    '<div class="rline" style="font-weight:700;"><span>Total</span><span>' + rupiah(r.total) + '</span></div>' +
    '<div class="rline"><span>Metode</span><span>' + r.payment_method.toUpperCase() + '</span></div>' +
    (r.payment_method === 'tunai' ? '<div class="rline"><span>Diterima</span><span>' + rupiah(r.cash_received) + '</span></div>' +
    '<div class="rline"><span>Kembalian</span><span>' + rupiah(r.change) + '</span></div>' : '') +
    '<hr><div style="text-align:center;">Terima kasih 🙏</div></div>' +
    '<div class="row" style="margin-top:12px;"><button class="btn btn-outline" onclick="window.print()">🖨 Cetak Struk</button>' +
    '<button class="btn btn-primary" onclick="goPage(\'kasir\')">Transaksi Baru</button></div>';
}

/* Transaksi Ditahan */
function renderDitahan() {
  API.call('listHeld', {}).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    const list = res.data;
    document.getElementById('content').innerHTML = list.map(function (h) {
      return '<div class="card"><div class="list-item"><div><b>' + (h.customer || 'Tanpa nama') + '</b>' +
        '<div class="muted">' + fmtDate(h.date) + ' • ' + h.cashier + '</div></div><b>' + rupiah(h.subtotal) + '</b></div>' +
        '<div class="row" style="margin-top:8px;">' +
        '<button class="btn btn-outline btn-sm" onclick="resumeHeld(\'' + h.id + '\')">Lanjutkan</button>' +
        '<button class="btn btn-red btn-sm" onclick="deleteHeld(\'' + h.id + '\')">Hapus</button></div></div>';
    }).join('') || '<div class="card muted">Tidak ada transaksi ditahan</div>';
  }).catch(showErr);
}
function resumeHeld(id) {
  API.call('listHeld', {}).then(function (res) {
    const h = res.data.find(function (x) { return x.id === id; });
    if (!h) return;
    STATE.cart = h.items; STATE.cartDiscount = Number(h.discount || 0); STATE.cartCustomer = h.customer || '';
    API.call('deleteHeld', { id: id });
    goPage('kasir');
    setTimeout(showCartSheet, 200);
  }).catch(showErr);
}
function deleteHeld(id) {
  API.call('deleteHeld', { id: id }).then(function () { renderDitahan(); }).catch(showErr);
}
