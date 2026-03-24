// TapON SSP — Inventory service
// GET /inventory/screens
// GET /inventory/screens/:screen_id

import { sspFetchJson } from './client'
import type { TapOnScreen, TapOnListResponse, MapScreenItem, ScreenListParams } from './types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Hỗ trợ cả single string và string[] → append param[] cho mảng
function appendParam(qs: URLSearchParams, key: string, val: string | string[] | undefined) {
  if (!val || (Array.isArray(val) && val.length === 0)) return
  if (Array.isArray(val)) {
    val.forEach(v => qs.append(`${key}[]`, v))
  } else {
    qs.set(key, val)
  }
}

function buildQS(params: ScreenListParams): string {
  const qs = new URLSearchParams()
  if (params.page         !== undefined) qs.set('page',          String(params.page))
  if (params.limit        !== undefined) qs.set('limit',         String(params.limit))
  if (params.status)                     qs.set('status',        params.status)
  if (params.q)                          qs.set('q',             params.q)
  if (params.sort)                       qs.set('sort',          params.sort)
  if (params.updated_after)              qs.set('updated_after', params.updated_after)
  appendParam(qs, 'city',         params.city)
  appendParam(qs, 'venue_type',   params.venue_type)
  appendParam(qs, 'screen_type',  params.screen_type)
  appendParam(qs, 'orientation',  params.orientation)
  return qs.toString() ? `?${qs}` : ''
}

// ─── List screens ─────────────────────────────────────────────────────────────

export async function getScreens(
  params: ScreenListParams = {},
): Promise<TapOnListResponse> {
  return sspFetchJson<TapOnListResponse>(`/inventory/screens${buildQS(params)}`)
}

// ─── Map endpoint — lightweight, toàn bộ màn hình ───────────────────────────
// Gọi GET /inventory/screens/map, trả về dữ liệu tối thiểu cho bản đồ (~90% nhỏ hơn)

export async function getMapScreens(
  params: Omit<ScreenListParams, 'page' | 'limit'> = {},
): Promise<MapScreenItem[]> {
  const res = await sspFetchJson<{ total: number; data: MapScreenItem[] }>(
    `/inventory/screens/map${buildQS(params)}`,
  )
  return res.data
}

// ─── Single screen ────────────────────────────────────────────────────────────

export async function getScreen(screenId: string): Promise<TapOnScreen> {
  if (!screenId) throw new Error('screenId is required')
  // Single screen API trả về { data: TapOnScreen } — cần unwrap
  const res = await sspFetchJson<{ data: TapOnScreen }>(
    `/inventory/screens/${encodeURI(screenId)}`
  )
  return res.data
}
