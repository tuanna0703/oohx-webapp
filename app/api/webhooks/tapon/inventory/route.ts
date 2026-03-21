// Webhook receiver — POST /api/webhooks/tapon/inventory
// TapON gọi vào đây khi screen thay đổi
// Verify HMAC → revalidate cache screens

import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { revalidatePath } from 'next/cache'
import type { TapOnWebhookPayload } from '@/lib/tapon/types'

export async function POST(req: NextRequest) {
  // ── 1. Verify signature ────────────────────────────────────────────────────
  const signature = req.headers.get('x-tapon-signature')
  const secret    = process.env.TAPON_WEBHOOK_SECRET

  if (!secret) {
    console.error('[webhook/tapon] TAPON_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  }

  const rawBody = await req.text()

  const expected = 'sha256=' + createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  if (!signature || signature !== expected) {
    console.warn('[webhook/tapon] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // ── 2. Parse payload ───────────────────────────────────────────────────────
  let payload: TapOnWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, data } = payload
  console.log(`[webhook/tapon] ${event} — screen: ${data.screen_id}`)

  // ── 3. Revalidate cache ────────────────────────────────────────────────────
  // Xóa cache danh sách màn hình và trang detail liên quan
  revalidatePath('/api/screens')
  revalidatePath(`/api/screens/${data.screen_id}`)

  // Nếu màn hình bị deactivate, revalidate trang browse
  if (event === 'screen.deactivated') {
    revalidatePath('/browse')
  }

  return NextResponse.json({ received: true })
}
