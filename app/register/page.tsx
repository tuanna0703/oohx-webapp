'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toast';

export default function RegisterPage() {
  const router = useRouter();

  function handleRegister() {
    toast('Tài khoản đã tạo! Kiểm tra email ✓', 'success');
    setTimeout(() => router.push('/browse'), 800);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-left-h">Bắt đầu plan DOOH campaign <span className="grad">ngay hôm nay</span></div>
          <div className="auth-left-p">Miễn phí, không cần thẻ tín dụng. Đăng ký và browse inventory ngay.</div>
          <div className="auth-benefit mt-24">
            <div className="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div className="ab-text">Miễn phí — không phí đăng ký hay ẩn phí</div>
          </div>
          <div className="auth-benefit">
            <div className="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
            <div className="ab-text">Xem giá và plan trong vòng 5 phút</div>
          </div>
          <div className="auth-benefit">
            <div className="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
            <div className="ab-text">Hỗ trợ từ đội ngũ OOHX khi cần</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-title">Đăng ký</div>
        <div className="auth-sub">Tạo tài khoản OOHX miễn phí</div>
        <div className="form-row">
          <div className="form-group"><div className="form-label">Họ tên <span className="req">*</span></div><input className="form-control" placeholder="Nguyễn Văn A"/></div>
          <div className="form-group"><div className="form-label">Email <span className="req">*</span></div><input className="form-control" type="email" placeholder="you@company.com"/></div>
        </div>
        <div className="form-group"><div className="form-label">Tên công ty</div><input className="form-control" placeholder="Công ty ABC"/></div>
        <div className="form-group"><div className="form-label">Bạn là</div>
          <select className="form-control">
            <option>Brand / Marketer</option>
            <option>Media Agency</option>
            <option>Freelancer</option>
          </select>
        </div>
        <div className="form-group"><div className="form-label">Mật khẩu <span className="req">*</span></div><input className="form-control" type="password" placeholder="••••••••"/></div>
        <button className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={handleRegister}>Tạo tài khoản →</button>
        <div style={{fontSize:'12px',color:'var(--g500)',textAlign:'center',marginTop:'10px'}}>Bằng cách đăng ký, bạn đồng ý với <a style={{color:'var(--blue)',cursor:'pointer'}}>Terms</a> &amp; <a style={{color:'var(--blue)',cursor:'pointer'}}>Privacy</a>.</div>
        <div className="auth-switch mt-8">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></div>
      </div>
    </div>
  );
}
