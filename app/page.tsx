'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { screenHref, iconSVG } from '@/lib/data';
import type { InventoryStats, TapOnOwner, VenueTypeNode } from '@/lib/tapon/types';
import type { Screen } from '@/lib/types';

const hsInit = { type: 'all', venue: 'all', loc: 'all' };
const hsLabels: Record<string, Record<string, string>> = {
  type: { all: 'Tất cả định dạng', lcd: 'LCD Screen', led: 'LED Screen', billboard: 'Billboard' },
  loc: { all: 'Toàn quốc' },
};

const FALLBACK_VENUE_TYPES: VenueTypeNode[] = [
  { type: 'mall',    label: 'Retail / Mall',   count: 0, children: [] },
  { type: 'outdoor', label: 'Outdoor',          count: 0, children: [] },
  { type: 'fnb',     label: 'F&B / Coffee',     count: 0, children: [] },
  { type: 'transit', label: 'Transit',          count: 0, children: [] },
  { type: 'office',  label: 'Office',           count: 0, children: [] },
];

/** Flatten cây venue types thành danh sách phẳng để hiển thị chips.
 *  Root nodes được giữ nguyên; nếu root có children thì thêm children vào sau (indent). */
function flattenVenueTypes(nodes: VenueTypeNode[]): VenueTypeNode[] {
  const result: VenueTypeNode[] = []
  for (const node of nodes) {
    result.push(node)
    for (const child of node.children) {
      result.push(child)
    }
  }
  return result
}

export default function HomePage() {
  const router = useRouter();
  const [hsState, setHsState] = useState(hsInit);
  const [hsValues, setHsValues] = useState({ type: 'Tất cả định dạng', venue: 'Tất cả địa điểm', loc: 'Toàn quốc' });
  const [openField, setOpenField] = useState<string | null>(null);
  const [locSearch, setLocSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // ── API data ──────────────────────────────────────────────────────────────
  const [stats, setStats]                   = useState<InventoryStats | null>(null);
  const [venueTypes, setVenueTypes]         = useState<VenueTypeNode[]>(FALLBACK_VENUE_TYPES);
  const [featuredOwners, setFeaturedOwners] = useState<TapOnOwner[]>([]);
  const [featuredScreens, setFeaturedScreens] = useState<Screen[]>([]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpenField(null);
      }
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Fetch stats + venue types + featured owners + featured screens song song
  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()).catch(() => null),
      fetch('/api/venue-types').then(r => r.json()).catch(() => null),
      fetch('/api/owners?featured=true&limit=6').then(r => r.json()).catch(() => null),
      fetch('/api/screens?limit=3&sort=newest').then(r => r.json()).catch(() => null),
    ]).then(([statsData, venueTypesData, ownersData, screensData]) => {
      if (statsData && !statsData.error)     setStats(statsData);
      if (venueTypesData?.data)              setVenueTypes(flattenVenueTypes(venueTypesData.data));
      if (ownersData?.data)                  setFeaturedOwners(ownersData.data);
      if (screensData?.data)                 setFeaturedScreens(screensData.data);
    });
  }, []);

  function toggleField(key: string, e: React.MouseEvent) {
    e.stopPropagation();
    setOpenField(p => p === key ? null : key);
  }

  function selectHs(key: string, val: string, label: string) {
    setHsState(s => ({ ...s, [key]: val }));
    setHsValues(s => ({ ...s, [key]: label }));
    setOpenField(null);
  }

  function doSearch() {
    setOpenField(null);
    const params = new URLSearchParams();
    if (hsState.loc !== 'all')   params.append('city[]',        hsState.loc);
    if (hsState.venue !== 'all') params.append('venue_type[]',  hsState.venue);
    if (hsState.type !== 'all')  params.append('screen_type[]', hsState.type);
    const qs = params.toString();
    router.push(`/browse${qs ? `?${qs}` : ''}`);
  }

  const filteredLocs = (stats?.cities ?? []).filter(c =>
    c.name.toLowerCase().includes(locSearch.toLowerCase())
  );

  // Lookup count theo venue label từ stats API (fallback 0)
  function venueCount(label: string): number {
    return stats?.venues.find(v => v.label === label)?.count ?? 0;
  }

  // Label hiển thị cho venue đang chọn (kể cả "Tất cả")
  const selectedVenueLabel = hsState.venue === 'all'
    ? 'Tất cả địa điểm'
    : (venueTypes.find(v => v.type === hsState.venue)?.label ?? hsState.venue);

  return (
    <>
      {/* ── HOME PAGE ── */}
      <div className="page active" id="page-home">

        {/* HERO */}
        <section className="hero">
          <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
          <div className="hero-grid"></div>
          <div className="hero-glow hero-glow-1"></div>
          <div className="hero-glow hero-glow-2"></div>
          <div className="hero-glow hero-glow-3"></div>

          <svg className="hero-cityscape" viewBox="0 0 1440 220" preserveAspectRatio="none" fill="none">
            <rect x="0" y="120" width="60" height="100" fill="white"/>
            <rect x="20" y="90" width="20" height="130" fill="white"/>
            <rect x="70" y="140" width="50" height="80" fill="white"/>
            <rect x="130" y="60" width="35" height="160" fill="white"/>
            <rect x="125" y="40" width="10" height="20" fill="white"/>
            <rect x="175" y="100" width="55" height="120" fill="white"/>
            <rect x="240" y="130" width="40" height="90" fill="white"/>
            <rect x="290" y="70" width="50" height="150" fill="white"/>
            <rect x="285" y="50" width="12" height="20" fill="white"/>
            <rect x="350" y="110" width="45" height="110" fill="white"/>
            <rect x="405" y="80" width="60" height="140" fill="white"/>
            <rect x="430" y="55" width="12" height="25" fill="white"/>
            <rect x="475" y="120" width="40" height="100" fill="white"/>
            <rect x="525" y="50" width="70" height="170" fill="white"/>
            <rect x="548" y="30" width="14" height="20" fill="white"/>
            <rect x="605" y="100" width="45" height="120" fill="white"/>
            <rect x="660" y="130" width="55" height="90" fill="white"/>
            <rect x="725" y="65" width="40" height="155" fill="white"/>
            <rect x="722" y="45" width="10" height="20" fill="white"/>
            <rect x="775" y="110" width="60" height="110" fill="white"/>
            <rect x="845" y="75" width="50" height="145" fill="white"/>
            <rect x="843" y="55" width="14" height="20" fill="white"/>
            <rect x="905" y="130" width="45" height="90" fill="white"/>
            <rect x="960" y="90" width="55" height="130" fill="white"/>
            <rect x="1025" y="110" width="40" height="110" fill="white"/>
            <rect x="1075" y="55" width="65" height="165" fill="white"/>
            <rect x="1095" y="35" width="12" height="20" fill="white"/>
            <rect x="1150" y="120" width="50" height="100" fill="white"/>
            <rect x="1210" y="80" width="45" height="140" fill="white"/>
            <rect x="1265" y="105" width="60" height="115" fill="white"/>
            <rect x="1335" y="130" width="50" height="90" fill="white"/>
            <rect x="1390" y="70" width="50" height="150" fill="white"/>
            <rect x="0" y="218" width="1440" height="4" fill="white"/>
          </svg>

          <div className="hero-billboards">
            <div className="hb-frame hb-f1">
              <div className="hb-pulse"></div>
              <div className="hb-screen" style={{background:'linear-gradient(135deg,rgba(59,71,240,.4),rgba(107,116,245,.2))'}}>
                <svg viewBox="0 0 80 36" width="80" height="36">
                  <rect x="4" y="4" width="72" height="28" rx="3" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1"/>
                  <rect x="8" y="8" width="30" height="20" rx="2" fill="rgba(255,255,255,.08)"/>
                  <rect x="42" y="8" width="34" height="6" rx="2" fill="rgba(255,255,255,.12)"/>
                  <rect x="42" y="18" width="22" height="4" rx="2" fill="rgba(255,255,255,.08)"/>
                  <rect x="42" y="26" width="16" height="3" rx="2" fill="rgba(59,71,240,.5)"/>
                </svg>
              </div>
              <div className="hb-label">LCD · Landscape</div>
            </div>
            <div className="hb-frame hb-f2">
              <div className="hb-pulse" style={{background:'var(--orange)',boxShadow:'0 0 0 0 rgba(255,107,53,.5)',animation:'hb-ping-o 2.4s ease-out infinite .6s'}}></div>
              <div className="hb-screen" style={{background:'linear-gradient(180deg,rgba(255,107,53,.25),rgba(201,78,26,.1))'}}>
                <svg viewBox="0 0 48 80" width="48" height="80">
                  <rect x="4" y="4" width="40" height="72" rx="3" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1"/>
                  <rect x="8" y="8" width="32" height="30" rx="2" fill="rgba(255,255,255,.08)"/>
                  <rect x="8" y="42" width="32" height="5" rx="2" fill="rgba(255,255,255,.12)"/>
                  <rect x="8" y="51" width="20" height="4" rx="2" fill="rgba(255,255,255,.08)"/>
                  <rect x="8" y="62" width="14" height="10" rx="2" fill="rgba(255,107,53,.4)"/>
                </svg>
              </div>
              <div className="hb-label">LCD · Portrait</div>
            </div>
            <div className="hb-frame hb-f3">
              <div className="hb-pulse" style={{background:'#FFB800',boxShadow:'0 0 0 0 rgba(255,184,0,.5)',animation:'hb-ping-y 3s ease-out infinite 1s'}}></div>
              <div className="hb-screen" style={{background:'linear-gradient(135deg,rgba(0,196,140,.2),rgba(0,150,109,.1))'}}>
                <svg viewBox="0 0 88 32" width="88" height="32">
                  <rect x="3" y="3" width="82" height="26" rx="2" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1"/>
                  <rect x="6" y="6" width="36" height="20" rx="2" fill="rgba(255,255,255,.07)"/>
                  <rect x="46" y="6" width="39" height="8" rx="2" fill="rgba(0,196,140,.2)"/>
                  <rect x="46" y="18" width="26" height="4" rx="2" fill="rgba(255,255,255,.08)"/>
                </svg>
              </div>
              <div className="hb-label">LED Billboard · 14×6m</div>
            </div>
            <div className="hb-frame hb-f4">
              <div className="hb-pulse" style={{background:'var(--blue-m)'}}></div>
              <div className="hb-screen" style={{background:'linear-gradient(135deg,rgba(59,71,240,.3),rgba(107,116,245,.15))'}}>
                <svg viewBox="0 0 40 40" width="40" height="40">
                  <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
                  <circle cx="20" cy="20" r="8" fill="rgba(59,71,240,.3)"/>
                  <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,.5)"/>
                </svg>
              </div>
              <div className="hb-label">LCD · Square</div>
            </div>
          </div>
          </div>{/* /decorative-clip */}

          <div className="container" style={{position:'relative',zIndex:2,width:'100%',boxSizing:'border-box'}}>
            <div className="hero-center fade-up">
              <div className="hero-eyebrow"><div className="dot"></div>Vietnam&apos;s #1 DOOH Marketplace</div>
              <h1 className="hero-h1">
                Tìm màn hình<br/>
                <span className="grad">quảng cáo lý tưởng</span>
              </h1>

              {/* SEARCH BAR */}
              <div className="hero-search fade-up d2" ref={searchRef}>
                <div className="hs-fields">

                  {/* Type field */}
                  <div className={`hs-field${openField === 'type' ? ' open' : ''}`} id="hsf-type">
                    <div className="hs-field-inner" onClick={e => toggleField('type', e)}>
                      <div className="hs-field-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/></svg>
                      </div>
                      <div className="hs-field-body">
                        <div className="hs-field-label">Loại màn hình</div>
                        <div className="hs-field-value">{hsValues.type}</div>
                      </div>
                      <svg className="hs-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div className="hs-dropdown">
                      <div className="hs-dd-title">Loại màn hình</div>
                      <div className="hs-dd-chips">
                        {[['all','Tất cả'],['lcd','LCD Screen'],['led','LED Screen'],['billboard','Billboard']].map(([v,l]) => (
                          <div key={v} className={`hs-chip${hsState.type === v ? ' on' : ''}`} onClick={e => { e.stopPropagation(); selectHs('type', v, l); }}>{l}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hs-divider"></div>

                  {/* Venue field */}
                  <div className={`hs-field${openField === 'venue' ? ' open' : ''}`} id="hsf-venue">
                    <div className="hs-field-inner" onClick={e => toggleField('venue', e)}>
                      <div className="hs-field-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>
                      </div>
                      <div className="hs-field-body">
                        <div className="hs-field-label">Venue type</div>
                        <div className="hs-field-value">{selectedVenueLabel}</div>
                      </div>
                      <svg className="hs-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div className="hs-dropdown">
                      <div className="hs-dd-title">Loại địa điểm</div>
                      <div className="hs-dd-chips">
                        {/* "Tất cả" luôn đầu tiên */}
                        <div
                          className={`hs-chip${hsState.venue === 'all' ? ' on' : ''}`}
                          onClick={e => { e.stopPropagation(); selectHs('venue', 'all', 'Tất cả địa điểm'); }}
                        >
                          Tất cả
                        </div>

                        {/* Dynamic từ /api/venue-types (fallback hardcode khi API chưa sẵn sàng) */}
                        {venueTypes.map(vt => (
                          <div
                            key={vt.type}
                            className={`hs-chip${hsState.venue === vt.type ? ' on' : ''}${vt.type.includes('.') ? ' hs-chip-child' : ''}`}
                            onClick={e => { e.stopPropagation(); selectHs('venue', vt.type, vt.label); }}
                            title={vt.count > 0 ? `${vt.count.toLocaleString('vi-VN')} màn hình` : undefined}
                          >
                            {vt.type.includes('.') && <span className="hs-chip-indent">↳ </span>}
                            {vt.label}
                            {vt.count > 0 && <span className="hs-chip-count">{vt.count.toLocaleString('vi-VN')}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hs-divider"></div>

                  {/* Location field */}
                  <div className={`hs-field${openField === 'loc' ? ' open' : ''}`} id="hsf-loc">
                    <div className="hs-field-inner" onClick={e => toggleField('loc', e)}>
                      <div className="hs-field-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <div className="hs-field-body">
                        <div className="hs-field-label">Địa điểm</div>
                        <div className="hs-field-value">{hsValues.loc}</div>
                      </div>
                      <svg className="hs-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div className="hs-dropdown hs-dropdown-loc">
                      <div className="hs-dd-title">Tỉnh / thành phố</div>
                      <input
                        className="hs-loc-input"
                        type="text"
                        placeholder="Tìm tỉnh thành..."
                        value={locSearch}
                        onChange={e => setLocSearch(e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                      <div className="hs-loc-list">
                        <div className={`hs-loc-item${hsState.loc === 'all' ? ' on' : ''}`} onClick={e => { e.stopPropagation(); selectHs('loc', 'all', 'Toàn quốc'); }}>
                          Toàn quốc <span className="hs-loc-count">{stats ? stats.total_screens.toLocaleString('vi-VN') : ''}</span>
                        </div>
                        {filteredLocs.map(c => (
                          <div key={c.code} className={`hs-loc-item${hsState.loc === c.code ? ' on' : ''}`} onClick={e => { e.stopPropagation(); selectHs('loc', c.code, c.name); }}>
                            {c.name} <span className="hs-loc-count">{c.count.toLocaleString('vi-VN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
                <button className="hs-btn" onClick={doSearch}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Tìm màn hình
                </button>
              </div>

              {/* Quick tags */}
              <div className="hero-quick-tags fade-up d3">
                <span className="hqt-label">Phổ biến:</span>
                <div className="hqt-chips">
                  <Link href="/browse" className="hqt-chip">Billboard HCM</Link>
                  <Link href="/browse" className="hqt-chip">Mall Hà Nội</Link>
                  <Link href="/browse" className="hqt-chip">F&amp;B LCD</Link>
                  <Link href="/browse" className="hqt-chip">LED Outdoor</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <div className="stats-strip">
          <div className="container">
            <div className="strip-inner">
              <div className="strip-item">
                <div className="strip-top">
                  <div className="strip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/></svg></div>
                  <div className="strip-num">{stats ? stats.total_screens.toLocaleString('vi-VN') : '—'}</div>
                </div>
                <div className="strip-label">Màn hình</div>
              </div>
              <div className="strip-item">
                <div className="strip-top">
                  <div className="strip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                  <div className="strip-num">{stats ? stats.total_cities : '—'}</div>
                </div>
                <div className="strip-label">Tỉnh thành</div>
              </div>
              <div className="strip-item">
                <div className="strip-top">
                  <div className="strip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
                  <div className="strip-num">{stats ? `${stats.total_owners}+` : '—'}</div>
                </div>
                <div className="strip-label">Media owners</div>
              </div>
              <div className="strip-item">
                <div className="strip-top">
                  <div className="strip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                  <div className="strip-num">0đ</div>
                </div>
                <div className="strip-label">Phí đăng ký</div>
              </div>
            </div>
          </div>
        </div>

        {/* INVENTORY PREVIEW */}
        <section className="section">
          <div className="container">
            <div className="section-header-row">
              <div>
                <div className="label">Inventory</div>
                <div className="h2">Khám phá <span className="text-blue">màn hình</span></div>
                <div className="lead mt-8">Từ LCD trong TTTM đến Billboard ngoài trời — tất cả trên một nền tảng.</div>
              </div>
              <Link href="/browse" className="btn btn-outline">
                Xem tất cả
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            <div className="screens-grid">
              {featuredScreens.map(s => (
                <Link key={s.id} href={screenHref(s.id)} className="sc">
                  <div className={`sc-thumb sc-thumb-${s.thumb}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56" dangerouslySetInnerHTML={{__html: iconSVG[s.venue] || ''}}/>
                    <div className="sc-status"><span className="badge badge-green">● Online</span></div>
                    <div className="sc-format"><span className="badge badge-navy">{s.type}</span></div>
                  </div>
                  <div className="sc-body">
                    <div className="sc-name">{s.name}</div>
                    <div className="sc-loc">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {s.loc}
                    </div>
                    <div className="sc-tags">
                      <span className="sc-pill">{s.size}</span>
                      <span className="sc-pill">{s.orientation}</span>
                      <span className="sc-pill">{s.slot_duration_sec}s</span>
                    </div>
                    <div className="sc-footer">
                      <div className="sc-impr">
                        {s.weekly > 0
                          ? <><strong>{(s.weekly/1000).toFixed(0)}K</strong> lượt/tuần</>
                          : <><strong>{(s.price_per_slot_vnd/1000).toFixed(0)}K</strong> /slot</>
                        }
                      </div>
                      <div className="sc-lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Đăng nhập</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center mb-40">
              <div className="label">Quy trình</div>
              <div className="h2">Campaign trong <span className="text-blue">3 bước</span></div>
            </div>
            <div className="steps">
              <div className="step">
                <div className="step-num">
                  <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <div className="step-title">Tìm màn hình</div>
                <div className="step-desc">Filter theo thành phố, venue, định dạng và ngân sách. Xem ảnh và traffic thực tế.</div>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </div>
                <div className="step-title">Plan &amp; Estimate</div>
                <div className="step-desc">Thêm vào Media Planner. Tự động tính impressions, reach và ngân sách theo CPM thực.</div>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div className="step-title">Go Live</div>
                <div className="step-desc">Upload creative, submit và theo dõi impressions real-time ngay trên dashboard.</div>
              </div>
            </div>
          </div>
        </section>

        {/* VENUE TYPES */}
        <section className="section">
          <div className="container">
            <div className="section-header center mb-40">
              <div className="label">Loại màn hình</div>
              <div className="h2">Phủ sóng mọi <span className="text-blue">điểm chạm</span></div>
            </div>
            <div className="venues">
              {[
                { name:'Retail',        path:<><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7"/></> },
                { name:'Outdoor',       path:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
                { name:'F&B',           path:<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
                { name:'Transit',       path:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/><path d="m3 11 3-9 3 6 3-3 3 6 3-6 3 6"/></> },
                { name:'Office',        path:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
                { name:'Entertainment', path:<><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></> },
              ].map(v => (
                <Link key={v.name} href="/browse" className="venue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{v.path}</svg>
                  <div className="venue-name">{v.name}</div>
                  <div className="venue-count">
                    {venueCount(v.name) > 0 ? `${venueCount(v.name).toLocaleString('vi-VN')} màn hình` : '—'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* WHY OOHX */}
        <section className="section section-alt">
          <div className="container">
            <div className="why-grid">
              <div>
                <div className="label">Tại sao OOHX</div>
                <div className="h2">Minh bạch, nhanh,<br/><span className="text-blue">đo được</span></div>
                <div className="lead mt-8">Không còn gọi điện, không báo giá qua email, không chờ đợi.</div>
                <div className="why-features mt-32">
                  <div className="why-feat">
                    <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                    <div><div className="why-feat-title">Giá minh bạch theo CPM</div><div className="why-feat-desc">Xem giá ngay, không ẩn phí, không markup sau.</div></div>
                  </div>
                  <div className="why-feat">
                    <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                    <div><div className="why-feat-title">Plan trong 5 phút</div><div className="why-feat-desc">Media Planner tự tính reach và ngân sách khi chọn màn hình.</div></div>
                  </div>
                  <div className="why-feat">
                    <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
                    <div><div className="why-feat-title">Báo cáo real-time</div><div className="why-feat-desc">Theo dõi impressions và spend ngay khi campaign đang chạy.</div></div>
                  </div>
                  <div className="why-feat">
                    <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                    <div><div className="why-feat-title">Self-service + Sales hỗ trợ</div><div className="why-feat-desc">Tự chạy hoặc gửi brief, đội ngũ OOHX plan cho bạn.</div></div>
                  </div>
                </div>
              </div>
              <div className="why-panel">
                <div className="why-metric">
                  <div><div className="wm-label">Total Impressions</div><div className="wm-val">2,450,000</div></div>
                  <div className="wm-badge green">↑ 18%</div>
                </div>
                <div className="why-metric">
                  <div><div className="wm-label">Campaign Spend</div><div className="wm-val">12,500,000đ</div></div>
                  <div className="wm-badge green">On track</div>
                </div>
                <div className="why-metric">
                  <div><div className="wm-label">Active Screens</div><div className="wm-val">8 screens</div></div>
                  <div className="wm-badge green">↑ 100%</div>
                </div>
                <div className="why-metric">
                  <div><div className="wm-label">eCPM</div><div className="wm-val">5,102đ</div></div>
                  <div className="wm-badge green">✓ Efficient</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED MEDIA OWNERS */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header-row">
              <div>
                <div className="label">Media Owners</div>
                <div className="h2">Đối tác <span className="text-blue">nổi bật</span></div>
                <div className="lead mt-8">Các công ty sở hữu màn hình uy tín đang listing inventory trên OOHX.</div>
              </div>
              <Link href="/owners" className="btn btn-outline">
                Xem tất cả
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            <div className="owners-strip">
              {featuredOwners.map(o => (
                <Link key={o.owner_id} href={`/owners/${o.owner_id}`} className="os-card">
                  <div className="os-logo">
                    {o.logo_url
                      ? <img src={o.logo_url} alt={o.name} style={{width:'100%',height:'100%',objectFit:'contain',borderRadius:'inherit'}}/>
                      : o.name.slice(0, 2).toUpperCase()
                    }
                  </div>
                  <div>
                    <div className="os-name">{o.name}</div>
                    <div className="os-count">{o.screen_count} màn hình · {o.venue_types[0] ?? ''}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* DUAL CTA */}
        <section className="section">
          <div className="container">
            <div className="dual-cta">
              <div className="dcta dcta-left">
                <div className="dcta-tag">Cho brand &amp; marketer</div>
                <div className="dcta-title">Tự plan và mua trong 5 phút</div>
                <div className="dcta-desc">Không cần kinh nghiệm. Tìm màn hình, chọn ngày, upload creative, go live.</div>
                <Link href="/register" className="btn btn-white btn-lg mt-24">
                  Bắt đầu miễn phí
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
              <div className="dcta dcta-right">
                <div className="dcta-tag">Cho agency &amp; media planner</div>
                <div className="dcta-title">Gửi brief, nhận proposal trong 24h</div>
                <div className="dcta-desc">Sales team OOHX plan campaign, báo giá chi tiết và hỗ trợ execution.</div>
                <Link href="/request" className="btn btn-lg mt-24" style={{color:'#fff',border:'1.5px solid rgba(255,255,255,.35)',background:'transparent'}}>
                  Gửi brief ngay
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
