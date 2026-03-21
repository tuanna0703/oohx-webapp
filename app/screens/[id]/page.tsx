import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { screens as mockScreens, owners, iconSVG } from '@/lib/data';
import { getScreen } from '@/lib/tapon/inventory';
import { mapScreen } from '@/lib/tapon/mapper';
import type { Screen } from '@/lib/types';

const MapDetail = dynamic(() => import('@/components/MapDetail'), { ssr: false });

interface Props {
  params: { id: string };
}

// Dynamic — data đến từ TapON API (không static generate)
export const dynamic = 'force-dynamic';

async function fetchScreen(id: string): Promise<Screen | null> {
  // 1. Thử TapON API (server-side, không qua /api route)
  if (process.env.TAPON_CLIENT_SECRET) {
    try {
      const raw = await getScreen(id);
      return mapScreen(raw);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 404) return null;
      // Lỗi khác (network, auth) → fallback về mock
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[ScreenDetail] TapON error, falling back to mock:', msg);
    }
  }

  // 2. Fallback: mock data (dev / khi chưa cấu hình API)
  return mockScreens.find(s => s.id === id) ?? null;
}

export default async function ScreenDetailPage({ params }: Props) {
  const screen = await fetchScreen(params.id);
  if (!screen) notFound();

  const owner    = owners[screen.owner];
  const svgPath  = iconSVG[screen.venue] || '';
  const oriLabel = screen.orientation === 'portrait' ? 'Portrait'
                 : screen.orientation === 'square'   ? 'Square'
                 : 'Landscape';

  const specRows = [
    { key: 'Kích thước',     val: screen.size },
    { key: 'Loại màn',       val: `${screen.type} · ${screen.venue}` },
    { key: 'Orientation',    val: oriLabel },
    { key: 'Creative types', val: 'MP4 Video, JPG/PNG Image' },
    { key: 'Spot duration',  val: `${screen.slot_duration_sec} giây` },
    { key: 'Loop length',    val: `${screen.slots_per_loop} spots / loop` },
    { key: 'Weekly traffic', val: screen.weekly > 0 ? `${(screen.weekly / 1000).toFixed(0)},000 lượt` : '—' },
    { key: 'Media owner',    val: screen.owner_name || owner?.name || screen.owner },
  ];

  const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const DAY_KEYS   = ['mon','tue','wed','thu','fri','sat','sun'];

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

          {/* Photo — ảnh thật nếu có, fallback CSS thumb */}
          {screen.photoUrl ? (
            <div className="detail-photo" style={{backgroundImage:`url(${screen.photoUrl})`,backgroundSize:'cover',backgroundPosition:'center'}}>
              <div style={{position:'absolute',top:'14px',right:'14px'}}><span className="badge badge-green">● Online</span></div>
            </div>
          ) : (
            <div className={`detail-photo sc-thumb-${screen.thumb}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" dangerouslySetInnerHTML={{__html: svgPath}}/>
              <div style={{position:'absolute',top:'14px',right:'14px'}}><span className="badge badge-green">● Online</span></div>
            </div>
          )}

          <h1 className="h2">{screen.name}</h1>
          <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'8px',color:'var(--g500)',fontSize:'14px'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {screen.loc}
          </div>

          <div style={{display:'flex',gap:'8px',marginTop:'14px',flexWrap:'wrap'}}>
            <span className="badge badge-blue">{screen.venue}</span>
            <span className="badge badge-gray">{screen.type}</span>
            <span className="badge badge-gray">{oriLabel}</span>
            <span className="badge badge-gray">{screen.slot_duration_sec}s spot</span>
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
              {DAY_LABELS.map((d, i) => {
                const isOpen = screen.operating_hours?.days?.includes(DAY_KEYS[i]);
                const open   = screen.operating_hours?.open  ?? '08:00';
                const close  = screen.operating_hours?.close ?? '22:00';
                return (
                  <div key={d}>
                    <div className="hours-day-label">{d}</div>
                    <div className={`hours-bar${!isOpen ? ' closed' : ''}`}>
                      {isOpen ? `${open}\n–\n${close}` : 'Đóng'}
                    </div>
                  </div>
                );
              })}
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
                {screen.price_per_slot_vnd > 0 ? (
                  <>
                    <div className="pricing-row">
                      <div className="pricing-label">Giá / slot</div>
                      <div>
                        <div className="pricing-big">{(screen.price_per_slot_vnd/1000).toFixed(0)}K đ</div>
                        <div className="pricing-unit">/ {screen.slot_duration_sec}s spot</div>
                      </div>
                    </div>
                    <div className="pricing-row">
                      <div className="pricing-label">Min. booking</div>
                      <div className="pricing-value">{screen.min_booking_days} ngày</div>
                    </div>
                  </>
                ) : (
                  <div className="pricing-row">
                    <div className="pricing-label">CPM</div>
                    <div><div className="pricing-big">28,000đ</div><div className="pricing-unit">/ 1,000 impressions</div></div>
                  </div>
                )}
                <div className="pricing-row"><div className="pricing-label">Loop</div><div className="pricing-value">{screen.slots_per_loop} spots / loop</div></div>
              </div>
              <div className="pricing-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2" width="28" height="28"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <div style={{fontSize:'13px',fontWeight:700,color:'var(--navy)',textAlign:'center'}}>Đăng nhập để xem giá<br/>&amp; đặt màn hình</div>
                <Link href="/login" className="btn btn-primary btn-sm mt-8">Đăng nhập</Link>
                <Link href="/register" className="btn btn-ghost btn-sm" style={{color:'var(--blue)'}}>Đăng ký miễn phí</Link>
              </div>
            </div>

            <div className="pricing-row mt-12">
              <div className="pricing-label">Weekly traffic</div>
              <div className="pricing-value">{screen.weekly > 0 ? screen.weekly.toLocaleString('vi-VN') : '—'}</div>
            </div>
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

          {/* Mini map */}
          <MapDetail lat={screen.lat} lng={screen.lng} />
          <div style={{fontSize:'11px',color:'var(--g500)',textAlign:'center',marginTop:'6px'}}>{screen.loc}</div>
        </div>
      </div>
    </div>
  );
}
