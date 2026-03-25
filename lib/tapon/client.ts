// TapON SSP — Base HTTP client
// Chỉ chạy server-side (Next.js API Routes / Server Components)
// KHÔNG import file này ở client components

import type { TapOnTokenResponse } from './types'

const SSP_BASE = process.env.TAPON_BASE_URL ?? 'https://ssp.tapon.vn/api/v1'

// ─── Token cache (in-memory, per process) ─────────────────────────────────────

interface TokenCache {
  token: string
  expiresAt: number // ms timestamp
}

let _cache: TokenCache | null = null
// Dedup: nhiều request đồng thời trong cùng process chỉ fetch token 1 lần
let _pendingToken: Promise<string> | null = null

async function fetchToken(): Promise<string> {
  // Còn hơn 60 giây → tái sử dụng
  if (_cache && _cache.expiresAt - Date.now() > 60_000) {
    return _cache.token
  }

  // Đang có request token đang chờ → dùng chung, tránh N concurrent auth calls
  if (_pendingToken) return _pendingToken

  _pendingToken = (async () => {
    try {
      const clientId     = process.env.TAPON_CLIENT_ID     ?? 'oohx_marketplace'
      const clientSecret = process.env.TAPON_CLIENT_SECRET

      if (!clientSecret) {
        throw new Error('[TapON] TAPON_CLIENT_SECRET is not set')
      }

      // Retry với jitter để tránh nhiều Lambda cold-start cùng đập TapON auth một lúc
      const MAX_ATTEMPTS = 3
      let lastErr: unknown

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (attempt > 0) {
          // Jitter: 400-900ms để các Lambda stagger retry, không đồng loạt
          const delay = 400 + Math.random() * 500
          await new Promise(r => setTimeout(r, delay))
        }

        let res: Response
        try {
          res = await fetch(`${SSP_BASE}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id:     clientId,
              client_secret: clientSecret,
              grant_type:    'client_credentials',
              scope:         'inventory booking reporting',
            }),
            signal: AbortSignal.timeout(8_000), // 8s per attempt
            cache: 'no-store',
          })
        } catch (err) {
          // Network error / timeout → retry
          lastErr = err
          console.warn(`[TapON] Auth attempt ${attempt + 1} network error:`, err)
          continue
        }

        if (res.ok) {
          const data: TapOnTokenResponse = await res.json()
          _cache = {
            token:     data.access_token,
            expiresAt: Date.now() + data.expires_in * 1000,
          }
          return _cache.token
        }

        // 429 (rate limit) hoặc 5xx (server error) → retry
        if (res.status === 429 || res.status >= 500) {
          lastErr = new Error(`[TapON] Auth ${res.status}`)
          console.warn(`[TapON] Auth attempt ${attempt + 1} failed (${res.status}), will retry`)
          continue
        }

        // 4xx khác (401, 403...) → sai credentials, không retry
        const body = await res.text()
        throw new Error(`[TapON] Auth failed ${res.status}: ${body}`)
      }

      throw lastErr ?? new Error('[TapON] Auth failed after all retries')
    } finally {
      _pendingToken = null
    }
  })()

  return _pendingToken
}

// ─── Main fetch wrapper ───────────────────────────────────────────────────────

export async function sspFetch(
  path: string,
  init: RequestInit = {},
  _retried = false,
): Promise<Response> {
  const token = await fetchToken()

  const res = await fetch(`${SSP_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(25_000), // 25s — fail trước Vercel function timeout
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: 'no-store',
  })

  // Token hết hạn sớm → clear cache, retry 1 lần
  if (res.status === 401 && !_retried) {
    _cache = null
    return sspFetch(path, init, true)
  }

  return res
}

// ─── Helper: throw on non-ok ──────────────────────────────────────────────────

export async function sspFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await sspFetch(path, init)

  if (!res.ok) {
    let message = `TapON API error ${res.status}`
    try {
      const err = await res.json()
      message = err.message ?? message
    } catch {
      // ignore parse error
    }
    const error = new Error(message) as Error & { status: number }
    error.status = res.status
    throw error
  }

  return res.json() as Promise<T>
}
