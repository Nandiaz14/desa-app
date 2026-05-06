// server/server.js
const express  = require('express');
const cors     = require('cors');
const config   = require('./config');
const { initDatabase } = require('./database');

const { router: authRouter } = require('./routes/auth');
const pendudukRouter         = require('./routes/penduduk');
const suratRouter            = require('./routes/surat');
const pengaturanRouter       = require('./routes/pengaturan');

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://desa-app-psi.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.url}`);
  next();
});

// ── ROUTES ────────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/penduduk',   pendudukRouter);
app.use('/api/surat',      suratRouter);
app.use('/api/pengaturan', pengaturanRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'Server Desa Cikulak berjalan normal ✅', time: new Date().toLocaleString('id-ID') });
});

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, msg: `Route ${req.url} tidak ditemukan` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ ok: false, msg: 'Terjadi kesalahan server', error: err.message });
});

// ── START ─────────────────────────────────────────────────
async function startServer() {
  await initDatabase(); // Buat database + tabel + seed data

  app.listen(config.server.port, () => {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   🏛  Sistem Informasi Desa Cikulak          ║');
    console.log('║   Node.js + Express.js + MySQL               ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║   ✅  Server: http://localhost:${config.server.port}           ║`);
    console.log('║   📋  Endpoints:                             ║');
    console.log('║       POST   /api/auth/login                 ║');
    console.log('║       POST   /api/auth/register              ║');
    console.log('║       GET    /api/penduduk                   ║');
    console.log('║       POST   /api/penduduk                   ║');
    console.log('║       PUT    /api/penduduk/:id               ║');
    console.log('║       DELETE /api/penduduk/:id               ║');
    console.log('║       GET    /api/surat/pengajuan            ║');
    console.log('║       GET    /api/surat/arsip                ║');
    console.log('║       GET    /api/pengaturan                 ║');
    console.log('╚══════════════════════════════════════════════╝');
  });
}

startServer();
module.exports = app;