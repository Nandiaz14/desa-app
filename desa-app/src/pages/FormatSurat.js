import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatTanggal, getTodayStr } from '../utils/helpers';
import { Alert, Btn, Card, Modal, Input, Select, SectionHeader, FormRow } from '../components/UI';

const JENIS_SURAT = [
  'Surat Keterangan Domisili',
  'Surat Keterangan Tidak Mampu',
  'Surat Pengantar KTP',
  'Surat Keterangan Usaha',
  'Surat Keterangan Kelahiran',
  'Surat Keterangan Kematian',
  'Surat Pengantar SKCK',
  'Surat Keterangan Pindah',
];

const PLACEHOLDER_INFO = [
  { tag: '[NAMA_DESA]', desc: 'Nama desa' },
  { tag: '[KECAMATAN]', desc: 'Nama kecamatan' },
  { tag: '[KABUPATEN]', desc: 'Nama kabupaten' },
  { tag: '[DATA_WARGA]', desc: 'Tabel data warga otomatis' },
  { tag: '[KEPERLUAN]', desc: 'Keperluan surat' },
  { tag: '[NOMOR_SURAT]', desc: 'Nomor surat' },
  { tag: '[TANGGAL]', desc: 'Tanggal surat' },
];

// Render placeholder ke teks nyata
function renderIsi(tpl, warga, keperluan, desa, nomor, tanggal) {
  const dataWarga = warga
    ? `Nama           : ${warga.nama}\nNIK            : ${warga.nik}\nTempat/Tgl Lahir: ${warga.tempatLahir}, ${formatTanggal(warga.tanggalLahir)}\nJenis Kelamin  : ${warga.jenisKelamin}\nAgama          : ${warga.agama}\nPekerjaan      : ${warga.pekerjaan}\nAlamat         : ${warga.alamat}, RT ${warga.rt}/RW ${warga.rw}${warga.dusun ? ', ' + warga.dusun : ''}`
    : '[ Data Warga ]';

  return (tpl || '')
    .replace(/\[NAMA_DESA\]/g, desa?.namaDesa || '')
    .replace(/\[KECAMATAN\]/g, desa?.kecamatan || '')
    .replace(/\[KABUPATEN\]/g, desa?.kabupaten || '')
    .replace(/\[PROVINSI\]/g, desa?.provinsi || '')
    .replace(/\[DATA_WARGA\]/g, dataWarga)
    .replace(/\[KEPERLUAN\]/g, keperluan || '')
    .replace(/\[NOMOR_SURAT\]/g, nomor || '')
    .replace(/\[TANGGAL\]/g, tanggal || formatTanggal(getTodayStr()));
}

// Komponen Surat Resmi (untuk preview & print)
function SuratResmi({ tpl, jenis, warga, keperluan, desa, nomor, tanggal, kepalaDesa, nip }) {
  const isiRendered = renderIsi(tpl?.isi, warga, keperluan, desa, nomor, tanggal);
  const penutupRendered = (tpl?.penutup || '')
    .replace(/\[NAMA_DESA\]/g, desa?.namaDesa || '')
    .replace(/\[KECAMATAN\]/g, desa?.kecamatan || '');

  return (
    <div style={{ fontFamily: 'Times New Roman, serif', fontSize: 12, lineHeight: 1.8, color: '#000', background: '#fff', padding: '32px 40px', minHeight: 600 }}>
      {/* KOP SURAT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 10, borderBottom: '3px double #000', marginBottom: 20 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', border: '2px solid #1B4F8A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, background: '#f0f4fb' }}>🏛</div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5 }}>PEMERINTAH KABUPATEN {(desa?.kabupaten || '').toUpperCase()}</div>
          <div style={{ fontSize: 11, letterSpacing: 1.5 }}>KECAMATAN {(desa?.kecamatan || '').toUpperCase()}</div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 2, margin: '2px 0' }}>KANTOR DESA {(desa?.namaDesa || '').toUpperCase()}</div>
          <div style={{ fontSize: 10, color: '#444' }}>
            {desa?.alamat} | Kode Pos {desa?.kodePos} | Telp. {desa?.telp}
          </div>
        </div>
      </div>

      {/* JUDUL */}
      <div style={{ textAlign: 'center', margin: '16px 0 6px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, textDecoration: 'underline', letterSpacing: 2, textTransform: 'uppercase' }}>
          {tpl?.judul || jenis?.toUpperCase()}
        </div>
        <div style={{ fontSize: 11, marginTop: 2 }}>Nomor : {nomor || '____/____/____/____'}</div>
      </div>

      <div style={{ borderBottom: '1px solid #000', marginBottom: 16 }} />

      {/* ISI */}
      <div style={{ textAlign: 'justify', whiteSpace: 'pre-line', fontSize: 12, marginBottom: 24 }}>
        {isiRendered}
      </div>

      {/* TANDA TANGAN */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <div style={{ textAlign: 'center', minWidth: 220 }}>
          <div style={{ fontSize: 12 }}>{desa?.namaDesa}, {tanggal || formatTanggal(getTodayStr())}</div>
          <div style={{ fontSize: 12, whiteSpace: 'pre-line', marginTop: 2 }}>{penutupRendered}</div>
          <div style={{ height: 64 }} />
          <div style={{ fontWeight: 700, fontSize: 12, borderTop: '1px solid #000', paddingTop: 4 }}>
            {kepalaDesa || desa?.kepalaDesa || '(____________________)'}
          </div>
          <div style={{ fontSize: 11 }}>NIP. {nip || desa?.nip || '-'}</div>
        </div>
      </div>
    </div>
  );
}

export default function FormatSurat() {
  const { state, dispatch } = useApp();
  const desa = state.pengaturanDesa || {};
  const templates = state.templateSurat || {};
  const printRef = useRef();

  const [selectedJenis, setSelectedJenis] = useState(JENIS_SURAT[0]);
  const [formTemplate, setFormTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPengaturan, setShowPengaturan] = useState(false);
  const [formPengaturan, setFormPengaturan] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Preview pakai warga pertama sebagai contoh
  const contohWarga = state.penduduk[0] || null;
  const tplAktif = templates[selectedJenis] || {};

  const bukaEdit = () => {
    setFormTemplate({ ...tplAktif });
    setEditMode(true);
  };

  const simpanTemplate = () => {
    dispatch({ type: 'UPDATE_TEMPLATE_SURAT', payload: { jenis: selectedJenis, data: formTemplate } });
    setEditMode(false);
  };

  const batalEdit = () => {
    setFormTemplate(null);
    setEditMode(false);
  };

  const insertPlaceholder = (tag) => {
    setFormTemplate(f => ({ ...f, isi: (f.isi || '') + tag }));
  };

  // Print
  const handlePrint = () => {
    const isi = printRef.current?.innerHTML;
    if (!isi) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedJenis}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; background: #fff; }
          @page { size: A4; margin: 2cm 2.5cm; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${isi}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const nomor = `${tplAktif.kodePrefix || 'DS/SKT'}/${new Date().getFullYear()}/001`;

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Format & Template Surat"
        sub="Kelola format surat desa — edit isi, preview, dan cetak langsung"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => { setFormPengaturan({ ...desa }); setShowPengaturan(true); }} variant="ghost">
              ⚙ Pengaturan Desa
            </Btn>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── PANEL KIRI: Pilih Jenis Surat ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            Jenis Surat
          </div>
          {JENIS_SURAT.map(j => {
            const aktif = j === selectedJenis;
            return (
              <button key={j} onClick={() => { setSelectedJenis(j); setEditMode(false); setFormTemplate(null); }}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 12, textAlign: 'left',
                  borderRadius: 8, border: aktif ? '1.5px solid #1B5EA0' : '0.5px solid var(--border)',
                  background: aktif ? '#EBF3FC' : 'var(--bg-primary)',
                  color: aktif ? '#1B5EA0' : 'var(--text-primary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: aktif ? 600 : 400,
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                <span style={{ fontSize: 16 }}>
                  {j.includes('Domisili') ? '🏠' : j.includes('Mampu') ? '💰' : j.includes('KTP') ? '🪪' : j.includes('Usaha') ? '🏪' : j.includes('Kelahiran') ? '👶' : j.includes('Kematian') ? '🕊' : j.includes('SKCK') ? '🚔' : '📦'}
                </span>
                <span style={{ lineHeight: 1.3 }}>{j}</span>
              </button>
            );
          })}

          {/* Info desa */}
          <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Info Desa</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>🏘 {desa.namaDesa || '-'}</div>
              <div>📍 Kec. {desa.kecamatan || '-'}</div>
              <div>👤 {desa.kepalaDesa || '-'}</div>
            </div>
          </div>
        </div>

        {/* ── PANEL KANAN: Editor & Preview ── */}
        <div>
          {/* Header panel kanan */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedJenis}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace', marginTop: 2 }}>
                {tplAktif.kodePrefix || 'DS/SKT'}/YYYY/NNN
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!editMode ? (
                <>
                  <Btn onClick={() => setShowPreviewModal(true)} variant="ghost">👁 Preview & Print</Btn>
                  <Btn onClick={bukaEdit} variant="primary">✏ Edit Template</Btn>
                </>
              ) : (
                <>
                  <Btn onClick={batalEdit}>Batal</Btn>
                  <Btn onClick={simpanTemplate} variant="primary">💾 Simpan</Btn>
                </>
              )}
            </div>
          </div>

          {/* ── MODE VIEW ── */}
          {!editMode && (
            <Card style={{ padding: 0 }}>
              {/* Preview surat mini */}
              <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Preview Surat</div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', transform: 'scale(0.85)', transformOrigin: 'top left', width: '117%', pointerEvents: 'none' }}>
                  <SuratResmi
                    tpl={tplAktif}
                    jenis={selectedJenis}
                    warga={contohWarga}
                    keperluan="Contoh keperluan surat"
                    desa={desa}
                    nomor={nomor}
                    tanggal={formatTanggal(getTodayStr())}
                  />
                </div>
              </div>

              {/* Detail template */}
              <div style={{ padding: '16px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Detail Template</div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Judul</span>
                  <span style={{ fontWeight: 500 }}>{tplAktif.judul || '-'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Kode Prefix</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{tplAktif.kodePrefix || '-'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Penutup</span>
                  <span style={{ whiteSpace: 'pre-line', fontSize: 12, color: 'var(--text-secondary)' }}>{tplAktif.penutup || '-'}</span>
                </div>
              </div>
            </Card>
          )}

          {/* ── MODE EDIT ── */}
          {editMode && formTemplate && (
            <Card>
              {/* Placeholder helper */}
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Klik placeholder untuk menyisipkan ke badan surat:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PLACEHOLDER_INFO.map(p => (
                    <button key={p.tag} onClick={() => insertPlaceholder(p.tag)}
                      title={p.desc}
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 5, border: '1px solid #1B5EA0', background: '#EBF3FC', color: '#1B5EA0', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 500 }}>
                      {p.tag}
                    </button>
                  ))}
                </div>
              </div>

              <FormRow>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Judul Surat</div>
                  <input value={formTemplate.judul || ''} onChange={e => setFormTemplate({ ...formTemplate, judul: e.target.value })}
                    placeholder="cth: SURAT KETERANGAN DOMISILI"
                    style={{ width: '100%', border: '0.5px solid var(--border-md)', borderRadius: 7, padding: '8px 11px', fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Kode Prefix Nomor</div>
                  <input value={formTemplate.kodePrefix || ''} onChange={e => setFormTemplate({ ...formTemplate, kodePrefix: e.target.value })}
                    placeholder="cth: DS/SKD"
                    style={{ width: '100%', border: '0.5px solid var(--border-md)', borderRadius: 7, padding: '8px 11px', fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </FormRow>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Isi / Badan Surat</div>
                <textarea value={formTemplate.isi || ''}
                  onChange={e => setFormTemplate({ ...formTemplate, isi: e.target.value })}
                  rows={12}
                  placeholder="Tulis isi surat di sini. Gunakan placeholder di atas untuk data otomatis."
                  style={{ width: '100%', border: '0.5px solid var(--border-md)', borderRadius: 7, padding: '10px 12px', fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }} />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Kalimat Penutup & Penandatangan</div>
                <textarea value={formTemplate.penutup || ''}
                  onChange={e => setFormTemplate({ ...formTemplate, penutup: e.target.value })}
                  rows={3}
                  placeholder="cth: Hormat kami,&#10;Kepala Desa [NAMA_DESA]"
                  style={{ width: '100%', border: '0.5px solid var(--border-md)', borderRadius: 7, padding: '10px 12px', fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }} />
              </div>

              {/* Live preview kecil saat edit */}
              <div style={{ marginTop: 16, borderTop: '0.5px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Preview Langsung</div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'auto', maxHeight: 340, background: '#fff' }}>
                  <div style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '143%', pointerEvents: 'none' }}>
                    <SuratResmi
                      tpl={formTemplate}
                      jenis={selectedJenis}
                      warga={contohWarga}
                      keperluan="Contoh keperluan"
                      desa={desa}
                      nomor={nomor}
                      tanggal={formatTanggal(getTodayStr())}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <Btn onClick={batalEdit}>Batal</Btn>
                <Btn variant="primary" onClick={simpanTemplate}>💾 Simpan Template</Btn>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ══════ MODAL PREVIEW & PRINT ══════ */}
      <Modal show={showPreviewModal} onClose={() => setShowPreviewModal(false)} title={`👁 Preview — ${selectedJenis}`} width={680}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Data ditampilkan menggunakan contoh warga pertama terdaftar.
          </div>
          <Btn onClick={handlePrint} variant="primary">🖨 Cetak Surat</Btn>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'auto', maxHeight: '65vh', background: '#fff' }}>
          <div ref={printRef}>
            <SuratResmi
              tpl={tplAktif}
              jenis={selectedJenis}
              warga={contohWarga}
              keperluan={contohWarga ? 'Keperluan administratif' : 'Keperluan surat'}
              desa={desa}
              nomor={nomor}
              tanggal={formatTanggal(getTodayStr())}
            />
          </div>
        </div>
      </Modal>

      {/* ══════ MODAL PENGATURAN DESA ══════ */}
      <Modal show={showPengaturan} onClose={() => setShowPengaturan(false)} title="⚙ Pengaturan Data Desa" width={520}>
        <Alert type="info">Data ini digunakan sebagai kop surat di seluruh dokumen.</Alert>
        <FormRow>
          <Input label="Nama Desa" value={formPengaturan.namaDesa || ''} onChange={e => setFormPengaturan({ ...formPengaturan, namaDesa: e.target.value })} />
          <Input label="Kecamatan" value={formPengaturan.kecamatan || ''} onChange={e => setFormPengaturan({ ...formPengaturan, kecamatan: e.target.value })} />
        </FormRow>
        <FormRow>
          <Input label="Kabupaten" value={formPengaturan.kabupaten || ''} onChange={e => setFormPengaturan({ ...formPengaturan, kabupaten: e.target.value })} />
          <Input label="Provinsi" value={formPengaturan.provinsi || ''} onChange={e => setFormPengaturan({ ...formPengaturan, provinsi: e.target.value })} />
        </FormRow>
        <FormRow>
          <Input label="Kode Pos" value={formPengaturan.kodePos || ''} onChange={e => setFormPengaturan({ ...formPengaturan, kodePos: e.target.value })} />
          <Input label="No. Telepon" value={formPengaturan.telp || ''} onChange={e => setFormPengaturan({ ...formPengaturan, telp: e.target.value })} />
        </FormRow>
        <Input label="Alamat Kantor Desa" value={formPengaturan.alamat || ''} onChange={e => setFormPengaturan({ ...formPengaturan, alamat: e.target.value })} />
        <FormRow>
          <Input label="Nama Kepala Desa" value={formPengaturan.kepalaDesa || ''} onChange={e => setFormPengaturan({ ...formPengaturan, kepalaDesa: e.target.value })} />
          <Input label="NIP" value={formPengaturan.nip || ''} onChange={e => setFormPengaturan({ ...formPengaturan, nip: e.target.value })} />
        </FormRow>
        <Input label="Sekretaris Desa" value={formPengaturan.sekretaris || ''} onChange={e => setFormPengaturan({ ...formPengaturan, sekretaris: e.target.value })} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Btn onClick={() => setShowPengaturan(false)}>Batal</Btn>
          <Btn variant="primary" onClick={() => { dispatch({ type: 'UPDATE_PENGATURAN_DESA', payload: formPengaturan }); setShowPengaturan(false); }}>
            💾 Simpan
          </Btn>
        </div>
      </Modal>
    </div>
  );
}