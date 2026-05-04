import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Btn, SectionHeader, EmptyState, Alert } from '../components/UI';

const ROLE_LABEL = {
  kepala_desa:    { label: 'Kepala Desa',    color: 'warning', icon: '🏛' },
  perangkat_desa: { label: 'Perangkat Desa', color: 'info',    icon: '👤' },
};

export default function ManajemenUser() {
  const { users, currentUser, aktivasiUser, nonaktifUser, hapusUser } = useAuth();
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const cocok = u.nama.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.jabatan.toLowerCase().includes(q);
    const statusOk = filter === 'semua' ? true : filter === 'aktif' ? u.aktif : !u.aktif;
    return cocok && statusOk;
  });

  const menunggu = users.filter(u => !u.aktif).length;

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="👥 Manajemen Pengguna"
        sub="Kelola akun perangkat desa dan kepala desa"
      />

      {menunggu > 0 && (
        <Alert type="warning">
          ⚠️ Ada <strong>{menunggu} akun</strong> yang menunggu aktivasi. Silakan periksa dan aktifkan jika sudah terverifikasi.
        </Alert>
      )}

      {/* Stat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Pengguna', value: users.length,                          color: '#1B5EA0', icon: '👥', bg: '#EBF3FC' },
          { label: 'Aktif',          value: users.filter(u => u.aktif).length,     color: '#2D6A0F', icon: '✅', bg: '#EAF3DE' },
          { label: 'Menunggu',       value: menunggu,                              color: '#C0392B', icon: '⏳', bg: '#FCEBEB' },
          { label: 'Perangkat Desa', value: users.filter(u=>u.role==='perangkat_desa').length, color:'#534AB7', icon:'👤', bg:'#EEEDFE' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#718096', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Cari nama, username, atau jabatan..."
          style={{ flex: 1, minWidth: 220, border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontFamily: 'inherit', background: '#fff', outline: 'none' }} />
        {['semua', 'aktif', 'menunggu'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '10px 18px', fontSize: 13, borderRadius: 10, border: '1.5px solid',
              borderColor: filter === f ? '#1B5EA0' : '#E2E8F0',
              background: filter === f ? '#1B5EA0' : '#fff',
              color: filter === f ? '#fff' : '#718096',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, textTransform: 'capitalize',
            }}>
            {f === 'semua' ? 'Semua' : f === 'aktif' ? '✅ Aktif' : '⏳ Menunggu'}
          </button>
        ))}
      </div>

      {/* Tabel User */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        {filtered.length === 0
          ? <EmptyState icon="👤" text="Tidak ada pengguna ditemukan" />
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['No', 'Nama & Jabatan', 'Username', 'Role', 'No. HP', 'Terdaftar', 'Status', 'Aksi'].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#4A5568', borderBottom: '2px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const isSelf = u.id === currentUser?.id;
                  const roleInfo = ROLE_LABEL[u.role] || ROLE_LABEL.perangkat_desa;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', color: '#A0AEC0', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: u.aktif ? '#EBF3FC' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {roleInfo.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{u.nama} {isSelf && <span style={{ fontSize: 11, color: '#1B5EA0', background: '#EBF3FC', padding: '1px 6px', borderRadius: 8 }}>Anda</span>}</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>{u.jabatan}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: '#4A5568' }}>@{u.username}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge type={roleInfo.color}>{roleInfo.label}</Badge>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#718096', fontSize: 13 }}>{u.noHp || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#718096', fontSize: 12, whiteSpace: 'nowrap' }}>{u.createdAt}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge type={u.aktif ? 'success' : 'danger'}>{u.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {isSelf ? (
                          <span style={{ fontSize: 12, color: '#A0AEC0' }}>—</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {!u.aktif && (
                              <Btn onClick={() => aktivasiUser(u.id)} variant="success" size="sm">✅ Aktifkan</Btn>
                            )}
                            {u.aktif && (
                              <Btn onClick={() => { if (window.confirm(`Nonaktifkan akun ${u.nama}?`)) nonaktifUser(u.id); }} variant="warning" size="sm">🚫 Nonaktif</Btn>
                            )}
                            <Btn onClick={() => { if (window.confirm(`Hapus akun ${u.nama}? Tindakan ini tidak bisa dibatalkan.`)) hapusUser(u.id); }} variant="danger" size="sm">🗑</Btn>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}