'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { screens, iconSVG } from '@/lib/data';
import type { Screen } from '@/lib/types';

const MapBrowse = dynamic(() => import('@/components/MapBrowse'), { ssr: false });

const cities = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
const venueTypes = ['Retail', 'Outdoor', 'F&B', 'Transit', 'Office'];
const formats = ['LCD', 'LED', 'Billboard'];
const orientations = ['Landscape', 'Portrait'];

export default function BrowsePage() {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [filterPanel, setFilterPanel] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [selCities, setSelCities] = useState<string[]>(['Hà Nội']);
  const [selVenues, setSelVenues] = useState<string[]>(['Outdoor']);
  const [selFormats, setSelFormats] = useState<string[]>([]);
  const [selOri, setSelOri] = useState<string[]>(['Landscape']);
  const [selected, setSelected] = useState<Screen | null>(null);

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  const filtered = useMemo(() => {
    return screens.filter(s => {
      if (searchQ && !s.name.toLowerCase().includes(searchQ.toLowerCase()) && !s.loc.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (selVenues.length > 0 && !selVenues.includes(s.venue)) return false;
      if (selFormats.length > 0 && !selFormats.includes(s.type)) return false;
      if (selCities.length > 0) {
        const cityMatch = selCities.some(c => {
          if (c === 'Hà Nội') return s.loc.includes('Hà Nội') || s.loc.includes('HN');
          if (c === 'TP.HCM') return s.loc.includes('HCM') || s.loc.includes('Hồ Chí Minh');
          if (c === 'Đà Nẵng') return s.loc.includes('Đà Nẵng');
          if (c === 'Hải Phòng') return s.loc.includes('Hải Phòng');
          if (c === 'Cần Thơ') return s.loc.includes('Cần Thơ');
          return false;
        });
        if (!cityMatch) return false;
      }
      return true;
    });
  }, [searchQ, selCities, selVenues, selFormats, selOri]);

  function clearFilters() {
    setSearchQ('');
    setSelCities([]);
    setSelVenues([]);
    setSelFormats([]);
    setSelOri([]);
  }

  return (
    <div className="browse-wrap">
      {/* Filter panel */}
      {filterPanel && (
        <div className="filter-panel" id="filter-panel">
          <div className="filter-title">
            Bộ lọc
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div className="filter-clear" onClick={clearFilters}>Xóa</div>
              <div className="filter-close" onClick={() => setFilterPanel(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Tìm kiếm</div>
            <input type="text" className="filter-search" placeholder="Tên màn hình, địa chỉ..." value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Thành phố</div>
            <div className="chips">
              {cities.map(c => (
                <div key={c} className={`chip${selCities.includes(c) ? ' on' : ''}`} onClick={() => setSelCities(p => toggle(p, c))}>{c}</div>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Loại venue</div>
            <div className="chips">
              {venueTypes.map(v => (
                <div key={v} className={`chip${selVenues.includes(v) ? ' on' : ''}`} onClick={() => setSelVenues(p => toggle(p, v))}>{v}</div>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Định dạng</div>
            <div className="chips">
              {formats.map(f => (
                <div key={f} className={`chip${selFormats.includes(f) ? ' on' : ''}`} onClick={() => setSelFormats(p => toggle(p, f))}>{f}</div>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Orientation</div>
            <div className="chips">
              {orientations.map(o => (
                <div key={o} className={`chip${selOri.includes(o) ? ' on' : ''}`} onClick={() => setSelOri(p => toggle(p, o))}>{o}</div>
              ))}
            </div>
          </div>

          <div className="filter-group" style={{borderBottom:'none'}}>
            <div style={{fontSize:'12px',color:'var(--g500)',marginBottom:'10px',display:'flex',alignItems:'center',gap:'6px'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Filter theo CPM — cần đăng nhập
            </div>
            <Link href="/login" className="btn btn-outline" style={{width:'100%',justifyContent:'center'}}>Đăng nhập để xem giá</Link>
          </div>
        </div>
      )}

      {/* Browse main */}
      <div className="browse-main">
        {/* Toolbar */}
        <div className="browse-toolbar">
          <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
            {!filterPanel && (
              <button className="btn btn-ghost btn-sm filter-toggle-btn" onClick={() => setFilterPanel(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Bộ lọc
              </button>
            )}
            <div className="browse-count"><strong>{filtered.length}</strong> màn hình</div>
          </div>
          <div className="browse-toolbar-right">
            <select className="sort-sel">
              <option>Traffic cao nhất</option>
              <option>CPM thấp nhất</option>
              <option>Mới nhất</option>
            </select>
            <div className="view-toggle">
              <button className={`vt-btn${view === 'map' ? ' on' : ''}`} onClick={() => setView('map')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                Map
              </button>
              <button className={`vt-btn${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                List
              </button>
            </div>
          </div>
        </div>

        {/* Map view */}
        {view === 'map' && (
          <div id="map-view-wrap" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <MapBrowse screens={filtered} onScreenSelect={setSelected}/>
            {selected && (
              <div style={{position:'absolute',bottom:'16px',right:'16px',zIndex:20,background:'#fff',borderRadius:'var(--r)',boxShadow:'var(--sh-l)',padding:'14px',maxWidth:'260px'}}>
                <button style={{position:'absolute',top:'8px',right:'8px',width:'22px',height:'22px',borderRadius:'50%',background:'var(--g100)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px'}} onClick={() => setSelected(null)}>✕</button>
                <div style={{fontWeight:700,fontSize:'13px',color:'var(--navy)',marginBottom:'4px',paddingRight:'20px'}}>{selected.name}</div>
                <div style={{fontSize:'11px',color:'var(--g500)',marginBottom:'8px'}}>{selected.loc}</div>
                <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  <span className="badge badge-blue">{selected.venue}</span>
                  <span className="badge badge-gray">{selected.type}</span>
                  <span className="badge badge-gray">{selected.size}</span>
                </div>
                <Link href={`/screens/${selected.id}`} className="btn btn-primary btn-sm mt-8" style={{width:'100%',justifyContent:'center'}}>Xem chi tiết</Link>
              </div>
            )}
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div id="list-view-wrap" className="list-view-wrap">
            <div className="list-grid" id="list-grid">
              {filtered.length === 0 ? (
                <div style={{padding:'60px',textAlign:'center',color:'var(--g500)',gridColumn:'1/-1'}}>Không tìm thấy màn hình nào.</div>
              ) : (
                filtered.map(s => (
                  <Link key={s.id} href={`/screens/${s.id}`} className="sc">
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
                      <div className="sc-tags"><span className="sc-pill">{s.size}</span><span className="sc-pill">{s.venue}</span></div>
                      <div className="sc-footer">
                        <div className="sc-impr"><strong>{(s.weekly/1000).toFixed(0)}K</strong> lượt/tuần</div>
                        <div className="sc-lock">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          Đăng nhập
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
