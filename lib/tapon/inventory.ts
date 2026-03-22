// TapON SSP — Inventory service
// GET /inventory/screens
// GET /inventory/screens/:screen_id

import { sspFetchJson } from './client'
import type { TapOnScreen, TapOnListResponse, ScreenListParams } from './types'

// ─── List screens ─────────────────────────────────────────────────────────────

export async function getScreens(
  params: ScreenListParams = {},
): Promise<TapOnListResponse> {
  const qs = new URLSearchParams()

  if (params.page        !== undefined) qs.set('page',          String(params.page))
  if (params.limit       !== undefined) qs.set('limit',         String(params.limit))
  if (params.city)                      qs.set('city',          params.city)
  if (params.venue_type)                qs.set('venue_type',    params.venue_type)
  if (params.screen_type)               qs.set('screen_type',   params.screen_type)
  if (params.status)                    qs.set('status',        params.status)
  if (params.updated_after)             qs.set('updated_after', params.updated_after)

  const query = qs.toString() ? `?${qs}` : ''
  return sspFetchJson<TapOnListResponse>(`/inventory/screens${query}`)
}

// ─── Fetch toàn bộ screens (parallel pagination) ─────────────────────────────
// Gọi page 1 trước để lấy total, sau đó fetch song song các page còn lại

export async function getAllScreens(
  baseParams: Omit<ScreenListParams, 'page' | 'limit'> = {},
): Promise<TapOnScreen[]> {
  const PAGE_SIZE = 100 // TapON max limit

  // Fetch page 1
  const first = await getScreens({ ...baseParams, page: 1, limit: PAGE_SIZE })
  const total = first.total
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (totalPages <= 1) return first.data

  // Fetch page 2..N song song
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      getScreens({ ...baseParams, page: i + 2, limit: PAGE_SIZE })
        .then(r => r.data)
        .catch(() => [] as TapOnScreen[]), // bỏ qua page lỗi, không dừng cả batch
    ),
  )

  return [...first.data, ...rest.flat()]
}

// ─── Single screen ────────────────────────────────────────────────────────────

export async function getScreen(screenId: string): Promise<TapOnScreen> {
  if (!screenId) throw new Error('screenId is required')
  // encodeURIComponent sẽ encode ':' → '%3A' làm TapON không nhận ra screen_id dạng MAC address
  // Dùng encodeURI để giữ nguyên ':' trong path segment
  return sspFetchJson<TapOnScreen>(`/inventory/screens/${encodeURI(screenId)}`)
}
