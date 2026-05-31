import { useState, useEffect, useMemo, useCallback } from 'react';
import { C, GradText, Card, Button, Input, Select, Toast, Spinner } from '../components/UI';
import api from '../utils/api';

export default function CreateBillPage() {
  const [formats,     setFormats]     = useState([]);
  const [products,    setProducts]    = useState([]);
  const [items,       setItems]       = useState([]);
  const [customer,    setCustomer]    = useState('');
  const [custEmail,   setCustEmail]   = useState('');
  const [custPhone,   setCustPhone]   = useState('');
  const [formatId,    setFormatId]    = useState('');
  const [notes,       setNotes]       = useState('');
  const [keyword,     setKeyword]     = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [step,        setStep]        = useState(1); // 1=form, 2=preview
  const [toast,       setToast]       = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [savedBill,   setSavedBill]   = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get('/formats/purchased'), api.get('/products'), api.get('/business')])
      .then(([fr, pr, b]) => { 
        setFormats(fr.data); 
        setProducts(pr.data); 
        const defaultFmt = b.data?.default_format_id;
        if (defaultFmt && fr.data.some(f => f.id === defaultFmt)) {
          setFormatId(String(defaultFmt));
        } else if (fr.data[0]) {
          setFormatId(String(fr.data[0].id)); 
        }
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleKw = useCallback((v) => {
    setKeyword(v);
    setSuggestions(v.length > 0 ? products.filter(p => p.product_name.toLowerCase().includes(v.toLowerCase())) : []);
  }, [products]);

  const addItem = (p) => {
    setItems(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id===p.id ? {...i,qty:i.qty+1} : i) : [...prev, { id:p.id, name:p.product_name, price:Number(p.price), qty:1 }];
    });
    setKeyword(''); setSuggestions([]);
  };

  const subtotal = useMemo(() => items.reduce((a,i) => a + i.price * i.qty, 0), [items]);
  const gst      = useMemo(() => Math.round(subtotal * 0.18 * 100) / 100, [subtotal]);
  const total    = subtotal + gst;
  const selFmt   = formats.find(f => f.id === Number(formatId));

  const handleGenerate = () => {
    if (!customer) return setToast({ msg:'Enter customer name', type:'error' });
    if (!items.length) return setToast({ msg:'Add at least one product', type:'error' });
    setStep(2);
  };

  const handleSave = async (status) => {
    setSaving(true);
    try {
      const { data } = await api.post('/bills', {
        format_id: formatId || null,
        customer_name: customer, customer_email: custEmail, customer_phone: custPhone,
        items: items.map(i => ({ product_id:i.id, name:i.name, price:i.price, quantity:i.qty })),
        notes, status,
      });
      setSavedBill(data);
      setToast({ msg: `Bill saved as ${status}!`, type:'success' });
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to save bill', type:'error' });
    } finally { setSaving(false); }
  };

  const handlePrint = async () => {
    if (savedBill) {
      try {
        const { data } = await api.get(`/bills/${savedBill.id}/pdf`, { responseType: 'text' });
        const blob = new Blob([data], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (e) {
        setToast({ msg:'Failed to generate PDF', type:'error' });
      }
    } else setToast({ msg:'Save the bill first to print/download', type:'error' });
  };

  const resetAll = () => { setStep(1); setItems([]); setCustomer(''); setCustEmail(''); setCustPhone(''); setNotes(''); setSavedBill(null); setFormatId(formats[0]?.id||''); };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><Spinner size={36} /></div>;

  if (formats.length === 0) return (
    <div className="page-enter">
      <Card style={{ textAlign:'center',padding:'60px' }}>
        <div style={{ fontSize:48,marginBottom:12 }}>🛍️</div>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:18,fontWeight:700,marginBottom:6,color:C.dark }}>No formats purchased</div>
        <div style={{ fontSize:13,color:C.light,marginBottom:18 }}>Buy a bill format from the store to start creating bills</div>
        <Button onClick={() => window.dispatchEvent(new CustomEvent('setPage', {detail:'store'}))}>Browse Store →</Button>
      </Card>
    </div>
  );

  if (step === 2) return (
    <div className="page-enter" style={{ maxWidth:600, margin:'0 auto' }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ background:'white',borderRadius:22,overflow:'hidden',boxShadow:'0 24px 64px rgba(99,102,241,.18)',border:`1px solid ${C.border}` }}>
        {/* Bill header */}
        <div style={{ background:`linear-gradient(135deg,${selFmt?.color||C.indigo},${selFmt?.color2||C.pink})`,padding:'26px 30px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:22,fontWeight:800,color:'white' }}>{selFmt?.icon||'⚡'} BillCraft</div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,.75)',marginTop:2 }}>Your Business Name</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:18,fontWeight:800,color:'white' }}>{savedBill?.invoice_no || 'PREVIEW'}</div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,.75)' }}>{new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div style={{ padding:'26px 30px' }}>
          <div style={{ background:'#F8FAFF',borderRadius:12,padding:'13px 17px',marginBottom:22,border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10.5,color:C.light,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:3 }}>Bill To</div>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:16,fontWeight:800 }}>
              <span style={{ color:selFmt?.color||C.indigo }}>{customer.split(' ')[0]}</span>{' '}
              <span style={{ color:C.dark }}>{customer.split(' ').slice(1).join(' ')}</span>
            </div>
            {custEmail && <div style={{ fontSize:12,color:C.light,marginTop:2 }}>{custEmail}</div>}
          </div>

          <table style={{ width:'100%',borderCollapse:'collapse',marginBottom:22 }}>
            <thead><tr>
              {['Item','Qty','Rate','Amount'].map(h => <th key={h} style={{ textAlign:h==='Item'?'left':'right',fontSize:10,color:'#C0C8E0',letterSpacing:'1.2px',textTransform:'uppercase',paddingBottom:10,fontWeight:700 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {items.map((item,i) => (
                <tr key={i}>
                  <td style={{ padding:'10px 0',fontSize:13,fontWeight:600,borderTop:`1px solid #F3F5FF` }}>{item.name}</td>
                  <td style={{ padding:'10px 0',fontSize:13,textAlign:'right',color:C.light,borderTop:`1px solid #F3F5FF` }}>{item.qty}</td>
                  <td style={{ padding:'10px 0',fontSize:13,textAlign:'right',borderTop:`1px solid #F3F5FF` }}>₹{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ padding:'10px 0',fontSize:13,textAlign:'right',fontWeight:800,color:selFmt?.color||C.indigo,borderTop:`1px solid #F3F5FF` }}>₹{(item.price*item.qty).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop:`1.5px solid ${C.indigoL}`,paddingTop:16 }}>
            {[['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`, C.light, C.dark], ['GST (18%)', `₹${gst.toLocaleString('en-IN')}`, C.light, C.green]].map(([l,v,lc,vc]) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8 }}>
                <span style={{ color:lc }}>{l}</span><span style={{ fontWeight:700,color:vc }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(135deg,#EEF0FB,#FDF2F8)',padding:'16px 20px',borderRadius:13,marginTop:4,border:`1.5px solid ${C.border}` }}>
              <span style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:14 }}>Total Amount</span>
              <span style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:26,fontWeight:800 }}>
                <GradText from={selFmt?.color||C.indigo} to={C.pink}>₹{total.toLocaleString('en-IN')}</GradText>
              </span>
            </div>
          </div>

          {notes && <div style={{ marginTop:16,fontSize:12,color:C.gray }}><strong>Notes:</strong> {notes}</div>}

          <div style={{ display:'flex',gap:10,marginTop:22,flexWrap:'wrap' }}>
            {!savedBill && <Button onClick={() => handleSave('Draft')} variant="ghost" loading={saving}>💾 Save Draft</Button>}
            {!savedBill && <Button onClick={() => handleSave('Paid')} loading={saving} style={{ background:`linear-gradient(135deg,${selFmt?.color||C.indigo},${selFmt?.color2||C.pink})`,boxShadow:`0 6px 20px ${selFmt?.color||C.indigo}44` }}>✅ Save as Paid</Button>}
            {savedBill && <Button onClick={handlePrint} style={{ background:`linear-gradient(135deg,${selFmt?.color||C.indigo},${selFmt?.color2||C.pink})` }}>🖨️ Print / PDF</Button>}
            <Button variant="ghost" onClick={resetAll}>✕ New Bill</Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth:900 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:18 }}>
        {/* Form */}
        <Card>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:16,marginBottom:22 }}>
            <span style={{ color:C.indigo }}>Bill</span>{' '}<span style={{ color:C.pink }}>Details</span>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input label="Customer Name *" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Rahul Sharma" />
            <Input label="Customer Email" type="email" value={custEmail} onChange={e => setCustEmail(e.target.value)} placeholder="customer@email.com" />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input label="Phone" value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="+91 98765 43210" />
            <Select label="Bill Format" value={formatId} onChange={e => setFormatId(e.target.value)}
              options={formats.map(f => ({ value:f.id, label:`${f.icon} ${f.name} ${f.accent}` }))} />
          </div>

          {/* Smart Product Search */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:10.5,color:C.light,letterSpacing:'1.5px',textTransform:'uppercase',display:'block',marginBottom:7,fontWeight:700 }}>⚡ Smart Product Search</label>
            <div style={{ position:'relative' }}>
              <input value={keyword} onChange={e => handleKw(e.target.value)}
                placeholder="Type product name (e.g. laptop, mouse)…"
                style={{ width:'100%',padding:'11px 15px',background:'#F8FAFF',border:`1.5px solid ${selFmt?.color||C.indigo}88`,borderRadius:10,color:C.dark,fontSize:13,outline:'none',fontFamily:'inherit' }} />
              {suggestions.length > 0 && (
                <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'white',border:`1.5px solid ${C.border}`,borderRadius:13,zIndex:30,overflow:'hidden',boxShadow:'0 10px 32px rgba(99,102,241,.14)',animation:'scaleIn .18s ease' }}>
                  {suggestions.map((s,i) => (
                    <div key={i} className="sug" onClick={() => addItem(s)}
                      style={{ padding:'12px 16px',display:'flex',justifyContent:'space-between',fontSize:13,borderTop:i>0?`1px solid #F3F5FF`:'none',transition:'all .12s' }}>
                      <span>📦 <strong>{s.product_name}</strong></span>
                      <span style={{ color:C.green,fontWeight:700 }}>₹{Number(s.price).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ fontSize:11,color:'#C0C8E0',marginTop:5 }}>💡 Auto-fetch from your product catalog</div>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div style={{ background:'#F8FAFF',borderRadius:13,padding:'16px',border:`1.5px solid ${C.indigoL}` }}>
              {items.map((item,i) => (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderTop:i>0?`1px solid ${C.indigoL}`:'none' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:600 }}>{item.name}</div>
                    <div style={{ fontSize:11,color:C.light }}>₹{item.price.toLocaleString('en-IN')} each</div>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                    <button onClick={() => setItems(prev => prev.map(b => b.id===item.id ? {...b,qty:Math.max(1,b.qty-1)} : b))}
                      style={{ width:28,height:28,borderRadius:7,background:C.indigoL,border:'none',color:C.indigo,cursor:'pointer',fontSize:15,fontWeight:800 }}>−</button>
                    <span style={{ fontSize:13,fontWeight:800,minWidth:22,textAlign:'center' }}>{item.qty}</span>
                    <button onClick={() => setItems(prev => prev.map(b => b.id===item.id ? {...b,qty:b.qty+1} : b))}
                      style={{ width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${selFmt?.color||C.indigo},${selFmt?.color2||C.pink})`,border:'none',color:'white',cursor:'pointer',fontSize:15,fontWeight:800 }}>+</button>
                  </div>
                  <div style={{ fontSize:13,fontWeight:800,minWidth:80,textAlign:'right',color:selFmt?.color||C.indigo }}>₹{(item.price*item.qty).toLocaleString('en-IN')}</div>
                  <button onClick={() => setItems(prev => prev.filter(b => b.id!==item.id))} style={{ background:'none',border:'none',color:'#C0C8E0',cursor:'pointer',fontSize:16,lineHeight:1 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, delivery notes…" style={{ marginTop:14,marginBottom:0 }} />
        </Card>

        {/* Summary */}
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:14,marginBottom:18 }}>
              <span style={{ color:C.indigo }}>Bill</span>{' '}<span style={{ color:C.pink }}>Summary</span>
            </div>
            {[['Subtotal',`₹${subtotal.toLocaleString('en-IN')}`,C.light,C.dark],['GST (18%)',`₹${gst.toLocaleString('en-IN')}`,C.light,C.green]].map(([l,v,lc,vc]) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:13 }}>
                <span style={{ color:lc }}>{l}</span><span style={{ fontWeight:700,color:vc }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop:`1.5px solid ${C.indigoL}`,paddingTop:14,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:700 }}>Total</span>
              <span style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:26,fontWeight:800 }}>
                <GradText from={selFmt?.color||C.indigo} to={C.pink}>₹{total.toLocaleString('en-IN')}</GradText>
              </span>
            </div>
          </Card>

          {selFmt && (
            <div style={{ background:`${selFmt.color}12`,border:`1.5px solid ${selFmt.color}30`,borderRadius:13,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ fontSize:20 }}>{selFmt.icon}</span>
              <div>
                <div style={{ fontSize:12,fontWeight:700,color:selFmt.color }}>{selFmt.name} {selFmt.accent}</div>
                <div style={{ fontSize:10.5,color:C.light }}>Selected template</div>
              </div>
            </div>
          )}

          <Button onClick={handleGenerate} style={{ width:'100%',justifyContent:'center',padding:'14px',background:customer&&items.length?`linear-gradient(135deg,${selFmt?.color||C.indigo},${selFmt?.color2||C.pink})`:'#F3F5FF',color:customer&&items.length?'white':C.light,boxShadow:customer&&items.length?`0 8px 24px ${selFmt?.color||C.indigo}44`:'none',fontSize:14,fontFamily:'Bricolage Grotesque,sans-serif' }}>
            ⚡ Generate Bill
          </Button>
          {(!customer||!items.length) && <div style={{ fontSize:11,color:'#C0C8E0',textAlign:'center',marginTop:8 }}>{!customer?'Enter customer name':'Add at least one product'}</div>}
        </div>
      </div>
    </div>
  );
}
