import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const JENIS_SURAT = [
  'Surat Keterangan Domisili',
  'Surat Keterangan Tidak Mampu',
  'Surat Keterangan Usaha',
  'Surat Keterangan Kelahiran',
  'Surat Keterangan Kematian',
  'Surat Keterangan Pindah',
  'Surat Pengantar KTP',
  'Surat Pengantar KK',
  'Surat Keterangan Lainnya',
];

const STATUS_COLOR = {
  'Menunggu':  { bg:'#FEF9C3', color:'#92400E', border:'#FDE68A' },
  'Diproses':  { bg:'#EEF4FF', color:'#1D4ED8', border:'#BFDBFE' },
  'Selesai':   { bg:'#F0FDF4', color:'#16A34A', border:'#BBF7D0' },
};

export default function DashboardWarga({ warga, token, onLogout }) {
  const [tab, setTab]         = useState('beranda');
  const [profil, setProfil]   = useState(null);
  const [bansos, setBansos]   = useState([]);
  const [surat, setSurat]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form ajukan surat
  const [showForm, setShowForm] = useState(false);
  const [formSurat, setFormSurat] = useState({ jenis_surat: JENIS_SURAT[0], keperluan: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rProfil, rBansos, rSurat] = await Promise.all([
        fetch(`${API}/warga/profil`, { headers }).then(r => r.json()),
        fetch(`${API}/warga/bansos`, { headers }).then(r => r.json()),
        fetch(`${API}/warga/surat`,  { headers }).then(r => r.json()),
      ]);
      if (rProfil.ok)  setProfil(rProfil.data);
      if (rBansos.ok)  setBansos(rBansos.data);
      if (rSurat.ok)   setSurat(rSurat.data);
    } catch {}
    setLoading(false);
  };

  const handleAjukanSurat = async (e) => {
    e.preventDefault();
    setSubmitMsg(''); setSubmitLoading(true);
    try {
      const res = await fetch(`${API}/warga/surat`, {
        method: 'POST', headers,
        body: JSON.stringify(formSurat),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitMsg(`✅ Pengajuan berhasil! No. Antrian: ${data.nomor_antrian}`);
        setFormSurat({ jenis_surat: JENIS_SURAT[0], keperluan: '' });
        fetchAll();
        setTimeout(() => { setShowForm(false); setSubmitMsg(''); }, 3000);
      } else {
        setSubmitMsg(`❌ ${data.msg}`);
      }
    } catch {
      setSubmitMsg('❌ Gagal terhubung ke server');
    }
    setSubmitLoading(false);
  };

  const navigateTo = (id) => { setTab(id); if (isMobile) setSidebarOpen(false); };

  const NAV = [
    { id:'beranda', label:'Beranda',    emoji:'🏠' },
    { id:'profil',  label:'Profil',     emoji:'👤' },
    { id:'bansos',  label:'Bansos',     emoji:'🤝' },
    { id:'surat',   label:'Pengajuan Surat', emoji:'📋' },
  ];

  const C = { navy:'#0B2545', royal:'#1D4ED8', emas:'#C9A84C', red:'#DC2626' };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:`linear-gradient(135deg,${C.navy},#1A3A6B)`, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <div style={{ fontSize:40 }}>👤</div>
        <div style={{ color:'white', fontWeight:700, fontSize:16 }}>Memuat data...</div>
        <div style={{ width:36, height:36, border:`3px solid rgba(255,255,255,.15)`, borderTop:`3px solid ${C.emas}`, borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif" }}>

      {/* HEADER */}
      <header style={{ position:'fixed', top:0, left:0, right:0, height:60, background:`linear-gradient(135deg,${C.navy},#1A3A6B,${C.royal})`, display:'flex', alignItems:'center', padding:'0 16px', gap:12, zIndex:200, boxShadow:'0 2px 20px rgba(11,37,69,.4)' }}>
        {isMobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:8, color:'#fff', width:36, height:36, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}
        <div style={{ width:34, height:34, background:'rgba(255,255,255,.15)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>👤</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Portal Warga — {warga.nama}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Desa Cikulak · NIK: {warga.nik}</div>
        </div>
        <button onClick={onLogout}
          style={{ background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.3)', color:'#FCA5A5', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          Keluar
        </button>
      </header>

      {/* OVERLAY mobile */}
      {isMobile && sidebarOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:140 }} onClick={() => setSidebarOpen(false)}/>
      )}

      <div style={{ display:'flex', paddingTop:60 }}>

        {/* SIDEBAR */}
        <aside style={{
          width:220, background:'#fff', borderRight:'1px solid #E8EDF5',
          padding:'16px 0', flexShrink:0,
          position:'fixed', top:60, left:0, bottom:0, zIndex:150,
          boxShadow:'2px 0 16px rgba(11,37,69,.07)',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          transition:'transform .3s',
          overflowY:'auto',
        }}>
          {/* Warga Info */}
          <div style={{ margin:'0 12px 14px', padding:'12px', background:`linear-gradient(135deg,${C.navy},#1A3A6B)`, borderRadius:12, textAlign:'center' }}>
            <div style={{ width:44, height:44, background:'rgba(255,255,255,.15)', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, margin:'0 auto 8px', border:`2px solid ${C.emas}` }}>👤</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:2 }}>{warga.nama}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.55)' }}>NIK: {warga.nik}</div>
            <div style={{ display:'inline-block', background:C.emas, color:'#0A1628', fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:8, marginTop:6 }}>Warga Desa</div>
          </div>

          <div style={{ padding:'0 14px 8px', fontSize:10, fontWeight:700, color:'#A0AEC0', textTransform:'uppercase', letterSpacing:1.2 }}>Menu</div>

          {NAV.map(n => {
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => navigateTo(n.id)}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', background:active?'linear-gradient(135deg,#EEF4FF,#DBEAFE)':'transparent', border:'none', textAlign:'left', cursor:'pointer', borderLeft:active?`4px solid ${C.royal}`:'4px solid transparent', transition:'all .15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='#F5F7FF'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
                <div style={{ width:32, height:32, borderRadius:8, background:active?`linear-gradient(135deg,${C.navy},${C.royal})`:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{n.emoji}</div>
                <span style={{ fontSize:13, fontWeight:active?700:500, color:active?C.royal:'#1A2332' }}>{n.label}</span>
              </button>
            );
          })}

          <div style={{ margin:'10px 14px', height:1, background:'#E8EDF5' }}/>

          <button onClick={onLogout}
            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', background:'transparent', border:'none', cursor:'pointer', borderLeft:'4px solid transparent', transition:'all .15s', textAlign:'left' }}
            onMouseEnter={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.borderLeftColor=C.red; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderLeftColor='transparent'; }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🚪</div>
            <span style={{ fontSize:13, color:C.red, fontWeight:500 }}>Keluar</span>
          </button>
        </aside>

        {/* MAIN */}
        <main style={{ flex:1, marginLeft: isMobile ? 0 : 220, padding:'20px 16px', minHeight:'calc(100vh - 60px)' }}>

          {/* ── BERANDA ── */}
          {tab === 'beranda' && (
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#A0AEC0', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Selamat Datang</div>
                <h1 style={{ fontSize:22, fontWeight:800, color:C.navy }}>Halo, {warga.nama}! 👋</h1>
                <p style={{ color:'#718096', fontSize:13, marginTop:4 }}>Portal layanan masyarakat Desa Cikulak</p>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:24 }}>
                {[
                  { icon:'🤝', label:'Program Bansos', val: bansos.length, color:C.navy, sub: bansos.length > 0 ? 'Anda terdaftar' : 'Tidak terdaftar' },
                  { icon:'📋', label:'Total Pengajuan', val: surat.length, color:C.royal, sub:'surat' },
                  { icon:'⏳', label:'Menunggu', val: surat.filter(s=>s.status==='Menunggu').length, color:'#D97706', sub:'diproses' },
                  { icon:'✅', label:'Selesai', val: surat.filter(s=>s.status==='Selesai').length, color:'#16A34A', sub:'surat' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:16, padding:'18px 16px', boxShadow:'0 2px 12px rgba(11,37,69,.07)', border:'1px solid #E8EDF5' }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                    <div style={{ fontSize:24, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1A2332', marginTop:4 }}>{s.label}</div>
                    <div style={{ fontSize:11, color:'#A0AEC0' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Quick Action */}
              <div style={{ background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(11,37,69,.07)', border:'1px solid #E8EDF5', marginBottom:20 }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.navy, marginBottom:14 }}>⚡ Aksi Cepat</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <button onClick={() => { setTab('surat'); setShowForm(true); }}
                    style={{ padding:'10px 18px', background:`linear-gradient(135deg,${C.navy},${C.royal})`, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                    📋 Ajukan Surat
                  </button>
                  <button onClick={() => setTab('bansos')}
                    style={{ padding:'10px 18px', background:'#EEF4FF', color:C.royal, border:`1px solid #BFDBFE`, borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                    🤝 Cek Bansos
                  </button>
                  <button onClick={() => setTab('profil')}
                    style={{ padding:'10px 18px', background:'#F5F7FF', color:C.navy, border:'1px solid #E8EDF5', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                    👤 Lihat Profil
                  </button>
                </div>
              </div>

              {/* Surat terbaru */}
              {surat.length > 0 && (
                <div style={{ background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(11,37,69,.07)', border:'1px solid #E8EDF5' }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.navy, marginBottom:14 }}>📋 Pengajuan Terbaru</div>
                  {surat.slice(0,3).map((s,i) => {
                    const sc = STATUS_COLOR[s.status] || STATUS_COLOR['Menunggu'];
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: i < Math.min(surat.length,3)-1 ? '1px solid #F1F5F9' : 'none', gap:12 }}>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#0A1628', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.jenis_surat}</div>
                          <div style={{ fontSize:11, color:'#A0AEC0' }}>{s.nomor_antrian} · {new Date(s.tanggal_ajuan).toLocaleDateString('id-ID')}</div>
                        </div>
                        <span style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700, flexShrink:0 }}>{s.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROFIL ── */}
          {tab === 'profil' && (
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, color:C.navy, marginBottom:16 }}>👤 Profil Saya</h2>
              {profil ? (
                <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 12px rgba(11,37,69,.07)', border:'1px solid #E8EDF5' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:20, borderBottom:'1px solid #F1F5F9' }}>
                    <div style={{ width:60, height:60, background:`linear-gradient(135deg,${C.navy},${C.royal})`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>👤</div>
                    <div>
                      <div style={{ fontSize:18, fontWeight:800, color:C.navy }}>{profil.nama}</div>
                      <div style={{ fontSize:13, color:'#718096' }}>NIK: {profil.nik}</div>
                      <span style={{ display:'inline-block', background:C.emas, color:'#0A1628', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:8, marginTop:4 }}>{profil.status}</span>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
                    {[
                      { label:'No. KK', val: profil.no_kk || '-' },
                      { label:'Tempat, Tgl Lahir', val: `${profil.tempat_lahir || '-'}, ${profil.tanggal_lahir ? new Date(profil.tanggal_lahir).toLocaleDateString('id-ID') : '-'}` },
                      { label:'Jenis Kelamin', val: profil.jenis_kelamin || '-' },
                      { label:'Agama', val: profil.agama || '-' },
                      { label:'Pendidikan', val: profil.pendidikan || '-' },
                      { label:'Pekerjaan', val: profil.pekerjaan || '-' },
                      { label:'Status Kawin', val: profil.status_kawin || '-' },
                      { label:'Alamat', val: `${profil.alamat || ''}, RT ${profil.rt}/RW ${profil.rw}, ${profil.dusun}` },
                    ].map((item,i) => (
                      <div key={i} style={{ background:'#F5F7FF', borderRadius:10, padding:'12px 14px' }}>
                        <div style={{ fontSize:11, fontWeight:600, color:'#A0AEC0', marginBottom:3, textTransform:'uppercase', letterSpacing:.5 }}>{item.label}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#0A1628' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ background:'#fff', borderRadius:16, padding:40, textAlign:'center', color:'#A0AEC0' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                  <div>Data profil tidak ditemukan di database penduduk</div>
                </div>
              )}
            </div>
          )}

          {/* ── BANSOS ── */}
          {tab === 'bansos' && (
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, color:C.navy, marginBottom:16 }}>🤝 Status Bantuan Sosial</h2>

              {/* Status banner */}
              <div style={{ background: bansos.length > 0 ? '#F0FDF4' : '#FEF9C3', border:`1px solid ${bansos.length > 0 ? '#BBF7D0' : '#FDE68A'}`, borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:32 }}>{bansos.length > 0 ? '✅' : '❌'}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color: bansos.length > 0 ? '#16A34A' : '#92400E' }}>
                    {bansos.length > 0 ? `Anda terdaftar dalam ${bansos.length} program bansos` : 'Anda tidak terdaftar dalam program bansos'}
                  </div>
                  <div style={{ fontSize:12, color:'#718096', marginTop:2 }}>
                    {bansos.length > 0 ? 'Data diperbarui oleh perangkat desa' : 'Hubungi kantor desa untuk informasi lebih lanjut'}
                  </div>
                </div>
              </div>

              {bansos.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {bansos.map((b,i) => (
                    <div key={i} style={{ background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(11,37,69,.07)', border:'1px solid #E8EDF5', borderLeft:`4px solid ${C.emas}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, gap:10 }}>
                        <div>
                          <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{b.nama_program}</div>
                          <div style={{ fontSize:12, color:'#718096' }}>Tahun {b.tahun}</div>
                        </div>
                        <span style={{ background: b.status_program==='Aktif'?'#F0FDF4':'#F1F5F9', color: b.status_program==='Aktif'?'#16A34A':'#718096', border:`1px solid ${b.status_program==='Aktif'?'#BBF7D0':'#E2E8F0'}`, padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700, flexShrink:0 }}>{b.status_program}</span>
                      </div>
                      {b.deskripsi && <div style={{ fontSize:12, color:'#718096', marginBottom:10 }}>{b.deskripsi}</div>}
                      {b.jumlah > 0 && (
                        <div style={{ background:'#EEF4FF', borderRadius:8, padding:'8px 12px', fontSize:13, fontWeight:600, color:C.royal }}>
                          💰 Jumlah Bantuan: Rp {b.jumlah.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background:'#fff', borderRadius:16, padding:40, textAlign:'center', border:'1px solid #E8EDF5' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Belum Ada Data Bansos</div>
                  <div style={{ fontSize:13, color:'#A0AEC0' }}>Hubungi kantor desa untuk informasi program bantuan sosial</div>
                </div>
              )}
            </div>
          )}

          {/* ── SURAT ── */}
          {tab === 'surat' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                <h2 style={{ fontSize:20, fontWeight:800, color:C.navy }}>📋 Pengajuan Surat</h2>
                <button onClick={() => setShowForm(!showForm)}
                  style={{ padding:'9px 18px', background:`linear-gradient(135deg,${C.navy},${C.royal})`, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                  {showForm ? '✕ Tutup' : '+ Ajukan Surat Baru'}
                </button>
              </div>

              {/* Form Ajukan */}
              {showForm && (
                <div style={{ background:'#fff', borderRadius:16, padding:20, boxShadow:'0 4px 20px rgba(11,37,69,.1)', border:`1px solid #BFDBFE`, marginBottom:20 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.navy, marginBottom:16 }}>📝 Form Pengajuan Surat</div>
                  {submitMsg && (
                    <div style={{ background: submitMsg.includes('✅')?'#F0FDF4':'#FEF2F2', border:`1px solid ${submitMsg.includes('✅')?'#BBF7D0':'#FECACA'}`, color: submitMsg.includes('✅')?'#16A34A':'#DC2626', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:14 }}>
                      {submitMsg}
                    </div>
                  )}
                  <form onSubmit={handleAjukanSurat}>
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Jenis Surat</label>
                      <select value={formSurat.jenis_surat} onChange={e => setFormSurat({...formSurat, jenis_surat: e.target.value})}
                        style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'11px 14px', fontSize:14, background:'#fff', color:'#0A1628', outline:'none', cursor:'pointer' }}>
                        {JENIS_SURAT.map(j => <option key={j}>{j}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom:18 }}>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Keperluan</label>
                      <textarea value={formSurat.keperluan} onChange={e => setFormSurat({...formSurat, keperluan: e.target.value})}
                        placeholder="Jelaskan keperluan pengajuan surat..."
                        rows={3}
                        style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'11px 14px', fontSize:14, background:'#fff', color:'#0A1628', outline:'none', resize:'vertical', fontFamily:'inherit' }}/>
                    </div>
                    <button type="submit" disabled={submitLoading}
                      style={{ padding:'11px 24px', background:submitLoading?'#93C5FD':`linear-gradient(135deg,${C.navy},${C.royal})`, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:submitLoading?'wait':'pointer' }}>
                      {submitLoading ? '⏳ Mengirim...' : '📤 Kirim Pengajuan'}
                    </button>
                  </form>
                </div>
              )}

              {/* Daftar surat */}
              {surat.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:16, padding:40, textAlign:'center', border:'1px solid #E8EDF5' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Belum Ada Pengajuan</div>
                  <div style={{ fontSize:13, color:'#A0AEC0' }}>Klik "Ajukan Surat Baru" untuk membuat pengajuan</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {surat.map((s,i) => {
                    const sc = STATUS_COLOR[s.status] || STATUS_COLOR['Menunggu'];
                    return (
                      <div key={i} style={{ background:'#fff', borderRadius:14, padding:18, boxShadow:'0 2px 12px rgba(11,37,69,.06)', border:'1px solid #E8EDF5', borderLeft:`4px solid ${sc.color}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color:'#0A1628' }}>{s.jenis_surat}</div>
                            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>No. Antrian: {s.nomor_antrian}</div>
                          </div>
                          <span style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, padding:'4px 12px', borderRadius:8, fontSize:12, fontWeight:700, flexShrink:0 }}>{s.status}</span>
                        </div>
                        {s.keperluan && <div style={{ fontSize:12, color:'#718096', marginBottom:6 }}>📌 {s.keperluan}</div>}
                        <div style={{ fontSize:11, color:'#A0AEC0' }}>
                          Diajukan: {new Date(s.tanggal_ajuan).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                          {s.petugas && ` · Petugas: ${s.petugas}`}
                        </div>
                        {s.catatan && <div style={{ marginTop:8, background:'#F5F7FF', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#4A5568' }}>💬 {s.catatan}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}