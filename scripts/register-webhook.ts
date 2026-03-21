/**
 * TapON SSP — Đăng ký webhook (chạy 1 lần sau khi deploy)
 *
 * Cách chạy:
 *   npx tsx scripts/register-webhook.ts
 *
 * Yêu cầu: .env.local phải có đủ 3 biến bên dưới
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const SSP_BASE            = process.env.TAPON_BASE_URL     ?? 'https://ssp.tapon.vn/api/v1'
const CLIENT_ID           = process.env.TAPON_CLIENT_ID    ?? 'oohx_marketplace'
const CLIENT_SECRET       = process.env.TAPON_CLIENT_SECRET
const WEBHOOK_SECRET      = process.env.TAPON_WEBHOOK_SECRET
const OOHX_DOMAIN         = process.env.OOHX_DOMAIN        ?? 'https://oohx.net'

// ─── Validate env ─────────────────────────────────────────────────────────────

if (!CLIENT_SECRET) {
  console.error('❌ TAPON_CLIENT_SECRET chưa được set trong .env.local')
  process.exit(1)
}
if (!WEBHOOK_SECRET) {
  console.error('❌ TAPON_WEBHOOK_SECRET chưa được set trong .env.local')
  process.exit(1)
}
if (WEBHOOK_SECRET.length < 16) {
  console.error('❌ TAPON_WEBHOOK_SECRET phải có ít nhất 16 ký tự')
  process.exit(1)
}

// ─── Step 1: Lấy token ────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  console.log('🔑 Đang lấy access token...')

  const res = await fetch(`${SSP_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    'client_credentials',
      scope:         'inventory booking reporting',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Auth thất bại (${res.status}): ${body}`)
  }

  const data = await res.json()
  console.log('✅ Lấy token thành công')
  return data.access_token
}

// ─── Step 2: Đăng ký webhook ──────────────────────────────────────────────────

async function registerWebhook(token: string): Promise<void> {
  const webhookUrl = `${OOHX_DOMAIN}/api/webhooks/tapon/inventory`

  console.log(`\n📡 Đăng ký webhook tới: ${webhookUrl}`)

  const res = await fetch(`${SSP_BASE}/inventory/webhook/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url:    webhookUrl,
      events: ['screen.created', 'screen.updated', 'screen.deactivated'],
      secret: WEBHOOK_SECRET,
    }),
  })

  const body = await res.json()

  if (!res.ok) {
    throw new Error(`Đăng ký webhook thất bại (${res.status}): ${JSON.stringify(body)}`)
  }

  console.log('✅ Webhook đã đăng ký thành công!')
  console.log(`   webhook_id : ${body.webhook_id}`)
  console.log(`   status     : ${body.status}`)
  console.log(`   url        : ${webhookUrl}`)
  console.log('\n⚠️  Lưu webhook_id lại để dùng khi cần unregister.')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== TapON Webhook Registration ===\n')
  console.log(`SSP Base  : ${SSP_BASE}`)
  console.log(`Client ID : ${CLIENT_ID}`)
  console.log(`Domain    : ${OOHX_DOMAIN}\n`)

  try {
    const token = await getToken()
    await registerWebhook(token)
    console.log('\n🎉 Hoàn tất!')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`\n❌ Lỗi: ${msg}`)
    process.exit(1)
  }
}

main()
