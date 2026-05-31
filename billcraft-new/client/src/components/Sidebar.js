import { C } from './UI';
import { useAuth } from '../context/AuthContext';

const USER_NAV = [
  { page: 'dashboard',  icon: '◈', label: 'Dashboard'    },
  { page: 'store',      icon: '⊕', label: 'Format Store'  },
  { page: 'myformats',  icon: '⊡', label: 'My Formats'    },
  { page: 'products',   icon: '⊟', label: 'Products'      },
  { page: 'createbill', icon: '✦', label: 'Create Bill'   },
  { page: 'history',    icon: '≡', label: 'Bill History'  },
];

const ADMIN_NAV = [
  { page: 'admin', icon: '⎔', label: 'Admin Panel', highlight: true },
];

export default function Sidebar({ activePage, setPage }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const NAV = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <aside style={{
      width: 252,
      background: isAdmin ? 'linear-gradient(180deg,#1E2235 0%,#252B45 100%)' : '#fff',
      flexShrink: 0,
      borderRight: isAdmin ? 'none' : `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      boxShadow: isAdmin ? '4px 0 28px rgba(0,0,0,.25)' : '4px 0 28px rgba(99,102,241,.07)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* bg blobs */}
      {!isAdmin && <>
        <div style={{ position:'absolute',top:-70,right:-70,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,#EEF0FB 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-50,left:-50,width:140,height:140,borderRadius:'50%',background:'radial-gradient(circle,#FDF2F8 0%,transparent 70%)',pointerEvents:'none' }} />
      </>}

      {/* Logo */}
      <div style={{ padding: '24px 20px 18px', borderBottom: isAdmin ? '1px solid rgba(255,255,255,.08)' : `1px solid ${C.indigoL}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width:42,height:42,borderRadius:13,
            background:'linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:20,boxShadow:'0 6px 20px rgba(99,102,241,.38)',
          }} className="icon-bob">⚡</div>
          <div>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:20,letterSpacing:'-0.5px' }}>
              <span style={{ color:C.indigo }}>Bill</span><span style={{ color:C.pink }}>Craft</span>
            </div>
            <div style={{ fontSize:9,color:isAdmin?'#6B7280':C.light,letterSpacing:'2.5px',textTransform:'uppercase',fontWeight:600 }}>
              {isAdmin ? 'Admin Portal' : 'Pro Suite v2'}
            </div>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding:'14px 20px', borderBottom: isAdmin ? '1px solid rgba(255,255,255,.08)' : `1px solid ${C.indigoL}` }}>
        <div style={{ display:'flex',alignItems:'center',gap:11 }}>
          <div style={{
            width:36,height:36,borderRadius:'50%',flexShrink:0,
            background: isAdmin ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : 'linear-gradient(135deg,#6366F1,#EC4899)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:14,fontWeight:800,color:'white',boxShadow:'0 4px 14px rgba(99,102,241,.3)',
          }}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:700,fontSize:13.5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
              <span style={{ color: isAdmin ? '#A5B4FC' : C.indigo }}>{user?.name?.split(' ')[0]}</span>{' '}
              <span style={{ color: isAdmin ? '#E5E7EB' : C.dark }}>{user?.name?.split(' ').slice(1).join(' ')}</span>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color: isAdmin ? '#F59E0B' : C.amber }}>
              {isAdmin ? '🔐 Administrator' : '⭐ Pro Plan'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'14px 10px',flex:1 }}>
        <div style={{ fontSize:9.5, color: isAdmin?'#4B5563':'#C8CFE8', letterSpacing:'2px',textTransform:'uppercase',padding:'0 10px',marginBottom:10,fontWeight:700 }}>
          {isAdmin ? 'Control Panel' : 'Main Menu'}
        </div>
        {NAV.map(item => {
          const active = activePage === item.page;
          return (
            <div key={item.page} className="nav-item"
              onClick={() => setPage(item.page)}
              style={{
                display:'flex',alignItems:'center',gap:11,padding:'10px 12px',borderRadius:11,
                cursor:'pointer',marginBottom:3,transition:'all .18s',
                background: active
                  ? (isAdmin ? 'linear-gradient(90deg,rgba(99,102,241,.25),rgba(139,92,246,.15))' : 'linear-gradient(90deg,#EEF0FB,#F3F0FF)')
                  : 'transparent',
                color: active ? (isAdmin ? '#A5B4FC' : C.indigo) : (isAdmin ? '#6B7280' : C.gray),
                fontWeight: active ? 700 : 500, fontSize:13.5, position:'relative',
                border: active && isAdmin ? '1px solid rgba(99,102,241,.3)' : '1px solid transparent',
              }}>
              <div style={{
                position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',
                width:4,height: active?22:0,borderRadius:'0 3px 3px 0',
                background:'linear-gradient(180deg,#6366F1,#EC4899)',
                opacity:active?1:0,transition:'all .2s',
              }} />
              <span style={{ fontSize:15 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* Bottom area */}
      <div style={{ padding:'10px 10px 16px' }}>
        {!isAdmin && (
          <div style={{
            background:'linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)',
            borderRadius:14,padding:'14px 16px',color:'white',
            boxShadow:'0 8px 28px rgba(99,102,241,.28)',marginBottom:10,
          }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontWeight:800,fontSize:12,marginBottom:4 }}>🚀 Go Enterprise</div>
            <div style={{ fontSize:10.5,opacity:.85,marginBottom:10,lineHeight:1.5 }}>GST reports · WhatsApp bills · Analytics</div>
            <button style={{ background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.35)',borderRadius:8,padding:'7px 0',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',width:'100%' }}>
              Upgrade Now →
            </button>
          </div>
        )}
        {isAdmin && (
          <div style={{ background:'rgba(99,102,241,.12)',borderRadius:12,padding:'12px 14px',marginBottom:10,border:'1px solid rgba(99,102,241,.2)' }}>
            <div style={{ fontSize:10,color:'#6B7280',marginBottom:4,fontWeight:700 }}>PLATFORM STATUS</div>
            <div style={{ fontSize:12,color:'#A5B4FC',lineHeight:1.6 }}>⚡ All systems active<br/>🔐 Secure admin session</div>
          </div>
        )}
        <button onClick={logout} style={{
          width:'100%',padding:'9px',borderRadius:10,fontSize:12,fontWeight:700,cursor:'pointer',
          background: isAdmin ? 'rgba(239,68,68,.15)' : C.redL,
          border: isAdmin ? '1.5px solid rgba(239,68,68,.3)' : '1.5px solid #FCA5A5',
          color: isAdmin ? '#F87171' : C.red,
        }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
