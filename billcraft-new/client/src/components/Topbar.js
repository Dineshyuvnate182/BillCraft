import { C } from './UI';

const TITLES = {
  dashboard:  [['Good Morning, ','#6366F1'],['Dinesh 👋','#1E2235']],
  store:      [['Format ','#6366F1'],['Marketplace ','#EC4899'],['🛍️','#1E2235']],
  myformats:  [['My ','#6366F1'],['Formats ','#EC4899'],['🎨','#1E2235']],
  products:   [['Product ','#6366F1'],['Catalog ','#EC4899'],['📦','#1E2235']],
  createbill: [['⚡ Smart ','#6366F1'],['Bill ','#EC4899'],['Generator','#1E2235']],
  history:    [['Bill ','#6366F1'],['History ','#EC4899'],['📊','#1E2235']],
};

export default function Topbar({ activePage }) {
  const parts = TITLES[activePage] || TITLES.dashboard;
  return (
    <header style={{
      padding:'16px 30px',background:'rgba(255,255,255,.9)',
      backdropFilter:'blur(20px)',borderBottom:`1px solid ${C.border}`,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      position:'sticky',top:0,zIndex:20,
      boxShadow:'0 2px 18px rgba(99,102,241,.07)',
    }}>
      <div>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif',fontSize:20,fontWeight:800,letterSpacing:'-0.4px' }}>
          {parts.map(([text,color],i) => <span key={i} style={{ color }}>{text}</span>)}
        </div>
        <div style={{ fontSize:11.5,color:C.light,marginTop:2,fontWeight:500 }}>
          {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        </div>
      </div>
      <div style={{ display:'flex',gap:10,alignItems:'center' }}>
        <div style={{ padding:'8px 16px',background:'linear-gradient(90deg,#EEF0FB,#F3F0FF)',border:`1px solid #C7D2FE`,borderRadius:10,fontSize:12,color:C.indigo,fontWeight:700 }}>
          📅 {new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
        </div>
        <div style={{ width:38,height:38,borderRadius:'50%',background:'white',border:`1.5px solid ${C.indigoL}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16,boxShadow:'0 2px 8px rgba(99,102,241,.1)',position:'relative' }}>
          🔔
          <div style={{ position:'absolute',top:6,right:7,width:7,height:7,background:C.red,borderRadius:'50%',border:'2px solid white' }} />
        </div>
      </div>
    </header>
  );
}
