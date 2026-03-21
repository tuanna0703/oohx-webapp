import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <div className="about-hero">
        <div className="container">
          <div style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:800,letterSpacing:'-1.5px'}}>Về OOHX</div>
          <div style={{fontSize:'17px',color:'rgba(255,255,255,.7)',marginTop:'12px',maxWidth:'560px',marginLeft:'auto',marginRight:'auto'}}>DOOH marketplace đầu tiên tại Việt Nam — kết nối brand với 1,200+ màn hình kỹ thuật số.</div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="mission-grid">
            <div>
              <div className="label">Sứ mệnh</div>
              <div className="h2">DOOH cho mọi<br/><span className="text-blue">quy mô ngân sách</span></div>
              <div className="lead mt-12">OOHX được xây dựng bởi AdTRUE — công ty DOOH media tại Việt Nam với hơn 5 năm kinh nghiệm. Chúng tôi tin rằng quảng cáo DOOH nên dễ tiếp cận, minh bạch về giá và đo lường được.</div>
              <div className="lead mt-8">Thông qua TapON SSP, OOHX kết nối hệ thống màn hình của các media owner trên khắp Việt Nam thành một marketplace thống nhất.</div>
            </div>
            <div className="mission-stats">
              <div className="m-stat"><div className="m-stat-num">12,000+</div><div className="m-stat-label">Màn hình</div></div>
              <div className="m-stat"><div className="m-stat-num">34</div><div className="m-stat-label">Tỉnh thành</div></div>
              <div className="m-stat"><div className="m-stat-num">50+</div><div className="m-stat-label">Media owners</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header center mb-40">
            <div className="h2">Media Owner <span className="text-blue">Partners</span></div>
          </div>
          <div className="owners-grid">
            {[
              { name:'Vingroup Retail', count:'320 screens', path:<><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></> },
              { name:'The Coffee House', count:'180 screens', path:<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></> },
              { name:'AdTRUE Outdoor', count:'95 screens', path:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
              { name:'AEON Vietnam', count:'140 screens', path:<><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/></> },
              { name:'Savills Office', count:'88 screens', path:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
              { name:'Metro Transit', count:'65 screens', path:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></> },
              { name:'Petrolimex', count:'212 screens', path:<><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></> },
              { name:'FV Hospital', count:'48 screens', path:<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></> },
            ].map(o => (
              <div key={o.name} className="owner-card">
                <div className="oc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{o.path}</svg></div>
                <div className="oc-name">{o.name}</div>
                <div className="oc-count">{o.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
