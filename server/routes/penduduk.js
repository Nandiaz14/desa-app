// server/routes/penduduk.js
const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { verifyToken } = require('./auth');

// GET /api/penduduk
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, dusun } = req.query;
    let sql    = 'SELECT * FROM penduduk WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (nama LIKE ? OR nik LIKE ? OR pekerjaan LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    if (dusun) { sql += ' AND dusun = ?'; params.push(dusun); }

    sql += ` ORDER BY FIELD(dusun,'Dusun 1','Dusun 2','Dusun 3','Dusun 4','Dusun 5','Dusun 6'), nama ASC`;

    const [rows] = await pool.execute(sql, params);
    res.json({ ok: true, data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/penduduk/stats/ringkasan
router.get('/stats/ringkasan', verifyToken, async (req, res) => {
  try {
    const [[{ total }]]     = await pool.execute('SELECT COUNT(*) as total FROM penduduk');
    const [[{ lakiLaki }]]  = await pool.execute("SELECT COUNT(*) as lakiLaki FROM penduduk WHERE jenis_kelamin='Laki-laki'");
    const [[{ perempuan }]] = await pool.execute("SELECT COUNT(*) as perempuan FROM penduduk WHERE jenis_kelamin='Perempuan'");
    const [[{ baru }]]      = await pool.execute("SELECT COUNT(*) as baru FROM penduduk WHERE status='Baru'");
    const [perDusun]        = await pool.execute("SELECT dusun, COUNT(*) as jumlah FROM penduduk GROUP BY dusun ORDER BY FIELD(dusun,'Dusun 1','Dusun 2','Dusun 3','Dusun 4','Dusun 5','Dusun 6')");
    res.json({ ok: true, data: { total, lakiLaki, perempuan, baru, perDusun } });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/penduduk/riwayat/semua
router.get('/riwayat/semua', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM riwayat_perubahan ORDER BY tanggal DESC, id DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// POST /api/penduduk/riwayat/tambah
router.post('/riwayat/tambah', verifyToken, async (req, res) => {
  try {
    const { tanggal, jenis, nik, nama, keterangan } = req.body;
    if (!nama || !tanggal) return res.status(400).json({ ok: false, msg: 'Nama dan tanggal wajib diisi' });

    const [result] = await pool.execute(
      'INSERT INTO riwayat_perubahan (tanggal, jenis, nik, nama, keterangan) VALUES (?,?,?,?,?)',
      [tanggal, jenis, nik || '-', nama, keterangan || '']
    );
    const [[newData]] = await pool.execute('SELECT * FROM riwayat_perubahan WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, msg: 'Riwayat berhasil dicatat', data: newData });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/penduduk/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [[data]] = await pool.execute('SELECT * FROM penduduk WHERE id = ?', [req.params.id]);
    if (!data) return res.status(404).json({ ok: false, msg: 'Data tidak ditemukan' });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// POST /api/penduduk
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pendidikan, pekerjaan, status_kawin, alamat, rt, rw, dusun, status, tanggal_masuk, keterangan } = req.body;

    if (!nik || !nama || !tanggal_lahir || !pekerjaan || !rt || !rw)
      return res.status(400).json({ ok: false, msg: 'NIK, nama, tanggal lahir, pekerjaan, RT, RW wajib diisi' });
    if (nik.length !== 16)
      return res.status(400).json({ ok: false, msg: 'NIK harus 16 digit' });

    const [[exist]] = await pool.execute('SELECT id FROM penduduk WHERE nik = ?', [nik]);
    if (exist) return res.status(409).json({ ok: false, msg: 'NIK sudah terdaftar' });

    const [result] = await pool.execute(`
      INSERT INTO penduduk (nik,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,agama,pendidikan,pekerjaan,status_kawin,alamat,rt,rw,dusun,status,tanggal_masuk,keterangan)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pendidikan, pekerjaan, status_kawin, alamat, rt, rw, dusun, status || 'Tetap', tanggal_masuk, keterangan || '']);

    const [[newData]] = await pool.execute('SELECT * FROM penduduk WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, msg: 'Data penduduk berhasil ditambahkan', data: newData });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PUT /api/penduduk/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pendidikan, pekerjaan, status_kawin, alamat, rt, rw, dusun, status, tanggal_masuk, keterangan } = req.body;

    const [[exist]] = await pool.execute('SELECT id FROM penduduk WHERE id = ?', [req.params.id]);
    if (!exist) return res.status(404).json({ ok: false, msg: 'Data tidak ditemukan' });

    const [[duplikat]] = await pool.execute('SELECT id FROM penduduk WHERE nik = ? AND id != ?', [nik, req.params.id]);
    if (duplikat) return res.status(409).json({ ok: false, msg: 'NIK sudah digunakan penduduk lain' });

    await pool.execute(`
      UPDATE penduduk SET nik=?,nama=?,tempat_lahir=?,tanggal_lahir=?,jenis_kelamin=?,agama=?,
      pendidikan=?,pekerjaan=?,status_kawin=?,alamat=?,rt=?,rw=?,dusun=?,status=?,tanggal_masuk=?,keterangan=?
      WHERE id=?
    `, [nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pendidikan, pekerjaan, status_kawin, alamat, rt, rw, dusun, status, tanggal_masuk, keterangan || '', req.params.id]);

    const [[updated]] = await pool.execute('SELECT * FROM penduduk WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Data penduduk berhasil diperbarui', data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// DELETE /api/penduduk/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [[exist]] = await pool.execute('SELECT id FROM penduduk WHERE id = ?', [req.params.id]);
    if (!exist) return res.status(404).json({ ok: false, msg: 'Data tidak ditemukan' });
    await pool.execute('DELETE FROM penduduk WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Data penduduk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;