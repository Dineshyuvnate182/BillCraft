import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GLOBAL_STYLES, C } from './components/UI';
import Sidebar from './components/Sidebar';
import Topbar  from './components/Topbar';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import LandingPage from './pages/LandingPage';
import Dashboard    from './pages/Dashboard';
import { StorePage, MyFormatsPage } from './pages/FormatPages';
import ProductsPage from './pages/ProductsPage';
import CreateBillPage from './pages/CreateBillPage';
import HistoryPage  from './pages/HistoryPage';
import AdminPage    from './pages/AdminPage';

// Inject global styles
const styleEl = document.createElement('style');
styleEl.textContent = GLOBAL_STYLES;
document.head.appendChild(styleEl);

function AppShell() {
  const { user } = useAuth();
  const [authPage,   setAuthPage]   = useState('landing');
  const [activePage, setActivePage] = useState('dashboard');

  // ensure activePage sets properly when user logs in
  useEffect(() => {
    if (user) setActivePage(user.role === 'admin' ? 'admin' : 'dashboard');
  }, [user]);

  // listen for custom event from child pages (e.g. store CTA)
  useEffect(() => {
    const handler = (e) => setActivePage(e.detail);
    window.addEventListener('setPage', handler);
    return () => window.removeEventListener('setPage', handler);
  }, []);

  if (!user) {
    if (authPage === 'landing') return <LandingPage onNavigate={setAuthPage} />;
    if (authPage === 'login') return <LoginPage onNavigate={setAuthPage} />;
    if (authPage === 'register') return <RegisterPage onNavigate={setAuthPage} />;
  }

  const pages = {
    dashboard:  <Dashboard   setPage={setActivePage} />,
    store:      <StorePage   setPage={setActivePage} />,
    myformats:  <MyFormatsPage setPage={setActivePage} />,
    products:   <ProductsPage />,
    createbill: <CreateBillPage />,
    history:    <HistoryPage />,
    admin:      <AdminPage />,
  };

  const defaultPage = user?.role === 'admin' ? 'admin' : 'dashboard';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'DM Sans',sans-serif" }}>
      <Sidebar activePage={activePage} setPage={setActivePage} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Topbar activePage={activePage} />
        <main style={{ flex:1, overflow:'auto', padding:'26px 30px' }}>
          {pages[activePage] || pages.dashboard}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
