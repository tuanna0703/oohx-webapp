'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [regions, setRegions] = useState<string[]>(['TP.HCM']);

  function toggleRegion(r: string) {
    setRegions(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);
  }

  return (
    <>
      <div className="rfp-hero">
        <div className="container">
          <div className="label" style={{color:'rgba(255,255,255,.45)',textAlign:'center'}}>Managed Service</div>
          <h1 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,color:'#fff',letterSpacing:'-1px',textAlign:'center'}}>Gửi brief, nhận <span style={{color:'#818CF8'}}>proposal</span></h1>
          <p style={{fontSize:'16px',color:'rgba(255,255,255,.55)',marginTop:'12px',textAlign:'center'}}>Đội ngũ OOHX gửi báo giá chi tiết trong vòng 24h làm việc.</p>
        </div>
      </div>

      <div style={{background:'var(--g50)',padding:'56px 0'}}>
        <div className="container-sm">
          {!submitted ? (
            <div className="rfp-card" id="rfp-form">
              <div className="form-row">
                <div className="form-group"><div className="form-label">Họ tên <span className="req">*</span></div><input className="form-control" placeholder="Nguyễn Văn A"/></div>
                <div className="form-group"><div className="form-label">Email <span className="req">*</span></div><input type="email" className="form-control" placeholder="you@company.com"/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><div className="form-label">Brand / Sản phẩm <span className="req">*</span></div><input className="form-control" placeholder="Grab, Samsung..."/></div>
                <div className="form-group"><div className="form-label">Ngành hàng</div>
                  <select className="form-control"><option>Chọn ngành...</option><option>FMCG</option><option>Tài chính</option><option>BĐS</option><option>Công nghệ</option><option>Thời trang</option></select>
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Khu vực <span className="req">*</span></div>
                <div className="chips mt-8">
                  {['Hà Nội','TP.HCM','Đà Nẵng','Hải Phòng','Toàn quốc'].map(r => (
                    <div key={r} className={`chip${regions.includes(r) ? ' on' : ''}`} onClick={() => toggleRegion(r)}>{r}</div>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><div className="form-label">Ngân sách dự kiến</div>
                  <select className="form-control"><option>Chọn...</option><option>&lt; 50 triệu</option><option>50–200 triệu</option><option>200–500 triệu</option><option>&gt; 500 triệu</option></select>
                </div>
                <div className="form-group"><div className="form-label">Thời gian</div>
                  <select className="form-control"><option>Chọn...</option><option>1 tuần</option><option>2 tuần</option><option>1 tháng</option><option>2–3 tháng</option></select>
                </div>
              </div>
              <div className="form-group"><div className="form-label">Mô tả brief</div><textarea className="form-control" placeholder="Mục tiêu, đối tượng khách hàng, yêu cầu đặc biệt..."></textarea></div>
              <button className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={() => setSubmitted(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Gửi yêu cầu proposal
              </button>
            </div>
          ) : (
            <div className="rfp-card" id="rfp-success">
              <div className="success-card">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="h3 mt-8">Brief đã được gửi!</div>
                <div className="lead mt-8">Đội ngũ OOHX sẽ liên hệ và gửi proposal trong vòng <strong>24 giờ làm việc</strong>.</div>
                <Link href="/" className="btn btn-primary btn-lg mt-24">Về trang chủ</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
