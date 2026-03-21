import Link from 'next/link'
import type { Owner } from '@/lib/types'

interface OwnerCardProps {
  owner: Owner
  screenCount?: number
}

export default function OwnerCard({ owner, screenCount }: OwnerCardProps) {
  return (
    <Link href={`/owners/${owner.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-g-100 hover:border-blue/30 hover:shadow-xl transition-all duration-300">
        {/* Cover */}
        <div
          className="h-24 flex items-center justify-center"
          style={{ background: owner.coverBg }}
        >
          <span className="text-4xl">{owner.emoji}</span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-navy text-base mb-0.5 group-hover:text-blue transition-colors">
            {owner.name}
          </h3>
          <p className="text-g-500 text-xs mb-3 leading-relaxed line-clamp-2">
            {owner.tagline}
          </p>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-g-700">
              <svg className="w-3.5 h-3.5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
              <span className="font-semibold">{screenCount ?? owner.screens}</span> màn hình
            </div>
            <div className="flex items-center gap-1 text-g-700">
              <svg className="w-3.5 h-3.5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="font-semibold">{owner.cities}</span> tỉnh thành
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {owner.venues.slice(0, 3).map((v) => (
              <span key={v} className="px-2 py-0.5 bg-g-50 text-g-700 rounded-md text-xs font-medium">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
