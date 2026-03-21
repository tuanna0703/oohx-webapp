'use client'

import Link from 'next/link'
import type { Screen } from '@/lib/types'
import { formatPrice } from '@/lib/data'

interface MapPopupProps {
  screen: Screen
  onClose: () => void
}

const venueColors: Record<string, string> = {
  Outdoor: 'bg-green-l text-green',
  Retail: 'bg-blue-l text-blue',
  'F&B': 'bg-orange-l text-orange',
  Office: 'bg-blue-l text-blue',
  Transit: 'bg-green-l text-green',
  Entertainment: 'bg-blue-l text-blue',
}

export default function MapPopup({ screen, onClose }: MapPopupProps) {
  const venueColor = venueColors[screen.venue] || 'bg-g-100 text-g-500'

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white rounded-2xl shadow-2xl border border-g-100 p-4 z-20">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-g-100 text-g-500 hover:bg-g-200 text-xs"
      >
        ✕
      </button>
      <h3 className="font-bold text-navy text-sm mb-1 pr-6">{screen.name}</h3>
      <p className="text-g-500 text-xs mb-3 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        {screen.loc}
      </p>
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${venueColor}`}>{screen.venue}</span>
        <span className="text-g-300 text-xs">{screen.type}</span>
        <span className="text-g-300 text-xs">{screen.size}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-g-500">Từ</p>
          <p className="font-bold text-navy text-sm">{formatPrice(screen.weekly)}<span className="text-xs font-normal text-g-500">/tuần</span></p>
        </div>
        <Link
          href={`/screens/${screen.id}`}
          className="px-4 py-2 bg-blue text-white text-xs font-bold rounded-lg hover:bg-blue-d transition-colors"
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  )
}
