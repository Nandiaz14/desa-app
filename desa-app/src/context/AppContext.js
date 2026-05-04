import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pendudukAPI, suratAPI, pengaturanAPI } from '../utils/api';

const AppContext = createContext();

export const WILAYAH = {
  'Dusun 1': { rw: '001', rtList: ['001','002','003','004','005','006'] },
  'Dusun 2': { rw: '002', rtList: ['007','008','009','010'] },
  'Dusun 3': { rw: '003', rtList: ['011','012','013','014'] },
  'Dusun 4': { rw: '004', rtList: ['015','016','017','018','019'] },
  'Dusun 5': { rw: '005', rtList: ['020','021','022','023','024'] },
};

export const DUSUN_LIST = ['Dusun 1','Dusun 2','Dusun 3','Dusun 4','Dusun 5'];

const DEFAULT_TEMPLATE = {
  'Surat Keterangan Domisili':    { judul:'SURAT KETERANGAN DOMISILI',    kodePrefix:'DS/SKD',    isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], menerangkan bahwa orang yang tersebut di bawah ini:\n\n[DATA_WARGA]\n\nadalah benar-benar warga yang berdomisili di wilayah Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN].\n\nSurat keterangan ini dibuat untuk keperluan: [KEPERLUAN].\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
  'Surat Keterangan Tidak Mampu': { judul:'SURAT KETERANGAN TIDAK MAMPU', kodePrefix:'DS/SKTM',   isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], dengan ini menerangkan bahwa:\n\n[DATA_WARGA]\n\nadalah benar-benar warga tidak mampu yang tercatat di wilayah Desa [NAMA_DESA].\n\nSurat keterangan ini dibuat untuk keperluan: [KEPERLUAN].\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
  'Surat Pengantar KTP':          { judul:'SURAT PENGANTAR KTP',          kodePrefix:'DS/SPKTP',  isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], dengan ini memberikan pengantar kepada:\n\n[DATA_WARGA]\n\nuntuk keperluan: [KEPERLUAN].\n\nKepada instansi terkait agar kiranya dapat memberikan pelayanan sebagaimana mestinya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
  'Surat Keterangan Usaha':       { judul:'SURAT KETERANGAN USAHA',       kodePrefix:'DS/SKU',    isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], menerangkan bahwa:\n\n[DATA_WARGA]\n\nadalah benar-benar warga kami yang menjalankan usaha di wilayah Desa [NAMA_DESA].\n\nSurat keterangan ini dibuat untuk keperluan: [KEPERLUAN].\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
  'Surat Keterangan Kelahiran':   { judul:'SURAT KETERANGAN KELAHIRAN',   kodePrefix:'DS/SKL',    isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], menerangkan bahwa:\n\n[DATA_WARGA]\n\ntelah lahir seorang anak di wilayah Desa [NAMA_DESA].\n\nSurat keterangan ini dibuat untuk keperluan: [KEPERLUAN].\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
  'Surat Keterangan Kematian':    { judul:'SURAT KETERANGAN KEMATIAN',    kodePrefix:'DS/SKKM',   isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], menerangkan bahwa:\n\n[DATA_WARGA]\n\ntelah meninggal dunia di wilayah Desa [NAMA_DESA].\n\nSurat keterangan ini dibuat untuk keperluan: [KEPERLUAN].\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
  'Surat Pengantar SKCK':         { judul:'SURAT PENGANTAR SKCK',         kodePrefix:'DS/SPSKCK', isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], dengan ini memberikan pengantar kepada:\n\n[DATA_WARGA]\n\nuntuk mengurus Surat Keterangan Catatan Kepolisian (SKCK) dengan keperluan: [KEPERLUAN].\n\nKepada pihak Kepolisian agar kiranya dapat memberikan pelayanan sebagaimana mestinya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
  'Surat Keterangan Pindah':      { judul:'SURAT KETERANGAN PINDAH',      kodePrefix:'DS/SKP',    isi:'Yang bertanda tangan di bawah ini, Kepala Desa [NAMA_DESA], Kecamatan [KECAMATAN], Kabupaten [KABUPATEN], menerangkan bahwa:\n\n[DATA_WARGA]\n\nadalah benar-benar warga kami yang akan pindah domisili dengan keperluan: [KEPERLUAN].\n\nDemikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.', penutup:'Hormat kami,\nKepala Desa [NAMA_DESA]' },
};

export function AppProvider({ children }) {
  const [penduduk,         setPenduduk]         = useState([]);
  const [riwayatPerubahan, setRiwayatPerubahan] = useState([]);
  const [pengajuanSurat,   setPengajuanSurat]   = useState([]);
  const [arsipSurat,       setArsipSurat]       = useState([]);
  const [pengaturanDesa,   setPengaturanDesa]   = useState({
    namaDesa:'Cikulak', kecamatan:'Waled', kabupaten:'Cirebon',
    provinsi:'Jawa Barat', kodePos:'45188', alamat:'Jl. Cikulak No. 1',
    telp:'-', kepalaDesa:'H. Edi Purnama, S.AP.M.Si', nip:'-', sekretaris:'-',
  });
  const [templateSurat, setTemplateSurat] = useState(() => {
    try {
      const saved = localStorage.getItem('desaCikulak_template');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATE;
    } catch (e) { return DEFAULT_TEMPLATE; }
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error,       setError]       = useState('');

  // ── LOAD SEMUA DATA DARI API ──────────────────────────────
  const loadAll = useCallback(async () => {
    setLoadingData(true);
    setError('');
    try {
      const [p, r, s, a, pg] = await Promise.all([
        pendudukAPI.getAll(),
        pendudukAPI.getRiwayat(),
        suratAPI.getPengajuan(),
        suratAPI.getArsip(),
        pengaturanAPI.get(),
      ]);
      // Format data dari MySQL ke format yang dipakai React
      setPenduduk((p.data||[]).map(formatPenduduk));
      setRiwayatPerubahan((r.data||[]).map(formatRiwayat));
      setPengajuanSurat((s.data||[]).map(formatSurat));
      setArsipSurat((a.data||[]).map(formatArsip));
      if (pg.data) setPengaturanDesa(formatPengaturan(pg.data));
    } catch (err) {
      setError('Gagal memuat data. Pastikan server backend berjalan di port 5000.');
    }
    setLoadingData(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── FORMAT DATA MySQL → React ────────────────────────────
  const formatPenduduk = p => ({
    id: p.id, nik: p.nik, nama: p.nama,
    tempatLahir: p.tempat_lahir, tanggalLahir: p.tanggal_lahir?.split('T')[0]||p.tanggal_lahir,
    jenisKelamin: p.jenis_kelamin, agama: p.agama, pendidikan: p.pendidikan,
    pekerjaan: p.pekerjaan, statusKawin: p.status_kawin, alamat: p.alamat,
    rt: p.rt, rw: p.rw, dusun: p.dusun, status: p.status,
    tanggalMasuk: p.tanggal_masuk?.split('T')[0]||p.tanggal_masuk,
    keterangan: p.keterangan||'',
  });

  const formatRiwayat = r => ({
    id: r.id, tanggal: r.tanggal?.split('T')[0]||r.tanggal,
    jenis: r.jenis, nik: r.nik, nama: r.nama, keterangan: r.keterangan||'',
  });

  const formatSurat = s => ({
    id: s.id, nomorAntrian: s.nomor_antrian,
    tanggalAjuan: s.tanggal_ajuan?.split('T')[0]||s.tanggal_ajuan,
    nik: s.nik, namaPemohon: s.nama_pemohon, jenisSurat: s.jenis_surat,
    keperluan: s.keperluan, status: s.status,
    tanggalSelesai: s.tanggal_selesai?.split('T')[0]||s.tanggal_selesai||'',
    petugas: s.petugas||'', catatan: s.catatan||'',
  });

  const formatArsip = a => ({
    id: a.id, nomorSurat: a.nomor_surat,
    tanggal: a.tanggal?.split('T')[0]||a.tanggal,
    jenis: a.jenis, penerima: a.penerima, nik: a.nik,
    keperluan: a.keperluan, dibuat: a.dibuat, file: a.file,
  });

  const formatPengaturan = pg => ({
    namaDesa: pg.nama_desa, kecamatan: pg.kecamatan, kabupaten: pg.kabupaten,
    provinsi: pg.provinsi, kodePos: pg.kode_pos, alamat: pg.alamat,
    telp: pg.telp, kepalaDesa: pg.kepala_desa, nip: pg.nip, sekretaris: pg.sekretaris,
  });

  // ── FORMAT React → MySQL ─────────────────────────────────
  const toApiPenduduk = f => ({
    nik: f.nik, nama: f.nama, tempat_lahir: f.tempatLahir,
    tanggal_lahir: f.tanggalLahir, jenis_kelamin: f.jenisKelamin,
    agama: f.agama, pendidikan: f.pendidikan, pekerjaan: f.pekerjaan,
    status_kawin: f.statusKawin, alamat: f.alamat, rt: f.rt, rw: f.rw,
    dusun: f.dusun, status: f.status, tanggal_masuk: f.tanggalMasuk,
    keterangan: f.keterangan||'',
  });

  // ── DISPATCH (mirip reducer lama) ────────────────────────
  const dispatch = async (action) => {
    try {
      switch (action.type) {

        // PENDUDUK
        case 'TAMBAH_PENDUDUK': {
          const res = await pendudukAPI.tambah(toApiPenduduk(action.payload));
          setPenduduk(prev => [...prev, formatPenduduk(res.data)].sort(sortPenduduk));
          break;
        }
        case 'UPDATE_PENDUDUK': {
          const res = await pendudukAPI.update(action.payload.id, toApiPenduduk(action.payload));
          setPenduduk(prev => prev.map(p => p.id===action.payload.id ? formatPenduduk(res.data) : p).sort(sortPenduduk));
          break;
        }
        case 'HAPUS_PENDUDUK': {
          await pendudukAPI.hapus(action.payload);
          setPenduduk(prev => prev.filter(p => p.id !== action.payload));
          break;
        }

        // RIWAYAT
        case 'TAMBAH_RIWAYAT': {
          const p = action.payload;
          const res = await pendudukAPI.tambahRiwayat({
            tanggal: p.tanggal, jenis: p.jenis, nik: p.nik||'-', nama: p.nama, keterangan: p.keterangan||'',
          });
          setRiwayatPerubahan(prev => [formatRiwayat(res.data), ...prev]);
          break;
        }

        // SURAT
        case 'TAMBAH_PENGAJUAN': {
          const p = action.payload;
          const res = await suratAPI.ajukan({
            nik: p.nik, nama_pemohon: p.namaPemohon, jenis_surat: p.jenisSurat,
            keperluan: p.keperluan, tanggal_ajuan: p.tanggalAjuan, catatan: p.catatan||'',
          });
          setPengajuanSurat(prev => [formatSurat(res.data), ...prev]);
          break;
        }
        case 'UPDATE_PENGAJUAN': {
          const p = action.payload;
          const res = await suratAPI.updateStatus(p.id, {
            status: p.status, petugas: p.petugas||'',
            catatan: p.catatan||'', tanggal_selesai: p.tanggalSelesai||null,
          });
          setPengajuanSurat(prev => prev.map(s => s.id===p.id ? formatSurat(res.data) : s));
          // Reload arsip jika selesai (arsip otomatis dibuat di backend)
          if (p.status === 'Selesai') {
            const arsipRes = await suratAPI.getArsip();
            setArsipSurat((arsipRes.data||[]).map(formatArsip));
          }
          break;
        }

        // ARSIP
        case 'TAMBAH_ARSIP': {
          const p = action.payload;
          const res = await suratAPI.tambahArsip({
            nomor_surat: p.nomorSurat, tanggal: p.tanggal, jenis: p.jenis,
            penerima: p.penerima, nik: p.nik||'', keperluan: p.keperluan||'', dibuat: p.dibuat||'',
          });
          setArsipSurat(prev => [formatArsip(res.data), ...prev]);
          break;
        }
        case 'HAPUS_ARSIP': {
          await suratAPI.hapusArsip(action.payload);
          setArsipSurat(prev => prev.filter(a => a.id !== action.payload));
          break;
        }

        // PENGATURAN DESA
        case 'UPDATE_PENGATURAN_DESA': {
          const p = action.payload;
          await pengaturanAPI.update({
            nama_desa: p.namaDesa, kecamatan: p.kecamatan, kabupaten: p.kabupaten,
            provinsi: p.provinsi, kode_pos: p.kodePos, alamat: p.alamat,
            telp: p.telp, kepala_desa: p.kepalaDesa, nip: p.nip, sekretaris: p.sekretaris,
          });
          setPengaturanDesa(p);
          break;
        }

        // TEMPLATE SURAT (tetap localStorage karena tidak ada di DB)
        case 'UPDATE_TEMPLATE_SURAT': {
          const updated = {
            ...templateSurat,
            [action.payload.jenis]: { ...templateSurat[action.payload.jenis], ...action.payload.data },
          };
          setTemplateSurat(updated);
          localStorage.setItem('desaCikulak_template', JSON.stringify(updated));
          break;
        }

        default: break;
      }
    } catch (err) {
      alert('❌ Error: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Urut penduduk: dusun → RT → nama
  const sortPenduduk = (a, b) => {
    const da = DUSUN_LIST.indexOf(a.dusun);
    const db = DUSUN_LIST.indexOf(b.dusun);
    if (da !== db) return da - db;
    if (parseInt(a.rt) !== parseInt(b.rt)) return parseInt(a.rt) - parseInt(b.rt);
    return a.nama.localeCompare(b.nama);
  };

  const state = {
    penduduk: [...penduduk].sort(sortPenduduk),
    riwayatPerubahan,
    pengajuanSurat,
    arsipSurat,
    pengaturanDesa,
    templateSurat,
  };

  return (
    <AppContext.Provider value={{ state, dispatch, loadingData, error, reload: loadAll }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }