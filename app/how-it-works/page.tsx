import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <>
      <div className="hiw-hero">
        <div className="container hiw-hero-inner" style={{textAlign:'center'}}>
          <div className="label" style={{color:'rgba(255,255,255,.45)'}}>Quy trình</div>
          <div style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:800,color:'#fff',letterSpacing:'-1.5px',lineHeight:1.1}}>Chạy DOOH campaign<br/>chưa bao giờ dễ hơn</div>
          <div style={{fontSize:'17px',color:'rgba(255,255,255,.55)',marginTop:'14px'}}>Từ ý tưởng đến go live trong 5 phút.</div>
        </div>
      </div>

      <div style={{padding:'72px 0'}}>
        <div className="container hiw-steps">
          <div className="hiw-step">
            <div>
              <div className="hiw-big-num">01</div>
              <div className="hiw-title">Tìm màn hình phù hợp</div>
              <div className="hiw-desc">Browse hơn 1,200 màn hình LCD, LED và Billboard trên toàn Việt Nam. Filter theo thành phố, venue, định dạng, traffic và ngân sách.</div>
              <div className="hiw-checks">
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Map view và list view</div>
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Ảnh thực tế + thống kê traffic</div>
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>6 loại venue OpenOOH</div>
              </div>
            </div>
            <div className="hiw-visual"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
          </div>

          <div className="hiw-step flip">
            <div>
              <div className="hiw-big-num">02</div>
              <div className="hiw-title">Plan và ước tính ngân sách</div>
              <div className="hiw-desc">Thêm màn hình vào Media Planner. Hệ thống tự tính tổng impressions, unique reach và ngân sách dự kiến theo CPM thực tế.</div>
              <div className="hiw-checks">
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Tính reach real-time</div>
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Xuất PDF proposal</div>
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Gửi plan cho sales hỗ trợ</div>
              </div>
            </div>
            <div className="hiw-visual"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          </div>

          <div className="hiw-step">
            <div>
              <div className="hiw-big-num">03</div>
              <div className="hiw-title">Submit và Go Live</div>
              <div className="hiw-desc">Upload creative, chọn thời gian và submit. Campaign review trong 24h. Theo dõi impressions và spend real-time ngay trên dashboard.</div>
              <div className="hiw-checks">
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Review creative nhanh</div>
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Real-time reporting</div>
                <div className="hiw-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Pause/resume anytime</div>
              </div>
            </div>
            <div className="hiw-visual"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
          </div>
        </div>
      </div>

      <section className="section-alt section" style={{textAlign:'center'}}>
        <div className="container">
          <div className="h2">Bắt đầu <span className="text-blue">ngay hôm nay</span></div>
          <div className="lead mt-8" style={{textAlign:'center',margin:'0 auto'}}>Đăng ký miễn phí — không cần thẻ tín dụng.</div>
          <div style={{display:'flex',gap:'10px',justifyContent:'center',marginTop:'28px',flexWrap:'wrap'}}>
            <Link href="/register" className="btn btn-primary btn-lg">Đăng ký miễn phí</Link>
            <Link href="/request" className="btn btn-outline btn-lg">Gửi brief cho sales</Link>
          </div>
        </div>
      </section>
    </>
  );
}
