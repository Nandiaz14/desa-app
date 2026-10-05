import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage     from './pages/LoginPage';
import Dashboard     from './pages/Dashboard';
import DataPenduduk  from './pages/DataPenduduk';
import SuratMenyurat from './pages/SuratMenyurat';
import ManajemenUser from './pages/ManajemenUser';
import Bansos        from './pages/Bansos';
import Fasilitas     from './pages/Fasilitas';
import Laporan       from './pages/Laporan';
import LandingPage     from './pages/LandingPage';
import LoginWarga     from './pages/LoginWarga';
import DashboardWarga from './pages/DashboardWarga';
import './index.css';

// ── WARNA TEMA ──
const C = {
  navy:      '#0B2545',
  navyMid:   '#1A3A6B',
  royal:     '#1D4ED8',
  blue:      '#3B82F6',
  emas:      '#C9A84C',
  emasLight: '#F0D080',
  red:       '#DC2626',
};

const NAV_ADMIN = [
  { id:'dashboard', label:'Beranda',         emoji:'🏠', desc:'Ringkasan data' },
  { id:'penduduk',  label:'Data Penduduk',   emoji:'👥', desc:'Lihat data warga desa' },
  { id:'arsip',     label:'Arsip Surat',     emoji:'🗂',  desc:'Laporan & arsip surat' },
  { id:'bansos',    label:'Bantuan Sosial',  emoji:'🤝', desc:'Lihat program bansos' },
  { id:'fasilitas', label:'Fasilitas Desa',  emoji:'🏛',  desc:'Approve booking fasilitas' },
  { id:'laporan',   label:'Laporan',         emoji:'📊', desc:'Rekap & export data' },
  { id:'users',     label:'Kelola Pengguna', emoji:'🔐', desc:'Manajemen akun' },
];

const NAV_USER = [
  { id:'dashboard', label:'Beranda',        emoji:'🏠', desc:'Ringkasan data' },
  { id:'penduduk',  label:'Data Penduduk',  emoji:'👥', desc:'Kelola warga desa' },
  { id:'surat',     label:'Surat & Arsip',  emoji:'📋', desc:'Pengajuan & arsip surat' },
  { id:'bansos',    label:'Bantuan Sosial', emoji:'🤝', desc:'Kelola program bansos' },
  { id:'fasilitas', label:'Fasilitas Desa', emoji:'🏛',  desc:'Inventaris & booking' },
  { id:'laporan',   label:'Laporan',        emoji:'📊', desc:'Rekap data' },
];

function AppInner() {
  const { state, loadingData, error, reload } = useApp();
  const { currentUser, logout, isKepala }     = useAuth();
  const [page,        setPage]        = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth <= 768);

  const desa          = state.pengaturanDesa || {};
  const suratMenunggu = state.pengajuanSurat.filter(s => s.status==='Menunggu').length;
  const NAV           = isKepala ? NAV_ADMIN : NAV_USER;
  const roleIcon      = isKepala ? '🏛' : '👤';
  const roleLabel     = isKepala ? 'Kepala Desa' : 'Perangkat Desa';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const validPages = NAV.map(n => n.id);
    if (!validPages.includes(page)) setPage('dashboard');
  }, [isKepala]);

  const navigateTo  = (id) => { setPage(id); if (isMobile) setSidebarOpen(false); };
  const handleLogout = () => { logout(); setShowLogout(false); toast.success('Berhasil keluar dari sistem'); };
  const handleReload = async () => {
    const t = toast.loading('Memuat ulang data...');
    await reload();
    toast.dismiss(t);
    toast.success('Data berhasil dimuat ulang!');
  };

  const pages = isKepala ? {
    dashboard: <Dashboard onNav={navigateTo} />,
    penduduk:  <DataPenduduk readOnly={true} />,
    arsip:     <SuratMenyurat adminMode={true} />,
    bansos:    <Bansos />,
    fasilitas: <Fasilitas />,
    laporan:   <Laporan />,
    users:     <ManajemenUser />,
  } : {
    dashboard: <Dashboard onNav={navigateTo} />,
    penduduk:  <DataPenduduk readOnly={false} />,
    surat:     <SuratMenyurat adminMode={false} />,
    bansos:    <Bansos />,
    fasilitas: <Fasilitas />,
    laporan:   <Laporan />,
  };

  // ── LOADING ──
  if (loadingData) {
    return (
      <div style={{ minHeight:'100vh', background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", padding:16 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:80, height:80, background:'rgba(255,255,255,.1)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 20px', border:'2px solid rgba(201,168,76,.3)' }}>🏛️</div>
          <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:6 }}>Memuat Data...</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:28 }}>Mengambil data dari database</div>
          <div className="spin" style={{ width:36, height:36, border:`3px solid rgba(255,255,255,.15)`, borderTop:`3px solid ${C.emas}`, borderRadius:'50%', margin:'0 auto' }} />
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <div style={{ minHeight:'100vh', background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <div style={{ textAlign:'center', maxWidth:400, width:'100%', padding:'32px 28px', background:'#fff', borderRadius:24, boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}>
          <div style={{ fontSize:48, marginBottom:14 }}>⚠️</div>
          <div style={{ fontSize:17, fontWeight:700, color:C.red, marginBottom:8 }}>Gagal Terhubung ke Server</div>
          <div style={{ fontSize:13, color:'#718096', marginBottom:24 }}>Pastikan server backend sudah berjalan.</div>
          <button onClick={reload} style={{ padding:'12px 28px', fontSize:14, fontWeight:700, background:`linear-gradient(135deg,${C.navy},${C.royal})`, color:'#fff', border:'none', borderRadius:12, cursor:'pointer', width:'100%' }}>
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">

      {/* ── HEADER ── */}
      <header className="app-header">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>

        {/* Logo */}
        <div style={{ width:36, height:36, background:'rgba(255,255,255,.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0, border:'1px solid rgba(255,255,255,.2)' }}>🏛️</div>

        {/* Title */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'#fff' }}>
            Sistem Informasi Desa {desa.namaDesa}
          </div>
          <div className="header-sub" style={{ fontSize:11, color:'rgba(255,255,255,.65)' }}>
            Kec. {desa.kecamatan} · Kab. {desa.kabupaten} · {desa.provinsi}
          </div>
        </div>

        {/* Date */}
        <div className="header-date" style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.75)', marginRight:8, flexShrink:0 }}>
          {new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </div>

        {/* Profile */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <button onClick={() => setShowProfile(!showProfile)}
            style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, padding:'6px 10px', cursor:'pointer', color:'#fff', transition:'background .2s' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${C.emas},#B8963E)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{roleIcon}</div>
            <div className="profile-name" style={{ textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:700, whiteSpace:'nowrap', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>{currentUser?.nama}</div>
              <div style={{ fontSize:10, opacity:.75 }}>{currentUser?.jabatan}</div>
            </div>
            <span style={{ fontSize:10, opacity:.6 }}>▼</span>
          </button>

          {/* Dropdown Profile */}
          {showProfile && (
            <div style={{ position:'absolute', right:0, top:'110%', background:'#fff', borderRadius:16, border:'1px solid #E8EDF5', boxShadow:'0 16px 48px rgba(11,37,69,.18)', minWidth:240, maxWidth:'92vw', zIndex:500, overflow:'hidden' }}>
              <div style={{ padding:'16px 18px', background:`linear-gradient(135deg,#EEF4FF,#DBEAFE)`, borderBottom:'1px solid #E8EDF5' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${C.navy},${C.royal})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{roleIcon}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#0A1628', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentUser?.nama}</div>
                    <div style={{ fontSize:11, color:'#5A6A85' }}>{currentUser?.jabatan}</div>
                    <span style={{ fontSize:10, background:isKepala?C.navy:C.royal, color:'#fff', padding:'2px 8px', borderRadius:8, fontWeight:600 }}>{roleLabel}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding:'8px 12px', borderBottom:'1px solid #F1F5F9' }}>
                <button onClick={() => { setShowProfile(false); handleReload(); }}
                  style={{ width:'100%', padding:'9px', fontSize:13, fontWeight:600, background:'#EEF4FF', color:C.royal, border:`1px solid #BFDBFE`, borderRadius:8, cursor:'pointer' }}>
                  🔄 Refresh Data
                </button>
              </div>
              <div style={{ padding:'10px 12px' }}>
                <button onClick={() => { setShowProfile(false); setShowLogout(true); }}
                  style={{ width:'100%', padding:'10px', fontSize:13, fontWeight:700, background:'#FEF2F2', color:C.red, border:`1.5px solid #FECACA`, borderRadius:9, cursor:'pointer' }}>
                  🚪 Keluar dari Sistem
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {showProfile && <div style={{ position:'fixed', inset:0, zIndex:199 }} onClick={() => setShowProfile(false)} />}
      {isMobile && sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-body">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${isMobile ? (sidebarOpen ? 'open' : '') : 'open'}`}
          style={{ transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)' }}>

          {/* Role Badge */}
          <div style={{ margin:'0 12px 14px', padding:'9px 12px', background:isKepala?`linear-gradient(135deg,${C.navy},${C.navyMid})`:`linear-gradient(135deg,${C.navyMid},${C.royal})`, borderRadius:10, fontSize:11, fontWeight:700, color:'#fff', textAlign:'center', letterSpacing:'.03em', boxShadow:`0 3px 10px rgba(11,37,69,.2)` }}>
            {isKepala ? '🏛️ Mode Kepala Desa' : '👤 Mode Perangkat Desa'}
          </div>

          {/* Section Label */}
          <div style={{ padding:'0 16px 8px', fontSize:10, fontWeight:700, color:'#A0AEC0', textTransform:'uppercase', letterSpacing:1.2 }}>Menu Utama</div>

          {/* Nav Items */}
          {NAV.map(n => {
            const active = page === n.id;
            const badge  = (n.id==='surat'||n.id==='arsip') && suratMenunggu > 0 ? suratMenunggu : null;
            return (
              <button key={n.id} onClick={() => navigateTo(n.id)}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', margin:'1px 0', padding:'10px 16px', background:active?'linear-gradient(135deg,#EEF4FF,#DBEAFE)':'transparent', border:'none', textAlign:'left', cursor:'pointer', borderLeft:active?`4px solid ${C.royal}`:'4px solid transparent', transition:'all .15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='#F5F7FF'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
                <div style={{ width:34, height:34, borderRadius:9, background:active?`linear-gradient(135deg,${C.navy},${C.royal})`:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{n.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:active?700:500, color:active?C.royal:'#1A2332' }}>{n.label}</div>
                  <div style={{ fontSize:11, color:'#A0AEC0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.desc}</div>
                </div>
                {badge && <span style={{ background:C.red, color:'#fff', borderRadius:10, fontSize:10, padding:'2px 6px', fontWeight:700 }}>{badge}</span>}
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ margin:'10px 14px', height:1, background:'#E8EDF5' }} />

          {/* Logout */}
          <button onClick={() => setShowLogout(true)}
            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', background:'transparent', border:'none', cursor:'pointer', borderLeft:'4px solid transparent', transition:'all .15s', textAlign:'left' }}
            onMouseEnter={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.borderLeftColor=C.red; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderLeftColor='transparent'; }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🚪</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:C.red }}>Keluar</div>
              <div style={{ fontSize:11, color:'#A0AEC0' }}>Logout dari sistem</div>
            </div>
          </button>

          {/* Data Singkat */}
          <div style={{ margin:'14px 12px 0', padding:'14px', background:'linear-gradient(135deg,#EEF4FF,#F5F7FF)', borderRadius:12, border:'1px solid #DBEAFE' }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.navy, marginBottom:10, letterSpacing:'.03em' }}>📊 Data Singkat</div>
            {[
              { label:'Penduduk', value:`${state.penduduk.length} jiwa`,   color:C.navy },
              { label:'Arsip',    value:`${state.arsipSurat.length} surat`, color:C.royal },
              { label:'Antrian',  value:`${suratMenunggu} surat`,           color:suratMenunggu>0?C.red:C.navy },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                <span style={{ color:'#718096' }}>{item.label}</span>
                <span style={{ fontWeight:700, color:item.color }}>{item.value}</span>
              </div>
            ))}
            <button onClick={handleReload} style={{ width:'100%', marginTop:10, padding:'7px', fontSize:11, fontWeight:600, background:`linear-gradient(135deg,${C.navy},${C.royal})`, color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}>
              🔄 Refresh Data
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main-content" style={{ marginLeft: isMobile ? 0 : 'var(--sidebar-width)' }}>
          <div className="fade-in" key={page}>
            {pages[page] || pages.dashboard}
          </div>
        </main>
      </div>

      {/* ── MODAL LOGOUT ── */}
      {showLogout && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:'#fff', borderRadius:24, padding:'32px 28px', width:'100%', maxWidth:340, boxShadow:'0 24px 64px rgba(11,37,69,.25)', textAlign:'center' }}>
            <div style={{ width:64, height:64, background:'#FEF2F2', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px' }}>🚪</div>
            <div style={{ fontSize:17, fontWeight:700, color:'#0A1628', marginBottom:8 }}>Keluar dari Sistem?</div>
            <div style={{ fontSize:13, color:'#718096', marginBottom:24, lineHeight:1.6 }}>
              Anda akan keluar sebagai <strong>{currentUser?.nama}</strong>.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowLogout(false)}
                style={{ flex:1, padding:'12px', fontSize:14, fontWeight:600, background:'#F1F5F9', color:'#4A5568', border:'1.5px solid #CBD5E1', borderRadius:12, cursor:'pointer' }}>
                Batal
              </button>
              <button onClick={handleLogout}
                style={{ flex:1, padding:'12px', fontSize:14, fontWeight:700, background:`linear-gradient(135deg,${C.red},#B91C1C)`, color:'#fff', border:'none', borderRadius:12, cursor:'pointer', boxShadow:'0 4px 14px rgba(220,38,38,.35)' }}>
                🚪 Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthGate() {
  const [showLanding, setShowLanding] = React.useState(true);
  const [showWarga,   setShowWarga]   = React.useState(false);
  const [wargaData,   setWargaData]   = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('warga_data')); } catch { return null; }
  });
  const [wargaToken, setWargaToken] = React.useState(() => localStorage.getItem('warga_token') || '');
  const { isLoggedIn } = useAuth();

  const handleWargaLogin = (data, token) => {
    setWargaData(data);
    setWargaToken(token);
    setShowWarga(false);
  };

  const handleWargaLogout = () => {
    localStorage.removeItem('warga_token');
    localStorage.removeItem('warga_data');
    setWargaData(null);
    setWargaToken('');
    setShowLanding(true);
  };

  if (wargaData && wargaToken) {
    return <DashboardWarga warga={wargaData} token={wargaToken} onLogout={handleWargaLogout} />;
  }

  if (showWarga) {
    return <LoginWarga onBack={() => { setShowWarga(false); setShowLanding(true); }} onLoginSuccess={handleWargaLogin} />;
  }

  if (showLanding && !isLoggedIn) {
    return <LandingPage
      onMasuk={() => setShowLanding(false)}
      onMasukWarga={() => { setShowLanding(false); setShowWarga(true); }}
    />;
  }

  return isLoggedIn
    ? <AppProvider><AppInner /></AppProvider>
    : <LoginPage onBack={() => setShowLanding(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
