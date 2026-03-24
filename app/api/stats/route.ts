// BFF Proxy — GET /api/stats

import { NextResponse } from 'next/server'
import { getStats } from '@/lib/tapon/stats'
import type { InventoryStats } from '@/lib/tapon/types'

interface CacheEntry { data: InventoryStats; exp: number }
let cache: CacheEntry | null = null

export async function GET() {
  if (cache && Date.now() < cache.exp) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders() },
    })
  }

  try {
    const data = await getStats()
    cache = { data, exp: Date.now() + 30 * 60 * 1000 } // 30 phút
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/stats] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 502 })
  }
}

function cacheHeaders() {
  return { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' }
}
