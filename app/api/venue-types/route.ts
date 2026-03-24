// BFF Proxy — GET /api/venue-types

import { NextResponse } from 'next/server'
import { getVenueTypes } from '@/lib/tapon/venueTypes'
import type { VenueTypeNode } from '@/lib/tapon/types'

interface CacheEntry { data: VenueTypeNode[]; exp: number }
let cache: CacheEntry | null = null

export async function GET() {
  if (cache && Date.now() < cache.exp) {
    return NextResponse.json({ data: cache.data }, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders() },
    })
  }

  try {
    const data = await getVenueTypes()
    cache = { data, exp: Date.now() + 30 * 60 * 1000 } // 30 phút — khớp TTL server
    return NextResponse.json({ data }, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/venue-types] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load venue types' }, { status: 502 })
  }
}

function cacheHeaders() {
  return { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' }
}
