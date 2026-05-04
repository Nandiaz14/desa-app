# Sistem Informasi Desa — UTS

Aplikasi web manajemen administrasi kantor desa berbasis React.

---

## Struktur Proyek

```
desa-app/
├── public/
│   └── index.html
└── src/
    ├── context/
    │   └── AppContext.js      ← State Management (Context API + useReducer)
    ├── utils/
    │   └── helpers.js         ← Fungsi bantu (format tanggal, hitung umur, statistik)
    ├── components/
    │   └── UI.js              ← Komponen UI reusable (Badge, Modal, Table, dll)
    ├── pages/
    │   ├── Dashboard.js       ← Halaman ringkasan & overview
    │   ├── DataPenduduk.js    ← Manajemen data warga (Masalah 1,2,3,4,14)
    │   └── SuratMenyurat.js   ← Surat & arsip digital (Masalah 5,6,12,13)
    ├── App.js                 ← Root component + navigasi sidebar
    └── index.js               ← Entry point React
```

---

## Masalah yang Diselesaikan (UTS)

### Kelompok 1 — Data Penduduk
| No | Masalah | Solusi |
|----|---------|--------|
| 1 | Pendataan warga masih manual (Excel) | Form input digital terpusat |
| 2 | Sulit mencari data warga | Pencarian NIK, nama, pekerjaan + filter RT |
| 3 | Sulit memantau penduduk baru masuk | Tab riwayat perubahan + badge penduduk baru |
| 4 | Data tidak sinkron (lahir/mati/pindah) | Modul catat perubahan penduduk |
| 14 | Tidak ada statistik/visualisasi data | Grafik usia, pekerjaan, pendidikan |

### Kelompok 2 — Surat Menyurat & Arsip
| No | Masalah | Solusi |
|----|---------|--------|
| 5 | Arsip fisik berisiko hilang | Arsip digital surat dengan pencarian |
| 6 | Tidak ada monitoring pengajuan surat | Sistem antrian + update status real-time |
| 12 | Pembuatan surat ketik ulang data | Autofill data warga dari NIK + preview surat |
| 13 | Tidak ada arsip surat lama | Modul arsip digital + pencarian nomor surat |

---

## Fitur Teknis

- **React 18** — Frontend Framework
- **Context API + useReducer** — State Management
- **ES6+** — Arrow function, destructuring, spread, template literal
- **Responsive** — CSS Grid & Flexbox
- **CSS Variables** — Dark mode otomatis
- **Component-based** — Komponen UI reusable

---

## Cara Menjalankan

```bash
cd desa-app
npm install
npm start
```

Buka browser di `http://localhost:3000`

---

## Rencana UAS

### Kelompok 3 — Bantuan Sosial (Masalah 8, 9)
### Kelompok 4 — Fasilitas Desa (Masalah 10, 16)
### Kelompok 5 — Laporan & Sistem (Masalah 7, 11, 15)

---

Instansi: Kantor Desa Contoh, Kec. Purwokerto, Kab. Banyumas
