import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card, SectionHeader, StatCard, Btn, Alert } from '../components/UI';
import { formatTanggal, hitungUmur, kelompokUsia, kelompokPekerjaan, kelompokPendidikan } from '../utils/helpers';

export default function Laporan() {
  const { state } = useApp();
  const { isKepala } = useAuth();
  const [loadingExport, setLoadingExport] = useState('');

  const { penduduk, arsipSurat, pengajuanSurat } = state;

  const exportLaporanPenduduk = () => {
    if (penduduk.length === 0) { toast.error('Tidak ada data penduduk!'); return; }
    setLoadingExport('penduduk');
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Data lengkap
      const data = penduduk.map((p,i) => ({
        'No': i+1, 'NIK': p.nik, 'No. KK': p.no_kk||'', 'Nama': p.nama,
        'Tempat Lahir': p.tempatLahir, 'Tanggal Lahir': p.tanggalLahir,
        'Umur': hitungUmur(p.tanggalLahir) + ' tahun',
        'Jenis Kelamin': p.jenisKelamin, 'Agama': p.agama,
        'Pendidikan': p.pendidikan, 'Pekerjaan': p.pekerjaan,
        'Status Kawin': p.statusKawin, 'Alamat': p.alamat,
        'RT': p.rt, 'RW': p.rw, 'Dusun': p.dusun,
        'Status': p.status, 'Tanggal Masuk': p.tanggalMasuk,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Data Penduduk');

      // Sheet 2: Statistik
      const stats = [
        { 'Kategori': 'Total Penduduk', 'Jumlah': penduduk.length },
        { 'Kategori': 'Laki-laki', 'Jumlah': penduduk.filter(p=>p.jenisKelamin==='Laki-laki').length },
        { 'Kategori': 'Perempuan', 'Jumlah': penduduk.filter(p=>p.jenisKelamin==='Perempuan').length },
        { 'Kategori': 'Penduduk Baru', 'Jumlah': penduduk.filter(p=>p.status==='Baru').length },
        ...kelompokUsia(penduduk).map(u => ({ 'Kategori': u.label, 'Jumlah': u.nilai })),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stats), 'Statistik');

      const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([buf], { type:'application/octet-stream' }), `Laporan_Penduduk_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Laporan penduduk berhasil didownload! 📥');
    } catch (e) { toast.error('Gagal export: ' + e.message); }
    setLoadingExport('');
  };

  const exportLaporanSurat = () => {
    if (arsipSurat.length === 0) { toast.error('Tidak ada data arsip surat!'); return; }
    setLoadingExport('surat');
    try {
      const wb = XLSX.utils.book_new();
      const data = arsipSurat.map((a,i) => ({
        'No': i+1, 'Nomor Surat': a.nomorSurat, 'Tanggal': formatTanggal(a.tanggal),
        'Jenis Surat': a.jenis, 'Penerima': a.penerima, 'NIK': a.nik||'',
        'Keperluan': a.keperluan||'', 'Dibuat Oleh': a.dibuat||'',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Arsip Surat');

      // Rekap per jenis
      const perJenis = {};
      arsipSurat.forEach(a => { perJenis[a.jenis] = (perJenis[a.jenis]||0) + 1; });
      const rekapJenis = Object.entries(perJenis).map(([j,n]) => ({ 'Jenis Surat': j, 'Jumlah': n }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rekapJenis), 'Rekap per Jenis');

      const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([buf], { type:'application/octet-stream' }), `Laporan_Surat_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Laporan surat berhasil didownload! 📥');
    } catch (e) { toast.error('Gagal export: ' + e.message); }
    setLoadingExport('');
  };

  const exportBackupData = () => {
    if (!isKepala) { toast.error('Hanya admin yang bisa melakukan backup!'); return; }
    setLoadingExport('backup');
    try {
      const wb = XLSX.utils.book_new();

      // Sheet penduduk
      const dataPenduduk = penduduk.map((p,i) => ({
        'No': i+1, 'NIK': p.nik, 'No KK': p.no_kk||'', 'Nama': p.nama,
        'Tempat Lahir': p.tempatLahir, 'Tanggal Lahir': p.tanggalLahir,
        'Jenis Kelamin': p.jenisKelamin, 'Agama': p.agama, 'Pendidikan': p.pendidikan,
        'Pekerjaan': p.pekerjaan, 'Status Kawin': p.statusKawin,
        'Alamat': p.alamat, 'RT': p.rt, 'RW': p.rw, 'Dusun': p.dusun,
        'Status': p.status, 'Tanggal Masuk': p.tanggalMasuk, 'Keterangan': p.keterangan||'',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataPenduduk), 'Penduduk');

      // Sheet arsip surat
      const dataArsip = arsipSurat.map((a,i) => ({
        'No': i+1, 'Nomor Surat': a.nomorSurat, 'Tanggal': a.tanggal,
        'Jenis': a.jenis, 'Penerima': a.penerima, 'NIK': a.nik||'',
        'Keperluan': a.keperluan||'', 'Dibuat': a.dibuat||'',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataArsip), 'Arsip Surat');

      // Sheet pengajuan surat
      const dataPengajuan = pengajuanSurat.map((s,i) => ({
        'No': i+1, 'No Antrian': s.nomorAntrian, 'Tanggal': s.tanggalAjuan,
        'NIK': s.nik, 'Nama Pemohon': s.namaPemohon, 'Jenis Surat': s.jenisSurat,
        'Keperluan': s.keperluan, 'Status': s.status, 'Petugas': s.petugas||'',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataPengajuan), 'Pengajuan Surat');

      const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([buf], { type:'application/octet-stream' }), `BACKUP_Data_Desa_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Backup data berhasil didownload! 💾');
    } catch (e) { toast.error('Gagal backup: ' + e.message); }
    setLoadingExport('');
  };

  const statUsia      = kelompokUsia(penduduk);
  const statPekerjaan = kelompokPekerjaan(penduduk).slice(0,5);
  const statPendidikan = kelompokPendidikan(penduduk);
  const maxPekerjaan  = Math.max(...statPekerjaan.map(s=>s.nilai), 1);
  const maxPendidikan = Math.max(...statPendidikan.map(s=>s.nilai), 1);

  // Rekap surat per bulan
  const rekapSuratBulan = {};
  arsipSurat.forEach(a => {
    if (!a.tanggal) return;
    const key = a.tanggal.substring(0,7);
    rekapSuratBulan[key] = (rekapSuratBulan[key]||0) + 1;
  });
  const rekapBulanArr = Object.entries(rekapSuratBulan).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,6);

  return (
    <div className="page-container">
      <SectionHeader
        title="📊 Laporan & Rekap Data"
        sub="Ringkasan statistik dan export laporan desa"
      />

      {/* Stat utama */}
      <div className="grid-stats" style={{ marginBottom:20 }}>
        <StatCard label="Total Penduduk" value={penduduk.length} color="#1B5EA0" icon="👥" sub="jiwa terdaftar" />
        <StatCard label="Laki-laki" value={penduduk.filter(p=>p.jenisKelamin==='Laki-laki').length} color="#534AB7" icon="👨" />
        <StatCard label="Perempuan" value={penduduk.filter(p=>p.jenisKelamin==='Perempuan').length} color="#993556" icon="👩" />
        <StatCard label="Total Arsip Surat" value={arsipSurat.length} color="#2D6A0F" icon="📋" sub="dokumen tersimpan" />
      </div>

      {/* Export */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>📥 Export Laporan</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:14 }}>

          <div style={{ padding:'16px', background:'#EBF3FC', borderRadius:12, border:'1px solid #B5D4F4' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>👥</div>
            <div style={{ fontWeight:700, marginBottom:4 }}>Laporan Penduduk</div>
            <div style={{ fontSize:12, color:'#718096', marginBottom:12 }}>Data lengkap penduduk + statistik usia, pekerjaan</div>
            <Btn onClick={exportLaporanPenduduk} variant="primary" disabled={loadingExport==='penduduk'} style={{ width:'100%', justifyContent:'center' }}>
              {loadingExport==='penduduk' ? '⏳ Exporting...' : '📥 Download Excel'}
            </Btn>
          </div>

          <div style={{ padding:'16px', background:'#EAF3DE', borderRadius:12, border:'1px solid #B8D98C' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
            <div style={{ fontWeight:700, marginBottom:4 }}>Laporan Surat</div>
            <div style={{ fontSize:12, color:'#718096', marginBottom:12 }}>Arsip surat + rekap per jenis surat</div>
            <Btn onClick={exportLaporanSurat} variant="success" disabled={loadingExport==='surat'} style={{ width:'100%', justifyContent:'center' }}>
              {loadingExport==='surat' ? '⏳ Exporting...' : '📥 Download Excel'}
            </Btn>
          </div>

          {isKepala && (
            <div style={{ padding:'16px', background:'#FAEEDA', borderRadius:12, border:'1px solid #F5CE8A' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>💾</div>
              <div style={{ fontWeight:700, marginBottom:4 }}>Backup Semua Data</div>
              <div style={{ fontSize:12, color:'#718096', marginBottom:12 }}>Backup lengkap semua data desa (hanya admin)</div>
              <Btn onClick={exportBackupData} variant="warning" disabled={loadingExport==='backup'} style={{ width:'100%', justifyContent:'center' }}>
                {loadingExport==='backup' ? '⏳ Backup...' : '💾 Backup Data'}
              </Btn>
            </div>
          )}
        </div>
      </Card>

      {/* Statistik Visual */}
      <div className="grid-2col" style={{ marginBottom:20 }}>
        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>📊 Distribusi Usia</div>
          {statUsia.map(s => (
            <div key={s.label} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span style={{ color:'#4A5568' }}>{s.label}</span>
                <span style={{ fontWeight:700 }}>{s.nilai} jiwa ({penduduk.length ? Math.round(s.nilai/penduduk.length*100) : 0}%)</span>
              </div>
              <div style={{ height:8, background:'#F1F5F9', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${penduduk.length?Math.round(s.nilai/penduduk.length*100):0}%`, background:'#1B5EA0', borderRadius:4 }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>💼 Top 5 Pekerjaan</div>
          {statPekerjaan.map(s => (
            <div key={s.label} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span style={{ color:'#4A5568', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:150 }}>{s.label}</span>
                <span style={{ fontWeight:700 }}>{s.nilai} jiwa</span>
              </div>
              <div style={{ height:8, background:'#F1F5F9', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${Math.round(s.nilai/maxPekerjaan*100)}%`, background:'#534AB7', borderRadius:4 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid-2col">
        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>🎓 Distribusi Pendidikan</div>
          {statPendidikan.map(s => (
            <div key={s.label} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span style={{ color:'#4A5568' }}>{s.label}</span>
                <span style={{ fontWeight:700 }}>{s.nilai} jiwa</span>
              </div>
              <div style={{ height:8, background:'#F1F5F9', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${Math.round(s.nilai/maxPendidikan*100)}%`, background:'#2D6A0F', borderRadius:4 }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>📋 Arsip Surat per Bulan</div>
          {rekapBulanArr.length === 0 ? (
            <div style={{ textAlign:'center', padding:20, color:'#A0AEC0', fontSize:13 }}>Belum ada data arsip</div>
          ) : rekapBulanArr.map(([bulan, jml]) => {
            const maxBulan = Math.max(...rekapBulanArr.map(b=>b[1]), 1);
            const [tahun, bln] = bulan.split('-');
            const namaBulan = new Date(tahun, parseInt(bln)-1).toLocaleDateString('id-ID', { month:'long', year:'numeric' });
            return (
              <div key={bulan} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                  <span style={{ color:'#4A5568' }}>{namaBulan}</span>
                  <span style={{ fontWeight:700 }}>{jml} surat</span>
                </div>
                <div style={{ height:8, background:'#F1F5F9', borderRadius:4 }}>
                  <div style={{ height:'100%', width:`${Math.round(jml/maxBulan*100)}%`, background:'#A0621B', borderRadius:4 }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}