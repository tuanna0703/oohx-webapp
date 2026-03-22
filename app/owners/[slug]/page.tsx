'use client';
import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { owners, screens, iconSVG, screenHref } from '@/lib/data';
import { toast } from '@/components/Toast';

const MapOwner = dynamic(() => import('@/components/MapOwner'), { ssr: false });

interface Props {
  params: { slug: string };
}

export default function OwnerProfilePage({ params }: Props) {
  const o = owners[params.slug];
  if (!o) notFound();

  const myScreens = screens.filter(s => s.owner === o.slug);
  const [activeTab, setActiveTab] = useState<'about' | 'screens' | 'map'>('about');

  const venueIconPath = iconSVG[o.venues[0]] || '';

  return (
    <>
      {/* Breadcrumb */}
      <div style={{background:'var(--g50)',borderBottom:'1px solid var(--g200)',padding:'10px 0'}}>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/owners">Media Owners</Link>
            <span className="breadcrumb-sep">/</span>
            <span style={{color:'var(--navy)'}}>{o.name}</span>
          </div>
        </div>
      </div>

      {/* Cover */}
      <div className="op-cover" style={{background:o.coverBg}}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5" width="140" height="140" dangerouslySetInnerHTML={{__html:venueIconPath}}/>
        <div className="op-cover-overlay"></div>
      </div>

      {/* Header */}
      <div className="op-header">
        <div className="container">
          <div className="op-header-inner">
            <div className="op-logo-wrap">
              <div className="op-logo">{o.emoji}</div>
              <div>
                <div className="op-name">{o.name}</div>
                <div className="op-tagline">{o.tagline}</div>
              </div>
            </div>
            <div className="op-header-actions">
              <Link href="/browse" className="btn btn-outline btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Xem màn hình
              </Link>
              <Link href="/request" className="btn btn-primary btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Liên hệ ngay
              </Link>
            </div>
          </div>
          {/* Tabs */}
          <div className="op-tabs">
            <div className={`op-tab${activeTab === 'about' ? ' on' : ''}`} onClick={() => setActiveTab('about')}>Giới thiệu</div>
            <div className={`op-tab${activeTab === 'screens' ? ' on' : ''}`} onClick={() => setActiveTab('screens')}>Màn hình ({myScreens.length})</div>
            <div className={`op-tab${activeTab === 'map' ? ' on' : ''}`} onClick={() => setActiveTab('map')}>Bản đồ phủ sóng</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="op-body">
        <div className="container">
          <div className="op-layout">
            {/* Main content */}
            <div>
              {/* About tab */}
              <div style={{display: activeTab === 'about' ? 'block' : 'none'}}>
                <div className="h3 mb-16">Về {o.name}</div>
                <div className="op-about-text">{o.about}</div>
                <div className="op-founded-row">
                  <div className="op-founded-item">
                    <div className="op-fi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                    <div><div className="op-fi-label">Thành lập</div><div className="op-fi-val">{o.founded}</div></div>
                  </div>
                  <div className="op-founded-item">
                    <div className="op-fi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/></svg></div>
                    <div><div className="op-fi-label">Màn hình</div><div className="op-fi-val">{o.screens} screens</div></div>
                  </div>
                  <div className="op-founded-item">
                    <div className="op-fi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                    <div><div className="op-fi-label">Phủ sóng</div><div className="op-fi-val">{o.cities} tỉnh thành</div></div>
                  </div>
                </div>
                <div className="mt-24">
                  <div className="fw-700 mb-8" style={{color:'var(--navy)',fontSize:'14px'}}>Loại venue</div>
                  <div className="op-coverage">
                    {o.venues.map(v => (
                      <div key={v} className="op-cov-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" dangerouslySetInnerHTML={{__html: iconSVG[v] || ''}}/>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Screens tab */}
              <div style={{display: activeTab === 'screens' ? 'block' : 'none'}}>
                <div className="op-screens-toolbar">
                  <div className="fw-700" style={{color:'var(--navy)'}}>{myScreens.length} màn hình đang listing</div>
                  <Link href="/browse" className="btn btn-primary btn-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Lọc trên bản đồ
                  </Link>
                </div>
                <div className="screens-grid">
                  {myScreens.map(s => (
                    <Link key={s.id} href={screenHref(s.id)} className="sc">
                      <div className={`sc-thumb sc-thumb-${s.thumb}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" dangerouslySetInnerHTML={{__html: iconSVG[s.venue] || ''}}/>
                        <div className="sc-status"><span className="badge badge-green">● Online</span></div>
                        <div className="sc-format"><span className="badge badge-navy">{s.type}</span></div>
                      </div>
                      <div className="sc-body">
                        <div className="sc-name">{s.name}</div>
                        <div className="sc-loc">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {s.loc}
                        </div>
                        <div className="sc-tags"><span className="sc-pill">{s.size}</span><span className="sc-pill">{s.venue}</span></div>
                        <div className="sc-footer">
                          <div className="sc-impr"><strong>{(s.weekly/1000).toFixed(0)}K</strong> lượt/tuần</div>
                          <div className="sc-lock">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Đăng nhập
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Map tab */}
              <div style={{display: activeTab === 'map' ? 'block' : 'none'}}>
                <div className="fw-700 mb-16" style={{color:'var(--navy)'}}>Bản đồ phủ sóng — {myScreens.length} màn hình</div>
                {activeTab === 'map' && <MapOwner screens={myScreens} center={[o.lat, o.lng]}/>}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="op-info-card">
                <div className="fw-700 mb-12" style={{fontSize:'14px',color:'var(--navy)'}}>Thông tin liên hệ</div>
                <div className="op-info-row"><div className="op-info-label">Website</div><div className="op-info-val blue">{o.website}</div></div>
                <div className="op-info-row"><div className="op-info-label">Email</div><div className="op-info-val" style={{fontSize:'12px'}}>{o.email}</div></div>
                <div className="op-info-row"><div className="op-info-label">Điện thoại</div><div className="op-info-val">{o.phone}</div></div>
                <div className="op-info-row"><div className="op-info-label">Tổng màn hình</div><div className="op-info-val blue">{o.screens}</div></div>
                <div className="op-info-row"><div className="op-info-label">Phủ sóng</div><div className="op-info-val">{o.cities} tỉnh thành</div></div>
                <Link href="/request" className="btn btn-primary mt-16" style={{width:'100%',justifyContent:'center'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Liên hệ {o.name.split(' ')[0]}
                </Link>
                <Link href="/browse" className="btn btn-ghost mt-8" style={{width:'100%',justifyContent:'center',color:'var(--blue)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Browse màn hình
                </Link>
              </div>

              <div style={{marginTop:'16px',background:'var(--blue-l)',border:'1px solid rgba(59,71,240,.2)',borderRadius:'var(--r)',padding:'18px'}}>
                <div style={{fontSize:'12px',fontWeight:700,color:'var(--blue)',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'8px'}}>Bạn là Media Owner?</div>
                <div style={{fontSize:'13px',color:'var(--g700)',lineHeight:1.6,marginBottom:'12px'}}>Đăng ký listing màn hình của bạn lên OOHX và tiếp cận hàng trăm advertiser.</div>
                <button className="btn btn-primary btn-sm" style={{width:'100%',justifyContent:'center'}} onClick={() => toast('Chuyển đến Publisher Panel...', 'info')}>
                  Đăng ký media owner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
