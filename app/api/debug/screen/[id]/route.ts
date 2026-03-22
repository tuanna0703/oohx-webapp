// Debug endpoint — XÓA SAU KHI DEBUG XONG
import { NextRequest, NextResponse } from 'next/server'
import { getScreen } from '@/lib/tapon/inventory'
import { mapScreen } from '@/lib/tapon/mapper'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const result: Record<string, unknown> = { params_id: id }

  try {
    const raw = await getScreen(id)
    result.getScreen_ok  = true
    result.raw_screen_id = raw?.screen_id
    result.raw_name      = raw?.name
    result.raw_type      = raw?.screen_type
    result.raw_venue     = raw?.venue_type

    const mapped = mapScreen(raw)
    result.mapScreen_ok = true
    result.mapped_id    = mapped.id
    result.mapped_name  = mapped.name
    result.mapped_venue = mapped.venue
    result.mapped_type  = mapped.type
    result.mapped_loc   = mapped.loc
  } catch (err) {
    result.error        = String(err)
    result.error_status = (err as { status?: number }).status
    result.stack        = err instanceof Error ? err.stack : undefined
  }

  return NextResponse.json(result)
}
