import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { screens, owners, iconSVG } from '@/lib/data';

const MapDetail = dynamic(() => import('@/components/MapDetail'), { ssr: false });

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return screens.map(s => ({ id: String(s.id) }));
}

export default function ScreenDetailPage({ params }: Props) {
  const screen = screens.find(s => s.id === Number(params.id));
  if (!screen) notFound();

  const owner = owners[screen.owner];
  const svgPath = iconSVG[screen.venue] || '';

  const specRows = [
    { key: 'Kích thước', val: screen.size },
    { key: 'Loại màn', val: `${screen.type} ${screen.venue}` },
    { key: 'Orientation', val: 'Landscape' },
    { key: 'Creative types', val: 'MP4 Video, JPG/PNG Image' },
    { key: 'Spot duration', val: '15 giây' },
    { key: 'Loop length', val: '8 spots / loop (~120s)' },
    { key: 'Weekly traffic', val: `${(screen.weekly / 1000).toFixed(0)},000 lượt` },
    { key: 'Media owner', val: owner?.name || screen.owner },
  ];

  return (
    <div className="container">
      <div className="detail-wrap">
        <div>
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/browse">Browse</Link>
            <span className="breadcrumb-sep">/</span>
            <span style={{color:'var(--navy)'}}>{screen.name}</span>
          </div>

          {/* Photo */}
          <div className={`detail-photo sc-thumb-${screen.thumb}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" dangerouslySetInnerHTML={{__html: svgPath}}/>
            <div style={{position:'absolute',top:'14px',right:'14px'}}><span className="badge badge-green">● Online</span></div>
          </div>

          <h1 className="h2">{screen.name}</h1>
          <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'8px',color:'var(--g500)',fontSize:'14px'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {screen.loc}
          </div>

          <div style={{display:'flex',gap:'8px',marginTop:'14px',flexWrap:'wrap'}}>
            <span className="badge badge-blue">{screen.venue}</span>
            <span className="badge badge-gray">{screen.type}</span>
            <span className="badge badge-gray">Landscape</span>
            <span className="badge badge-gray">15s spot</span>
          </div>

          {/* Specs table */}
          <div className="specs-table">
            {specRows.map(r => (
              <div key={r.key} className="spec-row">
                <div className="spec-key">{r.key}</div>
                <div className={`spec-val${r.key === 'Weekly traffic' ? ' fw-700 text-blue' : ''}`}>{r.val}</div>
              </div>
            ))}
          </div>

          {/* Hours */}
          <div className="mt-24">
            <div className="fw-700" style={{color:'var(--navy)',fontSize:'15px',marginBottom:'14px'}}>Giờ hoạt động</div>
            <div className="hours-grid">
              {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => (
                <div key={d}>
                  <div className="hours-day-label">{d}</div>
                  <div className={`hours-bar${i === 6 ? ' closed' : ''}`}>{i >= 4 ? '6h\n–\n24h' : (i === 6 ? '7h\n–\n22h' : '6h\n–\n23h')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="pricing-card">
            <div className="pricing-section-title">Thông tin đặt mua</div>

            {/* Blurred pricing */}
            <div className="pricing-blur-wrap">
              <div className="pricing-blur">
                <div className="pricing-row"><div className="pricing-label">CPM</div><div><div className="pricing-big">28,000đ</div><div className="pricing-unit">/ 1,000 impressions</div></div></div>
                <div className="pricing-row"><div className="pricing-label">USD CPM</div><div className="pricing-value">~$1.10</div></div>
                <div className="pricing-row"><div className="pricing-label">Min. buy</div><div className="pricing-value">10 spots/ngày</div></div>
              </div>
              <div className="pricing-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2" width="28" height="28"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <div style={{fontSize:'13px',fontWeight:700,color:'var(--navy)',textAlign:'center'}}>Đăng nhập để xem giá<br/>&amp; đặt màn hình</div>
                <Link href="/login" className="btn btn-primary btn-sm mt-8">Đăng nhập</Link>
                <Link href="/register" className="btn btn-ghost btn-sm" style={{color:'var(--blue)'}}>Đăng ký miễn phí</Link>
              </div>
            </div>

            <div className="pricing-row mt-12"><div className="pricing-label">Weekly traffic</div><div className="pricing-value">{screen.weekly.toLocaleString('vi-VN')}</div></div>
            <div className="pricing-row"><div className="pricing-label">Peak hours</div><div className="pricing-value">7–9h · 17–20h</div></div>
            <div className="pricing-row"><div className="pricing-label">Trạng thái</div><div><span className="badge badge-green">● Available</span></div></div>

            <Link href="/request" className="btn btn-primary mt-20" style={{width:'100%',justifyContent:'center'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              Yêu cầu báo giá
            </Link>
            <button className="btn btn-ghost mt-8" style={{width:'100%',justifyContent:'center',color:'var(--blue)'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Lưu màn hình
            </button>
          </div>

          {/* Mini map in sidebar */}
          <MapDetail lat={screen.lat} lng={screen.lng} />
          <div style={{fontSize:'11px',color:'var(--g500)',textAlign:'center',marginTop:'6px'}}>{screen.loc}</div>
        </div>
      </div>
    </div>
  );
}
