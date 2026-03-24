// TapON SSP — Data mapper
// Chuyển đổi TapOnScreen → Screen (OOHX internal type)

import type { TapOnScreen, MapScreenItem } from './types'
import type { Screen } from '../types'

// ─── Lookup maps ──────────────────────────────────────────────────────────────

// venue_type từ query param (mall/outdoor/fnb/transit/office) → OOHX label
const VENUE_PARAM_MAP: Record<string, string> = {
  mall:    'Retail',
  outdoor: 'Outdoor',
  fnb:     'F&B',
  transit: 'Transit',
  office:  'Office',
}

// venue_type từ TapON là string mô tả tự do, vd: "Malls : Concourse", "Outdoor : Billboard"
function mapVenue(raw: string | null | undefined): string {
  if (!raw) return 'Outdoor'
  const v = raw.toLowerCase()
  if (v.includes('mall') || v.includes('retail') || v.includes('shop') || v.includes('supermarket')) return 'Retail'
  if (v.includes('f&b') || v.includes('fnb') || v.includes('food') || v.includes('coffee') || v.includes('restaurant')) return 'F&B'
  if (v.includes('transit') || v.includes('airport') || v.includes('station') || v.includes('bus')) return 'Transit'
  if (v.includes('office') || v.includes('building') || v.includes('tower') || v.includes('corporate')) return 'Office'
  if (v.includes('outdoor') || v.includes('billboard') || v.includes('street') || v.includes('road')) return 'Outdoor'
  return raw  // fallback: giữ nguyên giá trị TapON
}

const TYPE_MAP: Record<TapOnScreen['screen_type'], string> = {
  lcd:       'LCD',
  led:       'LED',
  billboard: 'Billboard',
}

const COLOR_MAP: Record<string, Screen['color']> = {
  Outdoor:       'green',
  Retail:        'blue',
  'F&B':         'green',
  Transit:       'blue',
  Office:        'blue',
  Entertainment: 'blue',
}

// CSS thumb classes — fallback khi không có photos
const THUMB_BY_TYPE: Record<string, string> = {
  Billboard: 'bg2',
  LED:       'bg4',
  LCD:       'bg1',
}

// ─── Size string ──────────────────────────────────────────────────────────────

function buildSize(s: TapOnScreen): string {
  const { width_m, height_m, width_px } = s.specs

  if (width_m && height_m) {
    return `${width_m}×${height_m}m`
  }

  // Fallback: pixel → inch estimate (1080p landscape ≈ 55")
  if (width_px >= 3840) return '75"'
  if (width_px >= 1920) return '55"'
  return '43"'
}

// ─── Location string ──────────────────────────────────────────────────────────

function buildLoc(s: TapOnScreen): string {
  const { address, district, city } = s.location
  const cityLabel: Record<string, string> = {
    hanoi:  'Hà Nội',
    hcm:    'TP. Hồ Chí Minh',
    danang: 'Đà Nẵng',
  }
  const cityName = city ? (cityLabel[city] ?? city) : null
  const parts = [address, district, cityName].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Việt Nam'
}

// ─── Main mapper ──────────────────────────────────────────────────────────────

export function mapScreen(s: TapOnScreen): Screen {
  const venue = mapVenue(s.venue_type)
  const type  = TYPE_MAP[s.screen_type as keyof typeof TYPE_MAP] ?? s.screen_type?.toUpperCase() ?? 'LCD'

  return {
    id:                s.screen_id,
    name:              s.name,
    loc:               buildLoc(s),
    venue,
    type,
    size:              buildSize(s),
    weekly:            0,                    // populated later from reporting API
    price_per_slot_vnd: s.price_per_slot_vnd,
    lat:               s.location.lat,
    lng:               s.location.lng,
    color:             COLOR_MAP[venue] ?? 'blue',
    thumb:             THUMB_BY_TYPE[type] ?? 'bg1',
    photoUrl:          s.photos?.[0],
    owner:             s.owner_id,
    owner_name:        s.owner_name,
    slot_duration_sec: s.slot_duration_sec,
    slots_per_loop:    s.slots_per_loop,
    min_booking_days:  s.min_booking_days,
    orientation:       s.specs.orientation,
    operating_hours:   s.operating_hours,
  }
}

export function mapScreenList(list: TapOnScreen[]): Screen[] {
  return list.map(mapScreen)
}

// ─── Map endpoint mapper ───────────────────────────────────────────────────────
// MapScreenItem (lightweight) → Screen (fields cần thiết cho MapBrowse + selected panel)

export function mapMapScreenList(list: MapScreenItem[]): Screen[] {
  return list.map(m => {
    const venue = VENUE_PARAM_MAP[m.venue_type] ?? mapVenue(m.venue_type)
    const type  = TYPE_MAP[m.screen_type as keyof typeof TYPE_MAP] ?? m.screen_type.toUpperCase()
    return {
      id:                m.screen_id,
      name:              m.name,
      loc:               m.location.address,
      venue,
      type,
      size:              m.size,
      lat:               m.location.lat,
      lng:               m.location.lng,
      color:             COLOR_MAP[venue] ?? 'blue',
      // Fields không có trong map response — zero defaults (không hiển thị ở map view)
      weekly:            0,
      price_per_slot_vnd: 0,
      thumb:             'bg1',
      owner:             '',
      owner_name:        '',
      slot_duration_sec: 15,
      slots_per_loop:    8,
      min_booking_days:  7,
      orientation:       'landscape',
    }
  })
}
