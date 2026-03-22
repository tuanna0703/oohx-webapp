// TapON SSP — Data mapper
// Chuyển đổi TapOnScreen → Screen (OOHX internal type)

import type { TapOnScreen } from './types'
import type { Screen } from '../types'

// ─── Lookup maps ──────────────────────────────────────────────────────────────

const VENUE_MAP: Record<TapOnScreen['venue_type'], string> = {
  mall:    'Retail',
  outdoor: 'Outdoor',
  fnb:     'F&B',
  transit: 'Transit',
  office:  'Office',
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
  const { district, city } = s.location
  const cityLabel: Record<string, string> = {
    hanoi:  'Hà Nội',
    hcm:    'TP. Hồ Chí Minh',
    danang: 'Đà Nẵng',
  }
  const cityName = cityLabel[city] ?? city
  return district ? `${district}, ${cityName}` : cityName
}

// ─── Main mapper ──────────────────────────────────────────────────────────────

export function mapScreen(s: TapOnScreen): Screen {
  const venue = VENUE_MAP[s.venue_type] ?? s.venue_type ?? 'Outdoor'
  const type  = TYPE_MAP[s.screen_type] ?? s.screen_type?.toUpperCase() ?? 'LCD'

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
