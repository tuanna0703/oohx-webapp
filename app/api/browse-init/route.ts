// BFF Proxy — GET /api/browse-init
// Gộp venue-types + networks + locations vào 1 request để tránh
// nhiều Lambda cold-start đồng thời → TapON rate-limit auth → 502
export const maxDuration = 30

import { NextResponse }  from 'next/server'
import { getVenueTypes } from '@/lib/tapon/venueTypes'
import { getNetworks, getLocations } from '@/lib/tapon/inventory'

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
    const [venueTypes, networks, locations] = await Promise.all([
      getVenueTypes(),
      getNetworks(),
      getLocations(),
    ])

    const data = { venueTypes, networks, locations }

    cache = { data, exp: Date.now() + 30 * 60 * 1000 } // 30 phút
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/browse-init] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load filter data' }, { status: 502 })
  }
}

function cacheHeaders() {
  return { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' }
}
