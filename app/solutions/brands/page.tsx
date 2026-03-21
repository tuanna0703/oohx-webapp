import Link from 'next/link';

export default function BrandsPage() {
  const useCases = [
    { title:'Brand Awareness', desc:'Phủ sóng thương hiệu tại các điểm traffic cao — TTTM, đường lớn, convenience store.', path:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
    { title:'Event & Launch', desc:'Khuếch đại cho product launch, event, sale season với targeting theo thành phố và venue.', path:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
    { title:'Local Targeting', desc:'Campaign hyperlocal — target đúng quận, đúng venue type gần cửa hàng.', path:<><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
    { title:'Drive to Store', desc:'Màn hình gần cửa hàng tăng foot traffic — lý tưởng cho F&B, retail, pharmacy.', path:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
    { title:'Performance Campaign', desc:'Đo lường impressions, plays và reach real-time. Proof of performance sau mỗi campaign.', path:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
    { title:'Omnichannel', desc:'Kết hợp DOOH với digital để tạo omnichannel experience nhất quán cho audience.', path:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
  ];

  return (
    <>
      <div className="sol-hero">
        <div className="container sol-hero-inner">
          <div className="label" style={{color:'rgba(255,255,255,.45)'}}>For Brands</div>
          <div style={{fontSize:'clamp(30px,4vw,48px)',fontWeight:800,color:'#fff',letterSpacing:'-1px',maxWidth:'560px',lineHeight:1.1}}>Đưa thương hiệu ra ngoài thế giới thực</div>
          <div style={{fontSize:'17px',color:'rgba(255,255,255,.55)',marginTop:'14px',maxWidth:'460px'}}>Self-service DOOH — không cần agency, không cần kinh nghiệm.</div>
          <div style={{display:'flex',gap:'10px',marginTop:'28px',flexWrap:'wrap'}}>
            <Link href="/register" className="btn btn-white btn-lg">Bắt đầu miễn phí</Link>
            <Link href="/browse" className="btn btn-lg" style={{color:'#fff',border:'1.5px solid rgba(255,255,255,.35)',background:'transparent'}}>Browse Screens</Link>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header center mb-40">
            <div className="h2">Use cases <span className="text-blue">phổ biến</span></div>
          </div>
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
