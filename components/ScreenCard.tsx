import Link from 'next/link'
import type { Screen } from '@/lib/types'
import { formatPrice } from '@/lib/data'

interface ScreenCardProps {
  screen: Screen
  compact?: boolean
}

const venueColors: Record<string, string> = {
  Outdoor: 'bg-green-l text-green',
  Retail: 'bg-blue-l text-blue',
  'F&B': 'bg-orange-l text-orange',
  Office: 'bg-blue-l text-blue',
  Transit: 'bg-green-l text-green',
  Entertainment: 'bg-blue-l text-blue',
}

const colorMap: Record<string, string> = {
  green: 'bg-green',
  blue: 'bg-blue',
  orange: 'bg-orange',
}

const screenVisuals: Record<string, { bg: string; icon: string }> = {
  Billboard: { bg: 'from-navy to-navy-m', icon: '🏙️' },
  LCD: { bg: 'from-g-700 to-navy', icon: '📺' },
  LED: { bg: 'from-blue-d to-navy', icon: '💡' },
}

export default function ScreenCard({ screen, compact = false }: ScreenCardProps) {
  const visual = screenVisuals[screen.type] || screenVisuals['LCD']
  const venueColor = venueColors[screen.venue] || 'bg-g-100 text-g-500'

  return (
    <Link href={`/screens/${screen.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-g-100 hover:border-blue/30 hover:shadow-xl transition-all duration-300">
        {/* Visual placeholder */}
        <div className={`relative bg-gradient-to-br ${visual.bg} flex items-center justify-center ${compact ? 'h-32' : 'h-44'}`}>
          <span className="text-4xl">{visual.icon}</span>
          {/* Pin color indicator */}
          <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${colorMap[screen.color]} ring-2 ring-white`} />
          {/* Type badge */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md text-white text-xs font-semibold">
            {screen.type}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className={`font-bold text-navy leading-snug mb-1 group-hover:text-blue transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
            {screen.name}
          </h3>
          <p className="text-g-500 text-xs mb-3 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {screen.loc}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${venueColor}`}>
                {screen.venue}
              </span>
              <span className="text-g-300 text-xs">{screen.size}</span>
            </div>
            {!compact && (
              <div className="text-right">
                <p className="text-xs text-g-500">từ</p>
                <p className="text-sm font-bold text-navy">{formatPrice(screen.weekly)}<span className="text-xs font-normal text-g-500">/tuần</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
