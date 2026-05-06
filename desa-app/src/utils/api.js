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
  login:       (body) => apiFetch('/auth/login',    { method: 'POST', body }),
  register:    (body) => apiFetch('/auth/register', { method: 'POST', body }),
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