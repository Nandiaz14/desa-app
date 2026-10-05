import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const inputStyle = {
  width:'100%', border:'1.5px solid #CBD5E1', borderRadius:12,
  padding:'12px 16px', fontSize:15, background:'#fff',
  color:'#0A1628', fontFamily:'inherit', boxSizing:'border-box',
  outline:'none', transition:'border-color 0.2s',
};

export default function LoginWarga({ onBack, onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loginForm, setLoginForm] = useState({ nik: '', password: '' });
  const [regForm, setRegForm] = useState({ nik: '', nama: '', no_hp: '', password: '', konfirmasi: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/warga/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem('warga_token', data.token);
        localStorage.setItem('warga_data', JSON.stringify(data.warga));
        onLoginSuccess(data.warga, data.token);
      } else {
        setError(data.msg);
      }
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!regForm.nik || !regForm.nama || !regForm.password) return setError('NIK, nama, dan password wajib diisi');
    if (regForm.nik.length !== 16) return setError('NIK harus 16 digit');
    if (regForm.password.length < 6) return setError('Password minimal 6 karakter');
    if (regForm.password !== regForm.konfirmasi) return setError('Konfirmasi password tidak cocok');
    setLoading(true);
    try {
      const res = await fetch(`${API}/warga/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(data.msg);
        setRegForm({ nik: '', nama: '', no_hp: '', password: '', konfirmasi: '' });
        setTimeout(() => { setMode('login'); setSuccess(''); }, 2500);
      } else {
        setError(data.msg);
      }
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#040D1A 0%,#0B2545 50%,#1A3A6B 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px', fontFamily:"'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif",
    }}>
      <div style={{ width:'100%', maxWidth: mode==='register' ? 480 : 440 }}>

        {/* Tombol Kembali */}
        <button onClick={onBack} style={{
          display:'flex', alignItems:'center', gap:6,
          background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)',
          color:'#fff', borderRadius:10, padding:'7px 14px',
          fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:20,
        }}>
          ← Kembali ke Beranda
        </button>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:24, color:'#fff' }}>
          <div style={{ width:72, height:72, borderRadius:20, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 14px', border:'2px solid rgba(201,168,76,.3)' }}>👤</div>
          <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Playfair Display',Georgia,serif" }}>Portal Masyarakat</div>
          <div style={{ fontSize:13, opacity:.65, marginTop:4 }}>Desa Cikulak, Kec. Waled, Kab. Cirebon</div>
        </div>

        <div style={{ background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,.3)' }}>

          {/* Tab */}
          <div style={{ display:'flex', borderBottom:'1.5px solid #E8EDF5' }}>
            {[{id:'login',label:'🔑 Masuk'},{id:'register',label:'📝 Daftar'}].map(t => (
              <button key={t.id}
                onClick={() => { setMode(t.id); setError(''); setSuccess(''); }}
                style={{ flex:1, padding:'15px', fontSize:14, fontWeight:mode===t.id?700:500, color:mode===t.id?'#1D4ED8':'#718096', background:mode===t.id?'#EEF4FF':'#fff', border:'none', cursor:'pointer', borderBottom:mode===t.id?'3px solid #1D4ED8':'3px solid transparent', transition:'all .2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding:'28px 28px 32px' }}>

            {/* Alert */}
            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', borderRadius:10, padding:'12px 14px', fontSize:13, marginBottom:16 }}>
                ❌ {error}
              </div>
            )}
            {success && (
              <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#16A34A', borderRadius:10, padding:'12px 14px', fontSize:13, marginBottom:16 }}>
                ✅ {success}
              </div>
            )}

            {/* INFO BOX */}
            <div style={{ background:'#EEF4FF', border:'1px solid #BFDBFE', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#1D4ED8', marginBottom:20, lineHeight:1.6 }}>
              💡 {mode==='login'
                ? 'Masuk menggunakan NIK dan password yang sudah didaftarkan.'
                : 'NIK dan nama harus sesuai dengan data penduduk yang tercatat di desa.'}
            </div>

            {/* ── FORM LOGIN ── */}
            {mode==='login' && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>NIK (16 digit)</label>
                  <input
                    value={loginForm.nik}
                    onChange={e => setLoginForm({...loginForm, nik: e.target.value.replace(/\D/g,'')})}
                    placeholder="Masukkan NIK 16 digit"
                    maxLength={16}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#1D4ED8'}
                    onBlur={e => e.target.style.borderColor='#CBD5E1'}
                  />
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Password</label>
                  <div style={{ position:'relative' }}>
                    <input
                      type={showPass?'text':'password'}
                      value={loginForm.password}
                      onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      placeholder="Masukkan password"
                      style={{ ...inputStyle, paddingRight:44 }}
                      onFocus={e => e.target.style.borderColor='#1D4ED8'}
                      onBlur={e => e.target.style.borderColor='#CBD5E1'}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16 }}>
                      {showPass?'🙈':'👁'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  style={{ width:'100%', padding:'13px', fontSize:15, fontWeight:700, background:loading?'#93C5FD':'linear-gradient(135deg,#0B2545,#1D4ED8)', color:'#fff', border:'none', borderRadius:12, cursor:loading?'wait':'pointer', boxShadow:'0 4px 14px rgba(29,78,216,.3)' }}>
                  {loading ? '⏳ Memverifikasi...' : '🔑 Masuk Portal Warga'}
                </button>
              </form>
            )}

            {/* ── FORM REGISTER ── */}
            {mode==='register' && (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>NIK <span style={{ color:'#DC2626' }}>*</span></label>
                  <input
                    value={regForm.nik}
                    onChange={e => setRegForm({...regForm, nik: e.target.value.replace(/\D/g,'')})}
                    placeholder="NIK 16 digit sesuai KTP"
                    maxLength={16}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#1D4ED8'}
                    onBlur={e => e.target.style.borderColor='#CBD5E1'}
                  />
                  <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>{regForm.nik.length}/16 digit</div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Nama Lengkap <span style={{ color:'#DC2626' }}>*</span></label>
                  <input
                    value={regForm.nama}
                    onChange={e => setRegForm({...regForm, nama: e.target.value})}
                    placeholder="Nama sesuai KTP/data penduduk"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#1D4ED8'}
                    onBlur={e => e.target.style.borderColor='#CBD5E1'}
                  />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>No. HP</label>
                  <input
                    value={regForm.no_hp}
                    onChange={e => setRegForm({...regForm, no_hp: e.target.value})}
                    placeholder="08xxxxxxxxxx"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#1D4ED8'}
                    onBlur={e => e.target.style.borderColor='#CBD5E1'}
                  />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Password <span style={{ color:'#DC2626' }}>*</span></label>
                    <input
                      type="password"
                      value={regForm.password}
                      onChange={e => setRegForm({...regForm, password: e.target.value})}
                      placeholder="Min. 6 karakter"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor='#1D4ED8'}
                      onBlur={e => e.target.style.borderColor='#CBD5E1'}
                    />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Ulangi Password <span style={{ color:'#DC2626' }}>*</span></label>
                    <input
                      type="password"
                      value={regForm.konfirmasi}
                      onChange={e => setRegForm({...regForm, konfirmasi: e.target.value})}
                      placeholder="Ulangi password"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor='#1D4ED8'}
                      onBlur={e => e.target.style.borderColor='#CBD5E1'}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  style={{ width:'100%', padding:'13px', fontSize:15, fontWeight:700, background:loading?'#93C5FD':'linear-gradient(135deg,#0B2545,#1D4ED8)', color:'#fff', border:'none', borderRadius:12, cursor:loading?'wait':'pointer', boxShadow:'0 4px 14px rgba(29,78,216,.3)' }}>
                  {loading ? '⏳ Mendaftar...' : '📝 Daftar Sekarang'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:16, color:'rgba(255,255,255,.4)', fontSize:12 }}>
          Sistem Informasi Desa Cikulak © 2026
        </div>
      </div>
    </div>
  );
}