/* ============================ RIWAYAT TRANSAKSI ============================ */
function renderRiwayat() {
  API.call('listSales', { limit: 100 }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    const list = res.data;
    document.getElementById('content').innerHTML = list.map(function (s) {
      return '<div class="card" onclick="showSaleDetail(\'' + s.id + '\')"><div class="list-item">' +
        '<div><div style="font-weight:600;">' + s.trans_no + '</div><div class="muted">' + fmtDate(s.date) + ' • ' + s.cashier_name + '</div></div>' +
        '<div style="text-align:right;"><div style="font-weight:700;">' + rupiah(s.total) + '</div>' +
        '<span class="badge badge-green">' + s.payment_method + '</span></div></div></div>';
    }).join('') || '<div class="card muted">Belum ada transaksi</div>';
  }).catch(showErr);
}

function showSaleDetail(id) {
  API.call('saleDetail', { saleId: id }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    const s = res.sale;
    const itemsHtml = res.items.map(function (i) {
      return '<div class="rline"><span>' + i.product_name + ' x' + i.qty + '</span><span>' + rupiah(i.subtotal) + '</span></div>';
    }).join('');
    openFormSheet(
      '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">Detail Transaksi</div>' +
      '<div class="receipt"><div class="rline"><span>No. Transaksi</span><span>' + s.trans_no + '</span></div>' +
      '<div class="rline"><span>Tanggal</span><span>' + fmtDate(s.date) + '</span></div>' +
      '<div class="rline"><span>Kasir</span><span>' + s.cashier_name + '</span></div><hr>' + itemsHtml + '<hr>' +
      '<div class="rline"><span>Subtotal</span><span>' + rupiah(s.subtotal) + '</span></div>' +
      '<div class="rline"><span>Diskon</span><span>' + rupiah(s.discount) + '</span></div>' +
      '<div class="rline" style="font-weight:700;"><span>Total</span><span>' + rupiah(s.total) + '</span></div>' +
      '<div class="rline"><span>Metode</span><span>' + s.payment_method + '</span></div></div>' +
      '<button class="btn btn-outline" style="margin-top:10px;" onclick="window.print()">🖨 Cetak Ulang Struk</button>'
    );
  }).catch(showErr);
}
