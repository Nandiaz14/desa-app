import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useApp } from '../context/AppContext';
import { WILAYAH, DUSUN_LIST } from '../context/AppContext';
import { formatTanggal, hitungUmur, getTodayStr, kelompokUsia, kelompokPekerjaan } from '../utils/helpers';
import { Badge, Card, Modal, Input, Select, Btn, EmptyState, Alert, SectionHeader, TabBar, StatCard, FormRow } from '../components/UI';

const AGAMA        = ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu'];
const PENDIDIKAN   = ['Tidak Sekolah','SD','SMP','SMA','SMK','D3','S1','S2','S3'];
const STATUS_KAWIN = ['Belum Kawin','Kawin','Cerai Hidup','Cerai Mati'];
const JENIS_RIWAYAT= ['Kelahiran','Kematian','Pindah Masuk','Pindah Keluar'];
const DUSUN_COLORS = ['#1B5EA0','#534AB7','#2D6A0F','#A0621B','#C0392B'];

const formAwal = {
  nik:'', no_kk:'', nama:'', tempatLahir:'', tanggalLahir:'',
  jenisKelamin:'Laki-laki', agama:'Islam', pendidikan:'SMA',
  pekerjaan:'', statusKawin:'Belum Kawin', alamat:'',
  rt: WILAYAH['Dusun 1'].rtList[0],
  rw: WILAYAH['Dusun 1'].rw,
  dusun:'Dusun 1',
  status:'Tetap', tanggalMasuk: getTodayStr(), keterangan:'',
};

export default function DataPenduduk({ readOnly = false }) {
  const { state, dispatch } = useApp();
  const [tab, setTab]               = useState('daftar');
  const [search, setSearch]         = useState('');
  const [filterDusun, setFilterDusun] = useState('');
  const [expandedDusun, setExpandedDusun] = useState({ 'Dusun 1':true,'Dusun 2':false,'Dusun 3':false,'Dusun 4':false,'Dusun 5':false });
  const [showModal, setShowModal]   = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showRiwayatModal, setShowRiwayatModal] = useState(false);
  const [showImportModal, setShowImportModal]   = useState(false);
  const [editData, setEditData]     = useState(null);
  const [form, setForm]             = useState(formAwal);
  const [formRiwayat, setFormRiwayat] = useState({ jenis:'Pindah Masuk', nama:'', nik:'', tanggal: getTodayStr(), keterangan:'' });
  const [error, setError]           = useState('');
  const [importData, setImportData] = useState([]);
  const [importing, setImporting]   = useState(false);
  const [groupByKK, setGroupByKK]   = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768);
  const importRef = useRef();

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const sorted = [...state.penduduk].sort((a,b) => {
    const da = DUSUN_LIST.indexOf(a.dusun), db = DUSUN_LIST.indexOf(b.dusun);
    if (da!==db) return da-db;
    if (parseInt(a.rt)!==parseInt(b.rt)) return parseInt(a.rt)-parseInt(b.rt);
    return a.nama.localeCompare(b.nama);
  });

  const isSearching = search.trim().length > 0;

  const filtered = sorted.filter(p => {
    const q = search.toLowerCase();
    const cocok = !q || p.nama.toLowerCase().includes(q) || p.nik.includes(q) || p.pekerjaan.toLowerCase().includes(q) || p.rt.includes(q) || (p.no_kk||'').includes(q);
    const dusunOk = filterDusun ? p.dusun===filterDusun : true;
    return cocok && dusunOk;
  });

  const grouped = DUSUN_LIST.map((d,gi) => {
    const warga = filtered.filter(p => p.dusun===d);
    const rtGroups = WILAYAH[d].rtList.map(rt => ({ rt, list: warga.filter(p=>p.rt===rt) })).filter(g=>g.list.length>0);
    return { dusun:d, rtGroups, total:warga.length, color:DUSUN_COLORS[gi] };
  }).filter(g=>g.total>0);

  const toggleDusun  = d => setExpandedDusun(prev=>({...prev,[d]:!prev[d]}));
  const expandAll    = () => { const o={}; DUSUN_LIST.forEach(d=>o[d]=true);  setExpandedDusun(o); };
  const collapseAll  = () => { const o={}; DUSUN_LIST.forEach(d=>o[d]=false); setExpandedDusun(o); };

  const handleDusunChange = dusun => {
    const w = WILAYAH[dusun];
    setForm(f => ({ ...f, dusun, rw:w.rw, rt:w.rtList[0] }));
  };

  const bukaTambah = () => { setEditData(null); setForm(formAwal); setShowModal(true); setError(''); };
  const bukaEdit   = p  => { setEditData(p); setForm({...p}); setShowModal(true); setError(''); };

  const simpan = async () => {
    if (!form.nik||!form.nama||!form.tanggalLahir||!form.pekerjaan||!form.rt||!form.rw) {
      setError('NIK, Nama, Tanggal Lahir, Pekerjaan, RT, dan RW wajib diisi.'); return;
    }
    if (form.nik.length!==16) { setError('NIK harus 16 digit.'); return; }
    if (state.penduduk.find(p=>p.nik===form.nik&&p.id!==editData?.id)) {
      setError('NIK sudah terdaftar.'); return;
    }
    const t = toast.loading(editData ? 'Menyimpan...' : 'Menambah penduduk...');
    try {
      if (editData) await dispatch({ type:'UPDATE_PENDUDUK', payload:{...form,id:editData.id} });
      else          await dispatch({ type:'TAMBAH_PENDUDUK', payload:form });
      toast.dismiss(t);
      toast.success(editData ? 'Data berhasil diperbarui! ✅' : 'Penduduk berhasil ditambahkan! ✅');
      setShowModal(false); setError('');
    } catch(e) { toast.dismiss(t); toast.error('Gagal: '+e.message); }
  };

  const hapus = async id => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    const t = toast.loading('Menghapus...');
    try {
      await dispatch({ type:'HAPUS_PENDUDUK', payload:id });
      toast.dismiss(t); toast.success('Data berhasil dihapus! 🗑');
    } catch(e) { toast.dismiss(t); toast.error('Gagal: '+e.message); }
  };

  const simpanRiwayat = async () => {
    if (!formRiwayat.nama||!formRiwayat.tanggal) return;
    const t = toast.loading('Menyimpan...');
    try {
      await dispatch({ type:'TAMBAH_RIWAYAT', payload:formRiwayat });
      toast.dismiss(t); toast.success('Riwayat berhasil dicatat! ✅');
      setShowRiwayatModal(false);
      setFormRiwayat({ jenis:'Pindah Masuk', nama:'', nik:'', tanggal: getTodayStr(), keterangan:'' });
    } catch(e) { toast.dismiss(t); toast.error('Gagal'); }
  };

  const exportExcel = () => {
    if (state.penduduk.length===0) { toast.error('Tidak ada data!'); return; }
    const t = toast.loading('Menyiapkan Excel...');
    try {
      const dataExport = state.penduduk.map((p,i) => ({
        'No': i+1, 'NIK': p.nik, 'No. KK': p.no_kk||'', 'Nama Lengkap': p.nama,
        'Tempat Lahir': p.tempatLahir, 'Tanggal Lahir': p.tanggalLahir,
        'Jenis Kelamin': p.jenisKelamin, 'Agama': p.agama, 'Pendidikan': p.pendidikan,
        'Pekerjaan': p.pekerjaan, 'Status Kawin': p.statusKawin, 'Alamat': p.alamat,
        'RT': p.rt, 'RW': p.rw, 'Dusun': p.dusun, 'Status Penduduk': p.status,
        'Tanggal Masuk': p.tanggalMasuk, 'Keterangan': p.keterangan||'',
      }));
      const ws = XLSX.utils.json_to_sheet(dataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Penduduk');
      const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([buf], { type:'application/octet-stream' }), `Data_Penduduk_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.dismiss(t); toast.success('Excel berhasil didownload! 📥');
    } catch(e) { toast.dismiss(t); toast.error('Gagal: '+e.message); }
  };

  const exportTemplate = () => {
    const template = [{ 'NIK':'3209010101900001', 'No. KK':'3209010101900000', 'Nama Lengkap':'Contoh Nama', 'Tempat Lahir':'Cirebon', 'Tanggal Lahir':'1990-01-01', 'Jenis Kelamin':'Laki-laki', 'Agama':'Islam', 'Pendidikan':'SMA', 'Pekerjaan':'Petani', 'Status Kawin':'Kawin', 'Alamat':'Kp. Cikulak', 'RT':'001', 'RW':'001', 'Dusun':'Dusun 1', 'Status Penduduk':'Tetap', 'Tanggal Masuk':'2020-01-01', 'Keterangan':'' }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([buf],{type:'application/octet-stream'}), 'Template_Import_Penduduk.xlsx');
    toast.success('Template berhasil didownload!');
  };

  const handleFileImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const t = toast.loading('Membaca file...');
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const wb = XLSX.read(evt.target.result, { type:'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (data.length===0) { toast.dismiss(t); toast.error('File kosong!'); return; }
        setImportData(data); setShowImportModal(true);
        toast.dismiss(t); toast.success(`${data.length} data siap diimport!`);
      } catch { toast.dismiss(t); toast.error('File tidak valid!'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const prosesImport = async () => {
    setImporting(true);
    const t = toast.loading(`Mengimport ${importData.length} data...`);
    let sukses=0, gagal=0;
    for (const row of importData) {
      try {
        await dispatch({ type:'TAMBAH_PENDUDUK', payload:{
          nik: String(row['NIK']||'').trim(), no_kk: String(row['No. KK']||'').trim(),
          nama: String(row['Nama Lengkap']||'').trim(), tempatLahir: String(row['Tempat Lahir']||'').trim(),
          tanggalLahir: String(row['Tanggal Lahir']||'').trim(), jenisKelamin: String(row['Jenis Kelamin']||'Laki-laki').trim(),
          agama: String(row['Agama']||'Islam').trim(), pendidikan: String(row['Pendidikan']||'SMA').trim(),
          pekerjaan: String(row['Pekerjaan']||'').trim(), statusKawin: String(row['Status Kawin']||'Belum Kawin').trim(),
          alamat: String(row['Alamat']||'').trim(), rt: String(row['RT']||'001').padStart(3,'0'),
          rw: String(row['RW']||'001').padStart(3,'0'), dusun: String(row['Dusun']||'Dusun 1').trim(),
          status: String(row['Status Penduduk']||'Tetap').trim(), tanggalMasuk: String(row['Tanggal Masuk']||getTodayStr()).trim(),
          keterangan: String(row['Keterangan']||'').trim(),
        }}); sukses++;
      } catch { gagal++; }
    }
    toast.dismiss(t);
    if (sukses>0) toast.success(`✅ ${sukses} data berhasil diimport!`);
    if (gagal>0)  toast.error(`❌ ${gagal} data gagal`);
    setImporting(false); setShowImportModal(false); setImportData([]);
  };

  const statUsia      = kelompokUsia(state.penduduk);
  const statPekerjaan = kelompokPekerjaan(state.penduduk);
  const maxPekerjaan  = Math.max(...statPekerjaan.map(s=>s.nilai),1);

  const tabs = [
    { id:'daftar',    label:'👥 Daftar' },
    { id:'riwayat',   label:'📋 Riwayat' },
    { id:'statistik', label:'📊 Statistik' },
  ];

  // ── CARD MOBILE PENDUDUK ──────────────────────────────
  const CardPenduduk = ({ p }) => (
  <div style={{
    background:'#fff', borderRadius:10, border:'1px solid #E2E8F0',
    padding:'10px 12px', marginBottom:6,
    display:'flex', alignItems:'center', gap:10,
  }}>
    {/* Icon */}
    <div style={{ width:34, height:34, borderRadius:8, background:p.jenisKelamin==='Laki-laki'?'#EBF3FC':'#FBEAF0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
      {p.jenisKelamin==='Laki-laki'?'👨':'👩'}
    </div>

    {/* NIK */}
    <div style={{ fontSize:10, color:'#A0AEC0', fontFamily:'monospace', flexShrink:0 }}>
      {p.nik}
    </div>

    {/* Nama */}
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nama}</div>
      <div style={{ fontSize:10, color:'#A0AEC0' }}>{p.dusun} · RT {p.rt}</div>
    </div>

    {/* Tombol Detail */}
    <Btn onClick={()=>setShowDetail(p)} size="sm" variant="soft" style={{ fontSize:11, padding:'5px 10px', flexShrink:0 }}>
      Detail
    </Btn>
  </div>
);

  // ── TABEL DESKTOP ─────────────────────────────────────
  const TabelDesktop = ({ list }) => (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:580 }}>
      <thead>
        <tr style={{ background:'#F8FAFC' }}>
          {['No','NIK','No. KK','Nama Lengkap','Umur/TTL','Pekerjaan','RT/RW','Status','Aksi'].map((h,i)=>(
            <th key={i} style={{ textAlign:'left', padding:'10px 12px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0', whiteSpace:'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.map((p,idx)=>(
          <tr key={p.id} style={{ borderBottom:'1px solid #F1F5F9' }}
            onMouseEnter={e=>e.currentTarget.style.background='#FAFBFC'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <td style={{ padding:'10px 12px', color:'#A0AEC0', fontSize:12, fontWeight:600 }}>{idx+1}</td>
            <td style={{ padding:'10px 12px', fontFamily:'monospace', fontSize:11, color:'#718096' }}>{p.nik}</td>
            <td style={{ padding:'10px 12px', fontFamily:'monospace', fontSize:11, color:'#718096' }}>{p.no_kk||'-'}</td>
            <td style={{ padding:'10px 12px' }}>
              <div style={{ fontWeight:700, fontSize:13 }}>{p.nama}</div>
              <div style={{ fontSize:11, color:'#A0AEC0' }}>{p.agama}</div>
            </td>
            <td style={{ padding:'10px 12px' }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{hitungUmur(p.tanggalLahir)} th</div>
              <div style={{ fontSize:11, color:'#718096' }}>{p.tempatLahir}</div>
            </td>
            <td style={{ padding:'10px 12px', fontSize:13, color:'#4A5568' }}>{p.pekerjaan}</td>
            <td style={{ padding:'10px 12px', fontSize:12 }}>
              <div style={{ fontWeight:600 }}>RT {p.rt}</div>
              <div style={{ color:'#718096' }}>RW {p.rw}</div>
            </td>
            <td style={{ padding:'10px 12px' }}>
              <Badge type={p.status==='Baru'?'warning':'success'}>{p.status}</Badge>
            </td>
            <td style={{ padding:'10px 12px', whiteSpace:'nowrap' }}>
              <div style={{ display:'flex', gap:4 }}>
                <Btn onClick={()=>setShowDetail(p)} size="sm" style={{ fontSize:11, padding:'4px 8px' }}>👁</Btn>
                {!readOnly && <Btn onClick={()=>bukaEdit(p)} variant="soft" size="sm" style={{ fontSize:11, padding:'4px 8px' }}>✏</Btn>}
                {!readOnly && <Btn onClick={()=>hapus(p.id)} variant="danger" size="sm" style={{ fontSize:11, padding:'4px 8px' }}>🗑</Btn>}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0, marginBottom:4 }}>👥 Data Penduduk</h2>
          <p style={{ fontSize:13, color:'#718096', margin:0 }}>Desa Cikulak · 5 Dusun · 24 RT · 5 RW</p>
        </div>
        <div className="section-header-action">
          {!readOnly && <Btn onClick={()=>setShowRiwayatModal(true)} variant="ghost">📝 Catat Perubahan</Btn>}
          {!readOnly && <Btn onClick={bukaTambah} variant="primary">+ Tambah</Btn>}
        </div>
      </div>

      {readOnly && (
        <div style={{ marginBottom:14, padding:'8px 16px', background:'#EBF3FC', borderRadius:10, border:'1px solid #B5D4F4', fontSize:12, color:'#1B5EA0', fontWeight:600 }}>
          🏛 Mode Admin — Anda hanya dapat melihat data penduduk
        </div>
      )}

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {/* ═══ DAFTAR ═══ */}
      {tab==='daftar' && (
        <>
          {/* Search */}
          <div style={{ position:'relative', marginBottom:12 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#A0AEC0' }}>🔍</span>
            <input value={search} onChange={e=>{ setSearch(e.target.value); if(e.target.value.trim()) expandAll(); }}
              placeholder="Cari nama, NIK, No. KK, pekerjaan..."
              style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'11px 16px 11px 44px', fontSize:14, fontFamily:'inherit', background:'#fff', outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#1B5EA0'}
              onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
            {search && (
              <button onClick={()=>setSearch('')}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'#E2E8F0', border:'none', borderRadius:'50%', width:22, height:22, cursor:'pointer', fontSize:13 }}>×</button>
            )}
          </div>

          {/* Filter & Actions */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <select value={filterDusun} onChange={e=>setFilterDusun(e.target.value)}
              style={{ border:'1.5px solid #CBD5E1', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', background:'#fff', outline:'none', cursor:'pointer', flex:'1', minWidth:160 }}>
              <option value="">🏘 Semua Dusun ({state.penduduk.length} jiwa)</option>
              {DUSUN_LIST.map(d=>(
                <option key={d} value={d}>{d} — {state.penduduk.filter(p=>p.dusun===d).length} jiwa</option>
              ))}
            </select>

            {!isSearching && !isMobile && (
              <div style={{ display:'flex', gap:6 }}>
                <Btn onClick={expandAll} variant="ghost" size="sm">📂 Buka</Btn>
                <Btn onClick={collapseAll} variant="ghost" size="sm">📁 Tutup</Btn>
              </div>
            )}

            <div style={{ display:'flex', gap:6, marginLeft:'auto', flexWrap:'wrap' }}>
              <Btn onClick={exportExcel} variant="success" size="sm">📥 Excel</Btn>
              {!readOnly && <Btn onClick={exportTemplate} variant="ghost" size="sm">📋 Template</Btn>}
              {!readOnly && <Btn onClick={()=>importRef.current?.click()} variant="soft" size="sm">📤 Import</Btn>}
              {!readOnly && <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleFileImport} style={{ display:'none' }} />}
            </div>
          </div>

          {/* Data */}
          {filtered.length === 0 ? (
            <EmptyState icon="🔍" text="Tidak ada data ditemukan" sub="Coba ubah kata pencarian atau filter dusun" />
          ) : isSearching ? (
            <>
              <div style={{ padding:'8px 14px', background:'#EBF3FC', borderRadius:10, border:'1px solid #B5D4F4', fontSize:13, color:'#1B5EA0', fontWeight:600, marginBottom:12 }}>
                🔍 {filtered.length} hasil untuk "{search}"
              </div>
              {isMobile ? (
                <div>{filtered.map(p => <CardPenduduk key={p.id} p={p} />)}</div>
              ) : (
                <div className="table-wrapper"><TabelDesktop list={filtered} /></div>
              )}
            </>
          ) : (
            grouped.map((g,gi) => (
              <div key={g.dusun} style={{ marginBottom:16 }}>
                <button onClick={()=>toggleDusun(g.dusun)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 18px', background:'#fff', borderRadius:expandedDusun[g.dusun]?'12px 12px 0 0':12, border:`2px solid ${g.color}44`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', cursor:'pointer', textAlign:'left' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
                  onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <div style={{ width:38, height:38, borderRadius:10, background:g.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:15, flexShrink:0 }}>{gi+1}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:g.color }}>{g.dusun}</div>
                    <div style={{ fontSize:12, color:'#718096' }}>RW {WILAYAH[g.dusun].rw} · <strong>{g.total} jiwa</strong></div>
                  </div>
                  {!isMobile && (
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'flex-end', maxWidth:200 }}>
                      {WILAYAH[g.dusun].rtList.map(rt => {
                        const cnt = state.penduduk.filter(p=>p.dusun===g.dusun&&p.rt===rt).length;
                        return cnt>0 ? (
                          <span key={rt} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:`${g.color}22`, color:g.color, fontWeight:700, border:`1px solid ${g.color}44` }}>
                            RT {rt}: {cnt}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <div style={{ fontSize:18, color:g.color, marginLeft:6, transition:'transform 0.2s', transform:expandedDusun[g.dusun]?'rotate(90deg)':'rotate(0deg)' }}>›</div>
                </button>

                {expandedDusun[g.dusun] && (
                  <div style={{ border:`2px solid ${g.color}44`, borderTop:'none', borderRadius:'0 0 12px 12px', overflow:'hidden', background:'#fff' }}>
                    {g.rtGroups.map((rtg,ri)=>(
                      <div key={rtg.rt}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 16px', background:`${g.color}11`, borderTop:ri===0?'none':'1px solid #E2E8F0' }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', background:g.color }} />
                          <span style={{ fontSize:12, fontWeight:700, color:g.color }}>RT {rtg.rt} / RW {WILAYAH[g.dusun].rw}</span>
                          <span style={{ fontSize:11, color:'#718096' }}>— {rtg.list.length} jiwa</span>
                        </div>
                        {isMobile ? (
                          <div style={{ padding:'10px' }}>
                            {rtg.list.map(p => <CardPenduduk key={p.id} p={p} />)}
                          </div>
                        ) : (
                          <div style={{ overflowX:'auto' }}>
                            <TabelDesktop list={rtg.list} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ═══ RIWAYAT ═══ */}
      {tab==='riwayat' && (
        isMobile ? (
          <div>
            {state.riwayatPerubahan.length===0
              ? <EmptyState icon="📋" text="Belum ada riwayat perubahan" />
              : state.riwayatPerubahan.map(r=>(
                <div key={r.id} style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', padding:'12px 14px', marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <Badge type={r.jenis==='Kelahiran'?'success':r.jenis==='Kematian'?'danger':r.jenis==='Pindah Masuk'?'info':'warning'}>{r.jenis}</Badge>
                    <span style={{ fontSize:11, color:'#A0AEC0' }}>{formatTanggal(r.tanggal)}</span>
                  </div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{r.nama}</div>
                  {r.nik && <div style={{ fontSize:11, color:'#718096', fontFamily:'monospace' }}>{r.nik}</div>}
                  {r.keterangan && <div style={{ fontSize:12, color:'#718096', marginTop:4 }}>{r.keterangan}</div>}
                </div>
              ))
            }
          </div>
        ) : (
          <div className="table-wrapper">
            {state.riwayatPerubahan.length===0
              ? <EmptyState icon="📋" text="Belum ada riwayat perubahan" />
              : (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, minWidth:500 }}>
                  <thead>
                    <tr style={{ background:'#F8FAFC' }}>
                      {['Tanggal','Jenis','NIK','Nama','Keterangan'].map((h,i)=>(
                        <th key={i} style={{ textAlign:'left', padding:'11px 14px', fontSize:12, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.riwayatPerubahan.map(r=>(
                      <tr key={r.id} style={{ borderBottom:'1px solid #F1F5F9' }}>
                        <td style={{ padding:'11px 14px', color:'#718096', whiteSpace:'nowrap' }}>{formatTanggal(r.tanggal)}</td>
                        <td style={{ padding:'11px 14px' }}>
                          <Badge type={r.jenis==='Kelahiran'?'success':r.jenis==='Kematian'?'danger':r.jenis==='Pindah Masuk'?'info':'warning'}>{r.jenis}</Badge>
                        </td>
                        <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:12, color:'#718096' }}>{r.nik||'-'}</td>
                        <td style={{ padding:'11px 14px', fontWeight:600 }}>{r.nama}</td>
                        <td style={{ padding:'11px 14px', color:'#718096' }}>{r.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        )
      )}

      {/* ═══ STATISTIK ═══ */}
      {tab==='statistik' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="grid-stats">
            <StatCard label="Total Jiwa"    value={state.penduduk.length} color="#1B5EA0" icon="👥" />
            <StatCard label="Laki-laki"     value={state.penduduk.filter(p=>p.jenisKelamin==='Laki-laki').length} color="#534AB7" icon="👨" />
            <StatCard label="Perempuan"     value={state.penduduk.filter(p=>p.jenisKelamin==='Perempuan').length} color="#993556" icon="👩" />
            <StatCard label="Penduduk Baru" value={state.penduduk.filter(p=>p.status==='Baru').length} color="#A0621B" icon="🆕" />
          </div>

          <div className="grid-2col">
            <Card>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>📊 Distribusi Usia</div>
              {statUsia.map(s=>(
                <div key={s.label} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                    <span style={{ color:'#4A5568' }}>{s.label}</span>
                    <span style={{ fontWeight:700 }}>{s.nilai} jiwa</span>
                  </div>
                  <div style={{ height:8, background:'#F1F5F9', borderRadius:4 }}>
                    <div style={{ height:'100%', width:`${state.penduduk.length?Math.round(s.nilai/state.penduduk.length*100):0}%`, background:'linear-gradient(90deg,#1B5EA0,#1565C0)', borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>💼 Distribusi Pekerjaan</div>
              {statPekerjaan.slice(0,6).map(s=>(
                <div key={s.label} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                    <span style={{ color:'#4A5568', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>{s.label}</span>
                    <span style={{ fontWeight:700 }}>{s.nilai} jiwa</span>
                  </div>
                  <div style={{ height:8, background:'#F1F5F9', borderRadius:4 }}>
                    <div style={{ height:'100%', width:`${maxPekerjaan?Math.round(s.nilai/maxPekerjaan*100):0}%`, background:'linear-gradient(90deg,#534AB7,#6C63FF)', borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {!readOnly && (
        <Modal show={showModal} onClose={()=>setShowModal(false)} title={editData?'✏ Edit Data Penduduk':'➕ Tambah Penduduk Baru'} width={620}>
          {error && <Alert type="danger">{error}</Alert>}
          <Input label="NIK (16 digit)" required value={form.nik} onChange={e=>setForm({...form,nik:e.target.value})} placeholder="3209XXXXXXXXXXXX" maxLength={16} />
          <Input label="No. KK (16 digit)" value={form.no_kk||''} onChange={e=>setForm({...form,no_kk:e.target.value})} placeholder="Nomor Kartu Keluarga" maxLength={16} />
          <Input label="Nama Lengkap" required value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Nama sesuai KTP" />
          <div className="form-row">
            <Input label="Tempat Lahir" value={form.tempatLahir} onChange={e=>setForm({...form,tempatLahir:e.target.value})} placeholder="Kota lahir" />
            <Input label="Tanggal Lahir" required type="date" value={form.tanggalLahir} onChange={e=>setForm({...form,tanggalLahir:e.target.value})} />
          </div>
          <div className="form-row">
            <Select label="Jenis Kelamin" value={form.jenisKelamin} onChange={e=>setForm({...form,jenisKelamin:e.target.value})}>
              <option>Laki-laki</option><option>Perempuan</option>
            </Select>
            <Select label="Agama" value={form.agama} onChange={e=>setForm({...form,agama:e.target.value})}>
              {AGAMA.map(a=><option key={a}>{a}</option>)}
            </Select>
          </div>
          <div className="form-row">
            <Select label="Pendidikan" value={form.pendidikan} onChange={e=>setForm({...form,pendidikan:e.target.value})}>
              {PENDIDIKAN.map(p=><option key={p}>{p}</option>)}
            </Select>
            <Select label="Status Kawin" value={form.statusKawin} onChange={e=>setForm({...form,statusKawin:e.target.value})}>
              {STATUS_KAWIN.map(s=><option key={s}>{s}</option>)}
            </Select>
          </div>
          <Input label="Pekerjaan" required value={form.pekerjaan} onChange={e=>setForm({...form,pekerjaan:e.target.value})} placeholder="cth: Petani, PNS, Wiraswasta" />
          <Input label="Alamat" value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} placeholder="Nama jalan / kampung" />
          <Select label="Dusun" value={form.dusun} onChange={e=>handleDusunChange(e.target.value)}>
            {DUSUN_LIST.map(d=><option key={d} value={d}>{d} — RW {WILAYAH[d].rw}</option>)}
          </Select>
          <div className="form-row">
            <Select label="RT" value={form.rt} onChange={e=>setForm({...form,rt:e.target.value})}>
              {(WILAYAH[form.dusun]?.rtList||[]).map(rt=><option key={rt} value={rt}>RT {rt}</option>)}
            </Select>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>RW</label>
              <input value={`RW ${form.rw}`} disabled style={{ width:'100%', border:'1.5px solid #E2E8F0', borderRadius:10, padding:'10px 14px', fontSize:14, background:'#F8FAFC', color:'#718096', fontFamily:'inherit', boxSizing:'border-box' }} />
            </div>
          </div>
          <div className="form-row">
            <Select label="Status Penduduk" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option>Tetap</option><option>Baru</option><option>Sementara</option>
            </Select>
            <Input label="Tanggal Masuk" type="date" value={form.tanggalMasuk} onChange={e=>setForm({...form,tanggalMasuk:e.target.value})} />
          </div>
          <Input label="Keterangan (opsional)" value={form.keterangan} onChange={e=>setForm({...form,keterangan:e.target.value})} placeholder="Catatan tambahan" />
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:14, paddingTop:14, borderTop:'1px solid #E2E8F0' }}>
            <Btn onClick={()=>setShowModal(false)}>Batal</Btn>
            <Btn variant="primary" onClick={simpan}>💾 Simpan Data</Btn>
          </div>
        </Modal>
      )}

      {/* Modal Import */}
      {!readOnly && (
        <Modal show={showImportModal} onClose={()=>{ setShowImportModal(false); setImportData([]); }} title="📤 Konfirmasi Import Excel" width={560}>
          <Alert type="info">Ditemukan <strong>{importData.length} data</strong>. NIK duplikat akan dilewati otomatis.</Alert>
          {importData.length>0 && (
            <div style={{ overflowX:'auto', marginBottom:16 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:400 }}>
                <thead>
                  <tr style={{ background:'#F8FAFC' }}>
                    {['NIK','Nama','Dusun','RT','Pekerjaan'].map((h,i)=>(
                      <th key={i} style={{ textAlign:'left', padding:'7px 10px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importData.slice(0,5).map((r,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid #F1F5F9' }}>
                      <td style={{ padding:'7px 10px', fontFamily:'monospace', fontSize:11 }}>{r['NIK']}</td>
                      <td style={{ padding:'7px 10px', fontWeight:600 }}>{r['Nama Lengkap']}</td>
                      <td style={{ padding:'7px 10px' }}>{r['Dusun']}</td>
                      <td style={{ padding:'7px 10px' }}>{r['RT']}</td>
                      <td style={{ padding:'7px 10px' }}>{r['Pekerjaan']}</td>
                    </tr>
                  ))}
                  {importData.length>5 && (
                    <tr><td colSpan={5} style={{ padding:'7px 10px', color:'#718096', fontSize:12, textAlign:'center' }}>...dan {importData.length-5} data lainnya</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Btn onClick={()=>{ setShowImportModal(false); setImportData([]); }}>Batal</Btn>
            <Btn variant="primary" onClick={prosesImport} disabled={importing}>{importing ? '⏳ Mengimport...' : `📤 Import ${importData.length} Data`}</Btn>
          </div>
        </Modal>
      )}

      {/* Modal Riwayat */}
      {!readOnly && (
        <Modal show={showRiwayatModal} onClose={()=>setShowRiwayatModal(false)} title="📝 Catat Perubahan Penduduk" width={460}>
          <Select label="Jenis Perubahan" value={formRiwayat.jenis} onChange={e=>setFormRiwayat({...formRiwayat,jenis:e.target.value})}>
            {JENIS_RIWAYAT.map(j=><option key={j}>{j}</option>)}
          </Select>
          <Input label="Nama" value={formRiwayat.nama} onChange={e=>setFormRiwayat({...formRiwayat,nama:e.target.value})} placeholder="Nama penduduk" />
          <Input label="NIK (opsional)" value={formRiwayat.nik} onChange={e=>setFormRiwayat({...formRiwayat,nik:e.target.value})} placeholder="16 digit NIK" />
          <Input label="Tanggal Kejadian" type="date" value={formRiwayat.tanggal} onChange={e=>setFormRiwayat({...formRiwayat,tanggal:e.target.value})} />
          <Input label="Keterangan" value={formRiwayat.keterangan} onChange={e=>setFormRiwayat({...formRiwayat,keterangan:e.target.value})} placeholder="Penjelasan singkat..." />
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:12 }}>
            <Btn onClick={()=>setShowRiwayatModal(false)}>Batal</Btn>
            <Btn variant="primary" onClick={simpanRiwayat}>💾 Simpan</Btn>
          </div>
        </Modal>
      )}

      {/* Modal Detail */}
      <Modal show={!!showDetail} onClose={()=>setShowDetail(null)} title="👤 Detail Data Penduduk" width={500}>
        {showDetail && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, padding:'14px', background:'#F8FAFC', borderRadius:12 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:showDetail.jenisKelamin==='Laki-laki'?'#EBF3FC':'#FBEAF0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                {showDetail.jenisKelamin==='Laki-laki'?'👨':'👩'}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:16, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{showDetail.nama}</div>
                <div style={{ fontSize:12, color:'#718096', fontFamily:'monospace' }}>{showDetail.nik}</div>
                <div style={{ fontSize:13, color:'#4A5568', marginTop:2 }}>{hitungUmur(showDetail.tanggalLahir)} tahun · {showDetail.pekerjaan}</div>
              </div>
            </div>
            {[
              ['🪪 NIK', showDetail.nik],
              ['🏠 No. KK', showDetail.no_kk||'-'],
              ['📅 TTL', `${showDetail.tempatLahir}, ${formatTanggal(showDetail.tanggalLahir)}`],
              ['⚤ Jenis Kelamin', showDetail.jenisKelamin],
              ['🕌 Agama', showDetail.agama],
              ['🎓 Pendidikan', showDetail.pendidikan],
              ['💍 Status Kawin', showDetail.statusKawin],
              ['🏘 Dusun/RW', `${showDetail.dusun} · RW ${showDetail.rw}`],
              ['🏠 RT/Alamat', `RT ${showDetail.rt} · ${showDetail.alamat}`],
              ['📋 Status', showDetail.status],
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F1F5F9', fontSize:13 }}>
                <span style={{ color:'#718096', fontWeight:500, flexShrink:0, marginRight:12 }}>{k}</span>
                <span style={{ fontWeight:600, textAlign:'right' }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              {!readOnly && <Btn onClick={()=>{ setShowDetail(null); bukaEdit(showDetail); }} variant="soft" style={{ flex:1 }}>✏ Edit</Btn>}
              <Btn onClick={()=>setShowDetail(null)} style={{ flex:1 }}>Tutup</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}