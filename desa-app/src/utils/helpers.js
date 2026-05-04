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
  const urutan = ['SD', 'SMP', 'SMA', 'SMK', 'D3', 'S1', 'S2', 'S3', 'Tidak Sekolah'];
  const map = {};
  penduduk.forEach(p => { map[p.pendidikan] = (map[p.pendidikan] || 0) + 1; });
  return Object.entries(map).map(([label, nilai]) => ({ label, nilai }));
};
