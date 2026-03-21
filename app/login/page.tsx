'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();

  function handleLogin() {
    toast('Đăng nhập thành công! ✓', 'success');
    setTimeout(() => router.push('/planner'), 800);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-left-h">Xem giá, plan campaign và <span className="grad">go live</span></div>
          <div className="auth-left-p">Đăng nhập để truy cập đầy đủ CPM, Media Planner và Campaign Dashboard.</div>
          <div className="auth-benefit mt-24">
            <div className="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
            <div className="ab-text">Xem giá CPM đầy đủ của 1,200+ màn hình</div>
          </div>
          <div className="auth-benefit">
            <div className="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></div>
            <div className="ab-text">Dùng Media Planner tính reach và ngân sách</div>
          </div>
          <div className="auth-benefit">
            <div className="ab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
            <div className="ab-text">Theo dõi campaign performance real-time</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-title">Đăng nhập</div>
        <div className="auth-sub">Chào mừng trở lại với OOHX</div>
        <div className="form-group"><div className="form-label">Email</div><input className="form-control" type="email" placeholder="you@company.com"/></div>
        <div className="form-group"><div className="form-label">Mật khẩu</div><input className="form-control" type="password" placeholder="••••••••"/></div>
        <div style={{textAlign:'right',marginBottom:'18px'}}><a style={{fontSize:'13px',color:'var(--blue)',cursor:'pointer'}}>Quên mật khẩu?</a></div>
        <button className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center'}} onClick={handleLogin}>Đăng nhập</button>
        <div className="auth-switch mt-16">Chưa có tài khoản? <Link href="/register">Đăng ký miễn phí</Link></div>
      </div>
    </div>
  );
}
