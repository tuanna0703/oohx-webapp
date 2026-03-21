export interface Screen {
  id: string
  name: string
  loc: string
  venue: string
  type: string
  size: string
  weekly: number          // weekly impressions (0 nếu chưa có từ API)
  price_per_slot_vnd: number
  lat: number
  lng: number
  color: 'green' | 'blue' | 'orange'
  thumb: string           // CSS class suffix (bg1..bg6) — fallback khi không có photo
  photoUrl?: string       // URL ảnh thật từ TapON photos[]
  owner: string           // owner_id — dùng làm key lookup
  owner_name: string
  slot_duration_sec: number
  slots_per_loop: number
  min_booking_days: number
  orientation: 'landscape' | 'portrait' | 'square'
  operating_hours?: {
    open: string
    close: string
    days: string[]
  }
}

export interface Owner {
  slug: string
  name: string
  emoji: string
  tagline: string
  coverBg: string
  about: string
  founded: number
  screens: number
  cities: number
  venues: string[]
  website: string
  email: string
  phone: string
  lat: number
  lng: number
}

export type VenueType = 'Outdoor' | 'Retail' | 'F&B' | 'Office' | 'Transit' | 'Entertainment'
