// BFF Proxy — GET /api/screens
// Browser → đây → ssp.tapon.vn (client_secret không bao giờ ra browser)

import { NextRequest, NextResponse } from 'next/server'
import { getScreens } from '@/lib/tapon/inventory'
import { mapScreenList } from '@/lib/tapon/mapper'
import type { ScreenListParams } from '@/lib/tapon/types'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams

    const params: ScreenListParams = {
      page:   sp.has('page')   ? Number(sp.get('page'))  : 1,
      limit:  sp.has('limit')  ? Number(sp.get('limit')) : 20,
      status: 'active',
    }

    const city        = sp.get('city')
    const venue_type  = sp.get('venue_type')
    const screen_type = sp.get('screen_type')
    const updated_after = sp.get('updated_after')

    if (city)          params.city         = city
    if (venue_type)    params.venue_type   = venue_type   as ScreenListParams['venue_type']
    if (screen_type)   params.screen_type  = screen_type  as ScreenListParams['screen_type']
    if (updated_after) params.updated_after = updated_after

    const result = await getScreens(params)

    return NextResponse.json({
      total: result.total,
      page:  result.page,
      limit: result.limit,
      data:  mapScreenList(result.data),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/screens]', message)
    return NextResponse.json({ error: 'Failed to load screens' }, { status: 500 })
  }
}
