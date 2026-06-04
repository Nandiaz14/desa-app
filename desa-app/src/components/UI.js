import React, { useState } from 'react';

/* ─── WARNA BADGE ─── */
const BADGE_COLORS = {
  default: { bg: '#EBF3FC', color: '#1B5EA0', border: '#B5D4F4' },
  success: { bg: '#EAF3DE', color: '#2D6A0F', border: '#B8D98C' },
  danger:  { bg: '#FCEBEB', color: '#C0392B', border: '#F7C1C1' },
  warning: { bg: '#FAEEDA', color: '#A0621B', border: '#F5CE8A' },
  info:    { bg: '#EEEDFE', color: '#534AB7', border: '#C5C2F5' },
  gray:    { bg: '#F1F5F9', color: '#4A5568', border: '#CBD5E1' },
};

export function Badge({ children, type = 'default' }) {
  const c = BADGE_COLORS[type] || BADGE_COLORS.default;
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

/* ─── CARD ─── */
export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── STAT CARD ─── */
export function StatCard({ label, value, sub, color = '#1B5EA0', icon, trend }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 16, padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 13, color: '#4A5568', fontWeight: 500 }}>{label}</div>
        {icon && (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#718096' }}>{sub}</div>}
    </div>
  );
}

/* ─── MODAL ─── */
export function Modal({ show, onClose, title, children, width = 560 }) {
  if (!show) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '32px 16px', overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: width, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginBottom: 32, animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', fontSize: 18, cursor: 'pointer', color: '#4A5568', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── CONFIRM MODAL ─── */
export function ConfirmModal({ show, onClose, onConfirm, title, message, confirmLabel = 'Hapus', confirmVariant = 'danger', icon = '🗑' }) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1A2332' }}>{title}</div>
        <div style={{ fontSize: 14, color: '#718096', marginBottom: 28, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '12px', fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#4A5568', border: '1.5px solid #CBD5E1', borderRadius: 12, cursor: 'pointer' }}>
            Batal
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            style={{ flex: 1, padding: '12px', fontSize: 14, fontWeight: 700, background: confirmVariant === 'danger' ? '#C0392B' : '#1B5EA0', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SKELETON ─── */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height={13} width="60%" />
      <Skeleton height={32} width="40%" />
      <Skeleton height={12} width="50%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', display: 'flex', gap: 16 }}>
        {Array(cols).fill(0).map((_,i) => <Skeleton key={i} height={12} width={`${80/cols}%`} />)}
      </div>
      {Array(rows).fill(0).map((_,i) => (
        <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 16 }}>
          {Array(cols).fill(0).map((_,j) => <Skeleton key={j} height={12} width={`${80/cols}%`} />)}
        </div>
      ))}
    </div>
  );
}

/* ─── PAGINATION ─── */
export function Pagination({ page, total, perPage = 10, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = [];
  let start = Math.max(1, page - 2);
  let end   = Math.min(totalPages, page + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(totalPages, 5);
    else start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  const btnStyle = (active) => ({
    width: 36, height: 36, borderRadius: 8, border: active ? 'none' : '1px solid #E2E8F0',
    background: active ? '#1B5EA0' : '#fff', color: active ? '#fff' : '#4A5568',
    cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 700 : 400,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
      <div style={{ fontSize: 12, color: '#718096' }}>
        Menampilkan <strong>{Math.min((page-1)*perPage+1, total)}–{Math.min(page*perPage, total)}</strong> dari <strong>{total}</strong> data
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button style={btnStyle(false)} onClick={() => onChange(1)} disabled={page === 1}>«</button>
        <button style={btnStyle(false)} onClick={() => onChange(page-1)} disabled={page === 1}>‹</button>
        {start > 1 && <span style={{ color: '#A0AEC0', fontSize: 13 }}>...</span>}
        {pages.map(p => (
          <button key={p} style={btnStyle(p === page)} onClick={() => onChange(p)}>{p}</button>
        ))}
        {end < totalPages && <span style={{ color: '#A0AEC0', fontSize: 13 }}>...</span>}
        <button style={btnStyle(false)} onClick={() => onChange(page+1)} disabled={page === totalPages}>›</button>
        <button style={btnStyle(false)} onClick={() => onChange(totalPages)} disabled={page === totalPages}>»</button>
      </div>
    </div>
  );
}

/* ─── FORM ROW ─── */
export function FormRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>;
}

/* ─── FIELD ─── */
export function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#C0392B', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputBase = {
  width: '100%', border: '1.5px solid #CBD5E1', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, background: '#fff',
  color: '#1A2332', fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export function Input({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input style={inputBase} {...props}
        onFocus={e => { e.target.style.borderColor = '#1B5EA0'; e.target.style.boxShadow = '0 0 0 3px rgba(27,94,160,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
      />
    </Field>
  );
}

export function Select({ label, children, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <select style={{ ...inputBase, cursor: 'pointer' }} {...props}
        onFocus={e => { e.target.style.borderColor = '#1B5EA0'; e.target.style.boxShadow = '0 0 0 3px rgba(27,94,160,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
      >{children}</select>
    </Field>
  );
}

export function Textarea({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <textarea style={{ ...inputBase, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }} {...props}
        onFocus={e => { e.target.style.borderColor = '#1B5EA0'; e.target.style.boxShadow = '0 0 0 3px rgba(27,94,160,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
      />
    </Field>
  );
}

/* ─── BUTTON ─── */
const BTN_VARIANTS = {
  default: { background: '#F1F5F9', color: '#1A2332', border: '1.5px solid #CBD5E1' },
  primary: { background: 'linear-gradient(135deg,#1B5EA0,#1565C0)', color: '#fff', border: 'none' },
  danger:  { background: '#C0392B', color: '#fff', border: 'none' },
  success: { background: '#2D6A0F', color: '#fff', border: 'none' },
  ghost:   { background: '#fff', color: '#1B5EA0', border: '1.5px solid #1B5EA0' },
  warning: { background: '#A0621B', color: '#fff', border: 'none' },
  soft:    { background: '#EBF3FC', color: '#1B5EA0', border: '1.5px solid #B5D4F4' },
};

export function Btn({ children, onClick, variant = 'default', style, disabled, type = 'button', size = 'md' }) {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.default;
  const padding = size === 'sm' ? '6px 12px' : size === 'lg' ? '14px 28px' : '9px 18px';
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        ...v, borderRadius: 10, padding, fontSize, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, fontFamily: 'inherit',
        transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
        boxShadow: variant === 'primary' ? '0 2px 8px rgba(27,94,160,0.3)' : 'none',
        ...style,
      }}>
      {children}
    </button>
  );
}

/* ─── TABLE ─── */
export function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 500 }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#4A5568', borderBottom: '2px solid #E2E8F0', whiteSpace: 'nowrap', letterSpacing: 0.3 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TR({ children, onClick }) {
  return (
    <tr onClick={onClick}
      style={{ borderBottom: '1px solid #F1F5F9', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </tr>
  );
}

export function TD({ children, style }) {
  return <td style={{ padding: '12px 16px', color: '#1A2332', verticalAlign: 'middle', ...style }}>{children}</td>;
}

/* ─── ALERT ─── */
export function Alert({ type = 'info', children }) {
  const c = {
    info:    { bg: '#EBF3FC', color: '#1B5EA0', border: '#B5D4F4', icon: 'ℹ️' },
    warning: { bg: '#FAEEDA', color: '#A0621B', border: '#F5CE8A', icon: '⚠️' },
    danger:  { bg: '#FCEBEB', color: '#C0392B', border: '#F7C1C1', icon: '❌' },
    success: { bg: '#EAF3DE', color: '#2D6A0F', border: '#B8D98C', icon: '✅' },
  }[type] || {};
  return (
    <div style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span>{c.icon}</span>
      <div>{children}</div>
    </div>
  );
}

/* ─── EMPTY STATE ─── */
export function EmptyState({ icon, text, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
      <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.8 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>{text}</div>
      {sub && <div style={{ fontSize: 13, marginBottom: action ? 20 : 0 }}>{sub}</div>}
      {action && action}
    </div>
  );
}

/* ─── SECTION HEADER ─── */
export function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 4, color: '#1A2332' }}>{title}</h2>
        {sub && <p style={{ fontSize: 14, color: '#718096', margin: 0 }}>{sub}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

/* ─── TAB BAR ─── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: 24, gap: 0, overflowX: 'auto' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ padding: '12px 22px', fontSize: 14, fontWeight: active === t.id ? 700 : 500, color: active === t.id ? '#1B5EA0' : '#718096', background: 'none', border: 'none', borderBottom: active === t.id ? '3px solid #1B5EA0' : '3px solid transparent', marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8 }}>
          {t.label}
          {t.badge ? (
            <span style={{ background: '#C0392B', color: '#fff', borderRadius: 12, fontSize: 11, padding: '2px 7px', fontWeight: 700 }}>{t.badge}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ─── DIVIDER ─── */
export function Divider() {
  return <div style={{ height: 1, background: '#E2E8F0', margin: '16px 0' }} />;
}

/* ─── SEARCH BAR ─── */
export function SearchBar({ value, onChange, placeholder, onClear }) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#A0AEC0' }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Cari...'}
        style={{ width: '100%', border: '1.5px solid #CBD5E1', borderRadius: 10, padding: '11px 40px 11px 44px', fontSize: 14, fontFamily: 'inherit', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = '#1B5EA0'}
        onBlur={e => e.target.style.borderColor = '#CBD5E1'}
      />
      {value && (
        <button onClick={() => onClear ? onClear() : onChange('')}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#E2E8F0', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 13, color: '#4A5568', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ×
        </button>
      )}
    </div>
  );
}

/* ─── STAT ROW (mini stats) ─── */
export function StatRow({ items }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '6px 14px', background: item.bg || '#F8FAFC', borderRadius: 20, border: `1px solid ${item.border || '#E2E8F0'}`, fontSize: 12, fontWeight: 600, color: item.color || '#4A5568', display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}: <strong>{item.value}</strong></span>
        </div>
      ))}
    </div>
  );
}