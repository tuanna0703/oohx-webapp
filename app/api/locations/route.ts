// BFF Proxy — GET /api/locations

import { NextResponse } from 'next/server'
import { getLocations } from '@/lib/tapon/inventory'

interface CacheEntry { data: unknown; exp: number }
let cache: CacheEntry | null = null

const EMPTY: { regions: []; provinces: []; districts: [] } = { regions: [], provinces: [], districts: [] }

export async function GET() {
  if (cache && Date.now() < cache.exp) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders() },
    })
  }

  try {
    const data = await getLocations()
    cache = { data, exp: Date.now() + 30 * 60 * 1000 } // 30 phút
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/locations] TapON error:', message)
    return NextResponse.json(EMPTY, { status: 200 }) // trả rỗng, không crash UI
  }
}

function cacheHeaders() {
  return { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' }
}
