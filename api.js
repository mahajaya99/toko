/**
 * API — jembatan ke backend Google Apps Script.
 * Semua permintaan dikirim sebagai POST dengan Content-Type: text/plain
 * (bukan application/json) supaya browser TIDAK mengirim preflight OPTIONS,
 * karena Apps Script Web App tidak menangani preflight CORS dengan baik.
 * Body tetap berisi JSON biasa: { action, payload }.
 */
const API = {
  call: function (action, payload) {
    if (!CONFIG.API_URL || CONFIG.API_URL.indexOf('GANTI_DENGAN') === 0) {
      toast('API_URL belum diatur. Edit js/config.js terlebih dahulu.');
      return Promise.reject(new Error('API_URL belum dikonfigurasi'));
    }
    return fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action, payload: payload || {} })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .catch(function (err) {
        toast('Gagal terhubung ke server: ' + err.message);
        throw err;
      });
  }
};
