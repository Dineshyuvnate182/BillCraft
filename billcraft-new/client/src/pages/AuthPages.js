import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { C, GradText, Input, Button, Spinner } from '../components/UI';

function AuthCard({ children, onNavigate }) {
  return (
    <div style={{ minHeight:'100vh',background:`linear-gradient(135deg,${C.indigoL},${C.pinkL})`,display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative' }}>
      {onNavigate && (
        <button onClick={() => onNavigate('landing')} style={{ position:'absolute',top:24,left:24,background:'white',border:`1px solid ${C.border}`,padding:'8px 16px',borderRadius:20,fontSize:13,fontWeight:600,color:C.gray,cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,.05)' }}>
          ← Back to Home
        </button>
      )}
      <div style={{
        background:'white',borderRadius:24,padding:'40px 36px',width:'100%',maxWidth:440,
        boxShadow:'0 20px 60px rgba(99,102,241,.18)',border:`1px solid ${C.border}`,
        animation:'fadeUp .4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ width:52,height:52,borderRadius:15,background:'linear-gradient(135deg,#6366F1,#EC4899)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,margin:'0 auto 12px',boxShadow:'0 6px 20px rgba(99,102,241,.35)' }}>⚡</div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:22 }}>
            <span style={{ color:C.indigo }}>Bill</span><span style={{ color:C.pink }}>Craft</span>
          </div>
          <div style={{ fontSize:10,color:C.light,letterSpacing:'2px',textTransform:'uppercase',fontWeight:600 }}>Pro Suite</div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function LoginPage({ onNavigate }) {
  const { login, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ email:'', password:'' });

  const set = (k) => (e) => { setError(''); setForm(f => ({...f,[k]:e.target.value})); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (!ok) return;
  };

  return (
    <AuthCard>
      <div style={{ textAlign:'center',marginBottom:24 }}>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:20,fontWeight:800,marginBottom:4 }}>
          <GradText>Welcome Back</GradText>
        </div>
        <div style={{ fontSize:13,color:C.light }}>Sign in to your BillCraft account</div>
      </div>
      {error && <div style={{ background:C.redL,border:`1.5px solid #FCA5A5`,borderRadius:10,padding:'10px 14px',fontSize:12,color:C.red,marginBottom:14,fontWeight:600 }}>❌ {error}</div>}
      <form onSubmit={handleSubmit}>
        <Input label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Enter your password" required />
        <Button type="submit" loading={loading} style={{ width:'100%',justifyContent:'center',marginTop:6 }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </Button>
      </form>
      <div style={{ textAlign:'center',marginTop:18,fontSize:13,color:C.light }}>
        Don't have an account?{' '}
        <span onClick={() => onNavigate('register')} style={{ color:C.indigo,fontWeight:700,cursor:'pointer' }}>Create one →</span>
      </div>
    </AuthCard>
  );
}

export function RegisterPage({ onNavigate }) {
  const { register, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ name:'',email:'',password:'',business_name:'' });

  const set = (k) => (e) => { setError(''); setForm(f => ({...f,[k]:e.target.value})); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
  };

  return (
    <AuthCard>
      <div style={{ textAlign:'center',marginBottom:22 }}>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:20,fontWeight:800,marginBottom:4 }}>
          <GradText>Create Account</GradText>
        </div>
        <div style={{ fontSize:13,color:C.light }}>Start your billing journey today</div>
      </div>
      {error && <div style={{ background:C.redL,border:`1.5px solid #FCA5A5`,borderRadius:10,padding:'10px 14px',fontSize:12,color:C.red,marginBottom:14,fontWeight:600 }}>❌ {error}</div>}
      <form onSubmit={handleSubmit}>
        <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Dinesh Kumar" required />
        <Input label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Input label="Business Name" value={form.business_name} onChange={set('business_name')} placeholder="My Shop" />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
        <Button type="submit" loading={loading} style={{ width:'100%',justifyContent:'center',marginTop:6 }}>
          {loading ? 'Creating…' : 'Create Account →'}
        </Button>
      </form>
      <div style={{ textAlign:'center',marginTop:18,fontSize:13,color:C.light }}>
        Already have an account?{' '}
        <span onClick={() => onNavigate('login')} style={{ color:C.indigo,fontWeight:700,cursor:'pointer' }}>Sign in →</span>
      </div>
    </AuthCard>
  );
}
