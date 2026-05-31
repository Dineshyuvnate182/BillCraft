import { useState, useEffect, useCallback } from 'react';
import { C, GradText, Card, Button, Input, Select, Toast, Spinner } from '../components/UI';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [toast,    setToast]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [form, setForm] = useState({ product_name:'',price:'',stock:'',category:'General',description:'' });

  const fetchProducts = useCallback(() => {
    api.get(`/products${search ? `?search=${search}` : ''}`)
      .then(r => setProducts(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetForm = () => { setForm({ product_name:'',price:'',stock:'',category:'General',description:'' }); setEditing(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.product_name || !form.price) return setToast({ msg:'Name and price required', type:'error' });
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
        setToast({ msg:'Product updated!', type:'success' });
      } else {
        await api.post('/products', form);
        setToast({ msg:'Product added!', type:'success' });
      }
      resetForm(); fetchProducts();
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed', type:'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); fetchProducts(); setToast({ msg:'Deleted', type:'success' }); }
    catch { setToast({ msg:'Delete failed', type:'error' }); }
  };

  const handleEdit = (p) => {
    setForm({ product_name:p.product_name, price:p.price, stock:p.stock, category:p.category, description:p.description||'' });
    setEditing(p.id); setShowForm(true);
  };

  const set = (k) => (e) => setForm(f => ({...f,[k]:e.target.value}));

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ position:'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              style={{ padding:'10px 14px 10px 36px',background:'white',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13,width:220,fontFamily:'inherit',outline:'none' }} />
            <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:C.light,fontSize:14 }}>🔍</span>
          </div>
          <span style={{ color:C.light,fontSize:13 }}><span style={{ color:C.indigo,fontWeight:700 }}>{products.length}</span> products</span>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Cancel' : '＋ Add Product'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card style={{ marginBottom:18,border:`1.5px solid ${C.border}`,animation:'scaleIn .2s ease' }}>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:14,marginBottom:16 }}>
            <span style={{ color:C.indigo }}>{editing?'Edit':'Add'}</span>{' '}<span style={{ color:C.pink }}>Product</span>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
            <Input label="Product Name" value={form.product_name} onChange={set('product_name')} placeholder="e.g. Laptop" />
            <Input label="Price (₹)" type="number" value={form.price} onChange={set('price')} placeholder="50000" />
            <Input label="Stock" type="number" value={form.stock} onChange={set('stock')} placeholder="12" />
            <Select label="Category" value={form.category} onChange={set('category')} options={[
              { value:'General',value:'General',label:'General' },
              { value:'Electronics',label:'Electronics' },
              { value:'Food',label:'Food & Beverage' },
              { value:'Medicine',label:'Medicine' },
              { value:'Clothing',label:'Clothing' },
              { value:'Services',label:'Services' },
            ]} />
          </div>
          <Input label="Description (optional)" value={form.description} onChange={set('description')} placeholder="Short description…" />
          <div style={{ display:'flex',gap:10 }}>
            <Button onClick={handleSubmit}>{editing ? 'Update Product' : 'Add Product'}</Button>
            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card style={{ textAlign:'center',padding:'60px' }}>
          <div style={{ fontSize:48,marginBottom:12 }}>📦</div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:18,fontWeight:700,marginBottom:6 }}>No products yet</div>
          <div style={{ fontSize:13,color:C.light }}>Add products to start creating bills</div>
        </Card>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14 }}>
          {products.map(p => (
            <Card key={p.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:14 }}>
              <div style={{ display:'flex',alignItems:'center',gap:13 }}>
                <div style={{ width:48,height:48,borderRadius:13,background:'linear-gradient(135deg,#EEF0FB,#FDF2F8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,border:`1px solid ${C.border}`,flexShrink:0 }}>📦</div>
                <div>
                  <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:14 }}>
                    <span style={{ color:C.indigo }}>{p.product_name.slice(0,Math.ceil(p.product_name.length/2))}</span>
                    <span style={{ color:C.dark }}>{p.product_name.slice(Math.ceil(p.product_name.length/2))}</span>
                  </div>
                  <div style={{ fontSize:11.5,color:C.light,marginTop:2 }}>
                    {p.category} · Stock: <strong style={{ color:C.green }}>{p.stock}</strong>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:20,fontWeight:800 }}>
                    <GradText from={C.green} to="#10B981">₹{Number(p.price).toLocaleString('en-IN')}</GradText>
                  </div>
                  <div style={{ fontSize:11,color:C.light }}>per unit</div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                  <button onClick={() => handleEdit(p)} style={{ background:C.indigoL,border:'none',borderRadius:7,padding:'5px 10px',color:C.indigo,fontSize:11,fontWeight:700,cursor:'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background:C.redL,border:'none',borderRadius:7,padding:'5px 10px',color:C.red,fontSize:11,fontWeight:700,cursor:'pointer' }}>Del</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Inventory Section */}
      {!loading && products.length > 0 && <InventorySection products={products} />}
    </div>
  );
}

function InventorySection({ products }) {
  const chartData = products.map(p => ({
    name: p.product_name,
    stock: Number(p.stock) || 0
  }));

  return (
    <div style={{ marginTop: 24 }}>
      <Card style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 16, marginBottom: 20, color: C.dark }}>
          Store Inventory <span style={{ fontSize: 12, color: C.light, fontWeight: 500 }}>(Current Stock)</span>
        </h3>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0FB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A0AEC0' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A0AEC0' }} />
              <Tooltip cursor={{ fill: '#F8FAFF' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} labelStyle={{ fontWeight: 700, color: C.indigo }} itemStyle={{ color: C.green, fontWeight: 600 }} formatter={v => [v, 'Current Stock']} />
              <Bar dataKey="stock" fill={C.green} radius={[4, 4, 0, 0]} barSize={32} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
