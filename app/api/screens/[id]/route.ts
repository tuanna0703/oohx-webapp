// BFF Proxy — GET /api/screens/:id

import { NextRequest, NextResponse } from 'next/server'
import { getScreen } from '@/lib/tapon/inventory'
import { mapScreen } from '@/lib/tapon/mapper'

interface Context {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const raw = await getScreen(params.id)
    return NextResponse.json(mapScreen(raw))
  } catch (err) {
    const status  = (err as { status?: number }).status
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (status === 404) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    console.error(`[/api/screens/${params.id}]`, message)
    return NextResponse.json({ error: 'Failed to load screen' }, { status: 500 })
  }
}
