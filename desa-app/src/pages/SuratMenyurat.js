import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatTanggal, getTodayStr } from '../utils/helpers';
import {
  Badge, Card, Modal, Input, Select, Btn,
  EmptyState, Alert, SectionHeader, TabBar, StatCard, FormRow
} from '../components/UI';

const JENIS_SURAT = [
  'Surat Keterangan Domisili',
  'Surat Keterangan Tidak Mampu',
  'Surat Pengantar KTP',
  'Surat Keterangan Usaha',
  'Surat Keterangan Kelahiran',
  'Surat Keterangan Kematian',
  'Surat Pengantar SKCK',
  'Surat Keterangan Pindah',
];

const PLACEHOLDER_INFO = [
  { tag: '[NAMA_DESA]',  desc: 'Nama desa' },
  { tag: '[KECAMATAN]',  desc: 'Nama kecamatan' },
  { tag: '[KABUPATEN]',  desc: 'Nama kabupaten' },
  { tag: '[DATA_WARGA]', desc: 'Data warga otomatis' },
  { tag: '[KEPERLUAN]',  desc: 'Keperluan surat' },
];

const JENIS_ICON = {
  'Surat Keterangan Domisili':    '🏠',
  'Surat Keterangan Tidak Mampu': '💰',
  'Surat Pengantar KTP':          '🪪',
  'Surat Keterangan Usaha':       '🏪',
  'Surat Keterangan Kelahiran':   '👶',
  'Surat Keterangan Kematian':    '🕊',
  'Surat Pengantar SKCK':         '🚔',
  'Surat Keterangan Pindah':      '📦',
};

function renderIsi(tpl, warga, keperluan, desa, nomor, tanggal) {
  const dataWarga = warga
    ? `Nama            : ${warga.nama}\nNIK             : ${warga.nik}\nTempat/Tgl Lahir: ${warga.tempatLahir}, ${formatTanggal(warga.tanggalLahir)}\nJenis Kelamin   : ${warga.jenisKelamin}\nAgama           : ${warga.agama}\nPekerjaan       : ${warga.pekerjaan}\nAlamat          : ${warga.alamat}, RT ${warga.rt}/RW ${warga.rw}, ${warga.dusun||''}`
    : '';
  return (tpl||'')
    .replace(/\[NAMA_DESA\]/g,  desa?.namaDesa||'')
    .replace(/\[KECAMATAN\]/g,  desa?.kecamatan||'')
    .replace(/\[KABUPATEN\]/g,  desa?.kabupaten||'')
    .replace(/\[DATA_WARGA\]/g, dataWarga)
    .replace(/\[KEPERLUAN\]/g,  keperluan||'')
    .replace(/\[NOMOR_SURAT\]/g,nomor||'')
    .replace(/\[TANGGAL\]/g,    tanggal||formatTanggal(getTodayStr()));
}

// ══════════════════════════════════════════════════════════════
// GANTI fungsi SuratResmi di FormatSurat.js dan SuratMenyurat.js
// Cari: function SuratResmi({ ... sampai kurung tutup }
// Ganti dengan kode di bawah ini
// ══════════════════════════════════════════════════════════════

function SuratResmi({ tpl, jenis, warga, keperluan, desa, nomor, tanggal, kepalaDesa, nip }) {
  const isiParts = (tpl?.isi || '').split('[DATA_WARGA]');
  const isiBefore = renderIsi(isiParts[0] || '', null, keperluan, desa, nomor, tanggal);
  const isiAfter  = isiParts[1] ? renderIsi(isiParts[1], null, keperluan, desa, nomor, tanggal) : '';
  const penutupRendered = (tpl?.penutup || '')
    .replace(/\[NAMA_DESA\]/g, desa?.namaDesa || '')
    .replace(/\[KECAMATAN\]/g, desa?.kecamatan || '');

  const dataWargaRows = warga ? [
    { label: 'Nama lengkap',          value: warga.nama,           bold: false },
    { label: 'Tempat, tanggal lahir', value: `${warga.tempatLahir || ''}, ${formatTanggal(warga.tanggalLahir)}`, bold: false },
    { label: 'Jenis kelamin',         value: warga.jenisKelamin,   bold: false },
    { label: 'Status Perkawinan',     value: warga.statusPerkawinan || '-', bold: false },
    { label: 'Pekerjaan',             value: warga.pekerjaan,      bold: false },
    { label: 'Nomor KTP',             value: warga.nik,            bold: true  },
    { label: 'Tempat tinggal',        value: `${warga.alamat || ''}, RT ${warga.rt || ''} RW ${warga.rw || ''}${warga.dusun ? ', ' + warga.dusun : ''}\nDesa ${desa?.namaDesa || ''} Kec. ${desa?.kecamatan || ''} Kab. ${desa?.kabupaten || ''}`, bold: false },
  ] : [];

  return (
    <div style={{
      fontFamily: 'Times New Roman, serif',
      fontSize: 12,
      lineHeight: 1.7,
      color: '#000',
      background: '#fff',
      padding: '20px 48px 24px 48px',
      width: '100%',
      boxSizing: 'border-box',
    }}>

      {/* KOP SURAT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 10, borderBottom: '4px solid #000', marginBottom: 16 }}>
        <img
          src="/logo-cirebon.jpeg"
          alt="Logo"
          style={{ width: 70, height: 70, objectFit: 'contain', flexShrink: 0 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12 }}>PEMERINTAH KABUPATEN {(desa?.kabupaten || '').toUpperCase()}</div>
          <div style={{ fontSize: 12 }}>KECAMATAN {(desa?.kecamatan || '').toUpperCase()}</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, margin: '2px 0' }}>KUWU {(desa?.namaDesa || '').toUpperCase()}</div>
          <div style={{ fontSize: 10, color: '#333' }}>
            {desa?.alamat || ''}{desa?.kodePos ? ` | Kode Pos ${desa.kodePos}` : ''}{desa?.telp ? ` | Telp. ${desa.telp}` : ''}
          </div>
        </div>
      </div>

      {/* JUDUL */}
      <div style={{ textAlign: 'center', margin: '12px 0 6px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, textDecoration: 'underline', letterSpacing: 2, textTransform: 'uppercase' }}>
          {tpl?.judul || (jenis || '').toUpperCase()}
        </div>
        <div style={{ fontSize: 12, marginTop: 3 }}>Nomor : {nomor || '____/ ____- Desa / ____'}</div>
      </div>
      <div style={{ borderBottom: '1px solid #000', marginBottom: 14 }} />

      {/* PEMBUKA */}
      <div style={{ textAlign: 'justify', whiteSpace: 'pre-line', fontSize: 12, marginBottom: 10 }}>
        {isiBefore || `Yang bertanda tangan dibawah ini, Kuwu Desa ${desa?.namaDesa || ''} Kecamatan ${desa?.kecamatan || ''} Kabupaten ${desa?.kabupaten || ''}, dengan ini menerangkan bahwa :`}
      </div>

      {/* TABEL DATA WARGA */}
      {dataWargaRows.length > 0 && (
        <table style={{ width: '85%', margin: '4px auto 12px auto', borderCollapse: 'collapse', fontSize: 12 }}>
          <tbody>
            {dataWargaRows.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '1px 8px 1px 24px', verticalAlign: 'top', whiteSpace: 'nowrap', width: '38%' }}>{row.label}</td>
                <td style={{ padding: '1px 6px', verticalAlign: 'top', width: '4%' }}>:</td>
                <td style={{ padding: '1px 6px', verticalAlign: 'top', fontWeight: row.bold ? 700 : 400, whiteSpace: 'pre-line' }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ISI SETELAH DATA WARGA */}
      {isiAfter ? (
        <div style={{ textAlign: 'justify', whiteSpace: 'pre-line', fontSize: 12, marginBottom: 10 }}>{isiAfter}</div>
      ) : keperluan ? (
        <div style={{ textAlign: 'justify', fontSize: 12, marginBottom: 10 }}>
          <div>Yang bersangkutan tinggal di wilayah Desa kami Telah memohon Surat Keterangan ini dalam rangka :</div>
          <div style={{ textAlign: 'center', margin: '8px 0', fontWeight: 600 }}>&ldquo; {keperluan} &rdquo;</div>
          <div>Surat Keterangan ini kami berikan berdasarkan sepengetahuan dan pertimbangan bahwa :</div>
          <div style={{ textAlign: 'center', margin: '8px 0', fontWeight: 700 }}>&ldquo; Yang bersangkutan benar warga kami dan {keperluan} &rdquo;</div>
        </div>
      ) : null}

      {/* PENUTUP */}
      <div style={{ textAlign: 'justify', fontSize: 12, marginBottom: 6 }}>
        {penutupRendered || 'Demikian Surat Keterangan ini kami buat untuk dipergunakan seperlunya.'}
      </div>

      {/* TANDA TANGAN */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <div style={{ textAlign: 'center', minWidth: 220 }}>
          <div style={{ fontSize: 12 }}>{desa?.namaDesa || ''}, {tanggal || formatTanggal(getTodayStr())}</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>KUWU {(desa?.namaDesa || '').toUpperCase()}</div>
          <div style={{ height: 64 }} />
          <div style={{ fontWeight: 700, fontSize: 13, borderBottom: '1px solid #000', paddingBottom: 2, display: 'inline-block', minWidth: 200 }}>
            {kepalaDesa || desa?.kepalaDesa || 'H. ____________________'}
          </div>
          {desa?.gelarKepala && <div style={{ fontSize: 11, marginTop: 2 }}>{desa.gelarKepala}</div>}
        </div>
      </div>
    </div>
  );
}

export default function SuratMenyurat() {
  const { state, dispatch } = useApp();
  const { currentUser }     = useAuth(); // ← ambil user yang sedang login
  const printRef = useRef();

  // Nama petugas otomatis dari akun yang login
  const namaPetugasLogin = currentUser?.nama || '';
  const jabatanLogin     = currentUser?.jabatan || '';

  const [tab, setTab] = useState('pengajuan');

  const [showModalAjuan,   setShowModalAjuan]   = useState(false);
  const [showModalUpdate,  setShowModalUpdate]  = useState(null);
  const [showModalArsip,   setShowModalArsip]   = useState(false);
  const [showPengaturan,   setShowPengaturan]   = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(null);
  const [showEditTemplate, setShowEditTemplate] = useState(null);

  const [filterStatus, setFilterStatus] = useState('');
  const [searchArsip,  setSearchArsip]  = useState('');
  const [error, setError] = useState('');

  const [formAjuan, setFormAjuan] = useState({
    nik:'', namaPemohon:'', jenisSurat: JENIS_SURAT[0],
    keperluan:'', tanggalAjuan: getTodayStr(), catatan:''
  });

  // formUpdate: petugas otomatis diisi nama yang login
  const [formUpdate,     setFormUpdate]     = useState({});
  const [formArsip,      setFormArsip]      = useState({
    nomorSurat:'', tanggal: getTodayStr(), jenis: JENIS_SURAT[0],
    penerima:'', nik:'', keperluan:'',
    dibuat: namaPetugasLogin, // ← otomatis nama yang login
  });
  const [formPengaturan, setFormPengaturan] = useState({});
  const [formTemplate,   setFormTemplate]   = useState({});

  const desa      = state.pengaturanDesa || {};
  const templates = state.templateSurat  || {};

  const pending  = state.pengajuanSurat.filter(s=>s.status==='Menunggu').length;
  const diproses = state.pengajuanSurat.filter(s=>s.status==='Diproses').length;
  const selesai  = state.pengajuanSurat.filter(s=>s.status==='Selesai').length;

  const filteredAjuan = state.pengajuanSurat.filter(s => filterStatus ? s.status===filterStatus : true);
  const filteredArsip = state.arsipSurat.filter(a =>
    a.penerima.toLowerCase().includes(searchArsip.toLowerCase()) ||
    a.nomorSurat.toLowerCase().includes(searchArsip.toLowerCase()) ||
    a.jenis.toLowerCase().includes(searchArsip.toLowerCase())
  );

  const cariWarga   = nik => state.penduduk.find(p => p.nik===nik);
  const autofillNIK = nik => {
    const w = cariWarga(nik);
    setFormAjuan(f => ({ ...f, nik, namaPemohon: w ? w.nama : f.namaPemohon }));
  };

  const generateNomor = jenis => {
    const tpl    = templates[jenis];
    const prefix = tpl?.kodePrefix||'DS/SRT';
    const tahun  = new Date().getFullYear();
    const urut   = String(state.arsipSurat.length+1).padStart(3,'0');
    return `${prefix}/${tahun}/${urut}`;
  };

  // ── PRINT ─────────────────────────────────────────────────
  const handlePrint = () => {
    const isi = printRef.current?.innerHTML;
    if (!isi) return;
    const win = window.open('', '_blank');
     win.document.write(`
      <!DOCTYPE html><html><head><title>Surat</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; background: #fff; }
        @page { size: A4; margin: 1.5cm 2cm; }
        img { max-width: 70px; max-height: 70px; object-fit: contain; }
        table { border-collapse: collapse; }
        @media print { body { margin: 0; } }
      </style>
      </head><body>${isi}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // ── SIMPAN PENGAJUAN ──────────────────────────────────────
  function simpanAjuan() {
      if (!formAjuan.nik || !formAjuan.namaPemohon || !formAjuan.keperluan) {
        setError('NIK, Nama Pemohon, dan Keperluan wajib diisi.'); return;
      }
      const nomor = `S-${new Date().getFullYear()}-${String(state.pengajuanSurat.length + 1).padStart(3, '0')}`;
      dispatch({
        type: 'TAMBAH_PENGAJUAN',
        payload: {
          ...formAjuan,
          nomorAntrian: nomor,
          status: 'Menunggu',
          tanggalSelesai: '',
          petugas: '', // belum ada petugas saat pengajuan
        }
      });
      setShowModalAjuan(false);
      setFormAjuan({ nik: '', namaPemohon: '', jenisSurat: JENIS_SURAT[0], keperluan: '', tanggalAjuan: getTodayStr(), catatan: '' });
      setError('');
    }

  // ── UPDATE STATUS ─────────────────────────────────────────
  const bukaUpdate = s => {
    setShowModalUpdate(s);
    setFormUpdate({
      status:         s.status,
      petugas:        s.petugas || namaPetugasLogin, // ← otomatis nama login
      catatan:        s.catatan        || '',
      tanggalSelesai: s.tanggalSelesai || '',
    });
  };

  const simpanUpdate = () => {
    const updated = { ...showModalUpdate, ...formUpdate };
    if (formUpdate.status==='Selesai' && !updated.tanggalSelesai)
      updated.tanggalSelesai = getTodayStr();

    dispatch({ type:'UPDATE_PENGAJUAN', payload:updated });

    // Jika selesai → otomatis simpan ke arsip dengan nama petugas login
    if (formUpdate.status==='Selesai') {
      const nomorSurat = generateNomor(showModalUpdate.jenisSurat);
      dispatch({
        type: 'TAMBAH_ARSIP',
        payload: {
          nomorSurat,
          tanggal:   updated.tanggalSelesai||getTodayStr(),
          jenis:     showModalUpdate.jenisSurat,
          penerima:  showModalUpdate.namaPemohon,
          nik:       showModalUpdate.nik,
          keperluan: showModalUpdate.keperluan,
          dibuat:    formUpdate.petugas || namaPetugasLogin, // ← otomatis nama login
          file:      `${nomorSurat.replace(/\//g,'_')}.pdf`,
        }
      });
    }
    setShowModalUpdate(null);
  };

  // ── SIMPAN ARSIP MANUAL ───────────────────────────────────
  const simpanArsip = () => {
    if (!formArsip.nomorSurat||!formArsip.penerima) {
      setError('Nomor surat dan penerima wajib diisi.'); return;
    }
    dispatch({ type:'TAMBAH_ARSIP', payload:{ ...formArsip, dibuat: formArsip.dibuat||namaPetugasLogin } });
    setShowModalArsip(false);
    setFormArsip({ nomorSurat:'', tanggal: getTodayStr(), jenis: JENIS_SURAT[0], penerima:'', nik:'', keperluan:'', dibuat: namaPetugasLogin });
    setError('');
  };

  // ── TEMPLATE ──────────────────────────────────────────────
  const bukaEditTemplate = jenis => {
    setShowEditTemplate(jenis);
    setFormTemplate({ ...(templates[jenis]||{}) });
  };

  const simpanTemplate = () => {
    dispatch({ type:'UPDATE_TEMPLATE_SURAT', payload:{ jenis:showEditTemplate, data:formTemplate } });
    setShowEditTemplate(null);
  };

  const insertPlaceholder = tag => {
    setFormTemplate(f => ({ ...f, isi:(f.isi||'')+tag }));
  };

  const statusColor = s => s==='Selesai'?'success':s==='Diproses'?'warning':'default';

  const tabs = [
    { id:'pengajuan', label:'Pengajuan Surat', badge: pending||null },
    { id:'arsip',     label:'Arsip Digital' },
    { id:'format',    label:'Format Surat' },
  ];

  return (
    <div style={{ padding:24 }}>
      <SectionHeader
        title="📋 Surat Menyurat & Arsip"
        sub="Kelola pengajuan surat warga, arsip, dan format dokumen desa"
        action={
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={()=>{ setFormPengaturan({...desa}); setShowPengaturan(true); }} variant="ghost">⚙ Pengaturan Desa</Btn>
            <Btn onClick={()=>{ setShowModalArsip(true); setError(''); }} variant="ghost">+ Tambah Arsip</Btn>
            <Btn onClick={()=>{ setShowModalAjuan(true); setError(''); }} variant="primary">+ Pengajuan Baru</Btn>
          </div>
        }
      />

      {/* Info petugas yang login */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, padding:'10px 16px', background:'#EBF3FC', borderRadius:10, border:'1px solid #B5D4F4', fontSize:13 }}>
        <span style={{ fontSize:16 }}>👤</span>
        <span style={{ color:'#1B5EA0' }}>
          Login sebagai <strong>{namaPetugasLogin}</strong> — {jabatanLogin}.
          Nama Anda akan otomatis tercatat sebagai petugas di setiap surat yang diproses.
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:12, marginBottom:20 }}>
        <StatCard label="Total Pengajuan" value={state.pengajuanSurat.length} color="#1B5EA0" />
        <StatCard label="Menunggu"  value={pending}  sub="belum ditangani"   color="#C0392B" />
        <StatCard label="Diproses"  value={diproses} sub="sedang berjalan"   color="#A0621B" />
        <StatCard label="Selesai"   value={selesai}  sub="sudah diterbitkan" color="#2D6A0F" />
        <StatCard label="Total Arsip" value={state.arsipSurat.length} sub="dokumen digital" color="#534AB7" />
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {/* ═══ TAB PENGAJUAN ═══ */}
      {tab==='pengajuan' && (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            {['','Menunggu','Diproses','Selesai'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)}
                style={{ padding:'7px 16px', fontSize:12, borderRadius:20, border:'0.5px solid', borderColor:filterStatus===s?'#1B5EA0':'#E2E8F0', background:filterStatus===s?'#1B5EA0':'#fff', color:filterStatus===s?'#fff':'#718096', cursor:'pointer', fontFamily:'inherit', fontWeight:filterStatus===s?600:400 }}>
                {s||'Semua'}{s===''?` (${state.pengajuanSurat.length})`:s==='Menunggu'?` (${pending})`:s==='Diproses'?` (${diproses})`:` (${selesai})`}
              </button>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', overflow:'hidden', overflowX:'auto', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            {filteredAjuan.length===0
              ? <EmptyState icon="📋" text="Belum ada pengajuan surat" sub="Klik + Pengajuan Baru untuk menambahkan" />
              : (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:600 }}>
                  <thead>
                    <tr style={{ background:'#F8FAFC' }}>
                      {['No. Antrian','Tanggal','Pemohon','Jenis Surat','Keperluan','Petugas','Status','Aksi'].map((h,i)=>(
                        <th key={i} style={{ textAlign:'left', padding:'10px 14px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAjuan.map(s=>(
                      <tr key={s.id} style={{ borderBottom:'1px solid #F1F5F9' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#FAFBFC'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:'#1B5EA0', fontWeight:600 }}>{s.nomorAntrian}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:'#718096', whiteSpace:'nowrap' }}>{formatTanggal(s.tanggalAjuan)}</td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ fontWeight:600 }}>{s.namaPemohon}</div>
                          <div style={{ fontSize:11, color:'#A0AEC0', fontFamily:'monospace' }}>{s.nik}</div>
                        </td>
                        <td style={{ padding:'10px 14px', fontSize:12 }}>{s.jenisSurat}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:'#718096' }}>{s.keperluan}</td>
                        <td style={{ padding:'10px 14px', fontSize:12 }}>
                          {s.petugas
                            ? <span style={{ fontWeight:500 }}>{s.petugas}</span>
                            : <span style={{ color:'#A0AEC0', fontSize:11 }}>Belum ditangani</span>
                          }
                        </td>
                        <td style={{ padding:'10px 14px' }}>
                          <Badge type={statusColor(s.status)}>{s.status}</Badge>
                        </td>
                        <td style={{ padding:'10px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <Btn onClick={()=>bukaUpdate(s)} variant="primary" size="sm">✏ Update</Btn>
                            <Btn onClick={()=>setShowPreviewModal(s)} variant="ghost" size="sm">👁 Preview</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </>
      )}

      {/* ═══ TAB ARSIP ═══ */}
      {tab==='arsip' && (
        <>
          <div style={{ marginBottom:14 }}>
            <input value={searchArsip} onChange={e=>setSearchArsip(e.target.value)}
              placeholder="🔍  Cari nomor surat, nama penerima, atau jenis surat..."
              style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:13, fontFamily:'inherit', background:'#fff', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', overflow:'hidden', overflowX:'auto' }}>
            {filteredArsip.length===0
              ? <EmptyState icon="🗂" text="Belum ada arsip surat tersimpan" sub="Arsip otomatis masuk saat pengajuan berstatus Selesai" />
              : (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:600 }}>
                  <thead>
                    <tr style={{ background:'#F8FAFC' }}>
                      {['Nomor Surat','Tanggal','Jenis Surat','Penerima','NIK','Keperluan','Dibuat Oleh','Aksi'].map((h,i)=>(
                        <th key={i} style={{ textAlign:'left', padding:'10px 14px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArsip.map(a=>(
                      <tr key={a.id} style={{ borderBottom:'1px solid #F1F5F9' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#FAFBFC'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:'#1B5EA0', fontWeight:600 }}>{a.nomorSurat}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:'#718096', whiteSpace:'nowrap' }}>{formatTanggal(a.tanggal)}</td>
                        <td style={{ padding:'10px 14px', fontSize:12 }}>{a.jenis}</td>
                        <td style={{ padding:'10px 14px', fontWeight:600 }}>{a.penerima}</td>
                        <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:'#718096' }}>{a.nik}</td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:'#718096' }}>{a.keperluan}</td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ fontSize:13, fontWeight:500 }}>{a.dibuat}</div>
                        </td>
                        <td style={{ padding:'10px 14px', whiteSpace:'nowrap' }}>
                          <Btn onClick={()=>{ if(window.confirm('Hapus arsip ini?')) dispatch({type:'HAPUS_ARSIP',payload:a.id}); }} variant="danger" size="sm">🗑 Hapus</Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </>
      )}

      {/* ═══ TAB FORMAT SURAT ═══ */}
      {tab==='format' && (
        <div>
          <Alert type="info">
            💡 Klik <strong>✏ Edit</strong> untuk mengubah format surat. Gunakan placeholder:
            {PLACEHOLDER_INFO.map(p=>(
              <code key={p.tag} style={{ marginLeft:6, background:'#D4E8FA', padding:'1px 6px', borderRadius:4, fontSize:11 }}>{p.tag}</code>
            ))}
          </Alert>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14, marginTop:16 }}>
            {JENIS_SURAT.map(jenis => {
              const tpl = templates[jenis]||{};
              return (
                <div key={jenis} style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <span style={{ fontSize:24 }}>{JENIS_ICON[jenis]||'📄'}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{jenis}</div>
                        <div style={{ fontSize:11, color:'#A0AEC0', fontFamily:'monospace' }}>{tpl.kodePrefix||'-'}/YYYY/NNN</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn onClick={()=>setShowPreviewModal({ jenisSurat:jenis, nik: state.penduduk[0]?.nik||'', namaPemohon: state.penduduk[0]?.nama||'Contoh Warga', keperluan:'Contoh keperluan surat', tanggalAjuan: getTodayStr(), tanggalSelesai:'' })} variant="ghost" size="sm">👁</Btn>
                      <Btn onClick={()=>bukaEditTemplate(jenis)} variant="primary" size="sm">✏ Edit</Btn>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'#718096', background:'#F8FAFC', borderRadius:8, padding:'10px 12px', lineHeight:1.6, maxHeight:72, overflow:'hidden', position:'relative' }}>
                    {(tpl.isi||'Belum ada isi template').substring(0,120)}...
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:24, background:'linear-gradient(transparent, #F8FAFC)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: PREVIEW & PRINT
      ══════════════════════════════════════════ */}
      <Modal show={!!showPreviewModal} onClose={()=>setShowPreviewModal(null)} title={`👁 Preview — ${showPreviewModal?.jenisSurat||''}`} width={640}>
        {showPreviewModal && (() => {
          const warga   = cariWarga(showPreviewModal.nik);
          const tpl     = templates[showPreviewModal.jenisSurat]||{};
          const nomor   = generateNomor(showPreviewModal.jenisSurat);
          const tanggal = formatTanggal(showPreviewModal.tanggalSelesai||showPreviewModal.tanggalAjuan||getTodayStr());
          return (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, padding:'10px 16px', background:'#F8FAFC', borderRadius:10, border:'1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{showPreviewModal.jenisSurat}</div>
                  <div style={{ fontSize:12, color:'#718096' }}>{showPreviewModal.namaPemohon} · {tanggal}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Btn onClick={()=>bukaEditTemplate(showPreviewModal.jenisSurat)} variant="ghost" size="sm">✏ Edit Template</Btn>
                  <Btn onClick={handlePrint} variant="primary" size="sm">🖨 Cetak</Btn>
                </div>
              </div>
              <div style={{ border:'1px solid #E2E8F0', borderRadius:10, overflow:'auto', maxHeight:'65vh', background:'#fff' }}>
                <div ref={printRef}>
                  <SuratResmi tpl={tpl} jenis={showPreviewModal.jenisSurat} warga={warga} keperluan={showPreviewModal.keperluan} desa={desa} nomor={nomor} tanggal={tanggal} />
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:14, paddingTop:14, borderTop:'1px solid #E2E8F0' }}>
                <Btn onClick={()=>setShowPreviewModal(null)} style={{ flex:1 }}>Tutup</Btn>
                <Btn onClick={handlePrint} variant="primary" style={{ flex:2, justifyContent:'center' }}>🖨 Cetak Surat</Btn>
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ══ MODAL EDIT TEMPLATE ══ */}
      <Modal show={!!showEditTemplate} onClose={()=>setShowEditTemplate(null)} title={`✏ Edit Template — ${showEditTemplate}`} width={640}>
        {showEditTemplate && (
          <>
            <Alert type="info">
              Klik placeholder untuk menyisipkan ke badan surat:
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                {PLACEHOLDER_INFO.map(p=>(
                  <button key={p.tag} onClick={()=>insertPlaceholder(p.tag)} title={p.desc}
                    style={{ padding:'3px 10px', fontSize:11, borderRadius:6, border:'1px solid #1B5EA0', background:'#EBF3FC', color:'#1B5EA0', cursor:'pointer', fontFamily:'monospace', fontWeight:600 }}>
                    {p.tag}
                  </button>
                ))}
              </div>
            </Alert>
            <Input label="Judul Surat" value={formTemplate.judul||''} onChange={e=>setFormTemplate({...formTemplate,judul:e.target.value})} placeholder="cth: SURAT KETERANGAN DOMISILI" />
            <Input label="Kode Prefix Nomor" value={formTemplate.kodePrefix||''} onChange={e=>setFormTemplate({...formTemplate,kodePrefix:e.target.value})} placeholder="cth: DS/SKD" />
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Isi / Badan Surat</label>
              <textarea value={formTemplate.isi||''} onChange={e=>setFormTemplate({...formTemplate,isi:e.target.value})} rows={10}
                style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:13, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', outline:'none', lineHeight:1.7 }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Kalimat Penutup</label>
              <textarea value={formTemplate.penutup||''} onChange={e=>setFormTemplate({...formTemplate,penutup:e.target.value})} rows={3}
                style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:13, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', outline:'none' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <Btn onClick={()=>setShowEditTemplate(null)}>Batal</Btn>
              <Btn variant="primary" onClick={simpanTemplate}>💾 Simpan Template</Btn>
            </div>
          </>
        )}
      </Modal>

      {/* ══ MODAL PENGAJUAN BARU ══ */}
      <Modal show={showModalAjuan} onClose={()=>setShowModalAjuan(false)} title="📋 Pengajuan Surat Baru" width={500}>
        {error && <Alert type="danger">{error}</Alert>}
        <Alert type="info">Masukkan NIK warga — nama akan terisi otomatis jika terdaftar.</Alert>
        <Input label="NIK Pemohon" value={formAjuan.nik} onChange={e=>autofillNIK(e.target.value)} placeholder="16 digit NIK" maxLength={16} />
        <Input label="Nama Pemohon" value={formAjuan.namaPemohon} onChange={e=>setFormAjuan({...formAjuan,namaPemohon:e.target.value})} placeholder="Nama lengkap" />
        <Select label="Jenis Surat" value={formAjuan.jenisSurat} onChange={e=>setFormAjuan({...formAjuan,jenisSurat:e.target.value})}>
          {JENIS_SURAT.map(j=><option key={j}>{j}</option>)}
        </Select>
        <Input label="Keperluan" value={formAjuan.keperluan} onChange={e=>setFormAjuan({...formAjuan,keperluan:e.target.value})} placeholder="cth: Melamar kerja, Beasiswa" />
        <Input label="Tanggal Pengajuan" type="date" value={formAjuan.tanggalAjuan} onChange={e=>setFormAjuan({...formAjuan,tanggalAjuan:e.target.value})} />
        <Input label="Catatan (opsional)" value={formAjuan.catatan} onChange={e=>setFormAjuan({...formAjuan,catatan:e.target.value})} placeholder="Catatan tambahan..." />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <Btn onClick={()=>setShowModalAjuan(false)}>Batal</Btn>
          <Btn variant="primary" onClick={simpanAjuan}>📤 Ajukan Surat</Btn>
        </div>
      </Modal>

      {/* ══ MODAL UPDATE STATUS ══ */}
      <Modal show={!!showModalUpdate} onClose={()=>setShowModalUpdate(null)} title={`✏ Update Status — ${showModalUpdate?.nomorAntrian}`} width={460}>
        {showModalUpdate && (
          <>
            <div style={{ background:'#F8FAFC', borderRadius:10, padding:'12px 16px', marginBottom:14 }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{showModalUpdate.namaPemohon}</div>
              <div style={{ fontSize:12, color:'#718096' }}>{showModalUpdate.jenisSurat} · {showModalUpdate.keperluan}</div>
              <div style={{ marginTop:6 }}><Badge type={statusColor(showModalUpdate.status)}>{showModalUpdate.status}</Badge></div>
            </div>

            {/* Pilih status */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:8 }}>Ubah Status ke:</div>
              <div style={{ display:'flex', gap:8 }}>
                {['Menunggu','Diproses','Selesai'].map(s=>(
                  <button key={s} onClick={()=>setFormUpdate({...formUpdate,status:s})}
                    style={{ flex:1, padding:'10px', fontSize:13, borderRadius:8, border:'1.5px solid', borderColor:formUpdate.status===s?(s==='Selesai'?'#2D6A0F':s==='Diproses'?'#A0621B':'#1B5EA0'):'#E2E8F0', background:formUpdate.status===s?(s==='Selesai'?'#EAF3DE':s==='Diproses'?'#FAEEDA':'#EBF3FC'):'#fff', color:formUpdate.status===s?(s==='Selesai'?'#27500A':s==='Diproses'?'#633806':'#0C447C'):'#718096', cursor:'pointer', fontFamily:'inherit', fontWeight:formUpdate.status===s?700:400 }}>
                    {s==='Menunggu'?'⏳':s==='Diproses'?'⚙️':'✅'} {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Petugas — otomatis nama login, tapi bisa diubah */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Petugas yang Menangani</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input
                  value={formUpdate.petugas||''}
                  onChange={e=>setFormUpdate({...formUpdate,petugas:e.target.value})}
                  placeholder="Nama petugas"
                  style={{ flex:1, border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:14, fontFamily:'inherit', background:'#fff', outline:'none' }}
                />
                <button
                  onClick={()=>setFormUpdate({...formUpdate,petugas:namaPetugasLogin})}
                  style={{ padding:'10px 12px', fontSize:12, borderRadius:10, border:'1.5px solid #1B5EA0', background:'#EBF3FC', color:'#1B5EA0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, whiteSpace:'nowrap' }}>
                  👤 Pakai Nama Saya
                </button>
              </div>
              <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>
                Login sebagai: <strong>{namaPetugasLogin}</strong> ({jabatanLogin})
              </div>
            </div>

            {formUpdate.status==='Selesai' && (
              <>
                <Input label="Tanggal Selesai" type="date" value={formUpdate.tanggalSelesai||getTodayStr()} onChange={e=>setFormUpdate({...formUpdate,tanggalSelesai:e.target.value})} />
                <Alert type="success">✅ Surat akan otomatis disimpan ke Arsip Digital atas nama <strong>{formUpdate.petugas||namaPetugasLogin}</strong>.</Alert>
              </>
            )}

            <Input label="Catatan" value={formUpdate.catatan||''} onChange={e=>setFormUpdate({...formUpdate,catatan:e.target.value})} placeholder="Keterangan proses..." />

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
              <Btn onClick={()=>setShowModalUpdate(null)}>Batal</Btn>
              <Btn variant="primary" onClick={simpanUpdate}>💾 Simpan Update</Btn>
            </div>
          </>
        )}
      </Modal>

      {/* ══ MODAL TAMBAH ARSIP MANUAL ══ */}
      <Modal show={showModalArsip} onClose={()=>setShowModalArsip(false)} title="🗂 Tambah Arsip Surat" width={500}>
        {error && <Alert type="danger">{error}</Alert>}
        <Input label="Nomor Surat" value={formArsip.nomorSurat} onChange={e=>setFormArsip({...formArsip,nomorSurat:e.target.value})} placeholder="DS/SKD/2025/001" />
        <FormRow>
          <Select label="Jenis Surat" value={formArsip.jenis} onChange={e=>setFormArsip({...formArsip,jenis:e.target.value})}>
            {JENIS_SURAT.map(j=><option key={j}>{j}</option>)}
          </Select>
          <Input label="Tanggal Surat" type="date" value={formArsip.tanggal} onChange={e=>setFormArsip({...formArsip,tanggal:e.target.value})} />
        </FormRow>
        <Input label="Nama Penerima" value={formArsip.penerima} onChange={e=>setFormArsip({...formArsip,penerima:e.target.value})} placeholder="Nama lengkap penerima" />
        <Input label="NIK Penerima" value={formArsip.nik} onChange={e=>setFormArsip({...formArsip,nik:e.target.value})} placeholder="16 digit NIK" maxLength={16} />
        <Input label="Keperluan" value={formArsip.keperluan} onChange={e=>setFormArsip({...formArsip,keperluan:e.target.value})} placeholder="Keperluan surat" />
        {/* Dibuat otomatis nama login */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Dibuat Oleh</label>
          <input value={formArsip.dibuat} onChange={e=>setFormArsip({...formArsip,dibuat:e.target.value})}
            style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:14, fontFamily:'inherit', background:'#fff', outline:'none', boxSizing:'border-box' }} />
          <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>Otomatis diisi nama yang sedang login</div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <Btn onClick={()=>setShowModalArsip(false)}>Batal</Btn>
          <Btn variant="primary" onClick={simpanArsip}>💾 Simpan Arsip</Btn>
        </div>
      </Modal>

      {/* ══ MODAL PENGATURAN DESA ══ */}
      <Modal show={showPengaturan} onClose={()=>setShowPengaturan(false)} title="⚙ Pengaturan Data Desa" width={520}>
        <Alert type="info">Data ini digunakan sebagai kop surat di seluruh dokumen.</Alert>
        <FormRow>
          <Input label="Nama Desa" value={formPengaturan.namaDesa||''} onChange={e=>setFormPengaturan({...formPengaturan,namaDesa:e.target.value})} />
          <Input label="Kecamatan" value={formPengaturan.kecamatan||''} onChange={e=>setFormPengaturan({...formPengaturan,kecamatan:e.target.value})} />
        </FormRow>
        <FormRow>
          <Input label="Kabupaten" value={formPengaturan.kabupaten||''} onChange={e=>setFormPengaturan({...formPengaturan,kabupaten:e.target.value})} />
          <Input label="Provinsi" value={formPengaturan.provinsi||''} onChange={e=>setFormPengaturan({...formPengaturan,provinsi:e.target.value})} />
        </FormRow>
        <FormRow>
          <Input label="Kode Pos" value={formPengaturan.kodePos||''} onChange={e=>setFormPengaturan({...formPengaturan,kodePos:e.target.value})} />
          <Input label="No. Telepon" value={formPengaturan.telp||''} onChange={e=>setFormPengaturan({...formPengaturan,telp:e.target.value})} />
        </FormRow>
        <Input label="Alamat Kantor Desa" value={formPengaturan.alamat||''} onChange={e=>setFormPengaturan({...formPengaturan,alamat:e.target.value})} />
        <FormRow>
          <Input label="Nama Kepala Desa" value={formPengaturan.kepalaDesa||''} onChange={e=>setFormPengaturan({...formPengaturan,kepalaDesa:e.target.value})} />
          <Input label="NIP" value={formPengaturan.nip||''} onChange={e=>setFormPengaturan({...formPengaturan,nip:e.target.value})} />
        </FormRow>
        <Input label="Sekretaris Desa" value={formPengaturan.sekretaris||''} onChange={e=>setFormPengaturan({...formPengaturan,sekretaris:e.target.value})} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
          <Btn onClick={()=>setShowPengaturan(false)}>Batal</Btn>
          <Btn variant="primary" onClick={()=>{ dispatch({type:'UPDATE_PENGATURAN_DESA',payload:formPengaturan}); setShowPengaturan(false); }}>
            💾 Simpan
          </Btn>
        </div>
      </Modal>
    </div>
  );
}