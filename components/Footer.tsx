import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Image src="/logo_footer.png" alt="OOHX" width={110} height={30} style={{ width: 'auto', height: '20px' }} />
            <div className="footer-brand-desc">Vietnam&apos;s leading DOOH marketplace. Kết nối brand với màn hình kỹ thuật số trên khắp Việt Nam. Powered by TapON SSP · AdTRUE.</div>
          </div>
          <div>
            <div className="footer-col-title">Inventory</div>
            <Link href="/browse" className="footer-link">Browse Screens</Link>
            <div className="footer-link">Hà Nội</div>
            <div className="footer-link">TP. Hồ Chí Minh</div>
            <div className="footer-link">Đà Nẵng</div>
          </div>
          <div>
            <div className="footer-col-title">Solutions</div>
            <Link href="/solutions/brands" className="footer-link">For Brands</Link>
            <Link href="/solutions/agencies" className="footer-link">For Agencies</Link>
            <Link href="/how-it-works" className="footer-link">How it Works</Link>
            <Link href="/request" className="footer-link">Get a Proposal</Link>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <Link href="/about" className="footer-link">About OOHX</Link>
            <Link href="/contact" className="footer-link">Liên hệ</Link>
            <Link href="/owners" className="footer-link">Media Owners</Link>
            <div className="footer-link">Privacy &amp; Terms</div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 OOHX · oohx.net</div>
          <div className="footer-tagline">Vietnam&apos;s DOOH Marketplace</div>
        </div>
      </div>
    </footer>
  );
}
