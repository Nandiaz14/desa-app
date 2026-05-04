import React from 'react';
import { useApp } from '../context/AppContext';
import { formatTanggal } from '../utils/helpers';
import { Card, Badge } from '../components/UI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const DUSUN_COLORS = ['#1B5EA0','#534AB7','#2D6A0F','#A0621B','#C0392B'];

export default function Dashboard({ onNav }) {
  const { state } = useApp();
  const { penduduk, pengajuanSurat, riwayatPerubahan } = state;
  const desa = state.pengaturanDesa || {};

  const lakiLaki    = penduduk.filter(p => p.jenisKelamin==='Laki-laki').length;
  const perempuan   = penduduk.filter(p => p.jenisKelamin==='Perempuan').length;
  const baru        = penduduk.filter(p => p.status==='Baru').length;
  const menunggu    = pengajuanSurat.filter(s => s.status==='Menunggu').length;
  const diproses    = pengajuanSurat.filter(s => s.status==='Diproses').length;

  const statCards = [
    { label:'Total Penduduk', value: penduduk.length, sub:'jiwa terdaftar', icon:'👥', color:'#1B5EA0', bg:'#EBF3FC' },
    { label:'Laki-laki',      value: lakiLaki,         sub:'jiwa',           icon:'👨', color:'#534AB7', bg:'#EEEDFE' },
    { label:'Perempuan',      value: perempuan,        sub:'jiwa',           icon:'👩', color:'#993556', bg:'#FBEAF0' },
    { label:'Penduduk Baru',  value: baru,             sub:'bulan ini',      icon:'🆕', color:'#A0621B', bg:'#FAEEDA' },
    { label:'Antrian Surat',  value: menunggu,         sub:'perlu ditangani',icon:'📋', color:'#C0392B', bg:'#FCEBEB' },
  ];

  // Data grafik per dusun
  const dusunList = ['Dusun 1','Dusun 2','Dusun 3','Dusun 4','Dusun 5'];
  const grafikDusun = dusunList.map((d,i) => ({
    name: d,
    'Laki-laki': penduduk.filter(p => p.dusun===d && p.jenisKelamin==='Laki-laki').length,
    'Perempuan': penduduk.filter(p => p.dusun===d && p.jenisKelamin==='Perempuan').length,
    total: penduduk.filter(p => p.dusun===d).length,
    color: DUSUN_COLORS[i],
  }));

  const statusBadge = s => s==='Selesai'?'success':s==='Diproses'?'warning':'default';

  // Custom tooltip grafik
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', fontSize:13 }}>
          <div style={{ fontWeight:700, marginBottom:6, color:'#1A2332' }}>{label}</div>
          {payload.map(p => (
            <div key={p.name} style={{ display:'flex', justifyContent:'space-between', gap:16, color:p.color, fontWeight:600 }}>
              <span>{p.name}</span>
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

  return (
    <div className="page-container">

      {/* Banner sambutan */}
      <div style={{ background:'linear-gradient(135deg,#1B4F8A,#1565C0)', borderRadius:18, padding:'20px 24px', marginBottom:20, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>Selamat Datang! 👋</div>
          <div style={{ fontSize:14, opacity:0.85 }}>Sistem Informasi Desa {desa.namaDesa}, Kec. {desa.kecamatan}</div>
          <div style={{ fontSize:12, opacity:0.7, marginTop:3 }}>Kepala Desa: {desa.kepalaDesa}</div>
        </div>
        <div style={{ fontSize:52, opacity:0.85 }}>🏘</div>
      </div>

      {/* Alert surat */}
      {(menunggu+diproses) > 0 && (
        <div style={{ background:'#FAEEDA', border:'1px solid #F5CE8A', color:'#A0621B', borderRadius:12, padding:'12px 16px', marginBottom:18, fontSize:13, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <span>⚠️</span>
          <span>Ada <strong>{menunggu} surat menunggu</strong> dan <strong>{diproses} sedang diproses</strong>.</span>
          <span onClick={()=>onNav&&onNav('surat')}
            style={{ marginLeft:'auto', fontWeight:700, cursor:'pointer', textDecoration:'underline', whiteSpace:'nowrap' }}>
            Tangani →
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-stats" style={{ marginBottom:20 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:46, height:46, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{s.icon}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:26, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#1A2332', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.label}</div>
              <div style={{ fontSize:11, color:'#A0AEC0' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grafik + Riwayat */}
      <div className="grid-2col" style={{ marginBottom:20 }}>

        {/* Grafik per Dusun */}
        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>📊 Jumlah Penduduk per Dusun</div>
          {penduduk.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'#A0AEC0', fontSize:13 }}>
              Belum ada data penduduk
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={grafikDusun} margin={{ top:5, right:10, left:-10, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#718096' }} />
                <YAxis tick={{ fontSize:11, fill:'#718096' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Laki-laki" stackId="a" radius={[0,0,0,0]}>
                  {grafikDusun.map((_, i) => <Cell key={i} fill={DUSUN_COLORS[i]} />)}
                </Bar>
                <Bar dataKey="Perempuan" stackId="a" radius={[6,6,0,0]}>
                  {grafikDusun.map((_, i) => <Cell key={i} fill={`${DUSUN_COLORS[i]}99`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#4A5568' }}>
              <div style={{ width:12, height:12, borderRadius:3, background:'#1B5EA0' }} /> Laki-laki
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#4A5568' }}>
              <div style={{ width:12, height:12, borderRadius:3, background:'#1B5EA099' }} /> Perempuan
            </div>
          </div>
        </Card>

        {/* Riwayat Perubahan */}
        <Card>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>🔔 Riwayat Perubahan Penduduk</div>
          {riwayatPerubahan.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'#A0AEC0', fontSize:13 }}>Belum ada riwayat perubahan</div>
          ) : riwayatPerubahan.slice(0,5).map(r => (
            <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F1F5F9', gap:8 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.nama}</div>
                <div style={{ fontSize:12, color:'#718096', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.keterangan}</div>
                <div style={{ fontSize:11, color:'#A0AEC0' }}>{formatTanggal(r.tanggal)}</div>
              </div>
              <Badge type={r.jenis==='Kelahiran'?'success':r.jenis==='Kematian'?'danger':r.jenis==='Pindah Masuk'?'info':'warning'}>
                {r.jenis}
              </Badge>
            </div>
          ))}
        </Card>
      </div>

      {/* Pengajuan Surat Terbaru */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>📋 Pengajuan Surat Terbaru</div>
          <span onClick={()=>onNav&&onNav('surat')}
            style={{ fontSize:12, color:'#1B5EA0', cursor:'pointer', fontWeight:600 }}>
            Lihat Semua →
          </span>
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
                    <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:12, color:'#1B5EA0', fontWeight:600, whiteSpace:'nowrap' }}>{s.nomorAntrian}</td>
                    <td style={{ padding:'9px 12px', fontWeight:600 }}>{s.namaPemohon}</td>
                    <td style={{ padding:'9px 12px', fontSize:12 }}>{s.jenisSurat}</td>
                    <td style={{ padding:'9px 12px', fontSize:12, color:'#718096' }}>{s.keperluan}</td>
                    <td style={{ padding:'9px 12px' }}>
                      <Badge type={statusBadge(s.status)}>{s.status}</Badge>
                    </td>
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