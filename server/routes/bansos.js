const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { verifyToken } = require('./auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT b.*, COUNT(p.id) as jumlah_penerima
      FROM bansos b
      LEFT JOIN penerima_bansos p ON b.id = p.bansos_id
      GROUP BY b.id ORDER BY b.created_at DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { nama_program, tahun, deskripsi, anggaran } = req.body;
    if (!nama_program || !tahun)
      return res.status(400).json({ ok: false, msg: 'Nama program dan tahun wajib diisi' });
    const [result] = await pool.execute(
      'INSERT INTO bansos (nama_program,tahun,deskripsi,anggaran,created_by) VALUES (?,?,?,?,?)',
      [nama_program, tahun, deskripsi||'', anggaran||0, req.user.nama]
    );
    const [[data]] = await pool.execute('SELECT * FROM bansos WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, data });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { nama_program, tahun, deskripsi, anggaran, status } = req.body;
    await pool.execute(
      'UPDATE bansos SET nama_program=?,tahun=?,deskripsi=?,anggaran=?,status=? WHERE id=?',
      [nama_program, tahun, deskripsi||'', anggaran||0, status||'Aktif', req.params.id]
    );
    const [[data]] = await pool.execute('SELECT * FROM bansos WHERE id = ?', [req.params.id]);
    res.json({ ok: true, data });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM bansos WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Program bansos berhasil dihapus' });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.get('/cek/penerima-ganda', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.nik, p.nama, COUNT(*) as jumlah_program,
             GROUP_CONCAT(b.nama_program SEPARATOR ', ') as program_list
      FROM penerima_bansos p
      JOIN bansos b ON p.bansos_id = b.id
      GROUP BY p.nik, p.nama
      HAVING COUNT(*) > 1
      ORDER BY jumlah_program DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.get('/:id/penerima', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM penerima_bansos WHERE bansos_id = ? ORDER BY nama',
      [req.params.id]
    );
    res.json({ ok: true, data: rows });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.post('/:id/penerima', verifyToken, async (req, res) => {
  try {
    const { nik, nama, alamat, rt, rw, dusun, jumlah, keterangan } = req.body;
    if (!nik || !nama)
      return res.status(400).json({ ok: false, msg: 'NIK dan nama wajib diisi' });
    const [[exist]] = await pool.execute(
      'SELECT id FROM penerima_bansos WHERE bansos_id=? AND nik=?',
      [req.params.id, nik]
    );
    if (exist)
      return res.status(409).json({ ok: false, msg: 'NIK sudah terdaftar sebagai penerima di program ini (penerima ganda)' });
    const [result] = await pool.execute(
      'INSERT INTO penerima_bansos (bansos_id,nik,nama,alamat,rt,rw,dusun,jumlah,keterangan,created_by) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [req.params.id, nik, nama, alamat||'', rt||'', rw||'', dusun||'', jumlah||0, keterangan||'', req.user.nama]
    );
    const [[data]] = await pool.execute('SELECT * FROM penerima_bansos WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, data });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

router.delete('/:id/penerima/:pid', verifyToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM penerima_bansos WHERE id = ?', [req.params.pid]);
    res.json({ ok: true, msg: 'Penerima berhasil dihapus' });
  } catch (err) { res.status(500).json({ ok: false, msg: err.message }); }
});

module.exports = router;