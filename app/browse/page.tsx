'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { iconSVG, screenHref } from '@/lib/data';
import type { Screen } from '@/lib/types';
import type { VenueTypeNode, NetworkItem, LocationsResponse, TapOnOwner } from '@/lib/tapon/types';

const MapBrowse = dynamic(() => import('@/components/MapBrowse'), { ssr: false });

const FORMAT_CODE: Record<string, string> = { LCD: 'lcd', LED: 'led', Billboard: 'billboard' };
const CODE_FORMAT: Record<string, string> = Object.fromEntries(Object.entries(FORMAT_CODE).map(([k, v]) => [v, k]));
const FORMATS     = ['LCD', 'LED', 'Billboard'];
const ORIENTATIONS = ['Landscape', 'Portrait'];

function flattenVenueTypes(nodes: VenueTypeNode[]): VenueTypeNode[] {
  const result: VenueTypeNode[] = [];
  for (const node of nodes) {
    result.push(node);
    for (const child of node.children) result.push(child);
  }
  return result;
}

export default function BrowsePage() {
  return <Suspense><BrowsePageInner /></Suspense>;
}

function BrowsePageInner() {
  const sp     = useSearchParams();
  const router = useRouter();
  const mountedRef       = useRef(false);
  const ownerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Filter state — khởi tạo từ URL ─────────────────────────────────────────
  const [view, setView]         = useState<'map' | 'list'>(() => (sp.get('view') as 'map' | 'list') ?? 'map');
  const [filterPanel, setFilterPanel] = useState(true);
  const [searchQ, setSearchQ]   = useState(() => sp.get('q') ?? '');
  const [selRegions, setSelRegions]     = useState<string[]>(() => sp.getAll('region[]'));
  const [selCities, setSelCities]       = useState<string[]>(() => sp.getAll('city[]'));
  const [selDistricts, setSelDistricts] = useState<string[]>(() => sp.getAll('district[]'));
  const [selNetworks, setSelNetworks]   = useState<string[]>(() => sp.getAll('network[]'));
  const [selOwners, setSelOwners]       = useState<string[]>(() => sp.getAll('owner[]'));
  const [selVenues, setSelVenues]       = useState<string[]>(() => sp.getAll('venue_type[]'));
  const [selFormats, setSelFormats]     = useState<string[]>(() =>
    sp.getAll('screen_type[]').map(f => CODE_FORMAT[f]).filter(Boolean)
  );
  const [selOri, setSelOri]     = useState<string[]>(() => sp.getAll('orientation[]'));
  const [sortBy, setSortBy]     = useState(() => sp.get('sort') ?? '');

  // ── Dữ liệu filter động từ API ──────────────────────────────────────────────
  const [venueTypeList, setVenueTypeList] = useState<VenueTypeNode[]>([]);
  const [networks, setNetworks]           = useState<NetworkItem[]>([]);
  const [locData, setLocData]             = useState<LocationsResponse>({ regions: [], provinces: [], districts: [] });

  // Owner search combobox
  const [ownerQ, setOwnerQ]               = useState('');
  const [ownerResults, setOwnerResults]   = useState<TapOnOwner[]>([]);
  const [ownerSearching, setOwnerSearching] = useState(false);
  const [ownerNames, setOwnerNames]       = useState<Record<string, string>>({});

  // ── Dữ liệu màn hình ───────────────────────────────────────────────────────
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  const PAGE_SIZE  = 24;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  // ── Fetch metadata filter khi mount ─────────────────────────────────────────
  useEffect(() => {
    fetch('/api/venue-types')
      .then(r => r.json())
      .then(d => { if (d?.data?.length > 0) setVenueTypeList(flattenVenueTypes(d.data)); })
      .catch(() => {});

    fetch('/api/networks')
      .then(r => r.json())
      .then(d => { if (d?.data?.length > 0) setNetworks(d.data); })
      .catch(() => {});

    fetch('/api/locations')
      .then(r => r.json())
      .then(d => { if (d?.regions) setLocData(d); })
      .catch(() => {});
  }, []);

  // Nếu URL có owner[], lấy tên để hiển thị chip
  useEffect(() => {
    const initOwners = sp.getAll('owner[]');
    if (initOwners.length === 0) return;
    fetch('/api/owners?limit=50')
      .then(r => r.json())
      .then(d => {
        const map: Record<string, string> = {};
        (d?.data ?? []).forEach((o: TapOnOwner) => { map[o.owner_id] = o.name; });
        setOwnerNames(map);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── URL sync — push khi filter thay đổi (bỏ qua lần mount đầu) ─────────────
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const p = new URLSearchParams();
    if (view !== 'map')  p.set('view', view);
    if (searchQ)         p.set('q', searchQ);
    if (sortBy)          p.set('sort', sortBy);
    selRegions.forEach(r   => p.append('region[]',      r));
    selCities.forEach(c    => p.append('city[]',         c));
    selDistricts.forEach(d => p.append('district[]',     d));
    selNetworks.forEach(n  => p.append('network[]',      n));
    selOwners.forEach(o    => p.append('owner[]',        o));
    selVenues.forEach(v    => p.append('venue_type[]',   v));
    selFormats.forEach(f   => p.append('screen_type[]',  FORMAT_CODE[f] ?? f.toLowerCase()));
    selOri.forEach(o       => p.append('orientation[]',  o.toLowerCase()));
    const qs = p.toString();
    router.replace(qs ? `/browse?${qs}` : '/browse', { scroll: false });
  }, [view, searchQ, sortBy, selRegions, selCities, selDistricts, selNetworks, selOwners, selVenues, selFormats, selOri]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page khi filter thay đổi
  useEffect(() => { setPage(1); }, [view, selRegions, selCities, selDistricts, selNetworks, selOwners, selVenues, selFormats, selOri, searchQ, sortBy]);

  // ── Fetch màn hình ──────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (view === 'map') {
      params.set('all', 'true');
    } else {
      params.set('limit', String(PAGE_SIZE));
      params.set('page',  String(page));
    }

    selRegions.forEach(r   => params.append('region[]',      r));
    selCities.forEach(c    => params.append('city[]',         c));
    selDistricts.forEach(d => params.append('district[]',     d));
    selNetworks.forEach(n  => params.append('network[]',      n));
    selOwners.forEach(o    => params.append('owner[]',        o));
    selVenues.forEach(v    => params.append('venue_type[]',   v));
    selFormats.forEach(f   => params.append('screen_type[]',  FORMAT_CODE[f] ?? f.toLowerCase()));
    selOri.forEach(o       => params.append('orientation[]',  o.toLowerCase()));
    if (searchQ) params.set('q',    searchQ);
    if (sortBy)  params.set('sort', sortBy);

    setLoading(true);
    let attempt = 0;
    const MAX_ATTEMPTS = 3;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function doFetch() {
      fetch(`/api/screens?${params}`, { signal: controller.signal })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => { setScreens(data.data ?? []); setTotal(data.total ?? 0); setLoading(false); })
        .catch(err => {
          if (err.name === 'AbortError') return; // component unmounted hoặc filter đổi
          attempt++;
          if (attempt < MAX_ATTEMPTS) {
            retryTimer = setTimeout(doFetch, 2000 * attempt); // 2s, 4s
          } else {
            setScreens([]); setLoading(false);
          }
        });
    }
    doFetch();

    return () => { controller.abort(); if (retryTimer) clearTimeout(retryTimer); };
  }, [view, selRegions, selCities, selDistricts, selNetworks, selOwners, selVenues, selFormats, selOri, searchQ, sortBy, page]);

  // ── Owner search có debounce ────────────────────────────────────────────────
  useEffect(() => {
    if (ownerDebounceRef.current) clearTimeout(ownerDebounceRef.current);
    if (!ownerQ.trim()) { setOwnerResults([]); return; }
    ownerDebounceRef.current = setTimeout(() => {
      setOwnerSearching(true);
      fetch(`/api/owners?q=${encodeURIComponent(ownerQ)}&limit=10`)
        .then(r => r.json())
        .then(d => setOwnerResults(d?.data ?? []))
        .catch(() => setOwnerResults([]))
        .finally(() => setOwnerSearching(false));
    }, 300);
    return () => { if (ownerDebounceRef.current) clearTimeout(ownerDebounceRef.current); };
  }, [ownerQ]);

  function clearFilters() {
    setSearchQ(''); setSelRegions([]); setSelCities([]); setSelDistricts([]);
    setSelNetworks([]); setSelOwners([]); setSelVenues([]); setSelFormats([]); setSelOri([]); setSortBy('');
  }

  // Tỉnh hiển thị: nếu chọn vùng → chỉ show tỉnh thuộc vùng đó
  const visibleProvinces = selRegions.length > 0
    ? locData.provinces.filter(p => selRegions.includes(p.region))
    : locData.provinces;

  // Quận/huyện: chỉ show khi đã chọn tỉnh
  const visibleDistricts = selCities.length > 0
    ? locData.districts.filter(d => selCities.includes(d.province))
    : [];

  const activeFilterCount =
    selRegions.length + selCities.length + selDistricts.length +
    selNetworks.length + selOwners.length + selVenues.length +
    selFormats.length + selOri.length + (searchQ ? 1 : 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`browse-wrap${view === 'list' ? ' browse-list-mode' : ''}`}>

      {/* ── Filter panel ── */}
      {filterPanel && (
        <div className="filter-panel" id="filter-panel">
          <div className="filter-title">
            Bộ lọc
            {activeFilterCount > 0 && (
              <span style={{marginLeft:6,background:'var(--primary)',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:11,fontWeight:700}}>
                {activeFilterCount}
              </span>
            )}
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginLeft:'auto'}}>
              {activeFilterCount > 0 && (
                <div className="filter-clear" onClick={clearFilters}>Xóa tất cả</div>
              )}
            </div>
          </div>

          {/* 1. Tìm kiếm văn bản */}
          <div className="filter-group">
            <div className="filter-group-label">Tìm kiếm</div>
            <input
              type="text"
              className="filter-search"
              placeholder="Tên màn hình, địa chỉ..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>

          {/* 2. Chuỗi / Network */}
          {networks.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-label">Chuỗi / Network</div>
              <div className="chips">
                {networks.map(n => (
                  <div
                    key={n.code}
                    className={`chip${selNetworks.includes(n.code) ? ' on' : ''}`}
                    onClick={() => setSelNetworks(p => toggle(p, n.code))}
                  >
                    {n.name}
                    {n.screen_count > 0 && (
                      <span style={{marginLeft:4,opacity:0.55,fontSize:10}}>({n.screen_count})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Media Owner */}
          <div className="filter-group">
            <div className="filter-group-label">Media Owner</div>
            {selOwners.length > 0 && (
              <div className="chips" style={{marginBottom:8}}>
                {selOwners.map(slug => (
                  <div
                    key={slug}
                    className="chip on"
                    onClick={() => setSelOwners(p => p.filter(x => x !== slug))}
                    style={{paddingRight:6}}
                  >
                    {ownerNames[slug] ?? slug}
                    <span style={{marginLeft:5,opacity:0.7}}>×</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{position:'relative'}}>
              <input
                type="text"
                className="filter-search"
                placeholder="Tìm tên media owner..."
                value={ownerQ}
                onChange={e => setOwnerQ(e.target.value)}
                onBlur={() => setTimeout(() => setOwnerResults([]), 200)}
              />
              {(ownerSearching || ownerResults.length > 0) && (
                <div style={{
                  position:'absolute',top:'calc(100% + 4px)',left:0,right:0,
                  background:'#fff',border:'1px solid var(--g200)',borderRadius:8,
                  boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:50,
                  maxHeight:200,overflowY:'auto',
                }}>
                  {ownerSearching && (
                    <div style={{padding:'10px 12px',color:'var(--g400)',fontSize:13}}>Đang tìm...</div>
                  )}
                  {!ownerSearching && ownerResults.length === 0 && (
                    <div style={{padding:'10px 12px',color:'var(--g400)',fontSize:13}}>Không tìm thấy</div>
                  )}
                  {!ownerSearching && ownerResults.map(o => (
                    <div
                      key={o.owner_id}
                      style={{
                        padding:'9px 12px',cursor:'pointer',fontSize:13,
                        display:'flex',alignItems:'center',justifyContent:'space-between',
                        borderBottom:'1px solid var(--g100)',
                      }}
                      onMouseDown={() => {
                        if (!selOwners.includes(o.owner_id)) {
                          setSelOwners(p => [...p, o.owner_id]);
                          setOwnerNames(m => ({ ...m, [o.owner_id]: o.name }));
                        }
                        setOwnerQ('');
                        setOwnerResults([]);
                      }}
                    >
                      <span>{o.name}</span>
                      <span style={{fontSize:11,color:'var(--g400)'}}>{o.screen_count} màn</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Địa điểm */}
          <div className="filter-group">
            <div className="filter-group-label">Địa điểm</div>

            {/* Vùng miền */}
            {locData.regions.length > 0 && (
              <>
                <div style={{fontSize:11,color:'var(--g400)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.05em'}}>Vùng miền</div>
                <div className="chips" style={{marginBottom:10}}>
                  {locData.regions.map(r => (
                    <div
                      key={r.code}
                      className={`chip${selRegions.includes(r.code) ? ' on' : ''}`}
                      onClick={() => setSelRegions(p => toggle(p, r.code))}
                    >
                      {r.name}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Tỉnh / Thành phố */}
            {visibleProvinces.length > 0 && (
              <>
                <div style={{fontSize:11,color:'var(--g400)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.05em'}}>Tỉnh / Thành phố</div>
                <div className="chips" style={{marginBottom:10}}>
                  {visibleProvinces.map(p => (
                    <div
                      key={p.code}
                      className={`chip${selCities.includes(p.code) ? ' on' : ''}`}
                      onClick={() => setSelCities(prev => toggle(prev, p.code))}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Quận / Huyện — chỉ hiện khi chọn tỉnh */}
            {visibleDistricts.length > 0 && (
              <>
                <div style={{fontSize:11,color:'var(--g400)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.05em'}}>Quận / Huyện</div>
                <div className="chips">
                  {visibleDistricts.map(d => (
                    <div
                      key={d.code}
                      className={`chip${selDistricts.includes(d.code) ? ' on' : ''}`}
                      onClick={() => setSelDistricts(prev => toggle(prev, d.code))}
                    >
                      {d.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 5. Venue Type */}
          {venueTypeList.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-label">Loại Venue</div>
              <div className="chips">
                {venueTypeList.map(vt => (
                  <div
                    key={vt.type}
                    className={`chip${selVenues.includes(vt.type) ? ' on' : ''}${vt.type.includes('.') ? ' chip-child' : ''}`}
                    onClick={() => setSelVenues(p => toggle(p, vt.type))}
                  >
                    {vt.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Định dạng */}
          <div className="filter-group">
            <div className="filter-group-label">Định dạng</div>
            <div className="chips">
              {FORMATS.map(f => (
                <div
                  key={f}
                  className={`chip${selFormats.includes(f) ? ' on' : ''}`}
                  onClick={() => setSelFormats(p => toggle(p, f))}
                >
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* 7. Orientation */}
          <div className="filter-group">
            <div className="filter-group-label">Orientation</div>
            <div className="chips">
              {ORIENTATIONS.map(o => (
                <div
                  key={o}
                  className={`chip${selOri.includes(o) ? ' on' : ''}`}
                  onClick={() => setSelOri(p => toggle(p, o))}
                >
                  {o}
                </div>
              ))}
            </div>
          </div>

          {/* Login prompt */}
          <div className="filter-group" style={{borderBottom:'none'}}>
            <div style={{fontSize:'12px',color:'var(--g500)',marginBottom:'10px',display:'flex',alignItems:'center',gap:'6px'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Filter theo CPM — cần đăng nhập
            </div>
            <Link href="/login" className="btn btn-outline" style={{width:'100%',justifyContent:'center'}}>
              Đăng nhập để xem giá
            </Link>
          </div>
        </div>
      )}

      {/* ── Browse main ── */}
      <div className="browse-main">
        {/* Toolbar */}
        <div className="browse-toolbar">
          <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
            <button
              className={`btn btn-sm filter-toggle-btn${filterPanel ? ' btn-primary' : ' btn-ghost'}`}
              onClick={() => setFilterPanel(p => !p)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="browse-count">
              {loading
                ? <span style={{color:'var(--g400)'}}>Đang tải...</span>
                : <><strong>{total}</strong> màn hình</>
              }
            </div>
          </div>
          <div className="browse-toolbar-right">
            <select className="sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="">Mặc định</option>
              <option value="price_asc">Giá thấp nhất</option>
              <option value="price_desc">Giá cao nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
            <div className="view-toggle">
              <button className={`vt-btn${view === 'map' ? ' on' : ''}`} onClick={() => setView('map')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                Map
              </button>
              <button className={`vt-btn${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                List
              </button>
            </div>
          </div>
        </div>

        {/* Map view — luôn mounted, chỉ ẩn khi chuyển sang list */}
        <div
          id="map-view-wrap"
          style={{flex:1,display:view === 'map' ? 'flex' : 'none',flexDirection:'column',position:'relative'}}
        >
          <MapBrowse screens={screens} />
          {loading && (
            <div style={{
              position:'absolute',inset:0,background:'rgba(255,255,255,0.55)',
              display:'flex',alignItems:'center',justifyContent:'center',
              gap:'8px',color:'var(--g700)',fontWeight:600,fontSize:13,
              zIndex:10,pointerEvents:'none',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'spin 1s linear infinite'}}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Đang cập nhật...
            </div>
          )}
        </div>

        {/* List view */}
        {view === 'list' && (
          <div id="list-view-wrap" className="list-view-wrap">
            <div className="list-grid" id="list-grid">
              {loading ? (
                <div style={{padding:'60px',textAlign:'center',color:'var(--g400)',gridColumn:'1/-1',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 1s linear infinite'}}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Đang tải màn hình...
                </div>
              ) : screens.length === 0 ? (
                <div style={{padding:'60px',textAlign:'center',color:'var(--g500)',gridColumn:'1/-1'}}>
                  Không tìm thấy màn hình nào.
                </div>
              ) : (
                screens.map(s => (
                  <Link key={s.id} href={screenHref(s.id)} className="sc">
                    <div className={`sc-thumb sc-thumb-${s.thumb}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56"
                        dangerouslySetInnerHTML={{__html: iconSVG[s.venue] || ''}}/>
                      <div className="sc-status"><span className="badge badge-green">● Online</span></div>
                      <div className="sc-format"><span className="badge badge-navy">{s.type}</span></div>
                    </div>
                    <div className="sc-body">
                      <div className="sc-name">{s.name}</div>
                      <div className="sc-loc">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {s.loc}
                      </div>
                      <div className="sc-tags">
                        <span className="sc-pill">{s.size}</span>
                        <span className="sc-pill">{s.venue}</span>
                      </div>
                      <div className="sc-footer">
                        <div className="sc-impr">
                          {s.weekly > 0
                            ? <><strong>{(s.weekly/1000).toFixed(0)}K</strong> lượt/tuần</>
                            : <><strong>{(s.price_per_slot_vnd/1000).toFixed(0)}K</strong> /slot</>
                          }
                        </div>
                        <div className="sc-lock">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Đăng nhập
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'24px 0'}}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0,0); }}
                >
                  ← Trước
                </button>
                {Array.from({length: Math.min(totalPages, 7)}, (_, i) => {
                  let p: number;
                  if (totalPages <= 7)          p = i + 1;
                  else if (page <= 4)           p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else                          p = page - 3 + i;
                  return (
                    <button
                      key={p}
                      className={`btn btn-sm${p === page ? ' btn-primary' : ' btn-ghost'}`}
                      style={{minWidth:'36px'}}
                      onClick={() => { setPage(p); window.scrollTo(0,0); }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
                >
                  Sau →
                </button>
                <span style={{fontSize:'12px',color:'var(--g500)',marginLeft:'8px'}}>
                  {page}/{totalPages} · {total} màn hình
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
