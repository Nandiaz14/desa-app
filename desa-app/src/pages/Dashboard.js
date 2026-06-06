import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatTanggal } from '../utils/helpers';
import { Card, Badge, StatCard, SkeletonCard } from '../components/UI';
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

  const [bansosData,   setBansosData]   = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [bookingData,  setBookingData]  = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    bansosAPI.getAll().then(r=>setBansosData(r.data||[])).catch(()=>{});
    fasilitasAPI.getAll().then(r=>setFasilitasData(r.data||[])).catch(()=>{});
    fasilitasAPI.getBooking().then(r=>setBookingData(r.data||[])).catch(()=>{});
  }, []);

  const lakiLaki  = penduduk.filter(p=>p.jenisKelamin==='Laki-laki').length;
  const perempuan = penduduk.filter(p=>p.jenisKelamin==='Perempuan').length;
  const baru      = penduduk.filter(p=>p.status==='Baru').length;
  const menunggu  = pengajuanSurat.filter(s=>s.status==='Menunggu').length;
  const diproses  = pengajuanSurat.filter(s=>s.status==='Diproses').length;
  const bookingPending = bookingData.filter(b=>b.status==='Menunggu').length;

  const statCards = [
    { label:'Total Penduduk', value:penduduk.length, sub:'jiwa',        icon:'👥', color:'#1B5EA0' },
    { label:'Laki-laki',      value:lakiLaki,         sub:'jiwa',        icon:'👨', color:'#534AB7' },
    { label:'Perempuan',      value:perempuan,        sub:'jiwa',        icon:'👩', color:'#993556' },
    { label:'Penduduk Baru',  value:baru,             sub:'bulan ini',   icon:'🆕', color:'#A0621B' },
    { label:'Antrian Surat',  value:menunggu,         sub:'menunggu',    icon:'📋', color:'#C0392B' },
    { label:'Bansos Aktif',   value:bansosData.filter(b=>b.status==='Aktif').length, sub:'program', icon:'🤝', color:'#2D6A0F' },
  ];

  const grafikDusun = ['Dusun 1','Dusun 2','Dusun 3','Dusun 4','Dusun 5'].map((d,i)=>({
    name: isMobile ? `Ds${i+1}` : d,
    L: penduduk.filter(p=>p.dusun===d&&p.jenisKelamin==='Laki-laki').length,
    P: penduduk.filter(p=>p.dusun===d&&p.jenisKelamin==='Perempuan').length,
    color: DUSUN_COLORS[i],
  }));

  const pieData = [
    { name:'Laki-laki', value:lakiLaki,  fill:'#1B5EA0' },
    { name:'Perempuan', value:perempuan, fill:'#993556' },
  ];

  const statusBadge = s => s==='Selesai'?'success':s==='Diproses'?'warning':'default';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', fontSize:12 }}>
          <div style={{ fontWeight:700, marginBottom:4 }}>{label}</div>
          {payload.map(p=>(
            <div key={p.name} style={{ color:p.color, fontWeight:600 }}>{p.name==='L'?'Laki-laki':'Perempuan'}: {p.value} jiwa</div>
          ))}
          <div style={{ borderTop:'1px solid #E2E8F0', marginTop:4, paddingTop:4, fontWeight:700 }}>
            Total: {payload.reduce((a,b)=>a+b.value,0)} jiwa
          </div>
        </div>
      );
    }
    return null;
  };

  if (loadingData) {
    return (
      <div className="page-container">
        <div style={{ height:90, borderRadius:16, background:'linear-gradient(135deg,#1B4F8A,#1565C0)', marginBottom:16 }} />
        <div className="grid-stats" style={{ marginBottom:16 }}>
          {Array(6).fill(0).map((_,i)=><SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#1B4F8A,#1565C0)', borderRadius:16, padding:isMobile?'16px':' 22px 28px', marginBottom:16, color:'#fff', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-20, right:40, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:10, opacity:0.7, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Selamat Datang</div>
          <div style={{ fontSize:isMobile?16:20, fontWeight:800, marginBottom:4 }}>
            Sistem Informasi Desa {desa.namaDesa} 👋
          </div>
          <div style={{ fontSize:isMobile?11:13, opacity:0.8, marginBottom:isMobile?8:12 }}>
            Kec. {desa.kecamatan} · Kab. {desa.kabupaten} · {desa.provinsi}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 14px', backdropFilter:'blur(10px)' }}>
              <div style={{ fontSize:isMobile?18:22, fontWeight:800 }}>{penduduk.length}</div>
              <div style={{ fontSize:10, opacity:0.8 }}>Total Jiwa</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 14px', backdropFilter:'blur(10px)' }}>
              <div style={{ fontSize:isMobile?18:22, fontWeight:800 }}>{arsipSurat.length}</div>
              <div style={{ fontSize:10, opacity:0.8 }}>Arsip Surat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {(menunggu+diproses+bookingPending) > 0 && (
        <div style={{ background:'#FAEEDA', border:'1px solid #F5CE8A', color:'#92400E', borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:12, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', overflow:'hidden' }}>
          <span>⚡</span>
          <div style={{ flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
            {menunggu>0 && <span><strong>{menunggu}</strong> surat menunggu </span>}
            {diproses>0 && <span><strong>{diproses}</strong> diproses </span>}
            {bookingPending>0 && <span><strong>{bookingPending}</strong> booking pending</span>}
          </div>
          {!isKepala && (
            <span onClick={()=>onNav&&onNav('surat')} style={{ fontWeight:700, cursor:'pointer', textDecoration:'underline', whiteSpace:'nowrap', fontSize:11 }}>
              Tangani →
            </span>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-stats" style={{ marginBottom:16 }}>
        {statCards.map(s=>(
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* Grafik */}
      <div className="grid-2col" style={{ marginBottom:16 }}>
        <Card>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📊 Penduduk per Dusun</div>
          <div style={{ fontSize:11, color:'#718096', marginBottom:12 }}>Berdasarkan jenis kelamin</div>
          {penduduk.length===0 ? (
            <div style={{ textAlign:'center', padding:24, color:'#A0AEC0', fontSize:13 }}>Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile?160:200}>
              <BarChart data={grafikDusun} margin={{ top:5, right:5, left:-20, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'#718096' }} />
                <YAxis tick={{ fontSize:10, fill:'#718096' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="L" stackId="a" name="Laki-laki">
                  {grafikDusun.map((_,i)=><Cell key={i} fill={DUSUN_COLORS[i]} />)}
                </Bar>
                <Bar dataKey="P" stackId="a" name="Perempuan" radius={[4,4,0,0]}>
                  {grafikDusun.map((_,i)=><Cell key={i} fill={`${DUSUN_COLORS[i]}88`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'#1B5EA0' }} /> Laki-laki
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'#1B5EA088' }} /> Perempuan
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>🥧 Rasio Jenis Kelamin</div>
          <div style={{ fontSize:11, color:'#718096', marginBottom:8 }}>Perbandingan L & P</div>
          {penduduk.length===0 ? (
            <div style={{ textAlign:'center', padding:24, color:'#A0AEC0', fontSize:13 }}>Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile?160:200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={isMobile?40:50} outerRadius={isMobile?65:80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry,i)=><Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={v=>[`${v} jiwa`,'']} />
                <Legend iconSize={10} wrapperStyle={{ fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Ringkasan bawah */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'2fr 1fr', gap:14, marginBottom:16 }}>
        {/* Riwayat */}
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>🔔 Riwayat Perubahan</div>
            <span style={{ fontSize:11, color:'#1B5EA0', cursor:'pointer', fontWeight:600 }} onClick={()=>onNav&&onNav('penduduk')}>Lihat →</span>
          </div>
          {riwayatPerubahan.length===0 ? (
            <div style={{ textAlign:'center', padding:16, color:'#A0AEC0', fontSize:12 }}>Belum ada riwayat</div>
          ) : riwayatPerubahan.slice(0,4).map(r=>(
            <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F1F5F9', gap:8 }}>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.nama}</div>
                <div style={{ fontSize:11, color:'#A0AEC0' }}>{formatTanggal(r.tanggal)}</div>
              </div>
              <Badge type={r.jenis==='Kelahiran'?'success':r.jenis==='Kematian'?'danger':r.jenis==='Pindah Masuk'?'info':'warning'}>{r.jenis}</Badge>
            </div>
          ))}
        </Card>

        {/* Info Cepat */}
        <Card>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>⚡ Info Cepat</div>
          {[
            { label:'Fasilitas Tersedia', value:fasilitasData.filter(f=>f.tersedia).length, icon:'🏛', color:'#2D6A0F' },
            { label:'Kondisi Rusak',      value:fasilitasData.filter(f=>f.kondisi!=='Baik').length, icon:'⚠️', color:'#C0392B' },
            { label:'Bansos Aktif',       value:bansosData.filter(b=>b.status==='Aktif').length, icon:'🤝', color:'#1B5EA0' },
            { label:'Booking Pending',    value:bookingPending, icon:'📅', color:'#A0621B' },
            { label:'Surat Selesai',      value:pengajuanSurat.filter(s=>s.status==='Selesai').length, icon:'✅', color:'#534AB7' },
          ].map(item=>(
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #F1F5F9' }}>
              <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:12, color:'#4A5568', overflow:'hidden' }}>
                <span style={{ flexShrink:0 }}>{item.icon}</span>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>
              </div>
              <span style={{ fontWeight:700, color:item.color, fontSize:15, flexShrink:0, marginLeft:4 }}>{item.value}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Pengajuan Surat Terbaru */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>📋 Pengajuan Surat Terbaru</div>
          <span onClick={()=>onNav&&onNav(isKepala?'arsip':'surat')} style={{ fontSize:11, color:'#1B5EA0', cursor:'pointer', fontWeight:600 }}>Lihat →</span>
        </div>
        {pengajuanSurat.length===0 ? (
          <div style={{ textAlign:'center', padding:16, color:'#A0AEC0', fontSize:12 }}>Belum ada pengajuan</div>
        ) : isMobile ? (
          <div>
            {pengajuanSurat.slice(0,4).map(s=>(
              <div key={s.id} style={{ padding:'10px 0', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.namaPemohon}</div>
                  <div style={{ fontSize:11, color:'#718096', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.jenisSurat}</div>
                  <div style={{ fontSize:10, color:'#A0AEC0', fontFamily:'monospace' }}>{s.nomorAntrian}</div>
                </div>
                <Badge type={statusBadge(s.status)}>{s.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#F8FAFC' }}>
                {['No. Antrian','Pemohon','Jenis Surat','Status'].map((h,i)=>(
                  <th key={i} style={{ textAlign:'left', padding:'8px 12px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pengajuanSurat.slice(0,5).map(s=>(
                <tr key={s.id} style={{ borderBottom:'1px solid #F1F5F9' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#FAFBFC'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'8px 12px', fontFamily:'monospace', fontSize:11, color:'#1B5EA0', fontWeight:600 }}>{s.nomorAntrian}</td>
                  <td style={{ padding:'8px 12px', fontWeight:600 }}>{s.namaPemohon}</td>
                  <td style={{ padding:'8px 12px', fontSize:12 }}>{s.jenisSurat}</td>
                  <td style={{ padding:'8px 12px' }}><Badge type={statusBadge(s.status)}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}