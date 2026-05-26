// src/utils/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Ambil token dari sessionStorage
function getToken() {
  try {
    const session = sessionStorage.getItem('desaCikulak_token');
    return session || null;
  } catch (e) { return null; }
}

// Simpan token
export function setToken(token) {
  try { sessionStorage.setItem('desaCikulak_token', token); } catch (e) {}
}

// Hapus token
export function removeToken() {
  try { sessionStorage.removeItem('desaCikulak_token'); } catch (e) {}
}

// Fetch utama dengan token otomatis
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Terjadi kesalahan server');
  return data;
}

// ── AUTH ─────────────────────────────────────────────────
export const authAPI = {
  login:       (body) => apiFetch('/auth/login',       { method: 'POST', body }),
  register:    (body) => apiFetch('/auth/register',    { method: 'POST', body }),
  verifyOTP:   (body) => apiFetch('/auth/verify-otp',  { method: 'POST', body }),
  resendOTP:   (body) => apiFetch('/auth/resend-otp',  { method: 'POST', body }),
  getUsers:    ()     => apiFetch('/auth/users'),
  aktifkan:    (id)   => apiFetch(`/auth/users/${id}/aktifkan`,    { method: 'PATCH' }),
  nonaktifkan: (id)   => apiFetch(`/auth/users/${id}/nonaktifkan`, { method: 'PATCH' }),
  hapusUser:   (id)   => apiFetch(`/auth/users/${id}`,             { method: 'DELETE' }),
};

// ── PENDUDUK ─────────────────────────────────────────────
export const pendudukAPI = {
  getAll:        (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/penduduk${q ? '?' + q : ''}`);
  },
  statistik:     ()            => apiFetch('/penduduk/stats/ringkasan'),
  getRiwayat:    ()            => apiFetch('/penduduk/riwayat/semua'),
  tambahRiwayat: (body)        => apiFetch('/penduduk/riwayat/tambah', { method: 'POST', body }),
  getById:       (id)          => apiFetch(`/penduduk/${id}`),
  tambah:        (body)        => apiFetch('/penduduk',       { method: 'POST',   body }),
  update:        (id, body)    => apiFetch(`/penduduk/${id}`, { method: 'PUT',    body }),
  hapus:         (id)          => apiFetch(`/penduduk/${id}`, { method: 'DELETE' }),
};

// ── SURAT ─────────────────────────────────────────────────
export const suratAPI = {
  getPengajuan:  (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/surat/pengajuan${q ? '?' + q : ''}`);
  },
  ajukan:        (body)        => apiFetch('/surat/pengajuan',        { method: 'POST',  body }),
  updateStatus:  (id, body)    => apiFetch(`/surat/pengajuan/${id}`,  { method: 'PATCH', body }),
  getArsip:      (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/surat/arsip${q ? '?' + q : ''}`);
  },
  tambahArsip:   (body)        => apiFetch('/surat/arsip',            { method: 'POST',   body }),
  hapusArsip:    (id)          => apiFetch(`/surat/arsip/${id}`,      { method: 'DELETE' }),
  statistik:     ()            => apiFetch('/surat/stats/ringkasan'),
};

// ── PENGATURAN ────────────────────────────────────────────
export const pengaturanAPI = {
  get:    ()     => apiFetch('/pengaturan'),
  update: (body) => apiFetch('/pengaturan', { method: 'PUT', body }),
};

// ── HELPERS ───────────────────────────────────────────────
export const formatTanggal = (str) => {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const hitungUmur = (tanggalLahir) => {
  if (!tanggalLahir) return 0;
  const today = new Date();
  const lahir = new Date(tanggalLahir);
  let umur = today.getFullYear() - lahir.getFullYear();
  const m = today.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) umur--;
  return umur;
};

export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const generateNomorSurat = (jenis) => {
  const kode = {
    'Surat Keterangan Domisili': 'SKD',
    'Surat Keterangan Tidak Mampu': 'SKTM',
    'Surat Pengantar KTP': 'KTP',
    'Surat Keterangan Usaha': 'SKU',
    'Surat Keterangan Kelahiran': 'SKL',
    'Surat Keterangan Kematian': 'SKK',
    'Surat Pengantar SKCK': 'SKCK',
    'Surat Keterangan Pindah': 'SKP',
  };
  const k = kode[jenis] || 'SKT';
  const tahun = new Date().getFullYear();
  const nomor = String(Math.floor(Math.random() * 900) + 100);
  return `DS/${k}/${tahun}/${nomor}`;
};

export const kelompokUsia = (penduduk) => {
  const grup = { 'Balita (0-4)': 0, 'Anak (5-14)': 0, 'Remaja (15-24)': 0, 'Dewasa (25-54)': 0, 'Lansia (55+)': 0 };
  penduduk.forEach(p => {
    const u = hitungUmur(p.tanggalLahir);
    if (u <= 4) grup['Balita (0-4)']++;
    else if (u <= 14) grup['Anak (5-14)']++;
    else if (u <= 24) grup['Remaja (15-24)']++;
    else if (u <= 54) grup['Dewasa (25-54)']++;
    else grup['Lansia (55+)']++;
  });
  return Object.entries(grup).map(([label, nilai]) => ({ label, nilai }));
};

export const kelompokPekerjaan = (penduduk) => {
  const map = {};
  penduduk.forEach(p => {
    map[p.pekerjaan] = (map[p.pekerjaan] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([label, nilai]) => ({ label, nilai }));
};

export const kelompokPendidikan = (penduduk) => {
  const map = {};
  penduduk.forEach(p => { map[p.pendidikan] = (map[p.pendidikan] || 0) + 1; });
  return Object.entries(map).map(([label, nilai]) => ({ label, nilai }));
};