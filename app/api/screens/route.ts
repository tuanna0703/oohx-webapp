// BFF Proxy — GET /api/screens
// Browser → đây → ssp.tapon.vn (client_secret không bao giờ ra browser)

import { NextRequest, NextResponse } from 'next/server'
import { getScreens, getMapScreens } from '@/lib/tapon/inventory'
import { mapScreenList, mapMapScreenList } from '@/lib/tapon/mapper'
import type { ScreenListParams } from '@/lib/tapon/types'

// ─── In-memory cache (per Lambda warm instance) ───────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Đọc param đơn hoặc mảng (key=val hoặc key[]=val1&key[]=val2)
function getParamValues(sp: URLSearchParams, key: string): string[] {
  const multi = sp.getAll(`${key}[]`)
  if (multi.length > 0) return multi
  const single = sp.get(key)
  return single ? [single] : []
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const fetchAll     = sp.get('all') === 'true'
  const cities       = getParamValues(sp, 'city')
  const regions      = getParamValues(sp, 'region')
  const districts    = getParamValues(sp, 'district')
  const venue_types  = getParamValues(sp, 'venue_type')
  const screen_types = getParamValues(sp, 'screen_type')
  const orientations = getParamValues(sp, 'orientation')
  const networks     = getParamValues(sp, 'network')
  const owners       = getParamValues(sp, 'owner')
  const q            = sp.get('q')    || ''
  const sort         = sp.get('sort') || ''
  const page         = sp.has('page')  ? Number(sp.get('page'))  : 1
  const limit        = sp.has('limit') ? Number(sp.get('limit')) : 20

  const filterKey = [
    cities.join(','), regions.join(','), districts.join(','),
    venue_types.join(','), screen_types.join(','), orientations.join(','),
    networks.join(','), owners.join(','), q, sort,
  ].join('|')
  const cacheKey = fetchAll ? `map:${filterKey}` : `list:${page}:${limit}:${filterKey}`

  const hit = getCached<object>(cacheKey)
  if (hit) {
    return NextResponse.json(hit, {
      headers: { 'X-Cache': 'HIT', ...cacheHeaders(fetchAll) },
    })
  }

  const baseParams: Omit<ScreenListParams, 'page' | 'limit'> = {
    status:      'active',
    city:        cities.length       > 0 ? cities       : undefined,
    region:      regions.length      > 0 ? regions      : undefined,
    district:    districts.length    > 0 ? districts    : undefined,
    venue_type:  venue_types.length  > 0 ? venue_types  : undefined,
    screen_type: screen_types.length > 0 ? screen_types : undefined,
    orientation: orientations.length > 0 ? orientations : undefined,
    network:     networks.length     > 0 ? networks     : undefined,
    owner:       owners.length       > 0 ? owners       : undefined,
    q:           q    || undefined,
    sort:        (sort || undefined) as ScreenListParams['sort'],
  }

  try {
    let result: object

    if (fetchAll) {
      // Map view: /inventory/screens/map — payload nhỏ ~90%, không cần paginate
      const data = await getMapScreens(baseParams)
      result = { total: data.length, page: 1, limit: data.length, data: mapMapScreenList(data) }
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

function cacheHeaders(fetchAll: boolean) {
  const maxAge = fetchAll ? 300 : 120
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  }
}
