// Debug endpoint — XÓA SAU KHI DEBUG XONG
// Truy cập: /api/debug/screen/C0%3AFB%3AF9%3ACD%3AC6%3A2F

import { NextRequest, NextResponse } from 'next/server'

const SSP_BASE = process.env.TAPON_BASE_URL ?? 'https://ssp.tapon.vn/api/v1'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const rawId = params.id
  const decodedId = decodeURIComponent(rawId)

  const result: Record<string, unknown> = {
    params_id_raw:     rawId,
    params_id_decoded: decodedId,
    tapon_base_url:    SSP_BASE,
    has_secret:        !!process.env.TAPON_CLIENT_SECRET,
    has_client_id:     !!process.env.TAPON_CLIENT_ID,
  }

  // Test auth
  try {
    const authRes = await fetch(`${SSP_BASE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.TAPON_CLIENT_ID ?? 'oohx_marketplace',
        client_secret: process.env.TAPON_CLIENT_SECRET,
        grant_type:    'client_credentials',
        scope:         'inventory booking reporting',
      }),
    })
    const authBody = await authRes.json()
    result.auth_status = authRes.status
    result.auth_ok = authRes.ok
    if (authRes.ok) {
      result.token_type  = authBody.token_type
      result.token_scope = authBody.scope

      // Test screen fetch with decoded id
      const token = authBody.access_token
      const screenUrl = `${SSP_BASE}/inventory/screens/${decodedId}`
      result.screen_url = screenUrl

      const screenRes = await fetch(screenUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      result.screen_status = screenRes.status
      result.screen_ok = screenRes.ok

      if (screenRes.ok) {
        const data = await screenRes.json()
        result.screen_id   = data.screen_id
        result.screen_name = data.name
        result.screen_type = data.screen_type
        result.venue_type  = data.venue_type
      } else {
        result.screen_error = await screenRes.text()
      }
    } else {
      result.auth_error = authBody
    }
  } catch (e) {
    result.exception = String(e)
  }

  return NextResponse.json(result, { status: 200 })
}
