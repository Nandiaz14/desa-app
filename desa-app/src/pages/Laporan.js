import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const desa = state.pengaturanDesa || {};

  // ── HELPER HEADER PDF ─────────────────────────────────
  const addHeaderPDF = (doc, judul) => {
    const pageW = doc.internal.pageSize.getWidth();

    // Background header
    doc.setFillColor(27, 94, 160);
    doc.rect(0, 0, pageW, 38, 'F');

    // Judul
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`PEMERINTAH DESA ${(desa.namaDesa||'CIKULAK').toUpperCase()}`, pageW/2, 12, { align:'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kec. ${desa.kecamatan||'Waled'} · Kab. ${desa.kabupaten||'Cirebon'} · ${desa.provinsi||'Jawa Barat'}`, pageW/2, 20, { align:'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(judul, pageW/2, 30, { align:'center' });

    // Garis
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(14, 35, pageW-14, 35);

    // Info tanggal
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const tgl = new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
    doc.text(`Dicetak: ${tgl}`, 14, 46);
    doc.text(`Kepala Desa: ${desa.kepalaDesa||'-'}`, pageW-14, 46, { align:'right' });

    return 52; // return Y position setelah header
  };

  // ── FOOTER PDF ────────────────────────────────────────
  const addFooterPDF = (doc) => {
    const pageW  = doc.internal.pageSize.getWidth();
    const pageH  = doc.internal.pageSize.getHeight();
    const pages  = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFillColor(245, 247, 250);
      doc.rect(0, pageH-14, pageW, 14, 'F');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(`Sistem Informasi Desa ${desa.namaDesa||'Cikulak'} © ${new Date().getFullYear()}`, 14, pageH-5);
      doc.text(`Halaman ${i} dari ${pages}`, pageW-14, pageH-5, { align:'right' });
    }
  };

  // ── EXPORT PDF PENDUDUK ───────────────────────────────
  const exportPDFPenduduk = () => {
    if (penduduk.length === 0) { toast.error('Tidak ada data penduduk!'); return; }
    setLoadingExport('pdf-penduduk');
    try {
      const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
      let y = addHeaderPDF(doc, 'LAPORAN DATA PENDUDUK');

      // Ringkasan statistik
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('RINGKASAN DATA', 14, y);
      y += 6;

      const stats = [
        ['Total Penduduk', `${penduduk.length} jiwa`],
        ['Laki-laki', `${penduduk.filter(p=>p.jenisKelamin==='Laki-laki').length} jiwa`],
        ['Perempuan', `${penduduk.filter(p=>p.jenisKelamin==='Perempuan').length} jiwa`],
        ['Penduduk Baru', `${penduduk.filter(p=>p.status==='Baru').length} jiwa`],
      ];

      autoTable(doc, {
        startY: y,
        head: [['Kategori', 'Jumlah']],
        body: stats,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 40, halign: 'center' } },
        margin: { left: 14 },
        tableWidth: 100,
      });

      y = doc.lastAutoTable.finalY + 8;

      // Per dusun
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('PENDUDUK PER DUSUN', 120, doc.lastAutoTable.finalY - (doc.lastAutoTable.finalY - y + 8) + 6);

      const dusunData = ['Dusun 1','Dusun 2','Dusun 3','Dusun 4','Dusun 5'].map(d => [
        d,
        penduduk.filter(p=>p.dusun===d && p.jenisKelamin==='Laki-laki').length,
        penduduk.filter(p=>p.dusun===d && p.jenisKelamin==='Perempuan').length,
        penduduk.filter(p=>p.dusun===d).length,
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY - (doc.lastAutoTable.finalY - y + 8) + 12,
        head: [['Dusun', 'L', 'P', 'Total']],
        body: dusunData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0:{cellWidth:30}, 1:{cellWidth:15,halign:'center'}, 2:{cellWidth:15,halign:'center'}, 3:{cellWidth:20,halign:'center',fontStyle:'bold'} },
        margin: { left: 120 },
        tableWidth: 85,
      });

      y = Math.max(doc.lastAutoTable.finalY, y) + 8;

      // Tabel data lengkap
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('DATA PENDUDUK LENGKAP', 14, y);
      y += 4;

      const tableData = penduduk.map((p, i) => [
        i + 1,
        p.nik,
        p.nama,
        `${p.tempatLahir||''}, ${formatTanggal(p.tanggalLahir)}`,
        p.jenisKelamin,
        p.pendidikan,
        p.pekerjaan,
        `RT ${p.rt}/RW ${p.rw}`,
        p.dusun,
        p.status,
      ]);

      autoTable(doc, {
        startY: y,
        head: [['No','NIK','Nama','TTL','JK','Pendidikan','Pekerjaan','RT/RW','Dusun','Status']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 249, 255] },
        columnStyles: {
          0: { cellWidth: 8,  halign: 'center' },
          1: { cellWidth: 32, font: 'courier', fontSize: 7 },
          2: { cellWidth: 35 },
          3: { cellWidth: 32 },
          4: { cellWidth: 14, halign: 'center' },
          5: { cellWidth: 20 },
          6: { cellWidth: 28 },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 18 },
          9: { cellWidth: 16, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      });

      addFooterPDF(doc);
      doc.save(`Laporan_Penduduk_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF laporan penduduk berhasil didownload! 📄');
    } catch (e) { toast.error('Gagal export PDF: ' + e.message); }
    setLoadingExport('');
  };

  // ── EXPORT PDF SURAT ──────────────────────────────────
  const exportPDFSurat = () => {
    if (arsipSurat.length === 0) { toast.error('Tidak ada data arsip surat!'); return; }
    setLoadingExport('pdf-surat');
    try {
      const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      let y = addHeaderPDF(doc, 'LAPORAN ARSIP SURAT');

      // Rekap per jenis
      const perJenis = {};
      arsipSurat.forEach(a => { perJenis[a.jenis] = (perJenis[a.jenis]||0) + 1; });
      const rekapData = Object.entries(perJenis).map(([j,n]) => [j, n]);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('REKAP PER JENIS SURAT', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Jenis Surat', 'Jumlah']],
        body: rekapData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 8;

      // Tabel arsip lengkap
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('DAFTAR ARSIP SURAT', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['No','Nomor Surat','Tanggal','Jenis Surat','Penerima','Keperluan','Dibuat Oleh']],
        body: arsipSurat.map((a,i) => [
          i+1, a.nomorSurat, formatTanggal(a.tanggal),
          a.jenis, a.penerima, a.keperluan||'-', a.dibuat||'-',
        ]),
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 249, 255] },
        columnStyles: {
          0: { cellWidth: 8,  halign: 'center' },
          1: { cellWidth: 35, font: 'courier', fontSize: 7.5 },
          2: { cellWidth: 28 },
          3: { cellWidth: 45 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
          6: { cellWidth: 25 },
        },
        margin: { left: 14, right: 14 },
      });

      addFooterPDF(doc);
      doc.save(`Laporan_Surat_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF laporan surat berhasil didownload! 📄');
    } catch (e) { toast.error('Gagal export PDF: ' + e.message); }
    setLoadingExport('');
  };

  // ── EXPORT PDF REKAP LENGKAP (admin) ─────────────────
  const exportPDFRekap = () => {
    if (!isKepala) { toast.error('Hanya admin yang bisa export rekap!'); return; }
    setLoadingExport('pdf-rekap');
    try {
      const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      let y = addHeaderPDF(doc, 'REKAP DATA ADMINISTRASI DESA');

      // Statistik utama
      const statsUtama = [
        ['Total Penduduk',   `${penduduk.length} jiwa`],
        ['Laki-laki',        `${penduduk.filter(p=>p.jenisKelamin==='Laki-laki').length} jiwa`],
        ['Perempuan',        `${penduduk.filter(p=>p.jenisKelamin==='Perempuan').length} jiwa`],
        ['Total Arsip Surat',`${arsipSurat.length} surat`],
        ['Surat Menunggu',   `${pengajuanSurat.filter(s=>s.status==='Menunggu').length} surat`],
        ['Surat Selesai',    `${pengajuanSurat.filter(s=>s.status==='Selesai').length} surat`],
      ];

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('STATISTIK UTAMA', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Kategori', 'Data']],
        body: statsUtama,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 8;

      // Distribusi usia
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('DISTRIBUSI USIA PENDUDUK', 14, y);
      y += 4;

      const usiaData = kelompokUsia(penduduk).map(u => [
        u.label, u.nilai,
        `${penduduk.length ? Math.round(u.nilai/penduduk.length*100) : 0}%`
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Kelompok Usia', 'Jumlah (jiwa)', 'Persentase']],
        body: usiaData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 8;

      // Distribusi pekerjaan
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 94, 160);
      doc.text('DISTRIBUSI PEKERJAAN (TOP 10)', 14, y);
      y += 4;

      const pekerjaanData = kelompokPekerjaan(penduduk).slice(0,10).map(p => [
        p.label, p.nilai,
        `${penduduk.length ? Math.round(p.nilai/penduduk.length*100) : 0}%`
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Pekerjaan', 'Jumlah (jiwa)', 'Persentase']],
        body: pekerjaanData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [27, 94, 160], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 249, 255] },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 },
      });

      // Tanda tangan
      y = doc.lastAutoTable.finalY + 16;
      if (y > 230) { doc.addPage(); y = 20; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      const tglTtd = new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
      doc.text(`${desa.namaDesa||'Cikulak'}, ${tglTtd}`, pageW - 14, y, { align:'right' });
      y += 6;
      doc.text(`Kepala Desa ${desa.namaDesa||'Cikulak'}`, pageW - 14, y, { align:'right' });
      y += 24;
      doc.setFont('helvetica', 'bold');
      doc.text(desa.kepalaDesa||'_______________', pageW - 14, y, { align:'right' });

      addFooterPDF(doc);
      doc.save(`Rekap_Data_Desa_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF rekap data berhasil didownload! 📄');
    } catch (e) { toast.error('Gagal export PDF: ' + e.message); }
    setLoadingExport('');
  };

  // ── EXPORT EXCEL ──────────────────────────────────────
  const exportExcelPenduduk = () => {
    if (penduduk.length === 0) { toast.error('Tidak ada data penduduk!'); return; }
    setLoadingExport('excel-penduduk');
    try {
      const wb = XLSX.utils.book_new();
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
      const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([buf], { type:'application/octet-stream' }), `Laporan_Penduduk_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel laporan penduduk berhasil didownload! 📥');
    } catch (e) { toast.error('Gagal export: ' + e.message); }
    setLoadingExport('');
  };

  const exportExcelSurat = () => {
    if (arsipSurat.length === 0) { toast.error('Tidak ada data arsip surat!'); return; }
    setLoadingExport('excel-surat');
    try {
      const wb = XLSX.utils.book_new();
      const data = arsipSurat.map((a,i) => ({
        'No': i+1, 'Nomor Surat': a.nomorSurat, 'Tanggal': formatTanggal(a.tanggal),
        'Jenis Surat': a.jenis, 'Penerima': a.penerima, 'NIK': a.nik||'',
        'Keperluan': a.keperluan||'', 'Dibuat Oleh': a.dibuat||'',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Arsip Surat');
      const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([buf], { type:'application/octet-stream' }), `Laporan_Surat_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel laporan surat berhasil didownload! 📥');
    } catch (e) { toast.error('Gagal export: ' + e.message); }
    setLoadingExport('');
  };

  const exportBackup = () => {
    if (!isKepala) { toast.error('Hanya admin yang bisa backup!'); return; }
    setLoadingExport('backup');
    try {
      const wb = XLSX.utils.book_new();
      const dataPenduduk = penduduk.map((p,i) => ({ 'No':i+1, 'NIK':p.nik, 'Nama':p.nama, 'Dusun':p.dusun, 'RT':p.rt, 'RW':p.rw, 'Status':p.status }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataPenduduk), 'Penduduk');
      const dataArsip = arsipSurat.map((a,i) => ({ 'No':i+1, 'Nomor':a.nomorSurat, 'Jenis':a.jenis, 'Penerima':a.penerima }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataArsip), 'Arsip Surat');
      const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([buf], { type:'application/octet-stream' }), `BACKUP_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Backup berhasil! 💾');
    } catch (e) { toast.error('Gagal backup: ' + e.message); }
    setLoadingExport('');
  };

  const statUsia       = kelompokUsia(penduduk);
  const statPekerjaan  = kelompokPekerjaan(penduduk).slice(0,5);
  const statPendidikan = kelompokPendidikan(penduduk);
  const maxPekerjaan   = Math.max(...statPekerjaan.map(s=>s.nilai), 1);
  const maxPendidikan  = Math.max(...statPendidikan.map(s=>s.nilai), 1);

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
        <StatCard label="Total Penduduk"   value={penduduk.length}    color="#1B5EA0" icon="👥" sub="jiwa terdaftar" />
        <StatCard label="Laki-laki"        value={penduduk.filter(p=>p.jenisKelamin==='Laki-laki').length}  color="#534AB7" icon="👨" />
        <StatCard label="Perempuan"        value={penduduk.filter(p=>p.jenisKelamin==='Perempuan').length}  color="#993556" icon="👩" />
        <StatCard label="Total Arsip Surat" value={arsipSurat.length} color="#2D6A0F" icon="📋" sub="dokumen tersimpan" />
      </div>

      {/* Export Section */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>📥 Export Laporan</div>
        <div style={{ fontSize:13, color:'#718096', marginBottom:20 }}>Pilih format dan jenis laporan yang ingin didownload</div>

        {/* Laporan Penduduk */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#4A5568', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>👥</span> Laporan Data Penduduk
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:10 }}>
            <div style={{ padding:'14px 16px', background:'#EBF3FC', borderRadius:12, border:'1px solid #B5D4F4', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:12, color:'#1B5EA0', fontWeight:600 }}>📊 Format Excel</div>
              <div style={{ fontSize:11, color:'#718096' }}>Data lengkap + statistik</div>
              <Btn onClick={exportExcelPenduduk} variant="primary" size="sm" disabled={loadingExport==='excel-penduduk'} style={{ justifyContent:'center' }}>
                {loadingExport==='excel-penduduk' ? '⏳...' : '📥 Download Excel'}
              </Btn>
            </div>
            <div style={{ padding:'14px 16px', background:'#FCEBEB', borderRadius:12, border:'1px solid #F7C1C1', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:12, color:'#C0392B', fontWeight:600 }}>📄 Format PDF</div>
              <div style={{ fontSize:11, color:'#718096' }}>Tabel formal + kop desa</div>
              <Btn onClick={exportPDFPenduduk} variant="danger" size="sm" disabled={loadingExport==='pdf-penduduk'} style={{ justifyContent:'center' }}>
                {loadingExport==='pdf-penduduk' ? '⏳...' : '📄 Download PDF'}
              </Btn>
            </div>
          </div>
        </div>

        {/* Laporan Surat */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#4A5568', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>📋</span> Laporan Arsip Surat
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:10 }}>
            <div style={{ padding:'14px 16px', background:'#EAF3DE', borderRadius:12, border:'1px solid #B8D98C', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:12, color:'#2D6A0F', fontWeight:600 }}>📊 Format Excel</div>
              <div style={{ fontSize:11, color:'#718096' }}>Arsip + rekap per jenis</div>
              <Btn onClick={exportExcelSurat} variant="success" size="sm" disabled={loadingExport==='excel-surat'} style={{ justifyContent:'center' }}>
                {loadingExport==='excel-surat' ? '⏳...' : '📥 Download Excel'}
              </Btn>
            </div>
            <div style={{ padding:'14px 16px', background:'#FCEBEB', borderRadius:12, border:'1px solid #F7C1C1', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:12, color:'#C0392B', fontWeight:600 }}>📄 Format PDF</div>
              <div style={{ fontSize:11, color:'#718096' }}>Daftar arsip + rekap resmi</div>
              <Btn onClick={exportPDFSurat} variant="danger" size="sm" disabled={loadingExport==='pdf-surat'} style={{ justifyContent:'center' }}>
                {loadingExport==='pdf-surat' ? '⏳...' : '📄 Download PDF'}
              </Btn>
            </div>
          </div>
        </div>

        {/* Rekap & Backup (admin only) */}
        {isKepala && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#4A5568', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>🔐</span> Rekap & Backup (Khusus Admin)
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:10 }}>
              <div style={{ padding:'14px 16px', background:'#EEEDFE', borderRadius:12, border:'1px solid #C5C2F5', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:12, color:'#534AB7', fontWeight:600 }}>📄 Rekap PDF Resmi</div>
                <div style={{ fontSize:11, color:'#718096' }}>Statistik + tanda tangan kepala desa</div>
                <Btn onClick={exportPDFRekap} variant="info" size="sm" disabled={loadingExport==='pdf-rekap'}
                  style={{ justifyContent:'center', background:'#534AB7', color:'#fff', border:'none' }}>
                  {loadingExport==='pdf-rekap' ? '⏳...' : '📄 Download PDF Rekap'}
                </Btn>
              </div>
              <div style={{ padding:'14px 16px', background:'#FAEEDA', borderRadius:12, border:'1px solid #F5CE8A', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:12, color:'#A0621B', fontWeight:600 }}>💾 Backup Semua Data</div>
                <div style={{ fontSize:11, color:'#718096' }}>Backup lengkap semua data desa</div>
                <Btn onClick={exportBackup} variant="warning" size="sm" disabled={loadingExport==='backup'} style={{ justifyContent:'center' }}>
                  {loadingExport==='backup' ? '⏳...' : '💾 Backup Data'}
                </Btn>
              </div>
            </div>
          </div>
        )}
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
                <div style={{ height:'100%', width:`${penduduk.length?Math.round(s.nilai/penduduk.length*100):0}%`, background:'linear-gradient(90deg,#1B5EA0,#1565C0)', borderRadius:4 }} />
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
                <div style={{ height:'100%', width:`${Math.round(s.nilai/maxPekerjaan*100)}%`, background:'linear-gradient(90deg,#534AB7,#6C63FF)', borderRadius:4 }} />
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
                <div style={{ height:'100%', width:`${Math.round(s.nilai/maxPendidikan*100)}%`, background:'linear-gradient(90deg,#2D6A0F,#38A169)', borderRadius:4 }} />
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
                  <div style={{ height:'100%', width:`${Math.round(jml/maxBulan*100)}%`, background:'linear-gradient(90deg,#A0621B,#D97706)', borderRadius:4 }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}