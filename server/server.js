const express  = require('express');
const cors     = require('cors');
const config   = require('./config');
const { initDatabase } = require('./database');

const { router: authRouter } = require('./routes/auth');
const pendudukRouter         = require('./routes/penduduk');
const suratRouter            = require('./routes/surat');
const pengaturanRouter       = require('./routes/pengaturan');
const bansosRouter           = require('./routes/bansos');
const fasilitasRouter        = require('./routes/fasilitas');

const app = express();

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

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth',       authRouter);
app.use('/api/penduduk',   pendudukRouter);
app.use('/api/surat',      suratRouter);
app.use('/api/pengaturan', pengaturanRouter);
app.use('/api/bansos',     bansosRouter);
app.use('/api/fasilitas',  fasilitasRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'Server Desa Cikulak berjalan normal ✅', time: new Date().toLocaleString('id-ID') });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, msg: `Route ${req.url} tidak ditemukan` });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ ok: false, msg: 'Terjadi kesalahan server', error: err.message });
});

async function startServer() {
  await initDatabase();
  app.listen(config.server.port, () => {
    console.log(`✅ Server berjalan di port ${config.server.port}`);
  });
}

startServer();
module.exports = app;