// BFF Proxy — GET /api/screens
// Browser → đây → ssp.tapon.vn (client_secret không bao giờ ra browser)

import { NextRequest, NextResponse } from 'next/server'
import { getScreens, getAllScreens } from '@/lib/tapon/inventory'
import { mapScreenList } from '@/lib/tapon/mapper'
import type { ScreenListParams } from '@/lib/tapon/types'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const fetchAll    = sp.get('all') === 'true'
  const city        = sp.get('city')        || undefined
  const venue_type  = sp.get('venue_type')  || undefined
  const screen_type = sp.get('screen_type') || undefined

  const baseParams = {
    status:      'active' as const,
    city,
    venue_type:  venue_type  as ScreenListParams['venue_type'],
    screen_type: screen_type as ScreenListParams['screen_type'],
  }

  try {
    if (fetchAll) {
      const data = await getAllScreens(baseParams)
      return NextResponse.json({ total: data.length, page: 1, limit: data.length, data: mapScreenList(data) })
    }

    const params: ScreenListParams = {
      ...baseParams,
      page:  sp.has('page')  ? Number(sp.get('page'))  : 1,
      limit: sp.has('limit') ? Number(sp.get('limit')) : 20,
    }
    const result = await getScreens(params)
    return NextResponse.json({
      total: result.total,
      page:  result.page,
      limit: result.limit,
      data:  mapScreenList(result.data),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/screens] TapON error:', message)
    return NextResponse.json({ error: 'Failed to load screens' }, { status: 502 })
  }
}
