import { useState, useEffect } from 'react';
import { C, Badge, Card, Spinner, Toast } from '../components/UI';
import api from '../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryPage() {
  const [bills,   setBills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');
  const [toast,   setToast]   = useState(null);
  const [performance, setPerformance] = useState({ sales: [], demand: [] });

  const fetchBills = (status) => {
    setLoading(true);
    api.get(`/bills${status!=='All'?`?status=${status}`:''}`)
      .then(r => setBills(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  const fetchPerformance = () => {
    api.get('/bills/performance')
      .then(r => setPerformance(r.data)).catch(console.error);
  };

  useEffect(() => { 
    fetchBills(filter); 
    fetchPerformance();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bills/${id}/status`, { status });
      fetchBills(filter);
      setToast({ msg: `Bill marked as ${status}`, type:'success' });
    } catch { setToast({ msg:'Update failed', type:'error' }); }
  };

  const deleteBill = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try { await api.delete(`/bills/${id}`); fetchBills(filter); setToast({ msg:'Bill deleted', type:'success' }); }
    catch { setToast({ msg:'Delete failed', type:'error' }); }
  };

  const ss = (status) => ({Paid:{bg:C.greenL,c:C.green},Pending:{bg:C.amberL,c:C.amber},Draft:{bg:C.indigoL,c:C.light}}[status]||{bg:C.indigoL,c:C.light});

  const handlePrint = async (id) => {
    try {
      const { data } = await api.get(`/bills/${id}/pdf`, { responseType: 'text' });
      const blob = new Blob([data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch { setToast({ msg: 'Failed to generate PDF', type: 'error' }); }
  };

  return (
    <div className="page-enter">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <Card style={{ overflow:'hidden',padding:0 }}>
        {/* Header */}
        <div style={{ padding:'20px 26px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:16 }}>
            <span style={{ color:C.indigo }}>Invoice</span>{' '}<span style={{ color:C.pink }}>History</span>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            {['All','Paid','Pending','Draft'].map(f => (
              <button key={f} className="tag-btn" onClick={() => setFilter(f)} style={{
                fontSize:12,padding:'6px 14px',borderRadius:20,cursor:'pointer',border:'none',transition:'all .18s',fontFamily:'inherit',fontWeight:filter===f?700:500,
                background:filter===f?`linear-gradient(135deg,${C.indigo},${C.pink})`:'#F3F5FF',
                color:filter===f?'white':'#8090A8',
              }}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex',justifyContent:'center',padding:50 }}><Spinner size={32} /></div>
        ) : bills.length === 0 ? (
          <div style={{ textAlign:'center',padding:'60px',color:C.light }}>
            <div style={{ fontSize:40,marginBottom:12 }}>📭</div>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:16,fontWeight:700,color:C.dark,marginBottom:4 }}>No bills found</div>
            <div style={{ fontSize:13 }}>No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}bills yet</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',minWidth:640 }}>
              <thead>
                <tr style={{ background:'#FAFBFF' }}>
                  {['Invoice','Customer','Amount','Date','Status','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left',padding:'12px 22px',fontSize:10.5,color:'#C0C8E0',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bills.map((b,i) => {
                  const s = ss(b.status);
                  return (
                    <tr key={i} className="row-h" style={{ borderTop:`1px solid #F3F5FF`,transition:'all .12s' }}>
                      <td style={{ padding:'13px 22px',fontSize:13,fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,color:C.indigo }}>{b.invoice_no}</td>
                      <td style={{ padding:'13px 22px',fontSize:13,fontWeight:500 }}>{b.customer_name}</td>
                      <td style={{ padding:'13px 22px',fontSize:13,fontWeight:700 }}>₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                      <td style={{ padding:'13px 22px',fontSize:12,color:C.light }}>{new Date(b.created_at).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding:'13px 22px' }}><Badge label={b.status} bg={s.bg} color={s.c} /></td>
                      <td style={{ padding:'13px 22px' }}>
                        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                          <span onClick={() => handlePrint(b.id)} style={{ fontSize:12,color:C.indigo,fontWeight:700,cursor:'pointer' }}>🖨️ PDF</span>
                          {b.status !== 'Paid' && <span onClick={() => updateStatus(b.id,'Paid')} style={{ fontSize:12,color:C.green,fontWeight:700,cursor:'pointer' }}>✅ Paid</span>}
                          {b.status !== 'Pending' && b.status !== 'Paid' && <span onClick={() => updateStatus(b.id,'Pending')} style={{ fontSize:12,color:C.amber,fontWeight:700,cursor:'pointer' }}>⏳</span>}
                          <span onClick={() => deleteBill(b.id)} style={{ fontSize:12,color:C.red,fontWeight:700,cursor:'pointer' }}>🗑️</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Analytics Section */}
      {!loading && <AnalyticsSection performance={performance} />}
    </div>
  );
}

function AnalyticsSection({ performance }) {
  if (!performance.sales.length && !performance.demand.length) return null;

  return (
    <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
      <Card style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 16, marginBottom: 20, color: C.dark }}>
          Sales Performance <span style={{ fontSize: 12, color: C.light, fontWeight: 500 }}>(Paid Bills)</span>
        </h3>
        <div style={{ height: 260, width: '100%' }}>
          {performance.sales.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performance.sales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0FB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A0AEC0' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A0AEC0' }} dx={-10} tickFormatter={v => `₹${v}`} />
                <Tooltip cursor={{ stroke: '#EEF0FB', strokeWidth: 2 }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} labelStyle={{ fontWeight: 700, color: C.indigo }} itemStyle={{ color: C.pink, fontWeight: 600 }} formatter={v => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke={C.indigo} strokeWidth={3} dot={{ r: 4, fill: C.pink, strokeWidth: 0 }} activeDot={{ r: 6, fill: C.indigo }} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A0AEC0', fontSize: 13 }}>No sales data yet</div>
          )}
        </div>
      </Card>

      <Card style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 16, marginBottom: 20, color: C.dark }}>
          Top Products Demand
        </h3>
        <div style={{ height: 260, width: '100%' }}>
          {performance.demand.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance.demand} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF0FB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A0AEC0' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.dark, fontWeight: 600 }} width={100} />
                <Tooltip cursor={{ fill: '#F8FAFF' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} labelStyle={{ fontWeight: 700, color: C.indigo }} itemStyle={{ color: C.pink, fontWeight: 600 }} formatter={v => [v, 'Units Sold']} />
                <Bar dataKey="total_sold" fill={C.pink} radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A0AEC0', fontSize: 13 }}>No product demand data yet</div>
          )}
        </div>
      </Card>
    </div>
  );
}
