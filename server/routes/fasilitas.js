const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { verifyToken } = require('./auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM fasilitas ORDER BY nama');
    res.json({ ok: true, data: rows });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { nama, kategori, kondisi, lokasi, deskripsi } = req.body;
    if (!nama) return res.status(400).json({ ok: false, msg: 'Nama fasilitas wajib diisi' });
    const [result] = await pool.execute(
      'INSERT INTO fasilitas (nama,kategori,kondisi,lokasi,deskripsi,created_by) VALUES (?,?,?,?,?,?)',
      [nama, kategori||'Gedung', kondisi||'Baik', lokasi||'', deskripsi||'', req.user.nama]
    );
    const [[data]] = await pool.execute('SELECT * FROM fasilitas WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, data });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { nama, kategori, kondisi, lokasi, deskripsi, tersedia } = req.body;
    await pool.execute(
      'UPDATE fasilitas SET nama=?,kategori=?,kondisi=?,lokasi=?,deskripsi=?,tersedia=? WHERE id=?',
      [nama, kategori||'Gedung', kondisi||'Baik', lokasi||'', deskripsi||'', tersedia??1, req.params.id]
    );
    const [[data]] = await pool.execute('SELECT * FROM fasilitas WHERE id = ?', [req.params.id]);
    res.json({ ok: true, data });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM fasilitas WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Fasilitas berhasil dihapus' });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.get('/booking', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT b.*, f.nama as nama_fasilitas, f.kategori
      FROM booking_fasilitas b
      JOIN fasilitas f ON b.fasilitas_id = f.id
      ORDER BY b.created_at DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.post('/booking', verifyToken, async (req, res) => {
  try {
    const { fasilitas_id, nama_pemohon, nik, keperluan, tanggal_mulai, tanggal_selesai, catatan } = req.body;
    if (!fasilitas_id || !nama_pemohon || !keperluan || !tanggal_mulai || !tanggal_selesai)
      return res.status(400).json({ ok: false, msg: 'Semua field wajib diisi' });
    const [result] = await pool.execute(
      'INSERT INTO booking_fasilitas (fasilitas_id,nama_pemohon,nik,keperluan,tanggal_mulai,tanggal_selesai,catatan,created_by) VALUES (?,?,?,?,?,?,?,?)',
      [fasilitas_id, nama_pemohon, nik||'', keperluan, tanggal_mulai, tanggal_selesai, catatan||'', req.user.nama]
    );
    const [[data]] = await pool.execute(`
      SELECT b.*, f.nama as nama_fasilitas FROM booking_fasilitas b
      JOIN fasilitas f ON b.fasilitas_id = f.id WHERE b.id = ?
    `, [result.insertId]);
    res.status(201).json({ ok: true, data });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.patch('/booking/:id', verifyToken, async (req, res) => {
  try {
    const { status, catatan } = req.body;
    await pool.execute(
      'UPDATE booking_fasilitas SET status=?,catatan=?,diproses_oleh=? WHERE id=?',
      [status, catatan||'', req.user.nama, req.params.id]
    );
    const [[data]] = await pool.execute(`
      SELECT b.*, f.nama as nama_fasilitas FROM booking_fasilitas b
      JOIN fasilitas f ON b.fasilitas_id = f.id WHERE b.id = ?
    `, [req.params.id]);
    res.json({ ok: true, data });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

module.exports = router;