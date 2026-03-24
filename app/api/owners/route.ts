// BFF Proxy — GET /api/owners

import { NextRequest, NextResponse } from 'next/server'
import { getOwners } from '@/lib/tapon/owners'

interface CacheEntry { data: unknown; exp: number }
const memCache = new Map<string, CacheEntry>()

export async function GET(req: NextRequest) {
  const sp       = req.nextUrl.searchParams
  const featured = sp.get('featured') === 'true'
  const limit    = sp.has('limit') ? Number(sp.get('limit')) : 20
  const page     = sp.has('page')  ? Number(sp.get('page'))  : 1

  const cacheKey = `${featured}:${limit}:${page}`
  const hit = memCache.get(cacheKey)
  if (hit && Date.now() < hit.exp) {
    return NextResponse.json(hit.data, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders() },
    })
  }

  try {
    const data = await getOwners({ featured: featured || undefined, limit, page })
    memCache.set(cacheKey, { data, exp: Date.now() + 10 * 60 * 1000 }) // 10 phút
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/owners] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load owners' }, { status: 502 })
  }
}

function cacheHeaders() {
  return { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' }
}
