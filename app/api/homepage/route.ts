// BFF Proxy — GET /api/homepage
// Gộp stats + venue-types + owners + screens vào 1 request để tránh
// nhiều Lambda cold-start đồng thời → TapON rate-limit auth → 502
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { getStats }      from '@/lib/tapon/stats'
import { getVenueTypes } from '@/lib/tapon/venueTypes'
import { getOwners }     from '@/lib/tapon/owners'
import { getScreens }    from '@/lib/tapon/inventory'
import { mapScreenList } from '@/lib/tapon/mapper'

interface CacheEntry { data: unknown; exp: number }
let cache: CacheEntry | null = null

export async function GET() {
  if (cache && Date.now() < cache.exp) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders() },
    })
  }

  try {
    // Cùng 1 Lambda → fetchToken() dedup hoạt động → chỉ 1 TapON auth call
    const [stats, venueTypes, ownersRes, screensRes] = await Promise.all([
      getStats(),
      getVenueTypes(),
      getOwners({ featured: true, limit: 6 }),
      getScreens({ limit: 3, sort: 'newest', status: 'active' }),
    ])

    const data = {
      stats,
      venueTypes,
      owners:  ownersRes.data ?? [],
      screens: mapScreenList(screensRes.data ?? []),
    }

    cache = { data, exp: Date.now() + 15 * 60 * 1000 } // 15 phút
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/homepage] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load homepage data' }, { status: 502 })
  }
}

function cacheHeaders() {
  return { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' }
}
