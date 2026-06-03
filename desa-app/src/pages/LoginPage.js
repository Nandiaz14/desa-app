import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'perangkat_desa', label: 'Perangkat Desa', desc: 'Sekretaris, Bendahara, Kaur, dll', icon: '👤' },
  { value: 'kepala_desa',    label: 'Kepala Desa',     desc: 'Pimpinan desa — perlu aktivasi admin', icon: '🏛' },
];

const JABATAN_PERANGKAT = [
  'Sekretaris Desa','Bendahara Desa','Kaur Umum','Kaur Keuangan','Kaur Perencanaan',
  'Kasi Pemerintahan','Kasi Kesejahteraan','Kasi Pelayanan',
  'Kepala Dusun 1','Kepala Dusun 2','Kepala Dusun 3',
  'Kepala Dusun 4','Kepala Dusun 5','Staf Administrasi','Staf Umum',
];

const inputStyle = {
  width:'100%', border:'1.5px solid #CBD5E1', borderRadius:12,
  padding:'12px 16px', fontSize:15, background:'#fff',
  color:'#1A2332', fontFamily:'inherit', boxSizing:'border-box',
  outline:'none', transition:'border-color 0.2s',
};

export default function LoginPage() {
  const { login, register, loginError, setLoginError, loading } = useAuth();
  const [mode,       setMode]       = useState('login');
  const [showPass,   setShowPass]   = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError,   setRegError]   = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm,   setRegForm]   = useState({
    nama:'', username:'', password:'', konfirmasi:'',
    role:'perangkat_desa', jabatan: JABATAN_PERANGKAT[0], nip:'', noHp:'',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Username dan password wajib diisi.'); return;
    }
    await login(loginForm.username, loginForm.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!regForm.nama || !regForm.username || !regForm.password) {
      setRegError('Nama, username, dan password wajib diisi.'); return;
    }
    if (regForm.password !== regForm.konfirmasi) {
      setRegError('Konfirmasi password tidak cocok.'); return;
    }
    if (regForm.password.length < 6) {
      setRegError('Password minimal 6 karakter.'); return;
    }
    setRegLoading(true);
    const result = await register(regForm);
    setRegLoading(false);
    if (result.ok) {
      setRegSuccess(result.msg);
      setRegForm({ nama:'', username:'', password:'', konfirmasi:'', role:'perangkat_desa', jabatan: JABATAN_PERANGKAT[0], nip:'', noHp:'' });
    } else {
      setRegError(result.msg);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0F3460 0%,#1B4F8A 50%,#1565C0 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width:'100%', maxWidth: mode==='register' ? 500 : 440 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28, color:'#fff' }}>
          <div style={{ width:80, height:80, borderRadius:24, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, margin:'0 auto 16px', border:'2px solid rgba(255,255,255,0.3)' }}>🏛</div>
          <div style={{ fontSize:22, fontWeight:800 }}>Sistem Informasi Desa</div>
          <div style={{ fontSize:15, opacity:0.8, marginTop:4 }}>Desa Cikulak, Kec. Waled, Kab. Cirebon</div>
        </div>

        <div style={{ background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
          {/* Tab */}
          <div style={{ display:'flex', borderBottom:'1.5px solid #E2E8F0' }}>
            {[{id:'login',label:'🔑 Masuk'},{id:'register',label:'📝 Daftar'}].map(t=>(
              <button key={t.id} onClick={()=>{ setMode(t.id); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                style={{ flex:1, padding:'16px', fontSize:15, fontWeight:mode===t.id?700:500, color:mode===t.id?'#1B5EA0':'#718096', background:mode===t.id?'#EBF3FC':'#fff', border:'none', cursor:'pointer', borderBottom:mode===t.id?'3px solid #1B5EA0':'3px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding:'28px 32px 32px' }}>
            {/* ── LOGIN ── */}
            {mode==='login' && (
              <form onSubmit={handleLogin}>
                {loginError && (
                  <div style={{ background:'#FCEBEB', border:'1px solid #F7C1C1', color:'#C0392B', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16 }}>❌ {loginError}</div>
                )}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Username</label>
                  <input value={loginForm.username} onChange={e=>setLoginForm({...loginForm,username:e.target.value})}
                    placeholder="Masukkan username" style={inputStyle}
                    onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                </div>
                <div style={{ marginBottom:8 }}>
                  <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Password</label>
                  <div style={{ position:'relative' }}>
                    <input type={showPass?'text':'password'} value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
                      placeholder="Masukkan password" style={{ ...inputStyle, paddingRight:48 }}
                      onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                    <button type="button" onClick={()=>setShowPass(!showPass)}
                      style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18 }}>
                      {showPass?'🙈':'👁'}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize:12, color:'#A0AEC0', marginBottom:24 }}>
                  💡 Default: username <strong>admin</strong>, password <strong>admin123</strong>
                </div>
                <button type="submit" disabled={loading}
                  style={{ width:'100%', padding:'14px', fontSize:16, fontWeight:700, background:loading?'#93C5FD':'linear-gradient(135deg,#1B5EA0,#1565C0)', color:'#fff', border:'none', borderRadius:12, cursor:loading?'wait':'pointer', boxShadow:'0 4px 14px rgba(27,94,160,0.35)' }}>
                  {loading ? '⏳ Memverifikasi...' : '🔑 Masuk ke Sistem'}
                </button>
              </form>
            )}

            {/* ── REGISTER ── */}
            {mode==='register' && (
              <form onSubmit={handleRegister}>
                {regError && (
                  <div style={{ background:'#FCEBEB', border:'1px solid #F7C1C1', color:'#C0392B', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16 }}>❌ {regError}</div>
                )}
                {regSuccess && (
                  <div style={{ background:'#EAF3DE', border:'1px solid #B8D98C', color:'#2D6A0F', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span>✅ {regSuccess}</span>
                    <button type="button" onClick={()=>{ setMode('login'); setRegSuccess(''); }}
                      style={{ background:'none', border:'none', color:'#2D6A0F', cursor:'pointer', fontWeight:700 }}>Masuk →</button>
                  </div>
                )}

                {/* Pilih Role */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:8 }}>Daftar Sebagai <span style={{ color:'#C0392B' }}>*</span></label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {ROLE_OPTIONS.map(r=>(
                      <button type="button" key={r.value} onClick={()=>setRegForm({...regForm,role:r.value,jabatan:r.value==='perangkat_desa'?JABATAN_PERANGKAT[0]:'Kepala Desa'})}
                        style={{ padding:'12px', borderRadius:12, cursor:'pointer', textAlign:'center', border:`2px solid ${regForm.role===r.value?'#1B5EA0':'#E2E8F0'}`, background:regForm.role===r.value?'#EBF3FC':'#F8FAFC' }}>
                        <div style={{ fontSize:24, marginBottom:4 }}>{r.icon}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:regForm.role===r.value?'#1B5EA0':'#1A2332' }}>{r.label}</div>
                        <div style={{ fontSize:10, color:'#A0AEC0', marginTop:2 }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {regForm.role==='kepala_desa' && (
                  <div style={{ background:'#FAEEDA', border:'1px solid #F5CE8A', color:'#A0621B', borderRadius:10, padding:'10px 14px', fontSize:12, marginBottom:14 }}>
                    ⚠️ Akun Kepala Desa perlu diaktivasi admin sebelum bisa login.
                  </div>
                )}

                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Nama Lengkap <span style={{ color:'#C0392B' }}>*</span></label>
                  <input value={regForm.nama} onChange={e=>setRegForm({...regForm,nama:e.target.value})} placeholder="Nama sesuai identitas" style={inputStyle}
                    onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                </div>

                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Jabatan <span style={{ color:'#C0392B' }}>*</span></label>
                  {regForm.role==='kepala_desa'
                    ? <input value="Kepala Desa" disabled style={{ ...inputStyle, background:'#F8FAFC', color:'#718096' }} />
                    : <select value={regForm.jabatan} onChange={e=>setRegForm({...regForm,jabatan:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>
                        {JABATAN_PERANGKAT.map(j=><option key={j}>{j}</option>)}
                      </select>
                  }
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>NIP / NIK</label>
                    <input value={regForm.nip} onChange={e=>setRegForm({...regForm,nip:e.target.value})} placeholder="NIP atau NIK" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>No. HP</label>
                    <input value={regForm.noHp} onChange={e=>setRegForm({...regForm,noHp:e.target.value})} placeholder="08xxxxxxxxxx" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                  </div>
                </div>

                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Username <span style={{ color:'#C0392B' }}>*</span></label>
                  <input value={regForm.username} onChange={e=>setRegForm({...regForm,username:e.target.value.toLowerCase().replace(/\s/g,'')})}
                    placeholder="Buat username unik" style={inputStyle}
                    onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                  <div>
                    <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Password <span style={{ color:'#C0392B' }}>*</span></label>
                    <input type="password" value={regForm.password} onChange={e=>setRegForm({...regForm,password:e.target.value})}
                      placeholder="Min. 6 karakter" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Ulangi Password <span style={{ color:'#C0392B' }}>*</span></label>
                    <input type="password" value={regForm.konfirmasi} onChange={e=>setRegForm({...regForm,konfirmasi:e.target.value})}
                      placeholder="Ulangi password" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                  </div>
                </div>

                <button type="submit" disabled={regLoading}
                  style={{ width:'100%', padding:'14px', fontSize:16, fontWeight:700, background:regLoading?'#93C5FD':'linear-gradient(135deg,#1B5EA0,#1565C0)', color:'#fff', border:'none', borderRadius:12, cursor:regLoading?'wait':'pointer', boxShadow:'0 4px 14px rgba(27,94,160,0.35)' }}>
                  {regLoading ? '⏳ Mendaftar...' : '📝 Daftar Akun'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:20, color:'rgba(255,255,255,0.6)', fontSize:12 }}>
          Sistem Informasi Desa Cikulak © 2026
        </div>
      </div>
    </div>
  );
}