// server/routes/auth.js
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../database');
const config   = require('../config');

// ── MIDDLEWARE ────────────────────────────────────────────

function verifyToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ ok: false, msg: 'Token tidak ditemukan' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    res.status(401).json({ ok: false, msg: 'Token tidak valid atau sudah kadaluarsa' });
  }
}

function onlyKepala(req, res, next) {
  if (req.user?.role !== 'kepala_desa')
    return res.status(403).json({ ok: false, msg: 'Akses ditolak. Hanya Kepala Desa.' });
  next();
}

// ── ROUTES ────────────────────────────────────────────────

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ ok: false, msg: 'Username dan password wajib diisi' });

    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user   = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ ok: false, msg: 'Username atau password salah' });

    if (!user.aktif)
      return res.status(403).json({ ok: false, msg: 'Akun belum diaktifkan oleh admin' });

    const token = jwt.sign(
      { id: user.id, username: user.username, nama: user.nama, role: user.role, jabatan: user.jabatan },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      ok: true, msg: 'Login berhasil', token,
      user: { id: user.id, nama: user.nama, username: user.username, role: user.role, jabatan: user.jabatan, nip: user.nip, no_hp: user.no_hp },
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nama, username, password, konfirmasi, role, jabatan, nip, no_hp } = req.body;

    if (!nama || !username || !password)
      return res.status(400).json({ ok: false, msg: 'Nama, username, dan password wajib diisi' });
    if (password !== konfirmasi)
      return res.status(400).json({ ok: false, msg: 'Konfirmasi password tidak cocok' });
    if (password.length < 6)
      return res.status(400).json({ ok: false, msg: 'Password minimal 6 karakter' });

    const [exist] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (exist.length > 0)
      return res.status(409).json({ ok: false, msg: 'Username sudah digunakan' });

    const hash  = await bcrypt.hash(password, 10);
    const aktif = role === 'perangkat_desa' ? 1 : 0;

    await pool.execute(
      'INSERT INTO users (nama, username, password, role, jabatan, nip, no_hp, aktif) VALUES (?,?,?,?,?,?,?,?)',
      [nama, username, hash, role || 'perangkat_desa', jabatan || '-', nip || '-', no_hp || '-', aktif]
    );

    res.json({
      ok: true,
      msg: aktif ? 'Akun berhasil dibuat! Silakan login.' : 'Akun berhasil dibuat! Menunggu aktivasi oleh Kepala Desa.',
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/auth/users
router.get('/users', verifyToken, onlyKepala, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id,nama,username,role,jabatan,nip,no_hp,aktif,created_at FROM users ORDER BY created_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PATCH /api/auth/users/:id/aktifkan
router.patch('/users/:id/aktifkan', verifyToken, onlyKepala, async (req, res) => {
  try {
    await pool.execute('UPDATE users SET aktif = 1 WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Akun berhasil diaktifkan' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PATCH /api/auth/users/:id/nonaktifkan
router.patch('/users/:id/nonaktifkan', verifyToken, onlyKepala, async (req, res) => {
  try {
    await pool.execute('UPDATE users SET aktif = 0 WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Akun berhasil dinonaktifkan' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// DELETE /api/auth/users/:id
router.delete('/users/:id', verifyToken, onlyKepala, async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ ok: true, msg: 'Akun berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = { router, verifyToken, onlyKepala };