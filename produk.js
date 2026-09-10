/* ============================ PRODUK ============================ */
function renderProduk() {
  API.call('listProducts', {}).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    STATE.productsCache = res.data;
    let addBtn = STATE.currentUser.role !== 'kasir'
      ? '<button class="btn btn-primary" style="margin-bottom:12px;" onclick="openProductForm()">+ Tambah Produk</button>' : '';
    document.getElementById('content').innerHTML =
      addBtn +
      '<div class="searchbar">🔍 <input id="produk-search" placeholder="Cari produk" oninput="renderProdukList()"></div>' +
      '<div id="produk-list"></div>';
    renderProdukList();
  }).catch(showErr);
}

function renderProdukList() {
  const q = (document.getElementById('produk-search').value || '').toLowerCase();
  const filtered = STATE.productsCache.filter(function (p) { return !q || p.name.toLowerCase().indexOf(q) >= 0; });
  document.getElementById('produk-list').innerHTML = filtered.map(function (p) {
    const stockBadge = p.stock <= 0 ? '<span class="badge badge-red">Habis</span>' :
      p.stock <= p.min_stock ? '<span class="badge badge-orange">Menipis</span>' : '<span class="badge badge-green">' + p.stock + '</span>';
    return '<div class="card" onclick="openProductForm(\'' + p.id + '\')"><div class="list-item">' +
      '<div><div style="font-weight:600;">' + p.name + '</div><div class="muted">' + p.category_name + ' • ' + rupiah(p.sell_price) + '</div></div>' +
      stockBadge + '</div></div>';
  }).join('') || '<div class="muted" style="text-align:center;padding:20px;">Tidak ada produk</div>';
}

function openProductForm(id) {
  const p = id ? STATE.productsCache.find(function (x) { return x.id === id; }) : null;
  API.call('listCategories', {}).then(function (res) {
    STATE.categoriesCache = res.data || [];
    const catOptions = STATE.categoriesCache.map(function (c) {
      return '<option value="' + c.id + '"' + (p && p.category_id === c.id ? ' selected' : '') + '>' + c.name + '</option>';
    }).join('');
    const isKasir = STATE.currentUser.role === 'kasir';
    openFormSheet(
      '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">' + (p ? 'Edit Produk' : 'Tambah Produk') + '</div>' +
      '<label>Nama Produk</label><input id="pf-name" value="' + (p ? p.name : '') + '">' +
      '<div class="row"><div><label>SKU</label><input id="pf-sku" value="' + (p ? p.sku : '') + '"></div>' +
      '<div><label>Barcode</label><input id="pf-barcode" value="' + (p ? p.barcode : '') + '"></div></div>' +
      '<label>Kategori</label><select id="pf-category">' + catOptions + '</select>' +
      '<label>Satuan</label><input id="pf-unit" value="' + (p ? p.unit : 'pcs') + '">' +
      '<div class="row"><div><label>Harga Beli</label><input type="number" id="pf-cost" value="' + (p ? p.cost_price : '') + '" ' + (isKasir ? 'disabled' : '') + '></div>' +
      '<div><label>Harga Jual</label><input type="number" id="pf-sell" value="' + (p ? p.sell_price : '') + '"></div></div>' +
      '<div class="row"><div><label>Stok Awal</label><input type="number" id="pf-stock" value="' + (p ? p.stock : 0) + '" ' + (p || isKasir ? 'disabled' : '') + '></div>' +
      '<div><label>Stok Minimum</label><input type="number" id="pf-minstock" value="' + (p ? p.min_stock : 5) + '"></div></div>' +
      (p ? '<button class="btn btn-outline" style="margin-bottom:8px;" onclick="openStockAdjust(\'' + p.id + '\')">Sesuaikan Stok</button>' : '') +
      '<button class="btn btn-primary" onclick="saveProduct(' + (p ? "'" + p.id + "'" : 'null') + ')">Simpan</button>' +
      (p && !isKasir ? '<button class="btn btn-red" style="margin-top:8px;" onclick="toggleProductActive(\'' + p.id + '\',' + !p.active + ')">' + (p.active ? 'Nonaktifkan' : 'Aktifkan') + '</button>' : '')
    );
  }).catch(showErr);
}

function saveProduct(id) {
  const product = {
    id: id, name: document.getElementById('pf-name').value.trim(),
    sku: document.getElementById('pf-sku').value.trim(),
    barcode: document.getElementById('pf-barcode').value.trim(),
    category_id: document.getElementById('pf-category').value,
    unit: document.getElementById('pf-unit').value.trim(),
    cost_price: Number(document.getElementById('pf-cost').value || 0),
    sell_price: Number(document.getElementById('pf-sell').value || 0),
    stock: Number(document.getElementById('pf-stock').value || 0),
    min_stock: Number(document.getElementById('pf-minstock').value || 0),
    actor: STATE.currentUser.name
  };
  if (!product.name) { toast('Nama produk wajib diisi'); return; }
  API.call('saveProduct', { actorRole: STATE.currentUser.role, product: product }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    toast('Produk disimpan');
    closeFormSheet();
    renderProduk();
  }).catch(showErr);
}

function toggleProductActive(id, active) {
  API.call('setProductActive', { actorRole: STATE.currentUser.role, productId: id, active: active }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    toast(active ? 'Produk diaktifkan' : 'Produk dinonaktifkan');
    closeFormSheet(); renderProduk();
  }).catch(showErr);
}

function openStockAdjust(id) {
  const p = STATE.productsCache.find(function (x) { return x.id === id; });
  openFormSheet(
    '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">Sesuaikan Stok — ' + p.name + '</div>' +
    '<div class="muted" style="margin-bottom:8px;">Stok sistem saat ini: ' + p.stock + '</div>' +
    '<label>Stok Fisik</label><input type="number" id="adj-stock" value="' + p.stock + '">' +
    '<label>Alasan</label><input id="adj-reason" placeholder="Contoh: hasil stok opname">' +
    '<button class="btn btn-primary" onclick="submitStockAdjust(\'' + p.id + '\')">Simpan Penyesuaian</button>'
  );
}
function submitStockAdjust(id) {
  const newStock = Number(document.getElementById('adj-stock').value);
  const reason = document.getElementById('adj-reason').value.trim();
  API.call('adjustStock', {
    actorRole: STATE.currentUser.role, actorName: STATE.currentUser.name,
    productId: id, newStock: newStock, reason: reason
  }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    toast('Stok disesuaikan'); closeFormSheet(); renderProduk();
  }).catch(showErr);
}
