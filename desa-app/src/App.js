import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DataPenduduk from './pages/DataPenduduk';
import SuratMenyurat from './pages/SuratMenyurat';
import ManajemenUser from './pages/ManajemenUser';
import './index.css';

const NAV_BASE = [
  { id:'dashboard', label:'Beranda',       emoji:'🏠', desc:'Ringkasan data' },
  { id:'penduduk',  label:'Data Penduduk', emoji:'👥', desc:'Kelola warga desa' },
  { id:'surat',     label:'Surat & Arsip', emoji:'📋', desc:'Pengajuan & format surat' },
];
const NAV_ADMIN = [
  { id:'users', label:'Kelola Pengguna', emoji:'🔐', desc:'Manajemen akun' },
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
  const NAV           = isKepala ? [...NAV_BASE, ...NAV_ADMIN] : NAV_BASE;
  const roleIcon      = currentUser?.role==='kepala_desa' ? '🏛' : '👤';
  const roleLabel     = currentUser?.role==='kepala_desa' ? 'Kepala Desa' : 'Perangkat Desa';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigateTo = (id) => {
    setPage(id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogout(false);
    toast.success('Berhasil keluar dari sistem');
  };

  const handleReload = async () => {
    const t = toast.loading('Memuat ulang data...');
    await reload();
    toast.dismiss(t);
    toast.success('Data berhasil dimuat ulang!');
  };

  const pages = {
    dashboard: <Dashboard onNav={navigateTo} />,
    penduduk:  <DataPenduduk />,
    surat:     <SuratMenyurat />,
    users:     <ManajemenUser />,
  };

  // ── LOADING ───────────────────────────────────────────────
  if (loadingData) {
    return (
      <div style={{ minHeight:'100vh', background:'#F0F4F8', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI', system-ui, sans-serif", padding:16 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🏛</div>
          <div style={{ fontSize:18, fontWeight:700, color:'#1B5EA0', marginBottom:8 }}>Memuat Data...</div>
          <div style={{ fontSize:13, color:'#718096' }}>Mengambil data dari database MySQL</div>
          <div className="spin" style={{ width:40, height:40, border:'4px solid #E2E8F0', borderTop:'4px solid #1B5EA0', borderRadius:'50%', margin:'24px auto 0' }} />
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight:'100vh', background:'#F0F4F8', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <div style={{ textAlign:'center', maxWidth:400, width:'100%', padding:'28px 24px', background:'#fff', borderRadius:20, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:48, marginBottom:14 }}>⚠️</div>
          <div style={{ fontSize:17, fontWeight:700, color:'#C0392B', marginBottom:8 }}>Gagal Terhubung ke Server</div>
          <div style={{ fontSize:13, color:'#718096', marginBottom:16, lineHeight:1.7 }}>Pastikan server backend sudah berjalan.</div>
          <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'monospace', textAlign:'left', marginBottom:20, lineHeight:2 }}>
            cd Downloads/desa-app-UTS/server<br/>node server.js
          </div>
          <button onClick={reload} style={{ padding:'12px 28px', fontSize:14, fontWeight:700, background:'#1B5EA0', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', width:'100%' }}>
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
        <button className="hamburger" onClick={()=>setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>

        <div style={{ width:38, height:38, background:'rgba(255,255,255,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🏛</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            Sistem Informasi Desa {desa.namaDesa}
          </div>
          <div className="header-sub" style={{ fontSize:11, opacity:0.75 }}>
            Kec. {desa.kecamatan} · Kab. {desa.kabupaten} · {desa.provinsi}
          </div>
        </div>

        <div className="header-date" style={{ fontSize:11, fontWeight:600, opacity:0.85, marginRight:8, flexShrink:0 }}>
          {new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </div>

        {/* Avatar */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <button onClick={()=>setShowProfile(!showProfile)}
            style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, padding:'6px 10px', cursor:'pointer', color:'#fff' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{roleIcon}</div>
            <div className="profile-name" style={{ textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:700, whiteSpace:'nowrap', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>{currentUser?.nama}</div>
              <div style={{ fontSize:10, opacity:0.8 }}>{currentUser?.jabatan}</div>
            </div>
            <span style={{ fontSize:10, opacity:0.7 }}>▼</span>
          </button>

          {showProfile && (
            <div style={{ position:'absolute', right:0, top:'110%', background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', boxShadow:'0 12px 40px rgba(0,0,0,0.18)', minWidth:240, maxWidth:'92vw', zIndex:500, overflow:'hidden' }}>
              <div style={{ padding:'16px 18px', background:'linear-gradient(135deg,#EBF3FC,#DBEAFE)', borderBottom:'1px solid #E2E8F0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'#1B5EA0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{roleIcon}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#1A2332', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentUser?.nama}</div>
                    <div style={{ fontSize:11, color:'#4A5568' }}>{currentUser?.jabatan}</div>
                    <span style={{ fontSize:10, background:'#1B5EA0', color:'#fff', padding:'1px 7px', borderRadius:8, fontWeight:600 }}>{roleLabel}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding:'8px 16px', borderBottom:'1px solid #F1F5F9' }}>
                {[['👤 Username',`@${currentUser?.username}`],['🪪 NIP/NIK',currentUser?.nip||'-'],['📱 No. HP',currentUser?.no_hp||'-']].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:12 }}>
                    <span style={{ color:'#718096' }}>{k}</span>
                    <span style={{ fontWeight:600, color:'#1A2332', marginLeft:8 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'8px 12px', borderBottom:'1px solid #F1F5F9' }}>
                <button onClick={()=>{ setShowProfile(false); handleReload(); }}
                  style={{ width:'100%', padding:'9px', fontSize:13, fontWeight:600, background:'#EBF3FC', color:'#1B5EA0', border:'1px solid #B5D4F4', borderRadius:8, cursor:'pointer' }}>
                  🔄 Refresh Data
                </button>
              </div>
              <div style={{ padding:'10px 12px' }}>
                <button onClick={()=>{ setShowProfile(false); setShowLogout(true); }}
                  style={{ width:'100%', padding:'10px', fontSize:13, fontWeight:700, background:'#FCEBEB', color:'#C0392B', border:'1.5px solid #F7C1C1', borderRadius:9, cursor:'pointer' }}>
                  🚪 Keluar dari Sistem
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {showProfile && <div style={{ position:'fixed', inset:0, zIndex:199 }} onClick={()=>setShowProfile(false)} />}

      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)} />
      )}

      <div className="app-body">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${isMobile ? (sidebarOpen?'open':'') : 'open'}`}
          style={{ transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)' }}>

          <div style={{ padding:'0 14px 8px', fontSize:11, fontWeight:700, color:'#A0AEC0', textTransform:'uppercase', letterSpacing:1 }}>Menu Utama</div>

          {NAV.map(n => {
            const active = page===n.id;
            const badge  = n.id==='surat' && suratMenunggu>0 ? suratMenunggu : null;
            return (
              <button key={n.id} onClick={()=>navigateTo(n.id)}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', margin:'2px 0', padding:'11px 16px', background:active?'linear-gradient(135deg,#EBF3FC,#DBEAFE)':'transparent', border:'none', textAlign:'left', cursor:'pointer', borderLeft:active?'4px solid #1B5EA0':'4px solid transparent', transition:'all 0.15s' }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='#F8FAFC'; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}>
                <div style={{ width:36, height:36, borderRadius:9, background:active?'#1B5EA0':'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{n.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:active?700:500, color:active?'#1B5EA0':'#1A2332' }}>{n.label}</div>
                  <div style={{ fontSize:11, color:'#A0AEC0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.desc}</div>
                </div>
                {badge && <span style={{ background:'#C0392B', color:'#fff', borderRadius:10, fontSize:10, padding:'2px 6px', fontWeight:700, flexShrink:0 }}>{badge}</span>}
              </button>
            );
          })}

          <div style={{ margin:'10px 14px', height:1, background:'#E2E8F0' }} />

          <button onClick={()=>setShowLogout(true)}
            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 16px', background:'transparent', border:'none', cursor:'pointer', borderLeft:'4px solid transparent', transition:'all 0.15s', textAlign:'left' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#FCEBEB'; e.currentTarget.style.borderLeftColor='#C0392B'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderLeftColor='transparent'; }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🚪</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'#C0392B' }}>Keluar</div>
              <div style={{ fontSize:11, color:'#A0AEC0' }}>Logout dari sistem</div>
            </div>
          </button>

          {/* Ringkasan */}
          <div style={{ margin:'14px 12px 0', padding:'12px', background:'#F8FAFC', borderRadius:10, border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#4A5568', marginBottom:8 }}>📊 Data Singkat</div>
            {[
              {label:'Penduduk', value:`${state.penduduk.length} jiwa`,   color:'#1B5EA0'},
              {label:'Arsip',    value:`${state.arsipSurat.length} surat`, color:'#534AB7'},
              {label:'Antrian',  value:`${suratMenunggu} surat`,           color:suratMenunggu>0?'#C0392B':'#2D6A0F'},
            ].map(item=>(
              <div key={item.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                <span style={{ color:'#718096' }}>{item.label}</span>
                <span style={{ fontWeight:700, color:item.color }}>{item.value}</span>
              </div>
            ))}
            <button onClick={handleReload} style={{ width:'100%', marginTop:8, padding:'6px', fontSize:11, fontWeight:600, background:'#EBF3FC', color:'#1B5EA0', border:'1px solid #B5D4F4', borderRadius:7, cursor:'pointer' }}>
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

      {/* Modal Logout */}
      {showLogout && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:340, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🚪</div>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>Keluar dari Sistem?</div>
            <div style={{ fontSize:13, color:'#718096', marginBottom:22 }}>
              Anda akan keluar sebagai <strong>{currentUser?.nama}</strong>.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setShowLogout(false)}
                style={{ flex:1, padding:'12px', fontSize:14, fontWeight:600, background:'#F1F5F9', color:'#4A5568', border:'1.5px solid #CBD5E1', borderRadius:12, cursor:'pointer' }}>
                Batal
              </button>
              <button onClick={handleLogout}
                style={{ flex:1, padding:'12px', fontSize:14, fontWeight:700, background:'#C0392B', color:'#fff', border:'none', borderRadius:12, cursor:'pointer' }}>
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
  const { isLoggedIn } = useAuth();
  return isLoggedIn
    ? <AppProvider><AppInner /></AppProvider>
    : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}