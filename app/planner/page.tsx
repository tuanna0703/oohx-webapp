'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from '@/components/Toast';

interface PlanItem {
  id: number;
  name: string;
  loc: string;
  thumb: string;
  iconPath: JSX.Element;
  cpm: string;
  weekly: number;
}

const defaultItems: PlanItem[] = [
  {
    id: 1, name: 'Billboard Nút Giao Cầu Giấy', loc: 'Cầu Giấy, HN · LED · 14×6m', thumb: 'bg2',
    iconPath: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
    cpm: '28,000đ/CPM', weekly: 380000,
  },
  {
    id: 2, name: 'Vincom Mega Mall — Atrium L1', loc: 'Thanh Xuân, HN · LCD · 75"', thumb: 'bg1',
    iconPath: <><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/></>,
    cpm: '45,000đ/CPM', weekly: 120000,
  },
  {
    id: 3, name: 'The Coffee House — Nguyễn Huệ', loc: 'Quận 1, HCM · LCD · 55"', thumb: 'bg3',
    iconPath: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></>,
    cpm: '55,000đ/CPM', weekly: 85000,
  },
];

export default function PlannerPage() {
  const [items, setItems] = useState<PlanItem[]>(defaultItems);

  function removeItem(id: number) {
    setItems(p => p.filter(x => x.id !== id));
  }

  const totalWeekly = items.reduce((s, i) => s + i.weekly, 0);
  const totalImpr = Math.round(totalWeekly * 4.3);
  const budget = Math.round(totalImpr / 1000 * 32);

  return (
    <div className="planner-wrap">
      <div className="planner-main">
        <div className="planner-h">Media Planner</div>
        <div className="planner-sub">Chọn màn hình, set thời gian và xem ước tính tự động.</div>

        <div className="date-row">
          <div className="form-group" style={{margin:0}}>
            <div className="form-label">Ngày bắt đầu</div>
            <input type="date" className="form-control" defaultValue="2026-04-01"/>
          </div>
          <div className="form-group" style={{margin:0}}>
            <div className="form-label">Ngày kết thúc</div>
            <input type="date" className="form-control" defaultValue="2026-04-30"/>
          </div>
        </div>

        <div id="plan-items">
          {items.map(item => (
            <div key={item.id} className="plan-item">
              <div className={`plan-thumb sc-thumb-${item.thumb}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">{item.iconPath}</svg>
              </div>
              <div className="plan-info">
                <div className="plan-name">{item.name}</div>
                <div className="plan-loc">{item.loc}</div>
                <div className="plan-cpm">{item.cpm} · {(item.weekly / 1000).toFixed(0)}K lượt/tuần</div>
              </div>
              <button className="plan-remove" onClick={() => removeItem(item.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>

        <Link href="/browse" className="plan-add">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm màn hình từ Browse
        </Link>
      </div>

      <div className="planner-side">
        <div style={{fontSize:'14px',fontWeight:700,color:'var(--navy)',marginBottom:'18px',display:'flex',alignItems:'center',gap:'8px'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Ước tính Campaign
        </div>

        <div className="estimate-box">
          <div className="est-label">Total Impressions</div>
          <div className="est-big">{totalImpr.toLocaleString('vi-VN')}</div>
          <div className="est-big-sub">30 ngày · {items.length} màn hình</div>
          <div style={{marginTop:'16px',borderTop:'1px solid rgba(255,255,255,.08)',paddingTop:'16px'}}>
            <div className="est-row"><div className="est-key">Unique reach</div><div className="est-val">~{Math.round(totalImpr * 0.073).toLocaleString('vi-VN')}</div></div>
            <div className="est-row"><div className="est-key">Avg. frequency</div><div className="est-val">13.6×</div></div>
            <div className="est-row"><div className="est-key">eCPM estimate</div><div className="est-val" style={{color:'#818CF8'}}>5,102đ</div></div>
          </div>
        </div>

        <div className="budget-box">
          <div className="budget-label">Ngân sách ước tính</div>
          <div className="budget-num">{budget.toLocaleString('vi-VN')}đ</div>
          <div className="budget-sub">≈ ${Math.round(budget / 25000)} USD · 30 ngày</div>
        </div>

        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginBottom:'8px'}} onClick={() => toast('Campaign đang được tạo...', 'success')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Submit Campaign
        </button>
        <Link href="/request" className="btn btn-outline" style={{width:'100%',justifyContent:'center',marginBottom:'8px'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          Gửi cho Sales Team
        </Link>
        <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',color:'var(--g700)'}} onClick={() => toast('Đang xuất PDF...', 'info')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
          Xuất PDF Proposal
        </button>

        <div style={{marginTop:'18px',fontSize:'11px',color:'var(--g500)',lineHeight:1.6,paddingTop:'14px',borderTop:'1px solid var(--g100)'}}>
          Ước tính dựa trên traffic trung bình. Impression thực tế phụ thuộc lịch đặt màn hình.
        </div>
      </div>
    </div>
  );
}
