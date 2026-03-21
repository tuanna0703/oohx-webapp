'use client';
import Link from 'next/link';
import { owners, screens, iconSVG } from '@/lib/data';
import { toast } from '@/components/Toast';

export default function OwnersPage() {
  const ownerList = Object.values(owners);

  return (
    <>
      {/* HERO */}
      <div className="owners-dir-hero">
        <div className="container owners-dir-inner">
          <div className="label" style={{color:'rgba(255,255,255,.45)'}}>Media Owners</div>
          <div style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,color:'#fff',letterSpacing:'-1px',maxWidth:'580px',lineHeight:1.1}}>
            Các công ty sở hữu màn hình<br/>trên OOHX
          </div>
          <div style={{fontSize:'16px',color:'rgba(255,255,255,.55)',marginTop:'12px',maxWidth:'480px'}}>
            Khám phá hệ thống màn hình của từng media owner — xem inventory, phủ sóng và thông tin liên hệ trực tiếp.
          </div>
          <div className="owners-dir-search mt-24">
            <input type="text" placeholder="Tìm kiếm media owner..."/>
            <button className="btn btn-white" style={{flexShrink:0}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Stats bar */}
          <div style={{display:'flex',gap:'32px',padding:'20px 24px',background:'var(--g50)',borderRadius:'var(--r)',marginBottom:'36px',flexWrap:'wrap'}}>
            <div><div style={{fontSize:'22px',fontWeight:800,color:'var(--blue)'}}>5</div><div style={{fontSize:'12px',color:'var(--g500)'}}>Media owners</div></div>
            <div style={{width:'1px',background:'var(--g200)'}}></div>
            <div><div style={{fontSize:'22px',fontWeight:800,color:'var(--navy)'}}>823</div><div style={{fontSize:'12px',color:'var(--g500)'}}>Tổng màn hình</div></div>
            <div style={{width:'1px',background:'var(--g200)'}}></div>
            <div><div style={{fontSize:'22px',fontWeight:800,color:'var(--navy)'}}>34</div><div style={{fontSize:'12px',color:'var(--g500)'}}>Tỉnh thành</div></div>
            <div style={{width:'1px',background:'var(--g200)'}}></div>
            <div><div style={{fontSize:'22px',fontWeight:800,color:'var(--navy)'}}>5</div><div style={{fontSize:'12px',color:'var(--g500)'}}>Loại venue</div></div>
          </div>

          <div className="owner-cards-grid">
            {ownerList.map(o => {
              const myScreens = screens.filter(s => s.owner === o.slug);
              const svgPath = iconSVG[o.venues[0]] || '';
              return (
                <Link key={o.slug} href={`/owners/${o.slug}`} className="ow-card">
                  <div className="ow-card-cover" style={{background:o.coverBg}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" dangerouslySetInnerHTML={{__html:svgPath}}/>
                    <div className="ow-card-logo" style={{fontSize:'22px'}}>{o.emoji}</div>
                  </div>
                  <div className="ow-card-body">
                    <div className="ow-card-name">{o.name}</div>
                    <div className="ow-card-tagline">{o.tagline}</div>
                    <div className="ow-card-stats">
                      <div className="ow-stat"><div className="ow-stat-num">{o.screens}</div><div className="ow-stat-label">Màn hình</div></div>
                      <div className="ow-stat"><div className="ow-stat-num">{o.cities}</div><div className="ow-stat-label">Tỉnh thành</div></div>
                      <div className="ow-stat"><div className="ow-stat-num">{o.founded}</div><div className="ow-stat-label">Thành lập</div></div>
                    </div>
                    <div className="ow-card-venues">
                      {o.venues.map(v => <span key={v} className="ow-venue-tag">{v}</span>)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA for new media owners */}
      <section className="section section-alt">
        <div className="container" style={{textAlign:'center'}}>
          <div className="label">Bạn là Media Owner?</div>
          <div className="h2 mt-8">Listing màn hình của bạn lên <span className="text-blue">OOHX</span></div>
          <div className="lead mt-12" style={{margin:'0 auto'}}>Tiếp cận hàng trăm brand và agency đang tìm kiếm inventory DOOH tại Việt Nam.</div>
          <div style={{display:'flex',gap:'10px',justifyContent:'center',marginTop:'28px',flexWrap:'wrap'}}>
            <button className="btn btn-primary btn-lg" onClick={() => toast('Chuyển đến Publisher Panel...', 'info')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Đăng ký Media Owner
            </button>
            <Link href="/contact" className="btn btn-outline btn-lg">Liên hệ tư vấn</Link>
          </div>
        </div>
      </section>
    </>
  );
}
