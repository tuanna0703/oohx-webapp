// TapON SSP — TypeScript type definitions
// Base URL: https://ssp.tapon.vn/api/v1

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface TapOnScreen {
  screen_id: string
  name: string
  owner_id: string
  owner_name: string
  screen_type: 'lcd' | 'led' | 'billboard' | string
  venue_type: string  // TapON trả về string mô tả, vd: "Malls : Concourse"
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
  city?: string | string[]
  region?: string | string[]
  district?: string | string[]
  venue_type?: string | string[]
  screen_type?: string | string[]
  orientation?: string | string[]
  network?: string | string[]
  owner?: string | string[]
  q?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  status?: 'active' | 'inactive'
  updated_after?: string // ISO8601
}

// ─── Venue Types ──────────────────────────────────────────────────────────────

export interface VenueTypeNode {
  type:     string          // string_value từ taxonomy, vd: "outdoor", "retail.malls"
  label:    string          // display name từ venue_types.venue_type
  count:    number          // số màn hình active (đã roll-up từ con)
  children: VenueTypeNode[] // cây con, rỗng nếu là leaf
}

export interface VenueTypesResponse {
  data: VenueTypeNode[]
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface InventoryStats {
  total_screens: number
  total_cities:  number
  total_owners:  number
  venues: { type: string; label: string; count: number }[]
  cities: { code: string; name: string; count: number }[]
}

// ─── Owners ───────────────────────────────────────────────────────────────────

export interface TapOnOwner {
  owner_id:     string        // slug — dùng cho URL /owners/:owner_id
  name:         string
  tagline:      string | null
  logo_url:     string | null
  cover_url:    string | null
  screen_count: number
  city_count:   number
  venue_types:  string[]
  website:      string | null
  email:        string | null
  phone:        string | null
  founded:      number | null
  featured:     boolean
  headquarters: { lat: number; lng: number } | null
}

export interface TapOnOwnerDetail extends TapOnOwner {
  about: string | null        // Chỉ có ở GET /inventory/owners/:slug
}

export interface OwnersListResponse {
  total: number
  page:  number
  limit: number
  data:  TapOnOwner[]
}

// ─── Networks ─────────────────────────────────────────────────────────────────

export interface NetworkItem {
  code:         string
  name:         string
  screen_count: number
}

export interface NetworksResponse {
  data: NetworkItem[]
}

// ─── Locations ────────────────────────────────────────────────────────────────

export interface RegionItem {
  code:  string   // north | central | south
  name:  string   // Miền Bắc | Miền Trung | Miền Nam
  count: number
}

export interface ProvinceItem {
  code:   string  // hanoi | hcm | danang ...
  name:   string
  region: string  // → RegionItem.code
  count:  number
}

export interface DistrictItem {
  code:     string  // slug: cau-giay | quan-1 ...
  name:     string
  province: string  // → ProvinceItem.code
  count:    number
}

export interface LocationsResponse {
  regions:   RegionItem[]
  provinces: ProvinceItem[]
  districts: DistrictItem[]
}

// ─── Map endpoint ─────────────────────────────────────────────────────────────
// Lightweight response từ GET /inventory/screens/map — chỉ các field cần cho bản đồ

export interface MapScreenItem {
  screen_id: string
  name: string
  venue_type: string   // param value: mall | outdoor | fnb | transit | office
  screen_type: string  // lcd | led | billboard
  size: string         // pre-formatted bởi Laravel, vd: "14×6m" hoặc "55\""
  location: {
    address: string
    lat: number
    lng: number
  }
}
