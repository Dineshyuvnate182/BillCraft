import { useState, useEffect } from 'react';
import { C, GradText, Card, Button, Input, Toast, Spinner } from '../components/UI';
import api from '../utils/api';

export default function BusinessProfilePage() {
  const [profile, setProfile] = useState({
    business_name: '', gst_number: '', address: '', phone: '', email: '', website: '',
  });
  const [logoUrl, setLogoUrl]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    api.get('/business')
      .then(r => {
        if (r.data) {
          setProfile({
            business_name: r.data.business_name || '',
            gst_number: r.data.gst_number || '',
            address: r.data.address || '',
            phone: r.data.phone || '',
            email: r.data.email || '',
            website: r.data.website || '',
          });
          if (r.data.logo_url) setLogoUrl(r.data.logo_url);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile.business_name) return setToast({ msg: 'Business name is required', type: 'error' });
    setSaving(true);
    try {
      const { data } = await api.put('/business', profile);
      setProfile({
        business_name: data.business_name || '',
        gst_number: data.gst_number || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
      });
      setToast({ msg: 'Business profile saved!', type: 'success' });
    } catch {
      setToast({ msg: 'Failed to save profile', type: 'error' });
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setToast({ msg: 'Logo must be under 2MB', type: 'error' });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const { data } = await api.post('/business/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLogoUrl(data.logo_url);
      setToast({ msg: 'Logo uploaded!', type: 'success' });
    } catch {
      setToast({ msg: 'Logo upload failed', type: 'error' });
    } finally { setUploading(false); }
  };

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:60 }}><Spinner size={36} /></div>;

  return (
    <div className="page-enter" style={{ maxWidth: 800 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#EEF0FB,#FDF2F8)',
        border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '26px 30px',
        marginBottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position:'absolute',right:-40,top:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.08),transparent 70%)' }} />
        <div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:22,fontWeight:800,marginBottom:6 }}>
            <span style={{ color:C.indigo }}>Business </span>
            <span style={{ color:C.pink }}>Profile</span>
            <span style={{ color:C.dark }}> 🏢</span>
          </div>
          <div style={{ color:C.gray,fontSize:13,fontWeight:500 }}>Your business details will appear on every bill you generate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
        {/* Form */}
        <Card>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:16,marginBottom:22 }}>
            <span style={{ color:C.indigo }}>Business</span>{' '}<span style={{ color:C.pink }}>Details</span>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input label="Business Name *" value={profile.business_name}
              onChange={e => setProfile(p => ({...p, business_name: e.target.value}))}
              placeholder="Dinesh Electronics" />
            <Input label="GST Number" value={profile.gst_number}
              onChange={e => setProfile(p => ({...p, gst_number: e.target.value}))}
              placeholder="22AAAAA0000A1Z5" />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input label="Phone" value={profile.phone}
              onChange={e => setProfile(p => ({...p, phone: e.target.value}))}
              placeholder="+91 98765 43210" />
            <Input label="Email" type="email" value={profile.email}
              onChange={e => setProfile(p => ({...p, email: e.target.value}))}
              placeholder="business@example.com" />
          </div>
          <Input label="Website" value={profile.website}
            onChange={e => setProfile(p => ({...p, website: e.target.value}))}
            placeholder="https://yourbusiness.com" />
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize:10.5,color:C.light,letterSpacing:'1.5px',textTransform:'uppercase',display:'block',marginBottom:7,fontWeight:700 }}>Address</label>
            <textarea value={profile.address}
              onChange={e => setProfile(p => ({...p, address: e.target.value}))}
              placeholder="Shop No. 5, Main Road, City..."
              rows={3}
              style={{
                width:'100%',padding:'11px 15px',background:'#F8FAFF',
                border:`1.5px solid ${C.border}`,borderRadius:10,color:C.dark,
                fontSize:13,outline:'none',fontFamily:'inherit',resize:'vertical',
                boxSizing:'border-box',
              }} />
          </div>

          <Button onClick={handleSave} loading={saving} style={{
            background:`linear-gradient(135deg,${C.indigo},${C.pink})`,
            boxShadow:`0 6px 20px ${C.indigo}44`, width:'100%', justifyContent:'center',
            padding:'14px', fontSize:14, fontFamily:'Bricolage Grotesque,sans-serif',
          }}>
            💾 Save Business Profile
          </Button>
        </Card>

        {/* Logo Upload */}
        <div>
          <Card style={{ textAlign: 'center' }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:14,marginBottom:18 }}>
              <span style={{ color:C.indigo }}>Business</span>{' '}<span style={{ color:C.pink }}>Logo</span>
            </div>

            <div style={{
              width: 140, height: 140, borderRadius: 20, margin: '0 auto 18px',
              background: logoUrl ? 'white' : 'linear-gradient(135deg,#EEF0FB,#FDF2F8)',
              border: `2px dashed ${logoUrl ? C.indigo+'44' : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', transition: 'all .3s',
            }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width:'100%',height:'100%',objectFit:'contain',padding:8 }} />
              ) : (
                <div style={{ textAlign:'center',color:C.light }}>
                  <div style={{ fontSize:36,marginBottom:4 }}>🏢</div>
                  <div style={{ fontSize:11 }}>No logo</div>
                </div>
              )}
            </div>

            <label style={{
              display:'inline-block',padding:'10px 20px',borderRadius:11,cursor:'pointer',
              background:`${C.indigo}12`,border:`1.5px solid ${C.indigo}30`,
              color:C.indigo,fontSize:12,fontWeight:700,transition:'all .2s',
            }}>
              {uploading ? '⏳ Uploading...' : '📁 Upload Logo'}
              <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg"
                onChange={handleLogoUpload} style={{ display:'none' }} />
            </label>
            <div style={{ fontSize:11,color:C.light,marginTop:8 }}>PNG, JPG, SVG · Max 2MB</div>
          </Card>

          {/* Preview Card */}
          {profile.business_name && (
            <Card style={{ marginTop: 14 }}>
              <div style={{ fontSize:10.5,color:C.light,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:10 }}>Preview on Bills</div>
              <div style={{
                background:`linear-gradient(135deg,${C.indigo},${C.pink})`,
                borderRadius:12,padding:'14px 16px',color:'white',
              }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
                  {logoUrl && <img src={logoUrl} alt="" style={{ width:28,height:28,borderRadius:6,background:'white',objectFit:'contain',padding:2 }} />}
                  <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:14 }}>{profile.business_name}</div>
                </div>
                {profile.phone && <div style={{ fontSize:11,opacity:.8 }}>📞 {profile.phone}</div>}
                {profile.email && <div style={{ fontSize:11,opacity:.8 }}>✉️ {profile.email}</div>}
                {profile.gst_number && <div style={{ fontSize:11,opacity:.8 }}>🏷️ GST: {profile.gst_number}</div>}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
