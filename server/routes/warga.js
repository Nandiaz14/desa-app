// server/routes/warga.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../database');
const config   = require('../config');

const router = express.Router();

// ── MIDDLEWARE verify token warga ──
function verifyWarga(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ ok: false, msg: 'Token tidak ditemukan' });
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.tipe !== 'warga') return res.status(403).json({ ok: false, msg: 'Bukan akun warga' });
    req.warga = decoded;
    next();
  } catch {
    res.status(401).json({ ok: false, msg: 'Token tidak valid' });
  }
}

// ── POST /api/warga/register ──
router.post('/register', async (req, res) => {
  try {
    const { nik, nama, no_hp, password } = req.body;
    if (!nik || !nama || !password) return res.json({ ok: false, msg: 'NIK, nama, dan password wajib diisi' });
    if (password.length < 6) return res.json({ ok: false, msg: 'Password minimal 6 karakter' });

    // Cek NIK & nama cocok di data penduduk
    const [penduduk] = await pool.execute(
      'SELECT id, nama, status FROM penduduk WHERE nik = ?', [nik]
    );
    if (penduduk.length === 0) return res.json({ ok: false, msg: 'NIK tidak ditemukan dalam data penduduk desa' });

    const p = penduduk[0];
    // Cek nama cocok (case insensitive, trim)
    if (p.nama.trim().toLowerCase() !== nama.trim().toLowerCase()) {
      return res.json({ ok: false, msg: 'Nama tidak sesuai dengan data penduduk' });
    }
    // Cek status penduduk
    if (p.status === 'Meninggal' || p.status === 'Pindah Keluar') {
      return res.json({ ok: false, msg: 'Akun tidak dapat dibuat untuk penduduk yang sudah pindah atau meninggal' });
    }

    // Cek apakah sudah punya akun
    const [existing] = await pool.execute('SELECT id FROM warga_akun WHERE nik = ?', [nik]);
    if (existing.length > 0) return res.json({ ok: false, msg: 'NIK ini sudah terdaftar, silakan login' });

    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO warga_akun (nik, nama, no_hp, password) VALUES (?, ?, ?, ?)',
      [nik, nama.trim(), no_hp || '', hash]
    );

    res.json({ ok: true, msg: 'Pendaftaran berhasil! Silakan login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Gagal mendaftar', error: err.message });
  }
});

// ── POST /api/warga/login ──
router.post('/login', async (req, res) => {
  try {
    const { nik, password } = req.body;
    if (!nik || !password) return res.json({ ok: false, msg: 'NIK dan password wajib diisi' });

    const [rows] = await pool.execute('SELECT * FROM warga_akun WHERE nik = ?', [nik]);
    if (rows.length === 0) return res.json({ ok: false, msg: 'NIK tidak terdaftar, silakan daftar terlebih dahulu' });

    const warga = rows[0];

    // Cek status penduduk terbaru
    const [penduduk] = await pool.execute('SELECT status FROM penduduk WHERE nik = ?', [nik]);
    if (penduduk.length > 0) {
      const status = penduduk[0].status;
      if (status === 'Meninggal' || status === 'Pindah Keluar') {
        return res.json({ ok: false, msg: 'Akun dinonaktifkan karena status penduduk tidak aktif' });
      }
    }

    const match = await bcrypt.compare(password, warga.password);
    if (!match) return res.json({ ok: false, msg: 'Password salah' });

    const token = jwt.sign(
      { id: warga.id, nik: warga.nik, nama: warga.nama, tipe: 'warga' },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.json({ ok: true, token, warga: { id: warga.id, nik: warga.nik, nama: warga.nama, no_hp: warga.no_hp } });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Gagal login', error: err.message });
  }
});

// ── GET /api/warga/profil ── (butuh token)
router.get('/profil', verifyWarga, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pendidikan, pekerjaan, status_kawin, alamat, rt, rw, dusun, status FROM penduduk WHERE nik = ?',
      [req.warga.nik]
    );
    if (rows.length === 0) return res.json({ ok: false, msg: 'Data penduduk tidak ditemukan' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Gagal ambil profil', error: err.message });
  }
});

// ── GET /api/warga/bansos ── cek apakah dapat bansos
router.get('/bansos', verifyWarga, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT pb.id, pb.jumlah, pb.keterangan, pb.created_at,
             b.nama_program, b.tahun, b.deskripsi, b.status as status_program
      FROM penerima_bansos pb
      JOIN bansos b ON pb.bansos_id = b.id
      WHERE pb.nik = ?
      ORDER BY pb.created_at DESC
    `, [req.warga.nik]);
    res.json({ ok: true, data: rows, dapat: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Gagal cek bansos', error: err.message });
  }
});

// ── GET /api/warga/surat ── lihat pengajuan surat milik warga ini
router.get('/surat', verifyWarga, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM pengajuan_surat WHERE nik = ? ORDER BY created_at DESC',
      [req.warga.nik]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Gagal ambil data surat', error: err.message });
  }
});

// ── POST /api/warga/surat ── ajukan surat baru
router.post('/surat', verifyWarga, async (req, res) => {
  try {
    const { jenis_surat, keperluan } = req.body;
    if (!jenis_surat) return res.json({ ok: false, msg: 'Jenis surat wajib dipilih' });

    // Ambil nama dari profil warga
    const [profil] = await pool.execute('SELECT nama FROM penduduk WHERE nik = ?', [req.warga.nik]);
    const nama_pemohon = profil.length > 0 ? profil[0].nama : req.warga.nama;

    // Generate nomor antrian
    const now = new Date();
    const tgl = now.toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' }).replace(/\//g, '');
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM pengajuan_surat WHERE DATE(created_at) = CURDATE()');
    const no = String(count[0].total + 1).padStart(3, '0');
    const nomor_antrian = `ANT/${tgl}/${no}`;

    await pool.execute(
      'INSERT INTO pengajuan_surat (nomor_antrian, tanggal_ajuan, nik, nama_pemohon, jenis_surat, keperluan, status) VALUES (?,CURDATE(),?,?,?,?,?)',
      [nomor_antrian, req.warga.nik, nama_pemohon, jenis_surat, keperluan || '', 'Menunggu']
    );

    res.json({ ok: true, msg: 'Pengajuan surat berhasil dikirim!', nomor_antrian });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Gagal ajukan surat', error: err.message });
  }
});

module.exports = router;