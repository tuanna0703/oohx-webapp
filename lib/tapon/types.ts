// TapON SSP — TypeScript type definitions
// Base URL: https://ssp.tapon.vn/api/v1

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface TapOnScreen {
  screen_id: string
  name: string
  owner_id: string
  owner_name: string
  screen_type: 'lcd' | 'led' | 'billboard'
  venue_type: 'mall' | 'outdoor' | 'fnb' | 'transit' | 'office'
  location: {
    address: string
    city: string
    district: string
    lat: number
    lng: number
  }
  specs: {
    width_px: number
    height_px: number
    width_m: number | null
    height_m: number | null
    orientation: 'landscape' | 'portrait' | 'square'
    resolution: string | null
  }
  slot_duration_sec: number
  slots_per_loop: number
  operating_hours: {
    open: string
    close: string
    days: string[]
  }
  price_per_slot_vnd: number
  min_booking_days: number
  photos: string[]
  status: 'active' | 'inactive'
  updated_at: string
}

export interface TapOnListResponse {
  total: number
  page: number
  limit: number
  data: TapOnScreen[]
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TapOnTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  scope: string
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export type TapOnWebhookEvent =
  | 'screen.created'
  | 'screen.updated'
  | 'screen.deactivated'

export interface TapOnWebhookPayload {
  event: TapOnWebhookEvent
  timestamp: string
  data: {
    screen_id: string
    changed_fields?: string[]
  }
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export interface TapOnApiError {
  error: string
  message: string
  code: number
  details?: Array<{
    field: string
    issue: string
    expected?: string
  }>
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ScreenListParams {
  page?: number
  limit?: number
  city?: string
  venue_type?: 'mall' | 'outdoor' | 'fnb' | 'transit' | 'office'
  screen_type?: 'lcd' | 'led' | 'billboard'
  status?: 'active' | 'inactive'
  updated_after?: string // ISO8601
}
