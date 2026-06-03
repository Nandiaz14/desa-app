import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { bansosAPI } from '../utils/api';
import { Badge, Card, Modal, Input, Select, Btn, EmptyState, Alert, SectionHeader, TabBar, StatCard } from '../components/UI';
import { formatTanggal } from '../utils/helpers';

const STATUS_COLOR = { 'Aktif':'success', 'Selesai':'default', 'Ditangguhkan':'danger' };

export default function Bansos() {
  const { isKepala, currentUser } = useAuth();
  const [tab, setTab]                   = useState('program');
  const [programs, setPrograms]         = useState([]);
  const [penerima, setPenerima]         = useState([]);
  const [ganda, setGanda]               = useState([]);
  const [selectedProgram, setSelected]  = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [showModalPenerima, setShowModalPenerima] = useState(false);
  const [editData, setEditData]         = useState(null);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');

  const [form, setForm] = useState({
    nama_program:'', tahun: new Date().getFullYear(), deskripsi:'', anggaran:0, status:'Aktif'
  });
  const [formPenerima, setFormPenerima] = useState({
    nik:'', nama:'', alamat:'', rt:'', rw:'', dusun:'', jumlah:0, keterangan:''
  });

  useEffect(() => { loadPrograms(); }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const res = await bansosAPI.getAll();
      setPrograms(res.data || []);
    } catch (e) { toast.error('Gagal memuat data bansos'); }
    setLoading(false);
  };

  const loadPenerima = async (id) => {
    try {
      const res = await bansosAPI.getPenerima(id);
      setPenerima(res.data || []);
    } catch (e) { toast.error('Gagal memuat penerima'); }
  };

  const loadGanda = async () => {
    try {
      const res = await bansosAPI.cekGanda();
      setGanda(res.data || []);
    } catch (e) {}
  };

  const bukaTambah = () => {
    setEditData(null);
    setForm({ nama_program:'', tahun: new Date().getFullYear(), deskripsi:'', anggaran:0, status:'Aktif' });
    setShowModal(true); setError('');
  };

  const bukaEdit = (p) => {
    setEditData(p);
    setForm({ nama_program:p.nama_program, tahun:p.tahun, deskripsi:p.deskripsi||'', anggaran:p.anggaran||0, status:p.status });
    setShowModal(true); setError('');
  };

  const simpan = async () => {
    if (!form.nama_program || !form.tahun) { setError('Nama program dan tahun wajib diisi'); return; }
    const t = toast.loading(editData ? 'Menyimpan...' : 'Menambah program...');
    try {
      if (editData) await bansosAPI.update(editData.id, form);
      else          await bansosAPI.tambah(form);
      toast.dismiss(t);
      toast.success(editData ? 'Program berhasil diperbarui!' : 'Program berhasil ditambahkan!');
      setShowModal(false); loadPrograms();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const hapus = async (id) => {
    if (!window.confirm('Hapus program bansos ini? Semua data penerima juga akan dihapus.')) return;
    const t = toast.loading('Menghapus...');
    try {
      await bansosAPI.hapus(id);
      toast.dismiss(t); toast.success('Program berhasil dihapus!');
      if (selectedProgram?.id === id) setSelected(null);
      loadPrograms();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const pilihProgram = async (p) => {
    setSelected(p); setTab('penerima');
    await loadPenerima(p.id);
  };

  const simpanPenerima = async () => {
    if (!formPenerima.nik || !formPenerima.nama) { setError('NIK dan nama wajib diisi'); return; }
    const t = toast.loading('Menambah penerima...');
    try {
      await bansosAPI.tambahPenerima(selectedProgram.id, formPenerima);
      toast.dismiss(t); toast.success('Penerima berhasil ditambahkan!');
      setShowModalPenerima(false);
      setFormPenerima({ nik:'', nama:'', alamat:'', rt:'', rw:'', dusun:'', jumlah:0, keterangan:'' });
      loadPenerima(selectedProgram.id); loadPrograms();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const hapusPenerima = async (pid) => {
    if (!window.confirm('Hapus penerima ini?')) return;
    const t = toast.loading('Menghapus...');
    try {
      await bansosAPI.hapusPenerima(selectedProgram.id, pid);
      toast.dismiss(t); toast.success('Penerima berhasil dihapus!');
      loadPenerima(selectedProgram.id); loadPrograms();
    } catch (e) { toast.dismiss(t); toast.error(e.message); }
  };

  const totalPenerima = programs.reduce((a,b) => a + (parseInt(b.jumlah_penerima)||0), 0);
  const totalAnggaran = programs.reduce((a,b) => a + (parseInt(b.anggaran)||0), 0);

  const filteredPrograms = programs.filter(p =>
    p.nama_program.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id:'program',  label:'Program Bansos' },
    { id:'penerima', label: selectedProgram ? `Penerima — ${selectedProgram.nama_program}` : 'Penerima' },
    { id:'ganda',    label:'Cek Penerima Ganda' },
  ];

  return (
    <div className="page-container">
      <SectionHeader
        title="🤝 Bantuan Sosial"
        sub="Kelola program bantuan sosial dan data penerima"
        action={
          !isKepala && (
            <Btn onClick={bukaTambah} variant="primary">+ Tambah Program</Btn>
          )
        }
      />

      {isKepala && (
        <div style={{ marginBottom:14, padding:'8px 16px', background:'#EBF3FC', borderRadius:10, border:'1px solid #B5D4F4', fontSize:12, color:'#1B5EA0', fontWeight:600 }}>
          🏛 Mode Admin — Anda hanya dapat melihat data bantuan sosial
        </div>
      )}

      {/* Stat */}
      <div className="grid-stats" style={{ marginBottom:20 }}>
        <StatCard label="Total Program" value={programs.length} color="#1B5EA0" icon="📋" />
        <StatCard label="Program Aktif" value={programs.filter(p=>p.status==='Aktif').length} color="#2D6A0F" icon="✅" />
        <StatCard label="Total Penerima" value={totalPenerima} color="#534AB7" icon="👥" />
        <StatCard label="Total Anggaran" value={`Rp ${totalAnggaran.toLocaleString('id-ID')}`} color="#A0621B" icon="💰" />
      </div>

      <TabBar tabs={tabs} active={tab} onChange={t => {
        setTab(t);
        if (t === 'ganda') loadGanda();
      }} />

      {/* ═══ TAB PROGRAM ═══ */}
      {tab === 'program' && (
        <>
          <div style={{ marginBottom:14 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="🔍 Cari nama program..."
              style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:13, fontFamily:'inherit', background:'#fff', outline:'none', boxSizing:'border-box' }} />
          </div>
          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'#718096' }}>Memuat data...</div>
          ) : filteredPrograms.length === 0 ? (
            <EmptyState icon="🤝" text="Belum ada program bansos" sub="Klik + Tambah Program untuk menambahkan" />
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16 }}>
              {filteredPrograms.map(p => (
                <div key={p.id} style={{ background:'#fff', borderRadius:16, border:'1px solid #E2E8F0', padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nama_program}</div>
                      <div style={{ fontSize:12, color:'#718096' }}>Tahun {p.tahun}</div>
                    </div>
                    <Badge type={STATUS_COLOR[p.status]||'default'}>{p.status}</Badge>
                  </div>
                  {p.deskripsi && (
                    <div style={{ fontSize:12, color:'#718096', marginBottom:12, lineHeight:1.6 }}>{p.deskripsi}</div>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                    <div style={{ background:'#F8FAFC', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:800, color:'#534AB7' }}>{p.jumlah_penerima||0}</div>
                      <div style={{ fontSize:11, color:'#718096' }}>Penerima</div>
                    </div>
                    <div style={{ background:'#F8FAFC', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#A0621B' }}>Rp {parseInt(p.anggaran||0).toLocaleString('id-ID')}</div>
                      <div style={{ fontSize:11, color:'#718096' }}>Anggaran</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <Btn onClick={()=>pilihProgram(p)} variant="soft" size="sm" style={{ flex:1, justifyContent:'center' }}>👥 Lihat Penerima</Btn>
                    {!isKepala && (
                      <>
                        <Btn onClick={()=>bukaEdit(p)} variant="ghost" size="sm">✏</Btn>
                        <Btn onClick={()=>hapus(p.id)} variant="danger" size="sm">🗑</Btn>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ TAB PENERIMA ═══ */}
      {tab === 'penerima' && (
        <>
          {!selectedProgram ? (
            <EmptyState icon="👆" text="Pilih program bansos dulu" sub="Klik tombol 'Lihat Penerima' pada salah satu program" />
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
                <div style={{ padding:'10px 16px', background:'#EBF3FC', borderRadius:10, border:'1px solid #B5D4F4', fontSize:13 }}>
                  📋 <strong>{selectedProgram.nama_program}</strong> — {penerima.length} penerima terdaftar
                </div>
                {!isKepala && (
                  <Btn onClick={()=>{ setShowModalPenerima(true); setError(''); }} variant="primary">+ Tambah Penerima</Btn>
                )}
              </div>
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', overflow:'hidden', overflowX:'auto' }}>
                {penerima.length === 0 ? (
                  <EmptyState icon="👥" text="Belum ada penerima" sub="Klik + Tambah Penerima untuk menambahkan" />
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:600 }}>
                    <thead>
                      <tr style={{ background:'#F8FAFC' }}>
                        {['No','NIK','Nama','Dusun','RT/RW','Jumlah Bantuan','Keterangan','Aksi'].map((h,i)=>(
                          <th key={i} style={{ textAlign:'left', padding:'10px 14px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {penerima.map((p,i)=>(
                        <tr key={p.id} style={{ borderBottom:'1px solid #F1F5F9' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#FAFBFC'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'10px 14px', color:'#A0AEC0', fontWeight:600 }}>{i+1}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11 }}>{p.nik}</td>
                          <td style={{ padding:'10px 14px', fontWeight:600 }}>{p.nama}</td>
                          <td style={{ padding:'10px 14px', fontSize:12 }}>{p.dusun||'-'}</td>
                          <td style={{ padding:'10px 14px', fontSize:12 }}>RT {p.rt||'-'} / RW {p.rw||'-'}</td>
                          <td style={{ padding:'10px 14px', fontWeight:600, color:'#2D6A0F' }}>Rp {parseInt(p.jumlah||0).toLocaleString('id-ID')}</td>
                          <td style={{ padding:'10px 14px', fontSize:12, color:'#718096' }}>{p.keterangan||'-'}</td>
                          <td style={{ padding:'10px 14px' }}>
                            {!isKepala && (
                              <Btn onClick={()=>hapusPenerima(p.id)} variant="danger" size="sm">🗑</Btn>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ TAB CEK GANDA ═══ */}
      {tab === 'ganda' && (
        <>
          <Alert type="info">
            Sistem mendeteksi warga yang terdaftar sebagai penerima di <strong>lebih dari satu program</strong> bansos.
          </Alert>
          {ganda.length === 0 ? (
            <EmptyState icon="✅" text="Tidak ada penerima ganda" sub="Semua penerima bansos terdaftar di satu program saja" />
          ) : (
            <>
              <Alert type="warning">
                ⚠️ Ditemukan <strong>{ganda.length} warga</strong> yang menerima bantuan di lebih dari satu program!
              </Alert>
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2E8F0', overflow:'hidden', overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:500 }}>
                  <thead>
                    <tr style={{ background:'#F8FAFC' }}>
                      {['No','NIK','Nama','Jumlah Program','Program yang Diterima'].map((h,i)=>(
                        <th key={i} style={{ textAlign:'left', padding:'10px 14px', fontSize:11, fontWeight:700, color:'#4A5568', borderBottom:'2px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ganda.map((g,i)=>(
                      <tr key={i} style={{ borderBottom:'1px solid #F1F5F9', background:'#FFFBF0' }}>
                        <td style={{ padding:'10px 14px', color:'#A0AEC0', fontWeight:600 }}>{i+1}</td>
                        <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11 }}>{g.nik}</td>
                        <td style={{ padding:'10px 14px', fontWeight:600 }}>{g.nama}</td>
                        <td style={{ padding:'10px 14px' }}>
                          <Badge type="warning">{g.jumlah_program} program</Badge>
                        </td>
                        <td style={{ padding:'10px 14px', fontSize:12, color:'#718096' }}>{g.program_list}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal Tambah/Edit Program */}
      <Modal show={showModal} onClose={()=>setShowModal(false)} title={editData ? '✏ Edit Program' : '➕ Tambah Program Bansos'} width={500}>
        {error && <Alert type="danger">{error}</Alert>}
        <Input label="Nama Program" required value={form.nama_program} onChange={e=>setForm({...form,nama_program:e.target.value})} placeholder="cth: PKH, BLT, Raskin" />
        <div className="form-row">
          <Input label="Tahun" required type="number" value={form.tahun} onChange={e=>setForm({...form,tahun:e.target.value})} />
          <Input label="Anggaran (Rp)" type="number" value={form.anggaran} onChange={e=>setForm({...form,anggaran:e.target.value})} />
        </div>
        <Select label="Status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
          <option>Aktif</option><option>Selesai</option><option>Ditangguhkan</option>
        </Select>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Deskripsi</label>
          <textarea value={form.deskripsi} onChange={e=>setForm({...form,deskripsi:e.target.value})} rows={3}
            style={{ width:'100%', border:'1.5px solid #CBD5E1', borderRadius:10, padding:'10px 14px', fontSize:13, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', outline:'none' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <Btn onClick={()=>setShowModal(false)}>Batal</Btn>
          <Btn variant="primary" onClick={simpan}>💾 Simpan</Btn>
        </div>
      </Modal>

      {/* Modal Tambah Penerima */}
      <Modal show={showModalPenerima} onClose={()=>setShowModalPenerima(false)} title="➕ Tambah Penerima Bansos" width={500}>
        {error && <Alert type="danger">{error}</Alert>}
        <Alert type="info">Masukkan NIK warga — sistem akan otomatis mendeteksi jika NIK sudah terdaftar di program ini.</Alert>
        <div className="form-row">
          <Input label="NIK" required value={formPenerima.nik} onChange={e=>setFormPenerima({...formPenerima,nik:e.target.value})} placeholder="16 digit NIK" maxLength={16} />
          <Input label="Nama Lengkap" required value={formPenerima.nama} onChange={e=>setFormPenerima({...formPenerima,nama:e.target.value})} placeholder="Nama penerima" />
        </div>
        <Input label="Alamat" value={formPenerima.alamat} onChange={e=>setFormPenerima({...formPenerima,alamat:e.target.value})} placeholder="Alamat lengkap" />
        <div className="form-row">
          <Input label="RT" value={formPenerima.rt} onChange={e=>setFormPenerima({...formPenerima,rt:e.target.value})} placeholder="001" />
          <Input label="RW" value={formPenerima.rw} onChange={e=>setFormPenerima({...formPenerima,rw:e.target.value})} placeholder="001" />
        </div>
        <div className="form-row">
          <Input label="Dusun" value={formPenerima.dusun} onChange={e=>setFormPenerima({...formPenerima,dusun:e.target.value})} placeholder="Dusun 1" />
          <Input label="Jumlah Bantuan (Rp)" type="number" value={formPenerima.jumlah} onChange={e=>setFormPenerima({...formPenerima,jumlah:e.target.value})} />
        </div>
        <Input label="Keterangan" value={formPenerima.keterangan} onChange={e=>setFormPenerima({...formPenerima,keterangan:e.target.value})} placeholder="Keterangan tambahan" />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
          <Btn onClick={()=>setShowModalPenerima(false)}>Batal</Btn>
          <Btn variant="primary" onClick={simpanPenerima}>💾 Simpan</Btn>
        </div>
      </Modal>
    </div>
  );
}