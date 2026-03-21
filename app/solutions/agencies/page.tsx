import Link from 'next/link';

export default function AgenciesPage() {
  const useCases = [
    { title:'Media Planner Tool', desc:'Chọn screens, estimate reach/budget, xuất PDF proposal để gửi client.', path:<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></> },
    { title:'Multi-client Dashboard', desc:'Quản lý nhiều brand trong một account. Switch client context dễ dàng.', path:<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></> },
    { title:'Agency Pricing', desc:'Volume discount và net pricing riêng cho agency partner.', path:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
    { title:'Dedicated Support', desc:'Account manager riêng, hỗ trợ plan và propose, coordination với media owner.', path:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
    { title:'White-label Reports', desc:'Báo cáo performance export với logo agency để gửi thẳng cho client.', path:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></> },
    { title:'Fast Activation', desc:'Submit campaign và nhận xác nhận trong 24h. Campaign live đúng deadline.', path:<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></> },
  ];

  return (
    <>
      <div className="sol-hero" style={{background:'linear-gradient(135deg,#0D0F2B,#1a1d3d)'}}>
        <div className="container sol-hero-inner">
          <div className="label" style={{color:'rgba(255,255,255,.45)'}}>For Agencies</div>
          <div style={{fontSize:'clamp(30px,4vw,48px)',fontWeight:800,color:'#fff',letterSpacing:'-1px',maxWidth:'560px',lineHeight:1.1}}>Tools dành riêng cho media planner</div>
          <div style={{fontSize:'17px',color:'rgba(255,255,255,.55)',marginTop:'14px',maxWidth:'460px'}}>Plan, propose và execute DOOH campaigns cho client nhanh hơn bao giờ hết.</div>
          <div style={{display:'flex',gap:'10px',marginTop:'28px',flexWrap:'wrap'}}>
            <Link href="/request" className="btn btn-white btn-lg">Liên hệ sales</Link>
            <Link href="/planner" className="btn btn-lg" style={{color:'#fff',border:'1.5px solid rgba(255,255,255,.35)',background:'transparent'}}>Thử Media Planner</Link>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="use-cases">
            {useCases.map(uc => (
              <div key={uc.title} className="uc">
                <div className="uc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{uc.path}</svg></div>
                <div className="uc-title">{uc.title}</div>
                <div className="uc-desc">{uc.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
