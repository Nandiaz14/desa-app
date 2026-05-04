import React from 'react';

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
export function StatCard({ label, value, sub, color = '#1B5EA0', icon }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0',
      borderRadius: 16, padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 13, color: '#4A5568', fontWeight: 500 }}>{label}</div>
        {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
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
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 1000, padding: '32px 16px', overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: width,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginBottom: 32,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #E2E8F0',
        }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{
            border: 'none', background: '#F1F5F9', fontSize: 18, cursor: 'pointer',
            color: '#4A5568', width: 32, height: 32, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
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
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: '#4A5568', marginBottom: 6,
      }}>
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
  transition: 'border-color 0.2s',
};

export function Input({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input style={inputBase} {...props} />
    </Field>
  );
}

export function Select({ label, children, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <select style={{ ...inputBase, cursor: 'pointer' }} {...props}>{children}</select>
    </Field>
  );
}

export function Textarea({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <textarea style={{ ...inputBase, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }} {...props} />
    </Field>
  );
}

/* ─── BUTTON ─── */
const BTN_VARIANTS = {
  default: { background: '#F1F5F9', color: '#1A2332', border: '1.5px solid #CBD5E1' },
  primary: { background: '#1B5EA0', color: '#fff', border: 'none' },
  danger:  { background: '#C0392B', color: '#fff', border: 'none' },
  success: { background: '#2D6A0F', color: '#fff', border: 'none' },
  ghost:   { background: '#fff', color: '#1B5EA0', border: '1.5px solid #1B5EA0' },
  warning: { background: '#A0621B', color: '#fff', border: 'none' },
  soft:    { background: '#EBF3FC', color: '#1B5EA0', border: '1.5px solid #B5D4F4' },
};

export function Btn({ children, onClick, variant = 'default', style, disabled, type = 'button', size = 'md' }) {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.default;
  const padding = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '9px 18px';
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        ...v, borderRadius: 10, padding, fontSize, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
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
              <th key={i} style={{
                textAlign: 'left', padding: '12px 16px', fontSize: 12,
                fontWeight: 700, color: '#4A5568', borderBottom: '2px solid #E2E8F0',
                whiteSpace: 'nowrap', letterSpacing: 0.3,
              }}>{h}</th>
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
    <div style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: '12px 16px', fontSize: 13,
      marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start',
    }}>
      <span>{c.icon}</span>
      <div>{children}</div>
    </div>
  );
}

/* ─── EMPTY STATE ─── */
export function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>{text}</div>
      {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
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
    <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: 24, gap: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            padding: '12px 22px', fontSize: 14, fontWeight: active === t.id ? 700 : 500,
            color: active === t.id ? '#1B5EA0' : '#718096',
            background: 'none', border: 'none',
            borderBottom: active === t.id ? '3px solid #1B5EA0' : '3px solid transparent',
            marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8,
          }}>
          {t.label}
          {t.badge ? (
            <span style={{
              background: '#C0392B', color: '#fff', borderRadius: 12,
              fontSize: 11, padding: '2px 7px', fontWeight: 700,
            }}>{t.badge}</span>
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