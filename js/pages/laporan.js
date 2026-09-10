/* ============================ LAPORAN ============================ */
function renderLaporan() {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);
  document.getElementById('content').innerHTML =
    '<div class="card"><div class="row"><div><label>Dari</label><input type="date" id="rep-from" value="' + from + '"></div>' +
    '<div><label>Sampai</label><input type="date" id="rep-to" value="' + to + '"></div></div>' +
    '<button class="btn btn-primary" onclick="loadReport()">Tampilkan</button></div>' +
    '<div id="report-result"></div>';
  loadReport();
}
function loadReport() {
  const from = document.getElementById('rep-from').value;
  const to = document.getElementById('rep-to').value + 'T23:59:59';
  API.call('salesReport', { from: from, to: to }).then(function (res) {
    if (!res.ok) { toast(res.message); return; }
    const r = res.data;
    const topHtml = r.top_products.map(function (p) {
      return '<div class="list-item"><span>' + p.name + '</span><b>' + p.qty + ' terjual</b></div>';
    }).join('') || '<div class="muted">Tidak ada data</div>';
    document.getElementById('report-result').innerHTML =
      '<div class="grid2">' + statCard('Total Penjualan', rupiah(r.total_sales)) + statCard('Jumlah Transaksi', r.transaction_count) + '</div>' +
      '<div class="section-title">Produk Terlaris</div><div class="card">' + topHtml + '</div>' +
      '<div class="row" style="margin-top:6px;"><button class="btn btn-outline" onclick="window.print()">📄 Export PDF (Cetak)</button>' +
      '<button class="btn btn-outline" onclick="toast(\'Gunakan File > Download di Google Sheet sumber data\')">📊 Export Excel</button></div>';
  }).catch(showErr);
}
