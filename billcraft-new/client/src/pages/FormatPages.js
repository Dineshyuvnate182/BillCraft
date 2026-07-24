import { useState, useEffect } from 'react';
import { C, GradText, Badge, Card, Button, Toast, Spinner } from '../components/UI';
import api from '../utils/api';
import BusinessProfilePage from './BusinessProfilePage';

export function StorePage({ setPage }) {
  const [formats,  setFormats]  = useState([]);
  const [owned,    setOwned]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [buying,   setBuying]   = useState(null);
  const [toast,    setToast]    = useState(null);

  useEffect(() => {
    Promise.all([api.get('/formats'), api.get('/formats/purchased')])
      .then(([fr, pr]) => { setFormats(fr.data); setOwned(pr.data.map(f => f.id)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (fmt) => {
    setBuying(fmt.id);
    try {
      await api.post(`/formats/purchase/${fmt.id}`);
      setOwned(prev => [...prev, fmt.id]);
      setToast({ msg: `${fmt.name} ${fmt.accent} purchased!`, type:'success' });
    } catch {
      setToast({ msg:'Purchase failed. Try again.', type:'error' });
    } finally { setBuying(null); }
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#EEF0FB,#FDF2F8)',border:`1.5px solid ${C.border}`,borderRadius:20,padding:'26px 30px',marginBottom:26,display:'flex',justifyContent:'space-between',alignItems:'center',overflow:'hidden',position:'relative' }}>
        <div style={{ position:'absolute',right:-40,top:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.08),transparent 70%)' }} />
        <div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:22,fontWeight:800,marginBottom:6 }}>
            <span style={{ color:C.indigo }}>Bill Format </span>
            <span style={{ color:C.pink }}>Market</span>
            <span style={{ color:C.dark }}>place 🛍️</span>
          </div>
          <div style={{ color:C.gray,fontSize:13,fontWeight:500 }}>Professional billing templates for every business type</div>
        </div>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:52,fontWeight:800,letterSpacing:'-3px',opacity:.1 }}>
          <GradText>{formats.length}+</GradText>
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
        {formats.map(fmt => {
          const isOwned = owned.includes(fmt.id);
          return (
            <div key={fmt.id} className="fmt-card" style={{ background:'white',borderRadius:20,padding:'24px',boxShadow:'0 2px 16px rgba(0,0,0,.06)',border:`1.5px solid ${isOwned?fmt.color+'44':C.border}`,transition:'all .3s',cursor:'default' }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:16 }}>
                <div style={{ width:52,height:52,borderRadius:15,background:`linear-gradient(135deg,${fmt.color}20,${fmt.color2}20)`,border:`1px solid ${fmt.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26 }} className="icon-bob">{fmt.icon}</div>
                <Badge label={isOwned?'✓ Owned':fmt.tag} bg={`${fmt.color}18`} color={fmt.color} />
              </div>
              <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:17,fontWeight:800,marginBottom:4 }}>
                <span style={{ color:fmt.color }}>{fmt.name}</span>{' '}<span style={{ color:C.dark }}>{fmt.accent}</span>
              </div>
              <div style={{ fontSize:12,color:C.light,marginBottom:18,lineHeight:1.6 }}>{fmt.description}</div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:24,fontWeight:800 }}>
                  <GradText from={fmt.color} to={fmt.color2}>₹{fmt.price}</GradText>
                </div>
                <button className="btn-p" disabled={isOwned || buying===fmt.id}
                  onClick={() => !isOwned && handleBuy(fmt)}
                  style={{ background:isOwned?C.indigoL:`linear-gradient(135deg,${fmt.color},${fmt.color2})`,border:'none',borderRadius:11,padding:'9px 18px',color:isOwned?C.light:'white',fontSize:12,fontWeight:700,cursor:isOwned?'default':'pointer',transition:'all .2s',boxShadow:isOwned?'none':`0 4px 14px ${fmt.color}44` }}>
                  {buying===fmt.id ? '...' : isOwned ? 'Owned ✓' : 'Buy Now →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MyFormatsPage({ setPage }) {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState(null);
  const [toast, setToast] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    api.get('/formats/purchased')
      .then(res => setFormats(res.data))
      .catch(err => console.error('Failed to load purchased formats:', err))
      .finally(() => setLoading(false));

    api.get('/business')
      .then(res => { if (res.data) setDefaultFormat(res.data.default_format_id); })
      .catch(err => console.error('Failed to load business profile:', err));
  }, []);

  const handleSetDefault = async (fmtId) => {
    try {
      await api.put('/business/default-format', { format_id: fmtId });
      setDefaultFormat(fmtId);
      setToast({ msg: 'Default format updated!', type: 'success' });
    } catch {
      setToast({ msg: 'Failed to set default', type: 'error' });
    }
  };

  const handlePreview = async (id) => {
    try {
      const res = await api.get(`/formats/${id}/preview`);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      setToast({ msg: 'Preview failed to load', type: 'error' });
    }
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter" style={{ paddingBottom: 60 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {previewUrl && (
        <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.6)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',padding:40,justifyContent:'center',alignItems:'center' }}>
          <div style={{ background:'white',width:'100%',maxWidth:850,height:'100%',borderRadius:20,overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 60px rgba(0,0,0,.2)' }}>
            <div style={{ padding:'16px 24px',borderBottom:`1.5px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:18 }}>🎨 Template Preview</div>
              <button onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} style={{ background:'none',border:'none',fontSize:32,lineHeight:1,cursor:'pointer',color:C.light,padding:0,margin:'-8px 0' }}>&times;</button>
            </div>
            <iframe src={previewUrl} style={{ width:'100%',flex:1,border:'none',background:'#F4F6FD' }} title="Preview"></iframe>
          </div>
        </div>
      )}

      {/* Business Details Section embedded */}
      <div style={{ marginBottom: 40 }}>
         <BusinessProfilePage />
      </div>

      <div style={{ background:'linear-gradient(135deg,#EEF0FB,#FDF2F8)',border:`1.5px solid ${C.border}`,borderRadius:16,padding:'18px 24px',marginBottom:22,display:'flex',alignItems:'center',gap:14 }}>
        <span style={{ fontSize:28 }}>🎉</span>
        <div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800 }}>
            <span style={{ color:C.indigo }}>You own</span>{' '}<span style={{ color:C.pink }}>{formats.length} format{formats.length!==1?'s':''}</span>
          </div>
          <div style={{ fontSize:12,color:C.light,marginTop:2 }}>All ready for instant bill generation</div>
        </div>
        <Button onClick={() => setPage('store')} style={{ marginLeft:'auto' }}>+ Buy More</Button>
      </div>

      {formats.length === 0 ? (
        <Card style={{ textAlign:'center',padding:'60px' }}>
          <div style={{ fontSize:48,marginBottom:12 }}>📭</div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:18,fontWeight:700,color:C.dark,marginBottom:6 }}>No formats yet</div>
          <div style={{ fontSize:13,color:C.light,marginBottom:18 }}>Visit the store to purchase your first billing template</div>
          <Button onClick={() => setPage('store')}>Browse Store →</Button>
        </Card>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
          {formats.map(fmt => (
            <Card key={fmt.id} style={{ border:`1.5px solid ${defaultFormat===fmt.id ? fmt.color : fmt.color+'30'}`, position:'relative', boxShadow: defaultFormat===fmt.id ? `0 8px 24px ${fmt.color}22` : 'none' }}>
              {defaultFormat === fmt.id && (
                <div style={{ position:'absolute', top:16, right:16, background:fmt.color, color:'white', fontSize:10, padding:'4px 8px', borderRadius:20, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>⭐️ Default</div>
              )}
              <div style={{ fontSize:30,marginBottom:12 }} className="icon-bob">{fmt.icon}</div>
              <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:17,fontWeight:800,marginBottom:4 }}>
                <span style={{ color:fmt.color }}>{fmt.name}</span>{' '}<span style={{ color:C.dark }}>{fmt.accent}</span>
              </div>
              <div style={{ fontSize:12,color:C.light,marginBottom:4 }}>{fmt.description}</div>
              <div style={{ fontSize:11,color:C.light,marginBottom:16 }}>Purchased · {new Date(fmt.purchase_date).toLocaleDateString('en-IN')}</div>
              <div style={{ display:'flex', gap:8, marginBottom: 8 }}>
                <button onClick={() => handlePreview(fmt.id)} style={{ flex:1, padding:'10px',background:`#fff`,border:`1.5px solid ${C.border}`,borderRadius:11,color:C.dark,fontSize:12,fontWeight:700,cursor:'pointer' }}>
                  👀 Preview
                </button>
                {defaultFormat !== fmt.id && (
                  <button onClick={() => handleSetDefault(fmt.id)} style={{ flex:1, padding:'10px',background:'transparent',border:`1.5px solid ${C.border}`,borderRadius:11,color:C.gray,fontSize:12,fontWeight:600,cursor:'pointer' }}>
                    Set Default
                  </button>
                )}
              </div>
              <div style={{ display:'flex' }}>
                <button onClick={() => setPage('createbill')} style={{ width:'100%', padding:'10px',background:`linear-gradient(135deg,${fmt.color}18,${fmt.color2}18)`,border:`1.5px solid ${fmt.color}40`,borderRadius:11,color:fmt.color,fontSize:12,fontWeight:700,cursor:'pointer' }}>
                  Use →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
