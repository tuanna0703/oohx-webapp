// BFF Proxy — GET /api/screens
// Browser → đây → ssp.tapon.vn (client_secret không bao giờ ra browser)

import { NextRequest, NextResponse } from 'next/server'
import { getScreens, getAllScreens } from '@/lib/tapon/inventory'
import { mapScreenList } from '@/lib/tapon/mapper'
import type { ScreenListParams } from '@/lib/tapon/types'

// ─── In-memory cache (per Lambda warm instance) ───────────────────────────────
// Tránh gọi lại TapON mỗi request trong cùng một Lambda instance
interface CacheEntry { data: unknown; exp: number }
const memCache = new Map<string, CacheEntry>()

function getCached<T>(key: string): T | null {
  const entry = memCache.get(key)
  if (!entry || Date.now() > entry.exp) return null
  return entry.data as T
}

function setCached(key: string, data: unknown, ttlMs: number) {
  memCache.set(key, { data, exp: Date.now() + ttlMs })
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const fetchAll    = sp.get('all') === 'true'
  const city        = sp.get('city')        || ''
  const venue_type  = sp.get('venue_type')  || ''
  const screen_type = sp.get('screen_type') || ''
  const page        = sp.has('page')  ? Number(sp.get('page'))  : 1
  const limit       = sp.has('limit') ? Number(sp.get('limit')) : 20

  const cacheKey = fetchAll
    ? `all:${city}:${venue_type}:${screen_type}`
    : `list:${page}:${limit}:${city}:${venue_type}:${screen_type}`

  // Trả từ cache nếu còn hợp lệ
  const hit = getCached<object>(cacheKey)
  if (hit) {
    return NextResponse.json(hit, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders(fetchAll) },
    })
  }

  const baseParams = {
    status:      'active' as const,
    city:        city        || undefined,
    venue_type:  (venue_type  || undefined) as ScreenListParams['venue_type'],
    screen_type: (screen_type || undefined) as ScreenListParams['screen_type'],
  }

  try {
    let result: object

    if (fetchAll) {
      // Map view: fetch toàn bộ qua parallel pagination
      const data = await getAllScreens(baseParams)
      result = { total: data.length, page: 1, limit: data.length, data: mapScreenList(data) }
      setCached(cacheKey, result, 5 * 60 * 1000) // 5 phút
    } else {
      // List view: một trang
      const res = await getScreens({ ...baseParams, page, limit })
      result = { total: res.total, page: res.page, limit: res.limit, data: mapScreenList(res.data) }
      setCached(cacheKey, result, 2 * 60 * 1000) // 2 phút
    }

    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders(fetchAll) },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/screens] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load screens' }, { status: 502 })
  }
}

// Cache-Control headers → Vercel CDN cache thêm một lớp nữa
function cacheHeaders(fetchAll: boolean) {
  const maxAge = fetchAll ? 300 : 120 // seconds
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  }
}
