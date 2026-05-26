import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

const ROLE_OPTIONS = [
  { value: 'perangkat_desa', label: 'Perangkat Desa',  desc: 'Sekretaris, Bendahara, Kaur, Kasi, dll', icon: '👤' },
  { value: 'kepala_desa',    label: 'Kepala Desa',      desc: 'Pimpinan desa — perlu aktivasi admin',    icon: '🏛' },
];

const JABATAN_PERANGKAT = [
  'Sekretaris Desa','Bendahara Desa','Kaur Umum','Kaur Keuangan','Kaur Perencanaan',
  'Kasi Pemerintahan','Kasi Kesejahteraan','Kasi Pelayanan',
  'Kepala Dusun 1','Kepala Dusun 2','Kepala Dusun 3',
  'Kepala Dusun 4','Kepala Dusun 5',
  'Staf Administrasi','Staf Umum',
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

  // ── OTP STATE ─────────────────────────────────────────
  const [otpMode,    setOtpMode]    = useState(false);
  const [otpEmail,   setOtpEmail]   = useState('');
  const [otpCode,    setOtpCode]    = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError,   setOtpError]   = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [countdown,  setCountdown]  = useState(0);

  const [loginForm, setLoginForm] = useState({ username:'', password:'' });
  const [regForm,   setRegForm]   = useState({
    nama:'', username:'', password:'', konfirmasi:'',
    role:'perangkat_desa', jabatan: JABATAN_PERANGKAT[0], nip:'', noHp:'', email:'',
  });
  const [regError,   setRegError]   = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Countdown resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

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
    if (!regForm.nama || !regForm.username || !regForm.password || !regForm.email) {
      setRegError('Nama, username, email, dan password wajib diisi.'); return;
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
      setOtpEmail(regForm.email);
      setOtpMode(true);
      setCountdown(60);
    } else {
      setRegError(result.msg);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError(''); setOtpSuccess('');
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Masukkan kode 6 digit yang dikirim ke email.'); return;
    }
    setOtpLoading(true);
    try {
      const res = await authAPI.verifyOTP({ email: otpEmail, otp: otpCode });
      setOtpSuccess(res.msg);
      setTimeout(() => {
        setOtpMode(false);
        setMode('login');
        setOtpCode('');
        setOtpEmail('');
        setOtpSuccess('');
        setRegForm({ nama:'', username:'', password:'', konfirmasi:'', role:'perangkat_desa', jabatan: JABATAN_PERANGKAT[0], nip:'', noHp:'', email:'' });
      }, 2500);
    } catch (err) {
      setOtpError(err.message);
    }
    setOtpLoading(false);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      await authAPI.resendOTP({ email: otpEmail });
      setCountdown(60);
      setOtpError('');
      setOtpSuccess('Kode baru telah dikirim ke email Anda!');
      setTimeout(() => setOtpSuccess(''), 3000);
    } catch (err) {
      setOtpError(err.message);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', background:'linear-gradient(135deg,#0F3460 0%,#1B4F8A 50%,#1565C0 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px', fontFamily:"'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ position:'fixed', inset:0, opacity:0.05, backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth: otpMode ? 440 : mode==='register' ? 520 : 440, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28, color:'#fff' }}>
          <div style={{ width:80, height:80, borderRadius:24, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, margin:'0 auto 16px', border:'2px solid rgba(255,255,255,0.3)' }}>🏛</div>
          <div style={{ fontSize:22, fontWeight:800 }}>Sistem Informasi Desa</div>
          <div style={{ fontSize:15, opacity:0.8, marginTop:4 }}>Desa Cikulak, Kec. Waled, Kab. Cirebon</div>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>

          {/* ══ FORM OTP ══ */}
          {otpMode ? (
            <div style={{ padding:'32px' }}>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ fontSize:52, marginBottom:8 }}>📧</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#1A2332' }}>Cek Email Anda!</div>
                <div style={{ fontSize:13, color:'#718096', marginTop:8, lineHeight:1.6 }}>
                  Kode verifikasi 6 digit telah dikirim ke<br/>
                  <strong style={{ color:'#1B5EA0' }}>{otpEmail}</strong>
                </div>
              </div>

              {otpError && (
                <div style={{ background:'#FCEBEB', border:'1px solid #F7C1C1', color:'#C0392B', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16 }}>
                  ❌ {otpError}
                </div>
              )}
              {otpSuccess && (
                <div style={{ background:'#EAF3DE', border:'1px solid #B8D98C', color:'#2D6A0F', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16 }}>
                  ✅ {otpSuccess}
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:8, textAlign:'center' }}>
                    Masukkan Kode Verifikasi
                  </label>
                  <input
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="_ _ _ _ _ _"
                    maxLength={6}
                    style={{ ...inputStyle, textAlign:'center', fontSize:32, fontWeight:800, letterSpacing:14, color:'#1B5EA0', padding:'16px' }}
                    onFocus={e => e.target.style.borderColor = '#1B5EA0'}
                    onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                    autoFocus
                  />
                  <div style={{ fontSize:12, color:'#A0AEC0', textAlign:'center', marginTop:6 }}>
                    ⏱ Kode berlaku selama 10 menit
                  </div>
                </div>

                <button type="submit" disabled={otpLoading || otpCode.length !== 6}
                  style={{
                    width:'100%', padding:'14px', fontSize:16, fontWeight:700,
                    background: otpLoading || otpCode.length !== 6 ? '#93C5FD' : 'linear-gradient(135deg,#1B5EA0,#1565C0)',
                    color:'#fff', border:'none', borderRadius:12,
                    cursor: otpLoading || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
                    marginBottom:12, boxShadow:'0 4px 14px rgba(27,94,160,0.35)',
                  }}>
                  {otpLoading ? '⏳ Memverifikasi...' : '✅ Verifikasi Akun'}
                </button>

                <div style={{ textAlign:'center', fontSize:13, marginBottom:12 }}>
                  <span style={{ color:'#718096' }}>Tidak dapat kode? </span>
                  <button type="button" onClick={handleResendOTP} disabled={countdown > 0}
                    style={{ background:'none', border:'none', color: countdown > 0 ? '#A0AEC0' : '#1B5EA0', fontWeight:700, cursor: countdown > 0 ? 'not-allowed' : 'pointer', fontSize:13, padding:0 }}>
                    {countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim Ulang'}
                  </button>
                </div>

                <div style={{ textAlign:'center' }}>
                  <button type="button" onClick={() => { setOtpMode(false); setMode('register'); setOtpCode(''); setOtpError(''); }}
                    style={{ background:'none', border:'none', color:'#718096', fontSize:12, cursor:'pointer', textDecoration:'underline' }}>
                    ← Kembali ke form daftar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Tab Login / Register */}
              <div style={{ display:'flex', borderBottom:'1.5px solid #E2E8F0' }}>
                {[{id:'login',label:'🔑 Masuk'},{id:'register',label:'📝 Daftar Akun'}].map(t=>(
                  <button key={t.id} onClick={()=>{ setMode(t.id); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                    style={{ flex:1, padding:'16px', fontSize:15, fontWeight:mode===t.id?700:500, color:mode===t.id?'#1B5EA0':'#718096', background:mode===t.id?'#EBF3FC':'#fff', border:'none', cursor:'pointer', borderBottom:mode===t.id?'3px solid #1B5EA0':'3px solid transparent' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ padding:'28px 32px 32px' }}>

                {/* ══ FORM LOGIN ══ */}
                {mode==='login' && (
                  <form onSubmit={handleLogin}>
                    <div style={{ marginBottom:14, fontSize:13, color:'#718096', textAlign:'center' }}>
                      Masuk menggunakan akun yang sudah terdaftar
                    </div>

                    {loginError && (
                      <div style={{ background:'#FCEBEB', border:'1px solid #F7C1C1', color:'#C0392B', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16 }}>
                        ❌ {loginError}
                      </div>
                    )}

                    <div style={{ marginBottom:16 }}>
                      <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Username</label>
                      <input value={loginForm.username} onChange={e=>setLoginForm({...loginForm,username:e.target.value})}
                        placeholder="Masukkan username Anda" style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='#1B5EA0'}
                        onBlur={e=>e.target.style.borderColor='#CBD5E1'}
                        autoComplete="username" />
                    </div>

                    <div style={{ marginBottom:8 }}>
                      <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Password</label>
                      <div style={{ position:'relative' }}>
                        <input type={showPass?'text':'password'} value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
                          placeholder="Masukkan password Anda" style={{ ...inputStyle, paddingRight:48 }}
                          onFocus={e=>e.target.style.borderColor='#1B5EA0'}
                          onBlur={e=>e.target.style.borderColor='#CBD5E1'}
                          autoComplete="current-password" />
                        <button type="button" onClick={()=>setShowPass(!showPass)}
                          style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18 }}>
                          {showPass?'🙈':'👁'}
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize:12, color:'#A0AEC0', marginBottom:24 }}>
                      💡 Default admin: username <strong>admin</strong>, password <strong>admin123</strong>
                    </div>

                    <button type="submit" disabled={loading}
                      style={{ width:'100%', padding:'14px', fontSize:16, fontWeight:700, background:loading?'#93C5FD':'linear-gradient(135deg,#1B5EA0,#1565C0)', color:'#fff', border:'none', borderRadius:12, cursor:loading?'wait':'pointer', boxShadow:'0 4px 14px rgba(27,94,160,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      {loading ? '⏳ Memverifikasi...' : '🔑 Masuk ke Sistem'}
                    </button>
                  </form>
                )}

                {/* ══ FORM REGISTER ══ */}
                {mode==='register' && (
                  <form onSubmit={handleRegister}>
                    <div style={{ marginBottom:14, fontSize:13, color:'#718096', textAlign:'center' }}>
                      Buat akun baru untuk mengakses sistem
                    </div>

                    {regError && (
                      <div style={{ background:'#FCEBEB', border:'1px solid #F7C1C1', color:'#C0392B', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16 }}>
                        ❌ {regError}
                      </div>
                    )}
                    {regSuccess && (
                      <div style={{ background:'#EAF3DE', border:'1px solid #B8D98C', color:'#2D6A0F', borderRadius:10, padding:'12px 16px', fontSize:13, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span>✅ {regSuccess}</span>
                        <button type="button" onClick={()=>{ setMode('login'); setRegSuccess(''); }}
                          style={{ background:'none', border:'none', color:'#2D6A0F', cursor:'pointer', fontWeight:700, fontSize:13 }}>
                          Masuk →
                        </button>
                      </div>
                    )}

                    {/* Pilih Role */}
                    <div style={{ marginBottom:16 }}>
                      <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:8 }}>Daftar Sebagai <span style={{ color:'#C0392B' }}>*</span></label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                        {ROLE_OPTIONS.map(r=>(
                          <button type="button" key={r.value} onClick={()=>setRegForm({...regForm,role:r.value,jabatan:r.value==='perangkat_desa'?JABATAN_PERANGKAT[0]:'Kepala Desa'})}
                            style={{ padding:'14px 12px', borderRadius:12, cursor:'pointer', textAlign:'center', border:`2px solid ${regForm.role===r.value?'#1B5EA0':'#E2E8F0'}`, background:regForm.role===r.value?'#EBF3FC':'#F8FAFC' }}>
                            <div style={{ fontSize:26, marginBottom:6 }}>{r.icon}</div>
                            <div style={{ fontSize:13, fontWeight:700, color:regForm.role===r.value?'#1B5EA0':'#1A2332' }}>{r.label}</div>
                            <div style={{ fontSize:10, color:'#A0AEC0', marginTop:3, lineHeight:1.4 }}>{r.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {regForm.role==='kepala_desa' && (
                      <div style={{ background:'#FAEEDA', border:'1px solid #F5CE8A', color:'#A0621B', borderRadius:10, padding:'10px 14px', fontSize:12, marginBottom:14 }}>
                        ⚠️ Akun Kepala Desa perlu diaktivasi oleh Administrator sebelum bisa login.
                      </div>
                    )}

                    {/* Nama */}
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Nama Lengkap <span style={{ color:'#C0392B' }}>*</span></label>
                      <input value={regForm.nama} onChange={e=>setRegForm({...regForm,nama:e.target.value})} placeholder="Nama sesuai identitas resmi" style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Email <span style={{ color:'#C0392B' }}>*</span></label>
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={e=>setRegForm({...regForm,email:e.target.value})}
                        placeholder="contoh@gmail.com"
                        style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='#1B5EA0'}
                        onBlur={e=>e.target.style.borderColor='#CBD5E1'}
                      />
                      <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>
                        📧 Kode verifikasi akan dikirim ke email ini
                      </div>
                    </div>

                    {/* Jabatan */}
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Jabatan <span style={{ color:'#C0392B' }}>*</span></label>
                      {regForm.role==='kepala_desa'
                        ? <input value="Kepala Desa" disabled style={{ ...inputStyle, background:'#F8FAFC', color:'#718096' }} />
                        : <select value={regForm.jabatan} onChange={e=>setRegForm({...regForm,jabatan:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>
                            {JABATAN_PERANGKAT.map(j=><option key={j}>{j}</option>)}
                          </select>
                      }
                    </div>

                    {/* NIP & No HP */}
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

                    {/* Username */}
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Username <span style={{ color:'#C0392B' }}>*</span></label>
                      <input value={regForm.username} onChange={e=>setRegForm({...regForm,username:e.target.value.toLowerCase().replace(/\s/g,'')})}
                        placeholder="Buat username unik (tanpa spasi)" style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='#1B5EA0'} onBlur={e=>e.target.style.borderColor='#CBD5E1'} />
                    </div>

                    {/* Password */}
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
                      style={{ width:'100%', padding:'14px', fontSize:16, fontWeight:700, background:regLoading?'#93C5FD':'linear-gradient(135deg,#1B5EA0,#1565C0)', color:'#fff', border:'none', borderRadius:12, cursor:regLoading?'wait':'pointer', boxShadow:'0 4px 14px rgba(27,94,160,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      {regLoading ? '⏳ Mengirim kode...' : '📧 Daftar & Kirim Kode Verifikasi'}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:20, color:'rgba(255,255,255,0.6)', fontSize:12 }}>
          Sistem Informasi Desa Cikulak © 2026
        </div>
      </div>
    </div>
  );
}