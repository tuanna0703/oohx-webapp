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
  const q        = sp.get('q') ?? ''

  const cacheKey = `${featured}:${limit}:${page}:${q}`
  const hit = memCache.get(cacheKey)
  if (hit && Date.now() < hit.exp) {
    return NextResponse.json(hit.data, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders(!!q) },
    })
  }

  try {
    const data = await getOwners({ featured: featured || undefined, limit, page, q: q || undefined })
    const ttl = q ? 2 * 60 * 1000 : 10 * 60 * 1000 // 2 phút khi search, 10 phút bình thường
    memCache.set(cacheKey, { data, exp: Date.now() + ttl })
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders(!!q) },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/owners] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load owners' }, { status: 502 })
  }
}

function cacheHeaders(isSearch = false) {
  const maxAge = isSearch ? 120 : 600
  return { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}` }
}
