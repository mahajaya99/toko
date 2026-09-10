/* ============================ KEUANGAN ============================ */
function renderKeuangan() {
  document.getElementById('content').innerHTML =
    '<div class="grid2">' +
    kasirTile('💵', 'Pengeluaran', 'openExpenseForm()') +
    kasirTile('📄', 'Riwayat Transaksi', "goPage('riwayat')") +
    kasirTile('🚚', 'Pembelian', "toast('Fitur pembelian: Prioritas 2 — segera hadir')") +
    kasirTile('🤝', 'Hutang Supplier', "toast('Fitur hutang: Prioritas 2 — segera hadir')") +
    kasirTile('📥', 'Piutang Pelanggan', "toast('Fitur piutang: Prioritas 2 — segera hadir')") +
    kasirTile('📋', 'Stok Opname', "toast('Fitur stok opname: Prioritas 2 — segera hadir')") +
    '</div>';
}
function kasirTile(icon, label, onclick) {
  return '<div class="stat" style="cursor:pointer;text-align:center;" onclick="' + onclick + '">' +
    '<div style="font-size:26px;">' + icon + '</div><div class="l" style="margin-top:6px;">' + label + '</div></div>';
}
function openExpenseForm() {
  openFormSheet(
    '<div style="font-weight:700;font-size:15px;margin-bottom:10px;">Catat Pengeluaran</div>' +
    '<label>Kategori</label><select id="exp-cat"><option>Operasional</option><option>Gaji</option><option>Transportasi</option><option>Lainnya</option></select>' +
    '<label>Jumlah (Rp)</label><input type="number" id="exp-amount">' +
    '<label>Catatan</label><input id="exp-note" placeholder="Opsional">' +
    '<button class="btn btn-primary" onclick="submitExpense()">Simpan</button>'
  );
}
function submitExpense() {
  const cat = document.getElementById('exp-cat').value;
  const amount = document.getElementById('exp-amount').value;
  const note = document.getElementById('exp-note').value;
  API.call('addExpense', { user: STATE.currentUser.name, category: cat, amount: amount, note: note })
    .then(function (res) {
      if (!res.ok) { toast(res.message); return; }
      toast('Pengeluaran dicatat'); closeFormSheet();
    }).catch(showErr);
}
