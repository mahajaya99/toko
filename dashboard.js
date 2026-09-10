/* ============================ BERANDA ============================ */
function renderBeranda() {
  API.call('dashboard', {}).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    const d = res.data;
    let lowHtml = d.low_stock_list.map(function (p) {
      return '<div class="list-item"><span>' + p.name + '</span><span class="badge badge-orange">' + p.stock + ' tersisa</span></div>';
    }).join('') || '<div class="muted">Tidak ada</div>';
    let outHtml = d.out_stock_list.map(function (p) {
      return '<div class="list-item"><span>' + p.name + '</span><span class="badge badge-red">Habis</span></div>';
    }).join('') || '<div class="muted">Tidak ada</div>';
    let recentHtml = d.recent_transactions.map(function (t) {
      return '<div class="list-item"><div><div style="font-weight:600;font-size:13.5px;">' + t.trans_no + '</div>' +
        '<div class="muted">' + fmtDate(t.date) + ' • ' + t.cashier_name + '</div></div>' +
        '<div style="text-align:right;"><div style="font-weight:700;">' + rupiah(t.total) + '</div>' +
        '<span class="badge badge-green">' + t.status + '</span></div></div>';
    }).join('') || '<div class="muted">Belum ada transaksi</div>';

    document.getElementById('content').innerHTML =
      '<button class="btn btn-primary" style="font-size:16px;padding:18px;margin-bottom:14px;" onclick="goPage(\'kasir\')">🧾 MULAI KASIR</button>' +
      '<div class="grid2">' +
        statCard('Penjualan Hari Ini', rupiah(d.today_sales)) +
        statCard('Transaksi Hari Ini', d.today_trans) +
        statCard('Keuntungan Hari Ini', rupiah(d.today_profit)) +
        statCard('Saldo Kas', rupiah(d.cash_balance)) +
      '</div>' +
      '<div class="section-title">Ringkasan Penjualan</div>' +
      '<div class="card"><div class="list-item"><span>Hari ini</span><b>' + rupiah(d.today_sales) + '</b></div>' +
      '<div class="list-item"><span>Minggu ini</span><b>' + rupiah(d.week_sales) + '</b></div>' +
      '<div class="list-item"><span>Bulan ini</span><b>' + rupiah(d.month_sales) + '</b></div></div>' +
      '<div class="section-title">Produk</div>' +
      '<div class="card"><div class="list-item"><span>Total produk</span><b>' + d.total_products + '</b></div>' +
      '<div class="list-item"><span>Stok menipis</span><span class="badge badge-orange">' + d.low_stock_count + '</span></div>' +
      '<div class="list-item"><span>Stok habis</span><span class="badge badge-red">' + d.out_stock_count + '</span></div></div>' +
      (d.low_stock_count > 0 ? '<div class="section-title">⚠️ Stok Menipis</div><div class="card">' + lowHtml + '</div>' : '') +
      (d.out_stock_count > 0 ? '<div class="section-title">❌ Stok Habis</div><div class="card">' + outHtml + '</div>' : '') +
      '<div class="section-title">Transaksi Terakhir</div><div class="card">' + recentHtml + '</div>';
  }).catch(showErr);
}
