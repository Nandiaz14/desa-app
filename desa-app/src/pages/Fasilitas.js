import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fasilitasAPI } from '../utils/api';
import { Badge, Card, Modal, Input, Select, Btn, EmptyState, Alert, SectionHeader, TabBar, StatCard } from '../components/UI';
import { formatTanggal, getTodayStr } from '../utils/helpers';

const KONDISI_COLOR = { 'Baik':'success', 'Rusak Ringan':'warning', 'Rusak Berat':'danger' };
const STATUS_BOOKING = { 'Menunggu':'default', 'Disetujui':'success', 'Ditolak':'danger', 'Selesai':'gray' };

export default function Fasilitas() {
  const { isKepala, currentUser } = useAuth();
  const [tab, setTab]             = useState('inventaris');
  const [fasilitas, setFasilitas] = useState([]);
  const [booking, setBooking]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalBooking, setShowModalBooking] = useState(false);
  const [showModalApprove, setShowModalApprove] = useState(null);
  const [editData, setEditData]   = useState(null);
  const [error, setError]         = useState('');

  const [form, setForm] = useState({ nama:'', kategori:'Gedung', kondisi:'Baik', lokasi:'', deskripsi:'', tersedia:1 });
  const [formBooking, setFormBooking] = useState({
    fasilitas_id:'', nama_pemohon: currentUser?.nama||'', nik:'',
    keperluan:'', tanggal_mulai: getTodayStr(), tanggal_selesai: getTodayStr(), catatan:''
  });
  const [formApprove, setFormApprove] = useState({ status:'Disetujui', catatan:'' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [f, b] = await Promise.all([fasilitasAPI.getAll(), fasilitasAPI.getBooking()]);
      setFasilitas(f.data || []);
      setBooking(b.data || []);
    } catch (e) { toast.error('Gagal memuat data fasilitas'); }
    setLoading(false);
  };

  const bukaTambah = () => {
    setEditData(null);
    setForm({ nama:'', kategori:'Gedung', kondisi:'Baik', lokasi:'', deskripsi:'', tersedia:1 });
    setShowModal(true); setError('');
  };

  const bukaEdit = (f) => {
    setEditData(f);
    setForm({ nama:f.nama, kategori:f.kategori, kondisi:f.kondisi, lokasi:f.lokasi||'', deskripsi:f.deskripsi||'', tersedia:f.tersedia });
    setShowModal(true); setError('');
  };

  const simpan = async () => {
    if (!form.nama) { setError('Nama fasilitas wajib diisi'); return; }
    const t = toast.loading(editData ? 'Menyimpan...' : 'Menambah fasilitas...');
    try {
      if (editData) await fasilitasAPI.update(editData.id, form);
      else          await fasilitasAPI.tambah(form);
      toast.dismiss(t); toast.success(editData ? 'Fasilitas diperbarui!' : 'Fasilitas ditambahkan!');
      setShowModal(false); loadAll();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const hapus = async (id) => {
    if (!window.confirm('Hapus fasilitas ini?')) return;
    const t = toast.loading('Menghapus...');
    try {
      await fasilitasAPI.hapus(id);
      toast.dismiss(t); toast.success('Fasilitas berhasil dihapus!');
      loadAll();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const simpanBooking = async () => {
    if (!formBooking.fasilitas_id || !formBooking.nama_pemohon || !formBooking.keperluan) {
      setError('Fasilitas, nama pemohon, dan keperluan wajib diisi'); return;
    }
    const t = toast.loading('Mengajukan booking...');
    try {
      await fasilitasAPI.ajukanBooking(formBooking);
      toast.dismiss(t); toast.success('Booking berhasil diajukan!');
      setShowModalBooking(false); loadAll();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const prosesBooking = async () => {
    const t = toast.loading('Memproses...');
    try {
      await fasilitasAPI.updateBooking(showModalApprove.id, formApprove);
      toast.dismiss(t); toast.success(`Booking berhasil ${formApprove.status === 'Disetujui' ? 'disetujui' : 'ditolak'}!`);
      setShowModalApprove(null); loadAll();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const pendingBooking = booking.filter(b => b.status === 'Menunggu').length;

  const tabs = [
    { id:'inventaris', label:'Inventaris Fasilitas' },
    { id:'booking',    label:'Booking Fasilitas', badge: pendingBooking||null },
  ];

  const KATEGORI_ICON = { 'Gedung':'🏛', 'Peralatan':'🔧', 'Kendaraan':'🚗', 'Lainnya':'📦' };

  return (
    <div className="page-container">
      <SectionHeader
        title="🏛 Fasilitas Desa"
        sub="Kelola inventaris dan peminjaman fasilitas desa"
        action={
          <div style={{ display:'flex', gap:8 }}>
            {!isKepala && <Btn onClick={()=>{ setShowModalBooking(true); setError(''); setFormBooking({fasilitas_id:'',nama_pemohon:currentUser?.nama||'',nik:'',keperluan:'',tanggal_mulai:getTodayStr(),tanggal_selesai:getTodayStr(),catatan:''}); }} variant="ghost">📅 Ajukan Booking</Btn>}
            {!isKepala && <Btn onClick={bukaTambah} variant="primary">+ Tambah Fasilitas</Btn>}
          </div>
        }
      />

      {isKepala && (
        <div style={{ marginBottom:14, padding:'8px 16px', background:'#EBF3FC', borderRadius:10, border:'1px solid #B5D4F4', fontSize:12, color:'#1B5EA0', fontWeight:600 }}>
          🏛 Mode Admin — Anda dapat menyetujui atau menolak booking fasilitas
        </div>
      )}

      <div className="grid-stats" style={{ marginBottom:20 }}>
        <StatCard label="Total Fasilitas" value={fasilitas.length} color="#1B5EA0" icon="🏛" />
        <StatCard label="Kondisi Baik" value={fasilitas.filter(f=>f.kondisi==='Baik').length} color="#2D6A0F" icon="✅" />
        <StatCard label="Perlu Perhatian" value={fasilitas.filter(f=>f.kondisi!=='Baik').length} color="#C0392B" icon="⚠️" />
        <StatCard label="Booking Pending" value={pendingBooking} color="#A0621B" icon="📅" />
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {/* ═══ TAB INVENTARIS ═══ */}
      {tab === 'inventaris' && (
        loading ? <div style={{ textAlign:'center', padding:40 }}>Memuat data...</div>
        : fasilitas.length === 0 ? (
          <EmptyState icon="🏛" text="Belum ada data fasilitas" sub="Klik + Tambah Fasilitas untuk menambahkan" />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
            {fasilitas.map(f => (
              <div key={f.id} style={{ background:'#fff', borderRadius:16, border:`2px solid ${f.kondisi==='Baik'?'#B8D98C':f.kondisi==='Rusak Ringan'?'#F5CE8A':'#F7C1C1'}`, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                      {KATEGORI_ICON[f.kategori]||'📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{f.nama}</div>
                      <div style={{ fontSize:11, color:'#718096' }}>{f.kategori}</div>
                    </div>
                  </div>
                  <Badge type={KONDISI_COLOR[f.kondisi]||'default'}>{f.kondisi}</Badge>
                </div>
                {f.lokasi && <div style={{ fontSize:12, color:'#718096', marginBottom:6 }}>📍 {f.lokasi}</div>}
                {f.deskripsi && <div style={{ fontSize:12, color:'#718096', marginBottom:10 }}>{f.deskripsi}</div>}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontSize:12, fontWeight:600, color: f.tersedia ? '#2D6A0F' : '#C0392B' }}>
                    {f.tersedia ? '✅ Tersedia' : '🚫 Tidak Tersedia'}
                  </span>
                </div>
                {!isKepala && (
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn onClick={()=>bukaEdit(f)} variant="soft" size="sm" style={{ flex:1, justifyContent:'center' }}>✏ Edit</Btn>
                    <Btn onClick={()=>hapus(f.id)} variant="danger" size="sm">🗑</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ═══ TAB BOOKING ═══ */}
      {tab === 'booking' && (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', overflow:'hidden', overflowX:'auto' }}>
          {booking.length === 0 ? (
            <EmptyState icon="📅" text="Belum ada pengajuan booking" sub="Klik Ajukan Booking untuk mengajukan peminjaman fasilitas" />
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:700 }}>
              <thead>
                <tr style={{ background:'#F8FAFC' }}>
                  {['No','Fasilitas','Pemohon','Keperluan','Tanggal','Status','Diproses','Aksi'].map((h,i)=>(
                    <th key={i} style={{ textAlign:'left', padding:'10px 14px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {booking.map((b,i) => (
                  <tr key={b.id} style={{ borderBottom:'1px solid #F1F5F9' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#FAFBFC'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 14px', color:'#A0AEC0', fontWeight:600 }}>{i+1}</td>
                    <td style={{ padding:'10px 14px', fontWeight:600 }}>{b.nama_fasilitas}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontWeight:600 }}>{b.nama_pemohon}</div>
                      {b.nik && <div style={{ fontSize:11, color:'#A0AEC0', fontFamily:'monospace' }}>{b.nik}</div>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:'#718096' }}>{b.keperluan}</td>
                    <td style={{ padding:'10px 14px', fontSize:12, whiteSpace:'nowrap' }}>
                      <div>{formatTanggal(b.tanggal_mulai)}</div>
                      <div style={{ color:'#A0AEC0' }}>s/d {formatTanggal(b.tanggal_selesai)}</div>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <Badge type={STATUS_BOOKING[b.status]||'default'}>{b.status}</Badge>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:'#718096' }}>{b.diproses_oleh||'-'}</td>
                    <td style={{ padding:'10px 14px' }}>
                      {isKepala && b.status === 'Menunggu' && (
                        <Btn onClick={()=>{ setShowModalApprove(b); setFormApprove({ status:'Disetujui', catatan:'' }); }} variant="primary" size="sm">⚙ Proses</Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Tambah/Edit Fasilitas */}
      <Modal show={showModal} onClose={()=>setShowModal(false)} title={editData ? '✏ Edit Fasilitas' : '➕ Tambah Fasilitas'} width={480}>
        {error && <Alert type="danger">{error}</Alert>}
        <Input label="Nama Fasilitas" required value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="cth: Balai Desa, Traktor, dll" />
        <div className="form-row">
          <Select label="Kategori" value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})}>
            <option>Gedung</option><option>Peralatan</option><option>Kendaraan</option><option>Lainnya</option>
          </Select>
          <Select label="Kondisi" value={form.kondisi} onChange={e=>setForm({...form,kondisi:e.target.value})}>
            <option>Baik</option><option>Rusak Ringan</option><option>Rusak Berat</option>
          </Select>
        </div>
        <Input label="Lokasi" value={form.lokasi} onChange={e=>setForm({...form,lokasi:e.target.value})} placeholder="cth: Jl. Cikulak No. 1" />
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Deskripsi</label>
          <textarea value={form.deskripsi} onChange={e=>setForm({...form,deskripsi:e.target.value})} rows={3}
            style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:13, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', outline:'none' }} />
        </div>
        <Select label="Status Ketersediaan" value={form.tersedia} onChange={e=>setForm({...form,tersedia:parseInt(e.target.value)})}>
          <option value={1}>✅ Tersedia</option>
          <option value={0}>🚫 Tidak Tersedia</option>
        </Select>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <Btn onClick={()=>setShowModal(false)}>Batal</Btn>
          <Btn variant="primary" onClick={simpan}>💾 Simpan</Btn>
        </div>
      </Modal>

      {/* Modal Ajukan Booking */}
      <Modal show={showModalBooking} onClose={()=>setShowModalBooking(false)} title="📅 Ajukan Booking Fasilitas" width={500}>
        {error && <Alert type="danger">{error}</Alert>}
        <Select label="Fasilitas" required value={formBooking.fasilitas_id} onChange={e=>setFormBooking({...formBooking,fasilitas_id:e.target.value})}>
          <option value="">-- Pilih Fasilitas --</option>
          {fasilitas.filter(f=>f.tersedia).map(f=>(
            <option key={f.id} value={f.id}>{f.nama} ({f.kategori})</option>
          ))}
        </Select>
        <div className="form-row">
          <Input label="Nama Pemohon" required value={formBooking.nama_pemohon} onChange={e=>setFormBooking({...formBooking,nama_pemohon:e.target.value})} />
          <Input label="NIK (opsional)" value={formBooking.nik} onChange={e=>setFormBooking({...formBooking,nik:e.target.value})} maxLength={16} />
        </div>
        <Input label="Keperluan" required value={formBooking.keperluan} onChange={e=>setFormBooking({...formBooking,keperluan:e.target.value})} placeholder="cth: Rapat RT, Hajatan, dll" />
        <div className="form-row">
          <Input label="Tanggal Mulai" required type="date" value={formBooking.tanggal_mulai} onChange={e=>setFormBooking({...formBooking,tanggal_mulai:e.target.value})} />
          <Input label="Tanggal Selesai" required type="date" value={formBooking.tanggal_selesai} onChange={e=>setFormBooking({...formBooking,tanggal_selesai:e.target.value})} />
        </div>
        <Input label="Catatan (opsional)" value={formBooking.catatan} onChange={e=>setFormBooking({...formBooking,catatan:e.target.value})} placeholder="Catatan tambahan..." />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <Btn onClick={()=>setShowModalBooking(false)}>Batal</Btn>
          <Btn variant="primary" onClick={simpanBooking}>📅 Ajukan Booking</Btn>
        </div>
      </Modal>

      {/* Modal Approve/Tolak Booking (Admin) */}
      <Modal show={!!showModalApprove} onClose={()=>setShowModalApprove(null)} title="⚙ Proses Booking" width={440}>
        {showModalApprove && (
          <>
            <div style={{ background:'#F8FAFC', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
              <div style={{ fontWeight:600 }}>{showModalApprove.nama_fasilitas}</div>
              <div style={{ fontSize:12, color:'#718096' }}>{showModalApprove.nama_pemohon} · {showModalApprove.keperluan}</div>
              <div style={{ fontSize:12, color:'#718096', marginTop:4 }}>
                {formatTanggal(showModalApprove.tanggal_mulai)} s/d {formatTanggal(showModalApprove.tanggal_selesai)}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:8 }}>Keputusan:</div>
              <div style={{ display:'flex', gap:8 }}>
                {['Disetujui','Ditolak'].map(s=>(
                  <button key={s} onClick={()=>setFormApprove({...formApprove,status:s})}
                    style={{ flex:1, padding:'10px', fontSize:13, borderRadius:8, border:'1.5px solid', borderColor:formApprove.status===s?(s==='Disetujui'?'#2D6A0F':'#C0392B'):'#E2E8F0', background:formApprove.status===s?(s==='Disetujui'?'#EAF3DE':'#FCEBEB'):'#fff', color:formApprove.status===s?(s==='Disetujui'?'#2D6A0F':'#C0392B'):'#718096', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                    {s === 'Disetujui' ? '✅ Setujui' : '❌ Tolak'}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Catatan (opsional)" value={formApprove.catatan} onChange={e=>setFormApprove({...formApprove,catatan:e.target.value})} placeholder="Alasan atau keterangan..." />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
              <Btn onClick={()=>setShowModalApprove(null)}>Batal</Btn>
              <Btn variant={formApprove.status==='Disetujui'?'success':'danger'} onClick={prosesBooking}>💾 Simpan Keputusan</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}