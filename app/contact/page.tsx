'use client';
import { toast } from '@/components/Toast';

export default function ContactPage() {
  return (
    <>
      <div style={{background:'var(--navy)',padding:'56px 0',textAlign:'center'}}>
        <div className="container">
          <div className="label" style={{color:'rgba(255,255,255,.45)'}}>Liên hệ</div>
          <div style={{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,color:'#fff',letterSpacing:'-1px'}}>Hãy nói chuyện</div>
        </div>
      </div>

      <div className="container">
        <div className="contact-grid">
          <div>
            <div className="h3 mb-16">Chúng tôi ở đây để giúp</div>
            <div className="lead mb-24">Dù bạn là brand muốn tự chạy hay agency cần hỗ trợ phức tạp, đội ngũ OOHX luôn sẵn sàng.</div>
            <div className="ci">
              <div className="ci-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <div><div className="ci-label">Email</div><div className="ci-val">hello@oohx.net</div></div>
            </div>
            <div className="ci">
              <div className="ci-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.34 2 2 0 0 1 3.6 2.11l3-.04a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.93-1.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div><div className="ci-label">Hotline</div><div className="ci-val">+84 28 1234 5678</div></div>
            </div>
            <div className="ci">
              <div className="ci-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <div><div className="ci-label">Địa chỉ</div><div className="ci-val">Tầng 8, 141 Điện Biên Phủ<br/>Quận 1, TP. Hồ Chí Minh</div></div>
            </div>
          </div>
          <div className="rfp-card">
            <div className="h3 mb-20">Gửi tin nhắn</div>
            <div className="form-group"><div className="form-label">Họ tên</div><input className="form-control" placeholder="Nguyễn Văn A"/></div>
            <div className="form-group"><div className="form-label">Email</div><input className="form-control" placeholder="you@company.com"/></div>
            <div className="form-group"><div className="form-label">Nội dung</div><textarea className="form-control" placeholder="Tôi cần hỗ trợ về..."></textarea></div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={() => toast('Tin nhắn đã gửi! ✓', 'success')}>Gửi tin nhắn</button>
          </div>
        </div>
      </div>
    </>
  );
}
