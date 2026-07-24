import { useState, useEffect, useCallback } from 'react';
import { C, GradText, Badge, Spinner, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ── Mini helpers ──────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtRs = (n) => '₹' + fmt(n);

function StatCard({ icon, label, value, sub, color = C.indigo, trend }) {
  return (
    <div style={{
      background: 'white', borderRadius: 18, padding: '22px 24px',
      boxShadow: '0 2px 16px rgba(0,0,0,.06)', border: `1.5px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{icon}</div>
        {trend && <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenL, padding: '3px 8px', borderRadius: 20 }}>{trend}</span>}
      </div>
      <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 28, fontWeight: 800, color: C.dark, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.gray, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.light }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 20, fontWeight: 800, color: C.dark, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <GradText>{title}</GradText>
      </div>
      {subtitle && <div style={{ fontSize: 13, color: C.gray, marginTop: 4, marginLeft: 32 }}>{subtitle}</div>}
    </div>
  );
}

function AdminBtn({ children, onClick, color = C.indigo, outline, danger, small }) {
  const bg = danger ? C.red : color;
  return (
    <button onClick={onClick} style={{
      padding: small ? '5px 12px' : '8px 16px',
      fontSize: small ? 11 : 12.5,
      fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: 'none',
      background: outline ? 'transparent' : bg,
      color: outline ? bg : 'white',
      outline: outline ? `1.5px solid ${bg}` : 'none',
      transition: 'all .15s',
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '28px 30px',
        width: wide ? 640 : 480, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,.2)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 18, fontWeight: 800, color: C.dark }}>{title}</div>
          <button onClick={onClose} style={{ background: C.bg, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: C.gray }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text', placeholder, required, rows }) {
  const style = {
    width: '100%', padding: '10px 13px', fontSize: 13, borderRadius: 10,
    border: `1.5px solid ${C.border}`, color: C.dark, outline: 'none',
    fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 5 }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>
      {rows
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...style, resize: 'vertical' }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      }
    </div>
  );
}

// ── DASHBOARD TAB ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter">
      <SectionHeader icon="📊" title="Admin Dashboard" subtitle="Platform overview and key metrics" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Users" value={fmt(stats?.totalUsers)} color={C.indigo} />
        <StatCard icon="🗂️" label="Formats Listed" value={fmt(stats?.totalFormats)} color={C.purple} />
        <StatCard icon="🛒" label="Total Sales" value={fmt(stats?.totalSales)} color={C.green} />
        <StatCard icon="💰" label="Total Revenue" value={fmtRs(stats?.totalRevenue)} color={C.amber} />
        <StatCard icon="📄" label="Bills Generated" value={fmt(stats?.totalBills)} color={C.pink} />
      </div>

      {/* Monthly Chart */}
      <div style={{ background: 'white', borderRadius: 18, padding: '24px 26px', border: `1.5px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,.06)', marginBottom: 24 }}>
        <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 15, color: C.dark, marginBottom: 20 }}>📈 Monthly Sales Performance</div>
        {stats?.monthlyStats?.length ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {stats.monthlyStats.map((m, i) => {
              const maxRev = Math.max(...stats.monthlyStats.map(x => x.revenue), 1);
              const h = Math.max((m.revenue / maxRev) * 120, 8);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.indigo }}>{fmtRs(m.revenue)}</div>
                  <div style={{
                    width: '100%', height: h, borderRadius: '6px 6px 0 0',
                    background: `linear-gradient(180deg,${C.indigo},${C.purple})`,
                    transition: 'height .5s ease',
                  }} title={`${m.sales} sales`} />
                  <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: C.light, padding: 40, fontSize: 14 }}>No monthly data yet</div>
        )}
      </div>

      {/* Quick overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: `linear-gradient(135deg,${C.indigo},${C.purple})`, borderRadius: 18, padding: '22px 24px', color: 'white' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 15, marginBottom: 8 }}>🚀 Platform Health</div>
          <div style={{ fontSize: 13, opacity: .85, lineHeight: 1.8 }}>
            ✅ All systems operational<br />
            📦 {fmt(stats?.totalFormats)} formats in marketplace<br />
            💳 {fmt(stats?.totalSales)} successful transactions
          </div>
        </div>
        <div style={{ background: `linear-gradient(135deg,${C.pink},${C.amber})`, borderRadius: 18, padding: '22px 24px', color: 'white' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 15, marginBottom: 8 }}>💡 Commission Model</div>
          <div style={{ fontSize: 13, opacity: .85, lineHeight: 1.8 }}>
            📐 Agent earns: 60% per sale<br />
            🏦 Platform earns: 40% per sale<br />
            💰 Total revenue: {fmtRs(stats?.totalRevenue)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // {type:'reset'|'delete'|'role', user}
  const [resetPwd, setResetPwd] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const toggleBlock = async (u) => {
    try {
      const r = await api.patch(`/admin/users/${u.id}/block`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_blocked: r.data.is_blocked } : x));
      showToast(`${u.name} ${r.data.is_blocked ? 'blocked' : 'unblocked'}`);
    } catch { showToast('Action failed', 'error'); }
  };

  const deleteUser = async () => {
    try {
      await api.delete(`/admin/users/${modal.user.id}`);
      setUsers(prev => prev.filter(x => x.id !== modal.user.id));
      showToast('User deleted');
      setModal(null);
    } catch { showToast('Delete failed', 'error'); }
  };

  const resetPassword = async () => {
    try {
      await api.post(`/admin/users/${modal.user.id}/reset-password`, { password: resetPwd });
      showToast('Password reset successfully');
      setModal(null); setResetPwd('');
    } catch { showToast('Reset failed', 'error'); }
  };

  const changeRole = async (u, role) => {
    try {
      const r = await api.patch(`/admin/users/${u.id}/role`, { role });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: r.data.role } : x));
      showToast(`${u.name} role changed to ${role}`);
    } catch { showToast('Role change failed', 'error'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <SectionHeader icon="👥" title="User Management" subtitle={`${users.length} registered users`} />

      <div style={{ background: 'white', borderRadius: 18, border: `1.5px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search users…"
            style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.dark, outline: 'none' }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['User', 'Email', 'Role', 'Bills', 'Formats', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10.5, color: C.light, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="row-h" style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${C.indigo},${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800 }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: C.dark }}>{u.name}</div>
                      {u.business_name && <div style={{ fontSize: 11, color: C.light }}>{u.business_name}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 16px', color: C.gray }}>{u.email}</td>
                <td style={{ padding: '13px 16px' }}>
                  <select value={u.role} onChange={e => changeRole(u, e.target.value)}
                    style={{ fontSize: 11, fontWeight: 700, borderRadius: 8, border: `1.5px solid ${C.border}`, padding: '4px 8px', background: 'white', color: u.role === 'agent' ? C.purple : C.indigo, cursor: 'pointer' }}>
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                  </select>
                </td>
                <td style={{ padding: '13px 16px', color: C.gray, textAlign: 'center' }}>{u.bill_count}</td>
                <td style={{ padding: '13px 16px', color: C.gray, textAlign: 'center' }}>{u.formats_owned}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: u.is_blocked ? C.redL : C.greenL, color: u.is_blocked ? C.red : C.green }}>
                    {u.is_blocked ? '🚫 Blocked' : '✅ Active'}
                  </span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <AdminBtn small onClick={() => toggleBlock(u)} color={u.is_blocked ? C.green : C.amber}>
                      {u.is_blocked ? 'Unblock' : 'Block'}
                    </AdminBtn>
                    <AdminBtn small onClick={() => { setModal({ type: 'reset', user: u }); setResetPwd(''); }}>Reset Pwd</AdminBtn>
                    <AdminBtn small danger onClick={() => setModal({ type: 'delete', user: u })}>Delete</AdminBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <div style={{ padding: 40, textAlign: 'center', color: C.light }}>No users found</div>}
      </div>

      {/* Modals */}
      {modal?.type === 'delete' && (
        <Modal title="⚠️ Delete User" onClose={() => setModal(null)}>
          <p style={{ color: C.gray, marginBottom: 20 }}>Are you sure you want to permanently delete <strong>{modal.user.name}</strong>? This will remove all their bills and data.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <AdminBtn danger onClick={deleteUser}>Yes, Delete</AdminBtn>
            <AdminBtn outline onClick={() => setModal(null)}>Cancel</AdminBtn>
          </div>
        </Modal>
      )}
      {modal?.type === 'reset' && (
        <Modal title="🔑 Reset Password" onClose={() => setModal(null)}>
          <FieldInput label="New Password" value={resetPwd} onChange={setResetPwd} type="password" placeholder="Enter new password (min 6 chars)" required />
          <div style={{ display: 'flex', gap: 10 }}>
            <AdminBtn onClick={resetPassword}>Reset Password</AdminBtn>
            <AdminBtn outline onClick={() => setModal(null)}>Cancel</AdminBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FORMATS TAB ───────────────────────────────────────────────────────────────
function FormatsTab() {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // null | 'create' | {edit: fmt} | {delete: fmt}
  const [form, setForm] = useState({ name:'', accent:'', description:'', price:'', icon:'🧾', tag:'Standard', color:'#6366F1', color2:'#818CF8', template_html:'', status:'active' });

  const load = useCallback(() => {
    api.get('/admin/formats').then(r => setFormats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const openCreate = () => {
    setForm({ name:'', accent:'', description:'', price:'', icon:'🧾', tag:'Standard', color:'#6366F1', color2:'#818CF8', template_html:'', status:'active' });
    setModal('create');
  };

  const openEdit = (fmt) => {
    setForm({ ...fmt });
    setModal({ edit: fmt });
  };

  const saveFormat = async () => {
    if (!form.name || !form.price) return showToast('Name and price required', 'error');
    try {
      if (modal === 'create') {
        const r = await api.post('/admin/formats', form);
        setFormats(prev => [r.data, ...prev]);
        showToast(`"${r.data.name}" created!`);
      } else {
        const r = await api.put(`/admin/formats/${form.id}`, form);
        setFormats(prev => prev.map(x => x.id === form.id ? r.data : x));
        showToast('Format updated');
      }
      setModal(null);
    } catch { showToast('Save failed', 'error'); }
  };

  const toggleFeatured = async (fmt) => {
    try {
      const r = await api.patch(`/admin/formats/${fmt.id}/featured`);
      setFormats(prev => prev.map(x => x.id === fmt.id ? r.data : x));
      showToast(r.data.is_featured ? `"${fmt.name}" set as Featured` : `"${fmt.name}" unfeatured`);
    } catch { showToast('Update failed', 'error'); }
  };

  const toggleStatus = async (fmt) => {
    const newStatus = fmt.status === 'active' ? 'inactive' : 'active';
    try {
      const r = await api.patch(`/admin/formats/${fmt.id}/status`, { status: newStatus });
      setFormats(prev => prev.map(x => x.id === fmt.id ? r.data : x));
      showToast(`Format ${newStatus}`);
    } catch { showToast('Update failed', 'error'); }
  };

  const deleteFormat = async (fmt) => {
    try {
      await api.delete(`/admin/formats/${fmt.id}`);
      setFormats(prev => prev.filter(x => x.id !== fmt.id));
      showToast('Format deleted');
      setModal(null);
    } catch { showToast('Delete failed', 'error'); }
  };

  const ICONS = ['🧾','🛍️','💊','🍽️','📋','🏪','🏥','🚗','📦','💻','🏠','✂️','📱','🎓'];
  const TAGS = ['Standard','Popular','Premium','Hot','New','Basic','Featured'];

  const FormFields = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FieldInput label="Format Name" value={form.name} onChange={v => setForm(p=>({...p,name:v}))} placeholder="e.g. GST Invoice" required />
        <FieldInput label="Accent / Subtitle" value={form.accent} onChange={v => setForm(p=>({...p,accent:v}))} placeholder="e.g. Tax Invoice" />
      </div>
      <FieldInput label="Description" value={form.description} onChange={v => setForm(p=>({...p,description:v}))} rows={2} placeholder="Brief description…" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <FieldInput label="Price (₹)" value={form.price} onChange={v => setForm(p=>({...p,price:v}))} type="number" placeholder="0" required />
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 5 }}>Icon</label>
          <select value={form.icon} onChange={e => setForm(p=>({...p,icon:e.target.value}))}
            style={{ width: '100%', padding: '10px 13px', fontSize: 18, borderRadius: 10, border: `1.5px solid ${C.border}`, outline: 'none' }}>
            {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 5 }}>Tag</label>
          <select value={form.tag} onChange={e => setForm(p=>({...p,tag:e.target.value}))}
            style={{ width: '100%', padding: '10px 13px', fontSize: 13, borderRadius: 10, border: `1.5px solid ${C.border}`, outline: 'none' }}>
            {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 5 }}>Primary Color</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={form.color} onChange={e => setForm(p=>({...p,color:e.target.value}))} style={{ width: 42, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
            <span style={{ fontSize: 12, color: C.gray }}>{form.color}</span>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 5 }}>Secondary Color</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={form.color2} onChange={e => setForm(p=>({...p,color2:e.target.value}))} style={{ width: 42, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
            <span style={{ fontSize: 12, color: C.gray }}>{form.color2}</span>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 5 }}>Status</label>
          <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}
            style={{ width: '100%', padding: '10px 13px', fontSize: 13, borderRadius: 10, border: `1.5px solid ${C.border}`, outline: 'none' }}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, display: 'block', marginBottom: 5 }}>Preview (color gradient)</label>
        <div style={{ height: 50, borderRadius: 12, background: `linear-gradient(135deg,${form.color},${form.color2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{form.icon}</div>
      </div>
      <FieldInput label="HTML Template (optional)" value={form.template_html} onChange={v => setForm(p=>({...p,template_html:v}))} rows={3} placeholder="Paste HTML template code here…" />
    </>
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <SectionHeader icon="🗂️" title="Format Management" subtitle={`${formats.length} formats · ${formats.filter(f=>f.is_featured).length} featured`} />
        <button onClick={openCreate} style={{
          background: `linear-gradient(135deg,${C.indigo},${C.purple})`, color: 'white',
          border: 'none', borderRadius: 12, padding: '11px 20px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: `0 6px 20px ${C.indigo}44`,
        }}>➕ Add New Format</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {formats.map(fmt => (
          <div key={fmt.id} style={{
            background: 'white', borderRadius: 18, overflow: 'hidden',
            border: `1.5px solid ${fmt.is_featured ? fmt.color + '55' : C.border}`,
            boxShadow: fmt.is_featured ? `0 4px 24px ${fmt.color}22` : '0 2px 12px rgba(0,0,0,.05)',
          }}>
            {/* Card header */}
            <div style={{ height: 60, background: `linear-gradient(135deg,${fmt.color},${fmt.color2})`, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{fmt.icon}</span>
              <div>
                <div style={{ color: 'white', fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 14 }}>{fmt.name} {fmt.accent}</div>
                <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11 }}>₹{fmt.price}</div>
              </div>
              {fmt.is_featured && <div style={{ marginLeft: 'auto', fontSize: 18 }} title="Featured">⭐</div>}
              <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: fmt.status === 'active' ? 'rgba(5,150,105,.2)' : fmt.status === 'inactive' ? 'rgba(244,63,94,.2)' : 'rgba(217,119,6,.2)',
                color: fmt.status === 'active' ? '#059669' : fmt.status === 'inactive' ? C.red : C.amber,
              }}>{fmt.status}</div>
            </div>

            <div style={{ padding: '14px 18px' }}>
              <div style={{ fontSize: 12, color: C.gray, marginBottom: 10, minHeight: 32 }}>{fmt.description}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: `${fmt.color}15`, color: fmt.color }}>{fmt.tag}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: C.greenL, color: C.green }}>{fmt.sales_count || 0} sold</span>
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <AdminBtn small onClick={() => openEdit(fmt)}>✏️ Edit</AdminBtn>
                <AdminBtn small color={fmt.is_featured ? C.amber : C.green} onClick={() => toggleFeatured(fmt)}>
                  {fmt.is_featured ? '⭐ Unfeature' : '☆ Feature'}
                </AdminBtn>
                <AdminBtn small color={fmt.status === 'active' ? C.amber : C.green} onClick={() => toggleStatus(fmt)}>
                  {fmt.status === 'active' ? '⏸ Disable' : '▶ Enable'}
                </AdminBtn>
                <AdminBtn small danger onClick={() => setModal({ delete: fmt })}>🗑</AdminBtn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal?.edit) && (
        <Modal title={modal === 'create' ? '➕ Create New Format' : `✏️ Edit: ${modal.edit.name}`} onClose={() => setModal(null)} wide>
          <FormFields />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={saveFormat} style={{
              background: `linear-gradient(135deg,${C.indigo},${C.purple})`, color: 'white',
              border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer',
            }}>
              {modal === 'create' ? '✅ Create Format' : '💾 Save Changes'}
            </button>
            <AdminBtn outline onClick={() => setModal(null)}>Cancel</AdminBtn>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {modal?.delete && (
        <Modal title="🗑️ Delete Format" onClose={() => setModal(null)}>
          <p style={{ color: C.gray, marginBottom: 20 }}>Delete <strong>{modal.delete.name}</strong>? Users who purchased it will lose access.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <AdminBtn danger onClick={() => deleteFormat(modal.delete)}>Delete</AdminBtn>
            <AdminBtn outline onClick={() => setModal(null)}>Cancel</AdminBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PAYMENTS TAB ──────────────────────────────────────────────────────────────
function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments').then(r => setPayments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((a, p) => a + Number(p.price), 0);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter">
      <SectionHeader icon="💳" title="Payment Management" subtitle={`${payments.length} transactions · Total: ${fmtRs(total)}`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon="💰" label="Total Revenue" value={fmtRs(total)} color={C.green} />
        <StatCard icon="🛒" label="Total Transactions" value={fmt(payments.length)} color={C.indigo} />
        <StatCard icon="📊" label="Avg. Transaction" value={fmtRs(payments.length ? total / payments.length : 0)} color={C.amber} />
      </div>

      <div style={{ background: 'white', borderRadius: 18, border: `1.5px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['User', 'Format', 'Amount', 'Payment ID', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10.5, color: C.light, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="row-h" style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontWeight: 700, color: C.dark }}>{p.user_name}</div>
                  <div style={{ fontSize: 11, color: C.light }}>{p.user_email}</div>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontWeight: 600, color: C.dark }}>{p.format_name} {p.accent}</div>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 15, color: C.green }}>{fmtRs(p.price)}</span>
                </td>
                <td style={{ padding: '13px 16px', color: C.gray, fontFamily: 'monospace', fontSize: 11 }}>{p.payment_id}</td>
                <td style={{ padding: '13px 16px', color: C.gray, fontSize: 12 }}>{new Date(p.purchase_date).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!payments.length && <div style={{ padding: 40, textAlign: 'center', color: C.light }}>No transactions yet</div>}
      </div>
    </div>
  );
}

// ── BILLS TAB ─────────────────────────────────────────────────────────────────
function BillsTab() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/bills').then(r => setBills(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>;

  const totalAmt = bills.reduce((a, b) => a + Number(b.total_amount), 0);
  const paid = bills.filter(b => b.status === 'Paid').length;

  return (
    <div className="page-enter">
      <SectionHeader icon="📄" title="Bill Monitoring" subtitle="All bills generated across the platform" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon="📄" label="Total Bills" value={fmt(bills.length)} color={C.indigo} />
        <StatCard icon="✅" label="Paid Bills" value={fmt(paid)} color={C.green} />
        <StatCard icon="⏳" label="Pending/Draft" value={fmt(bills.length - paid)} color={C.amber} />
        <StatCard icon="💰" label="Total Value" value={fmtRs(totalAmt)} color={C.purple} />
      </div>

      <div style={{ background: 'white', borderRadius: 18, border: `1.5px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['Invoice', 'User', 'Customer', 'Format', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10.5, color: C.light, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.map(b => {
              const sc = { Paid: [C.green, C.greenL], Pending: [C.amber, C.amberL], Draft: [C.gray, C.bg] };
              const [col, bg] = sc[b.status] || [C.gray, C.bg];
              return (
                <tr key={b.id} className="row-h" style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '13px 16px', fontFamily: 'monospace', fontSize: 12, color: C.indigo, fontWeight: 700 }}>{b.invoice_no}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontWeight: 700, color: C.dark }}>{b.user_name}</div>
                    <div style={{ fontSize: 11, color: C.light }}>{b.user_email}</div>
                  </td>
                  <td style={{ padding: '13px 16px', color: C.gray }}>{b.customer_name}</td>
                  <td style={{ padding: '13px 16px', color: C.gray }}>{b.format_name || '—'}</td>
                  <td style={{ padding: '13px 16px', fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, color: C.dark }}>{fmtRs(b.total_amount)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: bg, color: col }}>{b.status}</span>
                  </td>
                  <td style={{ padding: '13px 16px', color: C.gray, fontSize: 12 }}>{new Date(b.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!bills.length && <div style={{ padding: 40, textAlign: 'center', color: C.light }}>No bills yet</div>}
      </div>
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>;

  const maxSales = Math.max(...(data?.topFormats || []).map(f => f.sales), 1);

  return (
    <div className="page-enter">
      <SectionHeader icon="📈" title="Analytics & Reports" subtitle="Deep insights into platform performance" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Top Formats */}
        <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: `1.5px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 15, color: C.dark, marginBottom: 18 }}>🏆 Top Selling Formats</div>
          {data?.topFormats?.map((f, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>{f.name} {f.accent}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.sales} sales</span>
              </div>
              <div style={{ height: 6, background: C.bg, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(f.sales / maxSales) * 100}%`, background: `linear-gradient(90deg,${f.color},${f.color}88)`, borderRadius: 4, transition: 'width .5s ease' }} />
              </div>
            </div>
          ))}
          {!data?.topFormats?.length && <div style={{ color: C.light, textAlign: 'center', padding: 20 }}>No data yet</div>}
        </div>

        {/* Top Users */}
        <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: `1.5px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 15, color: C.dark, marginBottom: 18 }}>👑 Most Active Users</div>
          {data?.topUsers?.map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < data.topUsers.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${C.indigo},${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>{u.name}</div>
                <div style={{ fontSize: 11, color: C.light }}>{u.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: C.indigo }}>{u.bill_count} bills</div>
                <div style={{ fontSize: 11, color: C.green }}>{fmtRs(u.total_amount)}</div>
              </div>
            </div>
          ))}
          {!data?.topUsers?.length && <div style={{ color: C.light, textAlign: 'center', padding: 20 }}>No data yet</div>}
        </div>
      </div>

      {/* Monthly bills chart */}
      <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: `1.5px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
        <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: 15, color: C.dark, marginBottom: 20 }}>📊 Monthly Billing Activity</div>
        {data?.monthlyBills?.length ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 130 }}>
            {data.monthlyBills.map((m, i) => {
              const maxC = Math.max(...data.monthlyBills.map(x => x.count), 1);
              const h = Math.max((m.count / maxC) * 110, 8);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.pink }}>{m.count}</div>
                  <div style={{ width: '100%', height: h, borderRadius: '6px 6px 0 0', background: `linear-gradient(180deg,${C.pink},${C.amber})` }} />
                  <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: C.light, padding: 40 }}>No billing activity in last 6 months</div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ADMIN PANEL ──────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'users',     icon: '👥', label: 'Users' },
  { id: 'formats',   icon: '🗂️', label: 'Formats' },
  { id: 'payments',  icon: '💳', label: 'Payments' },
  { id: 'bills',     icon: '📄', label: 'Bills' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: C.gray }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <h2 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 22, fontWeight: 800, color: C.red, marginBottom: 8 }}>Access Denied</h2>
        <p style={{ fontSize: 14 }}>Administrator privileges are required to view the admin panel.</p>
      </div>
    );
  }

  const tabContent = {
    dashboard: <DashboardTab />,
    users:     <UsersTab />,
    formats:   <FormatsTab />,
    payments:  <PaymentsTab />,
    bills:     <BillsTab />,
    analytics: <AnalyticsTab />,
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, margin: '-26px -30px', overflow: 'hidden' }}>
      {/* Admin Sub-Sidebar */}
      <div style={{
        width: 200, background: 'linear-gradient(180deg,#1E2235 0%,#2D3150 100%)',
        display: 'flex', flexDirection: 'column', padding: '24px 12px', flexShrink: 0,
      }}>
        <div style={{ marginBottom: 22, padding: '0 8px' }}>
          <div style={{ fontSize: 9, color: '#8B9CC8', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Admin Control Panel</div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.1)' }} />
        </div>
        {ADMIN_TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: active ? 'linear-gradient(135deg,rgba(99,102,241,.35),rgba(139,92,246,.25))' : 'transparent',
              border: active ? '1px solid rgba(99,102,241,.4)' : '1px solid transparent',
              borderRadius: 11, padding: '10px 12px', cursor: 'pointer', marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', width: '100%',
              color: active ? '#A5B4FC' : '#64748B', fontWeight: active ? 700 : 500, fontSize: 13,
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 10, color: '#4B5563', lineHeight: 1.6 }}>
            <div style={{ color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>⚡ BillCraft Admin</div>
            Full platform control
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '26px 30px', background: C.bg }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
