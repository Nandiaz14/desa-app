import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatTanggal } from '../utils/helpers';
import { Card, Badge, StatCard, SkeletonCard, Alert } from '../components/UI';
import { bansosAPI, fasilitasAPI } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const DUSUN_COLORS = ['#1B5EA0','#534AB7','#2D6A0F','#A0621B','#C0392B'];

export default function Dashboard({ onNav }) {
  const { state, loadingData } = useApp();
  const { isKepala } = useAuth();
  const { penduduk, pengajuanSurat, riwayatPerubahan, arsipSurat } = state;
  const desa = state.pengaturanDesa || {};

  const [bansosData, setBansosData] = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [bookingData, setBookingData] = useState([]);

  useEffect(() => {
    bansosAPI.getAll().then(r => setBansosData(r.data||[])).catch(()=>{});
    fasilitasAPI.getAll().then(r => setFasilitasData(r.data||[])).catch(()=>{});
    fasilitasAPI.getBooking().then(r => setBookingData(r.data||[])).catch(()=>{});
  }, []);

  const lakiLaki  = penduduk.filter(p => p.jenisKelamin==='Laki-laki').length;
  const perempuan = penduduk.filter(p => p.jenisKelamin==='Perempuan').length;
  const baru      = penduduk.filter(p => p.status==='Baru').length;
  const menunggu  = pengajuanSurat.filter(s => s.status==='Menunggu').length;
  const diproses  = pengajuanSurat.filter(s => s.status==='Diproses').length;
  const bookingPending = bookingData.filter(b => b.status==='Menunggu').length;

  const statCards = [
    { label:'Total Penduduk', value: penduduk.length, sub:'jiwa terdaftar', icon:'👥', color:'#1B5EA0' },
    { label:'Laki-laki',      value: lakiLaki,         sub:'jiwa',          icon:'👨', color:'#534AB7' },
    { label:'Perempuan',      value: perempuan,        sub:'jiwa',          icon:'👩', color:'#993556' },
    { label:'Penduduk Baru',  value: baru,             sub:'bulan ini',     icon:'🆕', color:'#A0621B' },
    { label:'Antrian Surat',  value: menunggu,         sub:'perlu ditangani',icon:'📋',color:'#C0392B' },
    { label:'Program Bansos', value: bansosData.filter(b=>b.status==='Aktif').length, sub:'aktif', icon:'🤝', color:'#2D6A0F' },
  ];

  const grafikDusun = ['Dusun 1','Dusun 2','Dusun 3','Dusun 4','Dusun 5'].map((d,i) => ({
    name: d.replace('Dusun ','Ds. '),
    'L': penduduk.filter(p => p.dusun===d && p.jenisKelamin==='Laki-laki').length,
    'P': penduduk.filter(p => p.dusun===d && p.jenisKelamin==='Perempuan').length,
    total: penduduk.filter(p => p.dusun===d).length,
    color: DUSUN_COLORS[i],
  }));

  const pieData = [
    { name:'Laki-laki', value: lakiLaki,  fill:'#1B5EA0' },
    { name:'Perempuan', value: perempuan, fill:'#993556' },
  ];

  const statusBadge = s => s==='Selesai'?'success':s==='Diproses'?'warning':'default';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', fontSize:13 }}>
          <div style={{ fontWeight:700, marginBottom:6, color:'#1A2332' }}>{label}</div>
          {payload.map(p => (
            <div key={p.name} style={{ display:'flex', justifyContent:'space-between', gap:16, color:p.color, fontWeight:600 }}>
              <span>{p.name === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              <span>{p.value} jiwa</span>
            </div>
          ))}
          <div style={{ borderTop:'1px solid #E2E8F0', marginTop:6, paddingTop:6, fontWeight:700, color:'#1A2332', display:'flex', justifyContent:'space-between' }}>
            <span>Total</span>
            <span>{payload.reduce((a,b)=>a+b.value,0)} jiwa</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loadingData) {
    return (
      <div className="page-container">
        <div style={{ height:100, borderRadius:18, background:'linear-gradient(135deg,#1B4F8A,#1565C0)', marginBottom:20 }} />
        <div className="grid-stats" style={{ marginBottom:20 }}>
          {Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#1B4F8A 0%,#1565C0 60%,#1976D2 100%)', borderRadius:20, padding:'24px 28px', marginBottom:20, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, boxShadow:'0 4px 20px rgba(27,79,138,0.3)' }}>
        <div>
          <div style={{ fontSize:11, opacity:0.7, marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>Selamat Datang</div>
          <div style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Sistem Informasi Desa {desa.namaDesa} 👋</div>
          <div style={{ fontSize:13, opacity:0.85 }}>Kec. {desa.kecamatan} · Kab. {desa.kabupaten} · {desa.provinsi}</div>
          <div style={{ fontSize:12, opacity:0.7, marginTop:4 }}>👤 Kepala Desa: {desa.kepalaDesa}</div>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'12px 20px', backdropFilter:'blur(10px)' }}>
            <div style={{ fontSize:24, fontWeight:800 }}>{penduduk.length}</div>
            <div style={{ fontSize:11, opacity:0.8 }}>Total Jiwa</div>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'12px 20px', backdropFilter:'blur(10px)' }}>
            <div style={{ fontSize:24, fontWeight:800 }}>{arsipSurat.length}</div>
            <div style={{ fontSize:11, opacity:0.8 }}>Arsip Surat</div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {(menunggu + diproses + bookingPending) > 0 && (
        <div style={{ background:'linear-gradient(135deg,#FAEEDA,#FEF3C7)', border:'1px solid #F5CE8A', color:'#92400E', borderRadius:14, padding:'14px 20px', marginBottom:20, fontSize:13, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', boxShadow:'0 2px 8px rgba(240,160,0,0.15)' }}>
          <span style={{ fontSize:20 }}>⚡</span>
          <div style={{ flex:1 }}>
            <strong>Perlu perhatian:</strong>
            {menunggu > 0 && <span> {menunggu} surat menunggu,</span>}
            {diproses > 0 && <span> {diproses} surat diproses,</span>}
            {bookingPending > 0 && <span> {bookingPending} booking fasilitas menunggu.</span>}
          </div>
          {!isKepala && (
            <span onClick={()=>onNav&&onNav('surat')} style={{ fontWeight:700, cursor:'pointer', textDecoration:'underline', whiteSpace:'nowrap' }}>
              Tangani →
            </span>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-stats" style={{ marginBottom:24 }}>
        {statCards.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* Grafik */}
      <div className="grid-2col" style={{ marginBottom:24 }}>
        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>📊 Penduduk per Dusun</div>
          <div style={{ fontSize:12, color:'#718096', marginBottom:16 }}>Distribusi berdasarkan jenis kelamin</div>
          {penduduk.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'#A0AEC0', fontSize:13 }}>Belum ada data penduduk</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={grafikDusun} margin={{ top:5, right:10, left:-10, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#718096' }} />
                <YAxis tick={{ fontSize:11, fill:'#718096' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="L" stackId="a" name="Laki-laki" radius={[0,0,0,0]}>
                  {grafikDusun.map((_, i) => <Cell key={i} fill={DUSUN_COLORS[i]} />)}
                </Bar>
                <Bar dataKey="P" stackId="a" name="Perempuan" radius={[4,4,0,0]}>
                  {grafikDusun.map((_, i) => <Cell key={i} fill={`${DUSUN_COLORS[i]}88`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:'#1B5EA0' }} /> Laki-laki
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:'#1B5EA088' }} /> Perempuan
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>🥧 Rasio Jenis Kelamin</div>
          <div style={{ fontSize:12, color:'#718096', marginBottom:8 }}>Perbandingan laki-laki dan perempuan</div>
          {penduduk.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'#A0AEC0', fontSize:13 }}>Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} jiwa`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Ringkasan Bawah */}
      <div className="grid-3col" style={{ marginBottom:24 }}>
        {/* Riwayat */}
        <Card style={{ gridColumn: 'span 2' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>🔔 Riwayat Perubahan</div>
            <span style={{ fontSize:12, color:'#1B5EA0', cursor:'pointer', fontWeight:600 }} onClick={()=>onNav&&onNav('penduduk')}>Lihat Semua →</span>
          </div>
          {riwayatPerubahan.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px', color:'#A0AEC0', fontSize:13 }}>Belum ada riwayat</div>
          ) : riwayatPerubahan.slice(0,5).map(r => (
            <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F1F5F9', gap:8 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.nama}</div>
                <div style={{ fontSize:11, color:'#A0AEC0' }}>{formatTanggal(r.tanggal)}</div>
              </div>
              <Badge type={r.jenis==='Kelahiran'?'success':r.jenis==='Kematian'?'danger':r.jenis==='Pindah Masuk'?'info':'warning'}>{r.jenis}</Badge>
            </div>
          ))}
        </Card>

        {/* Info Cepat */}
        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>⚡ Info Cepat</div>
          {[
            { label:'Fasilitas Tersedia', value: fasilitasData.filter(f=>f.tersedia).length, icon:'🏛', color:'#2D6A0F' },
            { label:'Kondisi Rusak', value: fasilitasData.filter(f=>f.kondisi!=='Baik').length, icon:'⚠️', color:'#C0392B' },
            { label:'Bansos Aktif', value: bansosData.filter(b=>b.status==='Aktif').length, icon:'🤝', color:'#1B5EA0' },
            { label:'Booking Pending', value: bookingPending, icon:'📅', color:'#A0621B' },
            { label:'Surat Selesai', value: pengajuanSurat.filter(s=>s.status==='Selesai').length, icon:'✅', color:'#534AB7' },
          ].map(item => (
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F1F5F9' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:13, color:'#4A5568' }}>
                <span>{item.icon}</span>{item.label}
              </div>
              <span style={{ fontWeight:700, color:item.color, fontSize:16 }}>{item.value}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Pengajuan Surat Terbaru */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>📋 Pengajuan Surat Terbaru</div>
          <span onClick={()=>onNav&&onNav(isKepala?'arsip':'surat')} style={{ fontSize:12, color:'#1B5EA0', cursor:'pointer', fontWeight:600 }}>Lihat Semua →</span>
        </div>
        {pengajuanSurat.length === 0 ? (
          <div style={{ textAlign:'center', padding:'24px', color:'#A0AEC0', fontSize:13 }}>Belum ada pengajuan surat</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:500 }}>
              <thead>
                <tr style={{ background:'#F8FAFC' }}>
                  {['No. Antrian','Pemohon','Jenis Surat','Keperluan','Status'].map((h,i)=>(
                    <th key={i} style={{ textAlign:'left', padding:'9px 12px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pengajuanSurat.slice(0,5).map(s => (
                  <tr key={s.id} style={{ borderBottom:'1px solid #F1F5F9' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#FAFBFC'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:12, color:'#1B5EA0', fontWeight:600 }}>{s.nomorAntrian}</td>
                    <td style={{ padding:'9px 12px', fontWeight:600 }}>{s.namaPemohon}</td>
                    <td style={{ padding:'9px 12px', fontSize:12 }}>{s.jenisSurat}</td>
                    <td style={{ padding:'9px 12px', fontSize:12, color:'#718096' }}>{s.keperluan}</td>
                    <td style={{ padding:'9px 12px' }}><Badge type={statusBadge(s.status)}>{s.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}