// server/routes/surat.js
const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { verifyToken } = require('./auth');

const KODE_SURAT = {
  'Surat Keterangan Domisili':    'SKD',
  'Surat Keterangan Tidak Mampu': 'SKTM',
  'Surat Pengantar KTP':          'SPKTP',
  'Surat Keterangan Usaha':       'SKU',
  'Surat Keterangan Kelahiran':   'SKL',
  'Surat Keterangan Kematian':    'SKKM',
  'Surat Pengantar SKCK':         'SPSKCK',
  'Surat Keterangan Pindah':      'SKP',
};

// ── PENGAJUAN SURAT ──────────────────────────────────────

// GET /api/surat/pengajuan
router.get('/pengajuan', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM pengajuan_surat WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(sql, params);
    res.json({ ok: true, data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// POST /api/surat/pengajuan
router.post('/pengajuan', verifyToken, async (req, res) => {
  try {
    const { nik, nama_pemohon, jenis_surat, keperluan, tanggal_ajuan, catatan } = req.body;
    if (!nik || !nama_pemohon || !keperluan)
      return res.status(400).json({ ok: false, msg: 'NIK, nama pemohon, dan keperluan wajib diisi' });

    const tahun = new Date().getFullYear();
    const [[{ cnt }]] = await pool.execute('SELECT COUNT(*) as cnt FROM pengajuan_surat');
    const nomor = `S-${tahun}-${String(cnt + 1).padStart(3, '0')}`;

    const [result] = await pool.execute(`
      INSERT INTO pengajuan_surat (nomor_antrian,tanggal_ajuan,nik,nama_pemohon,jenis_surat,keperluan,status,catatan)
      VALUES (?,?,?,?,?,?,'Menunggu',?)
    `, [nomor, tanggal_ajuan || new Date().toISOString().split('T')[0], nik, nama_pemohon, jenis_surat, keperluan, catatan || '']);

    const [[newData]] = await pool.execute('SELECT * FROM pengajuan_surat WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, msg: 'Pengajuan surat berhasil dibuat', data: newData });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PATCH /api/surat/pengajuan/:id — update status
router.patch('/pengajuan/:id', verifyToken, async (req, res) => {
  try {
    const { status, petugas, catatan, tanggal_selesai } = req.body;
    const [[exist]] = await pool.execute('SELECT * FROM pengajuan_surat WHERE id = ?', [req.params.id]);
    if (!exist) return res.status(404).json({ ok: false, msg: 'Data tidak ditemukan' });

    const tgl = status === 'Selesai' && !tanggal_selesai
      ? new Date().toISOString().split('T')[0]
      : tanggal_selesai || null;

    await pool.execute(
      'UPDATE pengajuan_surat SET status=?,petugas=?,catatan=?,tanggal_selesai=? WHERE id=?',
      [status, petugas || '', catatan || '', tgl, req.params.id]
    );

    // Jika selesai → otomatis simpan ke arsip
    if (status === 'Selesai') {
      const kode    = KODE_SURAT[exist.jenis_surat] || 'SKT';
      const tahun   = new Date().getFullYear();
      const [[{ cnt }]] = await pool.execute('SELECT COUNT(*) as cnt FROM arsip_surat');
      const nomSurat = `DS/${kode}/${tahun}/${String(cnt + 1).padStart(3, '0')}`;

      const [[arsipExist]] = await pool.execute('SELECT id FROM arsip_surat WHERE nomor_surat = ?', [nomSurat]);
      if (!arsipExist) {
        await pool.execute(`
          INSERT INTO arsip_surat (nomor_surat,tanggal,jenis,penerima,nik,keperluan,dibuat,file)
          VALUES (?,?,?,?,?,?,?,?)
        `, [nomSurat, tgl, exist.jenis_surat, exist.nama_pemohon, exist.nik, exist.keperluan, petugas || '-', `${nomSurat.replace(/\//g,'_')}.pdf`]);
      }
    }

    const [[updated]] = await pool.execute('SELECT * FROM pengajuan_surat WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Status surat berhasil diperbarui', data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// ── ARSIP SURAT ──────────────────────────────────────────

// GET /api/surat/arsip
router.get('/arsip', verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM arsip_surat WHERE 1=1';
    const params = [];
    if (search) {
      sql += ' AND (penerima LIKE ? OR nomor_surat LIKE ? OR jenis LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    sql += ' ORDER BY tanggal DESC';
    const [rows] = await pool.execute(sql, params);
    res.json({ ok: true, data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// POST /api/surat/arsip
router.post('/arsip', verifyToken, async (req, res) => {
  try {
    const { nomor_surat, tanggal, jenis, penerima, nik, keperluan, dibuat } = req.body;
    if (!nomor_surat || !penerima)
      return res.status(400).json({ ok: false, msg: 'Nomor surat dan penerima wajib diisi' });

    const [[exist]] = await pool.execute('SELECT id FROM arsip_surat WHERE nomor_surat = ?', [nomor_surat]);
    if (exist) return res.status(409).json({ ok: false, msg: 'Nomor surat sudah ada di arsip' });

    const [result] = await pool.execute(`
      INSERT INTO arsip_surat (nomor_surat,tanggal,jenis,penerima,nik,keperluan,dibuat,file)
      VALUES (?,?,?,?,?,?,?,?)
    `, [nomor_surat, tanggal, jenis, penerima, nik || '', keperluan || '', dibuat || '-', `${nomor_surat.replace(/\//g,'_')}.pdf`]);

    const [[newData]] = await pool.execute('SELECT * FROM arsip_surat WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, msg: 'Arsip berhasil ditambahkan', data: newData });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// DELETE /api/surat/arsip/:id
router.delete('/arsip/:id', verifyToken, async (req, res) => {
  try {
    const [[exist]] = await pool.execute('SELECT id FROM arsip_surat WHERE id = ?', [req.params.id]);
    if (!exist) return res.status(404).json({ ok: false, msg: 'Arsip tidak ditemukan' });
    await pool.execute('DELETE FROM arsip_surat WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Arsip berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/surat/stats/ringkasan
router.get('/stats/ringkasan', verifyToken, async (req, res) => {
  try {
    const [[{ total }]]    = await pool.execute('SELECT COUNT(*) as total FROM pengajuan_surat');
    const [[{ menunggu }]] = await pool.execute("SELECT COUNT(*) as menunggu FROM pengajuan_surat WHERE status='Menunggu'");
    const [[{ diproses }]] = await pool.execute("SELECT COUNT(*) as diproses FROM pengajuan_surat WHERE status='Diproses'");
    const [[{ selesai }]]  = await pool.execute("SELECT COUNT(*) as selesai FROM pengajuan_surat WHERE status='Selesai'");
    const [[{ arsip }]]    = await pool.execute('SELECT COUNT(*) as arsip FROM arsip_surat');
    res.json({ ok: true, data: { total, menunggu, diproses, selesai, arsip } });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;