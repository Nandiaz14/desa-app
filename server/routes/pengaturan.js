// server/routes/pengaturan.js
const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { verifyToken } = require('./auth');

// GET /api/pengaturan
router.get('/', verifyToken, async (req, res) => {
  try {
    const [[data]] = await pool.execute('SELECT * FROM pengaturan_desa WHERE id = 1');
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PUT /api/pengaturan
router.put('/', verifyToken, async (req, res) => {
  try {
    const { nama_desa, kecamatan, kabupaten, provinsi, kode_pos, alamat, telp, kepala_desa, nip, sekretaris } = req.body;
    await pool.execute(`
      UPDATE pengaturan_desa SET nama_desa=?,kecamatan=?,kabupaten=?,provinsi=?,kode_pos=?,alamat=?,telp=?,kepala_desa=?,nip=?,sekretaris=?
      WHERE id=1
    `, [nama_desa, kecamatan, kabupaten, provinsi, kode_pos, alamat, telp, kepala_desa, nip, sekretaris]);

    const [[updated]] = await pool.execute('SELECT * FROM pengaturan_desa WHERE id = 1');
    res.json({ ok: true, msg: 'Pengaturan desa berhasil disimpan', data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;