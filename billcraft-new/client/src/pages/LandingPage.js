import { useState, useEffect } from 'react';
import { C, GradText, Card, Button, Badge } from '../components/UI';

const FEATURES = [
  { icon: '⚡', title: 'Instant Invoicing', desc: 'Create professional bills in seconds' },
  { icon: '🎨', title: 'Beautiful Formats', desc: 'Choose from our premium format store' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Track sales performance & inventory' },
  { icon: '📱', title: 'WhatsApp Integration', desc: 'Send bills directly to customers' }
];

export default function LandingPage({ onNavigate }) {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.indigo}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>⚡</div>
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 22, fontWeight: 800, color: C.indigo }}>
            Bill<span style={{ color: C.pink }}>Craft</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          <a href="#features" style={{ textDecoration: 'none', color: C.gray, fontWeight: 600, fontSize: 14 }}>Features</a>
          <a href="#contact" style={{ textDecoration: 'none', color: C.gray, fontWeight: 600, fontSize: 14 }}>Contact Support</a>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="ghost" onClick={() => onNavigate('login')} style={{ background: '#FFF' }}>Login</Button>
            <Button onClick={() => onNavigate('register')}>Create Account</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', textAlign: 'center' }}>
        <div className="page-enter" style={{ maxWidth: 800 }}>
          <Badge label="✨ BILLCRAFT PRO SUITE V2 IS HERE" bg={C.pinkL} color={C.pink} />
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 64, fontWeight: 800, color: C.dark, margin: '24px 0', lineHeight: 1.1 }}>
            The smartest way to <GradText>manage your billing</GradText>
          </h1>
          <p style={{ fontSize: 18, color: C.gray, lineHeight: 1.6, marginBottom: 40, padding: '0 40px' }}>
            Transform your business with ultra-fast invoicing, robust inventory tracking, and stunning bill formats that your customers will love.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button onClick={() => onNavigate('register')} style={{ padding: '16px 32px', fontSize: 16, transform: 'scale(1.05)', boxShadow: `0 10px 30px rgba(99,102,241,.3)` }}>
              Get Started for Free →
            </Button>
            <Button variant="ghost" onClick={() => onNavigate('login')} style={{ padding: '16px 32px', fontSize: 16, background: 'white' }}>
              Existing User Login
            </Button>
          </div>
        </div>

        {/* Dynamic Features Showcase */}
        <div id="features" style={{ marginTop: 100, width: '100%', maxWidth: 1000 }}>
          <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 32, fontWeight: 800, color: C.dark, marginBottom: 40 }}>
            Why choose <span style={{ color: C.indigo }}>BillCraft?</span>
          </h2>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {FEATURES.map((f, i) => {
              const isActive = i === activeFeature;
              return (
                <Card key={i} style={{ 
                  flex: isActive ? 1.5 : 1, 
                  background: isActive ? `linear-gradient(135deg, ${C.indigo}, ${C.pink})` : 'white',
                  color: isActive ? 'white' : C.dark,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: isActive ? 'flex-start' : 'center',
                  textAlign: isActive ? 'left' : 'center',
                  cursor: 'pointer'
                }} onClick={() => setActiveFeature(i)}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: isActive ? 22 : 16, fontWeight: 800, marginBottom: 8, fontFamily: 'Bricolage Grotesque, sans-serif', color: isActive ? 'white' : C.dark }}>{f.title}</h3>
                  {isActive && <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5 }}>{f.desc}</p>}
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer / Contact */}
      <footer id="contact" style={{ background: 'white', padding: '60px 40px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800 }}>⚡</div>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 800, color: C.dark }}>BillCraft Pro Suite</span>
          </div>
          <p style={{ color: C.light, fontSize: 13, marginBottom: 20 }}>Empowering businesses worldwide since 2026.</p>
          <div style={{ color: C.gray, fontSize: 13 }}>
            <strong>Support:</strong> <a href="mailto:support@billcraft.com" style={{ color: C.indigo, textDecoration: 'none' }}>support@billcraft.com</a> <br/>
            <strong>Hotline:</strong> 1800-BILL-PRO
          </div>
        </div>
        
        <div style={{ background: C.bg, padding: 24, borderRadius: 16, width: 300 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 12 }}>Need help?</h4>
          <p style={{ fontSize: 12, color: C.gray, marginBottom: 16, lineHeight: 1.5 }}>Our support team is available 24/7 to assist you with onboarding and custom feature requests.</p>
          <Button variant="ghost" style={{ width: '100%', justifyContent: 'center', background: 'white' }}>Contact Support</Button>
        </div>
      </footer>
    </div>
  );
}
