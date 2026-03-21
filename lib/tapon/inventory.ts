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

// ─── Single screen ────────────────────────────────────────────────────────────

export async function getScreen(screenId: string): Promise<TapOnScreen> {
  if (!screenId) throw new Error('screenId is required')
  return sspFetchJson<TapOnScreen>(`/inventory/screens/${encodeURIComponent(screenId)}`)
}
