// BFF Proxy — GET /api/owners/:slug

import { NextRequest, NextResponse } from 'next/server'
import { getOwner } from '@/lib/tapon/owners'

interface Context { params: { slug: string } }

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const data = await getOwner(params.slug)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' },
    })
  } catch (err) {
    const status  = (err as { status?: number }).status
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (status === 404) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    console.error(`[/api/owners/${params.slug}]`, message)
    return NextResponse.json({ error: 'Failed to load owner' }, { status: 502 })
  }
}
