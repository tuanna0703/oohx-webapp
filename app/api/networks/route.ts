// BFF Proxy — GET /api/networks

import { NextResponse } from 'next/server'
import { getNetworks } from '@/lib/tapon/inventory'

interface CacheEntry { data: unknown; exp: number }
let cache: CacheEntry | null = null

export async function GET() {
  if (cache && Date.now() < cache.exp) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders() },
    })
  }

  try {
    const data = await getNetworks()
    const result = { data }
    cache = { data: result, exp: Date.now() + 30 * 60 * 1000 } // 30 phút
    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/networks] TapON error:', message)
    return NextResponse.json({ data: [] }, { status: 200 }) // trả rỗng, không crash UI
  }
}

function cacheHeaders() {
  return { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' }
}
