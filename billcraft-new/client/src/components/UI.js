import { useState, useEffect } from 'react';

// ── Design Tokens ─────────────────────────────────────────────────────────────
export const C = {
  indigo:   '#6366F1', indigoL: '#EEF0FB',
  pink:     '#EC4899', pinkL:   '#FDF2F8',
  green:    '#059669', greenL:  '#ECFDF5',
  amber:    '#D97706', amberL:  '#FFFBEB',
  red:      '#F43F5E', redL:    '#FFF1F2',
  blue:     '#0EA5E9', blueL:   '#E0F7FF',
  purple:   '#8B5CF6', purpleL: '#F3F0FF',
  dark:     '#1E2235',
  gray:     '#64748B',
  light:    '#A0AEC0',
  border:   '#E8ECF8',
  bg:       '#F4F6FD',
  white:    '#FFFFFF',
};

export const GLOBAL_STYLES = `
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
  @keyframes floatBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  .page-enter { animation: fadeUp .35s cubic-bezier(.22,1,.36,1) both; }
  .card:hover { transform:translateY(-4px); box-shadow:0 18px 42px rgba(99,102,241,.13)!important; }
  .nav-item:hover { background:linear-gradient(90deg,#EEF0FB,#F3F0FF)!important; color:#6366F1!important; transform:translateX(3px); }
  .btn-p:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(99,102,241,.38)!important; }
  .row-h:hover { background:#F7F8FF!important; }
  .sug:hover  { background:#EEF0FB!important; cursor:pointer; }
  .tag-btn:hover { background:#6366F1!important; color:#fff!important; }
  .icon-bob { animation: floatBob 3.2s ease-in-out infinite; }
`;

// ── GradText ──────────────────────────────────────────────────────────────────
export function GradText({ children, from = C.indigo, to = C.pink, style = {} }) {
  return (
    <span style={{
      background: `linear-gradient(135deg,${from},${to})`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      backgroundClip: 'text', display: 'inline', ...style,
    }}>{children}</span>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, bg = C.indigoL, color = C.indigo }) {
  return (
    <span style={{ fontSize: 10.5, padding: '3px 10px', borderRadius: 20, fontWeight: 700, background: bg, color }}>
      {label}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = C.indigo }) {
  return (
    <div style={{ width: size, height: size, border: `2.5px solid ${color}33`, borderTop: `2.5px solid ${color}`, borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
  );
}

// ── AnimatedCounter ───────────────────────────────────────────────────────────
export function AnimatedCounter({ target, prefix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0; const step = target / 45;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 25);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{val.toLocaleString('en-IN')}</>;
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = 'text', placeholder, required, style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ fontSize: 10.5, color: C.light, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: 7, fontWeight: 700 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '11px 15px', background: '#F8FAFF', border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.dark, fontSize: 13, outline: 'none', transition: 'border-color .2s, box-shadow .2s', fontFamily: 'inherit' }}
        onFocus={e => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 4px rgba(129,140,248,.18)'; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options = [], style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ fontSize: 10.5, color: C.light, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: 7, fontWeight: 700 }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ width: '100%', padding: '11px 15px', background: '#F8FAFF', border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.dark, fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, loading = false, style = {} }) {
  const styles = {
    primary: { background: `linear-gradient(135deg,${C.indigo},${C.pink})`, color: '#fff', boxShadow: `0 4px 16px rgba(99,102,241,.28)` },
    ghost:   { background: C.indigoL, color: C.indigo, border: `1.5px solid ${C.border}` },
    danger:  { background: C.redL, color: C.red, border: `1.5px solid #FCA5A5` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className="btn-p"
      style={{ padding: '11px 22px', borderRadius: 11, border: 'none', fontWeight: 700, fontSize: 13, cursor: disabled || loading ? 'not-allowed' : 'pointer', transition: 'all .2s', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: disabled ? 0.6 : 1, fontFamily: 'inherit', ...styles[variant], ...style }}>
      {loading && <Spinner size={14} color={variant === 'primary' ? '#fff' : C.indigo} />}
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hover = true }) {
  return (
    <div className={hover ? 'card' : ''} style={{ background: C.white, borderRadius: 18, padding: '22px', boxShadow: '0 2px 14px rgba(99,102,241,.08)', border: `1px solid ${C.border}`, transition: 'all .25s', ...style }}>
      {children}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: type === 'success' ? C.greenL : C.redL,
      color: type === 'success' ? C.green : C.red,
      border: `1.5px solid ${type === 'success' ? '#A7F3D0' : '#FCA5A5'}`,
      borderRadius: 12, padding: '12px 20px', fontWeight: 600, fontSize: 13,
      boxShadow: '0 8px 24px rgba(0,0,0,.1)', animation: 'scaleIn .2s ease',
      display: 'flex', alignItems: 'center', gap: 8, maxWidth: 340,
    }}>
      {type === 'success' ? '✅' : '❌'} {message}
      <span onClick={onClose} style={{ marginLeft: 'auto', cursor: 'pointer', opacity: .6 }}>✕</span>
    </div>
  );
}
