import { useState, useEffect } from 'react';
import { C, GradText, AnimatedCounter, Card, Badge, Spinner } from '../components/UI';
import api from '../utils/api';

function StatCard({ label, value, prefix, icon, change, from, to, bg }) {
  return (
    <Card style={{ position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,right:0,width:90,height:90,background:`radial-gradient(circle at top right,${bg},transparent 70%)` }} />
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
        <span style={{ fontSize:26 }}>{icon}</span>
        <Badge label={change} bg={bg} color={from} />
      </div>
      <div style={{ marginTop:16 }}>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:28,fontWeight:800 }}>
          <GradText from={from} to={to}><AnimatedCounter target={value} prefix={prefix} /></GradText>
        </div>
        <div style={{ fontSize:12,color:C.light,marginTop:3,fontWeight:500 }}>{label}</div>
      </div>
    </Card>
  );
}

function BillRow({ bill }) {
  const s = {Paid:{bg:C.greenL,c:C.green},Pending:{bg:C.amberL,c:C.amber},Draft:{bg:C.indigoL,c:C.light}}[bill.status]||{};
  return (
    <tr className="row-h" style={{ borderTop:`1px solid #F3F5FF`,transition:'all .15s' }}>
      <td style={{ padding:'12px 0',fontSize:13,fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,color:C.indigo }}>{bill.invoice_no}</td>
      <td style={{ padding:'12px 0',fontSize:13,fontWeight:500 }}>{bill.customer_name}</td>
      <td style={{ padding:'12px 0',fontSize:13,fontWeight:700 }}>₹{Number(bill.total_amount).toLocaleString('en-IN')}</td>
      <td style={{ padding:'12px 0',fontSize:12,color:C.light }}>{new Date(bill.created_at).toLocaleDateString('en-IN')}</td>
      <td style={{ padding:'12px 0' }}><Badge label={bill.status} bg={s.bg} color={s.c} /></td>
    </tr>
  );
}

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState({ revenue:0, billCount:0, fmtCount:0 });
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/bills/stats'), api.get('/bills?limit=5')])
      .then(([sr, br]) => { setStats(sr.data); setBills(br.data.slice(0,4)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><Spinner size={36} /></div>;

  const statCards = [
    { label:'Total Revenue',   value:stats.revenue,   prefix:'₹', icon:'💰', change:'+18%', from:C.indigo, to:'#818CF8',  bg:C.indigoL },
    { label:'Bills Generated', value:stats.billCount,  prefix:'',  icon:'🧾', change:'+12%', from:C.green,  to:'#10B981',  bg:C.greenL  },
    { label:'Formats Owned',   value:stats.fmtCount,   prefix:'',  icon:'📋', change:'Active',from:C.pink,  to:'#F472B6',  bg:C.pinkL   },
    { label:'This Month',      value:bills.length,     prefix:'',  icon:'📊', change:'Bills', from:C.amber, to:'#F59E0B',  bg:C.amberL  },
  ];

  return (
    <div className="page-enter">
      {/* Stat Cards */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 360px',gap:18 }}>
        {/* Bills Table */}
        <Card>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:15 }}>
              <span style={{ color:C.indigo }}>Recent</span>{' '}<span style={{ color:C.dark }}>Bills</span>
            </div>
            <span onClick={() => setPage('history')} style={{ fontSize:12,color:C.pink,cursor:'pointer',fontWeight:700 }}>View all →</span>
          </div>
          {bills.length === 0 ? (
            <div style={{ textAlign:'center',padding:'30px',color:C.light }}>
              <div style={{ fontSize:32,marginBottom:8 }}>🧾</div>
              <div style={{ fontWeight:600 }}>No bills yet</div>
              <span onClick={() => setPage('createbill')} style={{ color:C.indigo,cursor:'pointer',fontWeight:700,fontSize:13 }}>Create your first bill →</span>
            </div>
          ) : (
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Invoice','Customer','Amount','Date','Status'].map(h => <th key={h} style={{ textAlign:'left',fontSize:10.5,color:'#C0C8E0',fontWeight:700,paddingBottom:10,letterSpacing:'1px',textTransform:'uppercase' }}>{h}</th>)}</tr>
              </thead>
              <tbody>{bills.map((b,i) => <BillRow key={i} bill={b} />)}</tbody>
            </table>
          )}
        </Card>

        {/* Right Col */}
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {/* Quick Actions */}
          <div style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6 50%,#EC4899)',borderRadius:18,padding:'22px',color:'white',boxShadow:'0 10px 32px rgba(99,102,241,.32)' }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:15,marginBottom:14 }}>⚡ Quick Actions</div>
            {[
              { label:'Create New Bill', icon:'✦', page:'createbill' },
              { label:'Add Product',     icon:'＋', page:'products'   },
              { label:'Browse Formats',  icon:'⊕', page:'store'      },
            ].map(a => (
              <div key={a.label} onClick={() => setPage(a.page)} style={{
                display:'flex',alignItems:'center',gap:11,padding:'11px 14px',
                background:'rgba(255,255,255,.16)',borderRadius:11,marginBottom:8,
                cursor:'pointer',border:'1px solid rgba(255,255,255,.22)',transition:'all .18s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.28)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.16)'}>
                <span style={{ fontSize:16 }}>{a.icon}</span>
                <span style={{ fontSize:13,fontWeight:600 }}>{a.label}</span>
                <span style={{ marginLeft:'auto',opacity:.7 }}>→</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <Card>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:14,marginBottom:14 }}>
              <span style={{ color:C.indigo }}>Getting</span>{' '}<span style={{ color:C.dark }}>Started</span>
            </div>
            {[
              { step:'1', text:'Buy a bill format from the store', done: stats.fmtCount > 0 },
              { step:'2', text:'Add your products to catalog', done: false },
              { step:'3', text:'Create your first bill', done: stats.billCount > 0 },
            ].map(item => (
              <div key={item.step} style={{ display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderTop:'1px solid #F3F5FF' }}>
                <div style={{ width:24,height:24,borderRadius:'50%',background:item.done?C.greenL:C.indigoL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:item.done?C.green:C.indigo,flexShrink:0 }}>
                  {item.done?'✓':item.step}
                </div>
                <span style={{ fontSize:13,color:item.done?C.light:C.dark,textDecoration:item.done?'line-through':'none',fontWeight:item.done?400:500 }}>{item.text}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
