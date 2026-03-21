# TapON SSP — API Payload Specification

> Tài liệu này định nghĩa toàn bộ request/response payload cho TapON SSP API.
> Dùng làm cơ sở để viết backend service tích hợp với OOHX.

**Base URL:** `https://api.tapon.vn/v1`
**Auth:** Bearer Token trong header `Authorization: Bearer <token>`
**Content-Type:** `application/json`

---

## Phase 1 — Authentication

### POST /auth/token
Lấy access token bằng API credentials.

**Request:**
```json
{
  "client_id": "oohx_marketplace",
  "client_secret": "YOUR_SECRET_KEY",
  "grant_type": "client_credentials",
  "scope": "inventory booking reporting"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "inventory booking reporting"
}
```

**Response 401:**
```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed"
}
```

---

## Phase 2 — Inventory Sync

### GET /inventory/screens
Lấy toàn bộ danh sách màn hình DOOH.

**Query Params:**
```
page=1
limit=50
city=hanoi|hcm|danang
venue_type=mall|outdoor|fnb|transit|office
screen_type=lcd|led|billboard
status=active|inactive
updated_after=2026-01-01T00:00:00Z   (cho incremental sync)
```

**Response 200:**
```json
{
  "total": 1240,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "screen_id": "SCR-HN-001",
      "name": "Màn hình Vincom Bà Triệu - Tầng 1",
      "owner_id": "OWN-001",
      "owner_name": "VinMedia",
      "screen_type": "lcd",
      "venue_type": "mall",
      "location": {
        "address": "191 Bà Triệu, Hai Bà Trưng",
        "city": "hanoi",
        "district": "Hai Bà Trưng",
        "lat": 21.0122,
        "lng": 105.8412
      },
      "specs": {
        "width_px": 1920,
        "height_px": 1080,
        "width_m": 2.0,
        "height_m": 1.1,
        "orientation": "landscape",
        "resolution": "1080p"
      },
      "slot_duration_sec": 15,
      "slots_per_loop": 8,
      "operating_hours": {
        "open": "08:00",
        "close": "22:00",
        "days": ["mon","tue","wed","thu","fri","sat","sun"]
      },
      "price_per_slot_vnd": 500000,
      "min_booking_days": 7,
      "photos": [
        "https://cdn.tapon.vn/screens/SCR-HN-001/photo1.jpg"
      ],
      "status": "active",
      "updated_at": "2026-03-01T10:00:00Z"
    }
  ]
}
```

---

### GET /inventory/screens/:screen_id
Lấy chi tiết 1 màn hình.

**Response 200:** Trả về 1 object screen (cùng schema với item trong mảng `data` ở trên).

**Response 404:**
```json
{
  "error": "screen_not_found",
  "message": "Screen SCR-HN-001 does not exist"
}
```

---

### POST /inventory/webhook/register
Đăng ký webhook để nhận update khi inventory thay đổi.

**Request:**
```json
{
  "url": "https://oohx.net/api/webhooks/tapon/inventory",
  "events": ["screen.created", "screen.updated", "screen.deactivated"],
  "secret": "OOHX_WEBHOOK_SECRET"
}
```

**Response 200:**
```json
{
  "webhook_id": "WH-001",
  "status": "active"
}
```

**Webhook Payload (TapON → OOHX):**
```json
{
  "event": "screen.updated",
  "timestamp": "2026-03-15T08:30:00Z",
  "data": {
    "screen_id": "SCR-HN-001",
    "changed_fields": ["price_per_slot_vnd", "status"]
  }
}
```

---

## Phase 3 — Availability & Pricing

### POST /availability/check
Kiểm tra slot available cho 1 hoặc nhiều màn hình.

**Request:**
```json
{
  "screen_ids": ["SCR-HN-001", "SCR-HN-002"],
  "date_from": "2026-04-01",
  "date_to": "2026-04-30",
  "slots_per_day": 48,
  "time_range": {
    "from": "07:00",
    "to": "22:00"
  }
}
```

**Response 200:**
```json
{
  "data": [
    {
      "screen_id": "SCR-HN-001",
      "available": true,
      "available_slots": 42,
      "total_slots": 48,
      "booked_dates": ["2026-04-10", "2026-04-11"],
      "estimated_price_vnd": 21000000
    },
    {
      "screen_id": "SCR-HN-002",
      "available": false,
      "available_slots": 0,
      "total_slots": 48,
      "booked_dates": ["2026-04-01", "2026-04-30"],
      "estimated_price_vnd": 0
    }
  ]
}
```

---

### GET /pricing/rate-card
Lấy bảng giá theo loại màn hình / venue / thành phố.

**Query Params:**
```
city=hanoi
venue_type=mall
screen_type=lcd
```

**Response 200:**
```json
{
  "currency": "VND",
  "data": [
    {
      "screen_type": "lcd",
      "venue_type": "mall",
      "city": "hanoi",
      "price_per_slot_vnd": 500000,
      "price_per_day_vnd": 8000000,
      "price_per_week_vnd": 52000000,
      "price_per_month_vnd": 200000000,
      "min_booking_days": 7,
      "peak_multiplier": 1.5,
      "peak_hours": ["11:00-13:00", "17:00-21:00"]
    }
  ]
}
```

---

## Phase 4 — Campaign Booking

### POST /campaigns
Tạo campaign mới.

**Request:**
```json
{
  "name": "Vinamilk Summer 2026",
  "advertiser": {
    "name": "Vinamilk",
    "industry": "fmcg",
    "contact_email": "media@vinamilk.com.vn"
  },
  "date_from": "2026-04-01",
  "date_to": "2026-04-30",
  "budget_vnd": 500000000,
  "objective": "brand_awareness",
  "target_cities": ["hanoi", "hcm"],
  "target_venue_types": ["mall", "outdoor"],
  "notes": "Ưu tiên màn hình tại trung tâm thương mại lớn"
}
```

**Response 201:**
```json
{
  "campaign_id": "CMP-2026-001",
  "status": "draft",
  "created_at": "2026-03-21T10:00:00Z"
}
```

---

### POST /creatives/upload
Upload file quảng cáo cho campaign.

**Request:** `multipart/form-data`
```
campaign_id: CMP-2026-001
file: [binary video/image file]
creative_type: video|image
duration_sec: 15
```

**Response 200:**
```json
{
  "creative_id": "CRE-001",
  "campaign_id": "CMP-2026-001",
  "url": "https://cdn.tapon.vn/creatives/CRE-001.mp4",
  "status": "processing",
  "specs": {
    "width_px": 1920,
    "height_px": 1080,
    "duration_sec": 15,
    "file_size_mb": 12.4,
    "format": "mp4"
  }
}
```

---

### POST /bookings
Đặt slot màn hình cho campaign.

**Request:**
```json
{
  "campaign_id": "CMP-2026-001",
  "creative_id": "CRE-001",
  "line_items": [
    {
      "screen_id": "SCR-HN-001",
      "date_from": "2026-04-01",
      "date_to": "2026-04-30",
      "slots_per_loop": 2,
      "time_range": {
        "from": "08:00",
        "to": "22:00"
      }
    },
    {
      "screen_id": "SCR-HCM-005",
      "date_from": "2026-04-01",
      "date_to": "2026-04-30",
      "slots_per_loop": 1,
      "time_range": {
        "from": "07:00",
        "to": "22:00"
      }
    }
  ],
  "payment_method": "bank_transfer",
  "notes": "Cần xác nhận trước ngày 25/03"
}
```

**Response 201:**
```json
{
  "booking_id": "BK-2026-001",
  "campaign_id": "CMP-2026-001",
  "status": "pending_approval",
  "total_price_vnd": 180000000,
  "line_items": [
    {
      "line_item_id": "LI-001",
      "screen_id": "SCR-HN-001",
      "status": "pending",
      "price_vnd": 120000000
    },
    {
      "line_item_id": "LI-002",
      "screen_id": "SCR-HCM-005",
      "status": "pending",
      "price_vnd": 60000000
    }
  ],
  "created_at": "2026-03-21T10:30:00Z",
  "expires_at": "2026-03-25T23:59:59Z"
}
```

---

### GET /bookings/:booking_id
Lấy trạng thái booking.

**Response 200:**
```json
{
  "booking_id": "BK-2026-001",
  "campaign_id": "CMP-2026-001",
  "status": "approved",
  "approved_at": "2026-03-22T09:00:00Z",
  "line_items": [
    {
      "line_item_id": "LI-001",
      "screen_id": "SCR-HN-001",
      "status": "approved"
    }
  ]
}
```

**Booking status values:**
- `pending_approval` — đang chờ media owner duyệt
- `approved` — đã duyệt, chờ chạy
- `rejected` — bị từ chối
- `running` — đang chạy
- `completed` — đã xong
- `cancelled` — đã huỷ

---

### POST /bookings/:booking_id/cancel
Huỷ booking.

**Request:**
```json
{
  "reason": "Budget cut"
}
```

**Response 200:**
```json
{
  "booking_id": "BK-2026-001",
  "status": "cancelled",
  "cancelled_at": "2026-03-22T11:00:00Z",
  "refund_vnd": 180000000
}
```

---

### POST /webhooks/booking (TapON → OOHX)
Webhook TapON gửi về khi trạng thái booking thay đổi.

**Payload:**
```json
{
  "event": "booking.status_changed",
  "timestamp": "2026-03-22T09:00:00Z",
  "data": {
    "booking_id": "BK-2026-001",
    "old_status": "pending_approval",
    "new_status": "approved",
    "line_items": [
      {
        "line_item_id": "LI-001",
        "screen_id": "SCR-HN-001",
        "status": "approved"
      }
    ]
  }
}
```

---

## Phase 5 — Reporting

### GET /reports/impressions
Lấy dữ liệu impression theo campaign / screen.

**Query Params:**
```
campaign_id=CMP-2026-001
screen_id=SCR-HN-001           (optional)
date_from=2026-04-01
date_to=2026-04-30
group_by=day|screen|city
```

**Response 200:**
```json
{
  "campaign_id": "CMP-2026-001",
  "date_from": "2026-04-01",
  "date_to": "2026-04-30",
  "total_impressions": 2400000,
  "total_plays": 5760,
  "data": [
    {
      "date": "2026-04-01",
      "screen_id": "SCR-HN-001",
      "impressions": 80000,
      "plays": 192,
      "completion_rate": 0.97
    }
  ]
}
```

---

### GET /reports/revenue
Lấy dữ liệu doanh thu (dành cho media owner hoặc admin OOHX).

**Query Params:**
```
owner_id=OWN-001
date_from=2026-04-01
date_to=2026-04-30
group_by=screen|day|month
```

**Response 200:**
```json
{
  "owner_id": "OWN-001",
  "total_revenue_vnd": 180000000,
  "total_bookings": 12,
  "data": [
    {
      "screen_id": "SCR-HN-001",
      "bookings": 5,
      "revenue_vnd": 60000000,
      "occupancy_rate": 0.78
    }
  ]
}
```

---

## Error Response chuẩn (tất cả endpoints)

```json
{
  "error": "validation_error",
  "message": "date_from must be before date_to",
  "code": 400,
  "details": [
    {
      "field": "date_from",
      "issue": "invalid_format",
      "expected": "YYYY-MM-DD"
    }
  ]
}
```

**Error codes:**
| HTTP | error | Ý nghĩa |
|------|-------|---------|
| 400 | validation_error | Payload sai định dạng |
| 401 | unauthorized | Token không hợp lệ / hết hạn |
| 403 | forbidden | Không có quyền |
| 404 | not_found | Resource không tồn tại |
| 409 | conflict | Slot đã bị book |
| 429 | rate_limited | Quá nhiều request |
| 500 | server_error | Lỗi phía TapON |

---

## File TypeScript Types (để dev tham khảo)

```typescript
// lib/tapon/types.ts

export interface TapOnScreen {
  screen_id: string
  name: string
  owner_id: string
  owner_name: string
  screen_type: 'lcd' | 'led' | 'billboard'
  venue_type: 'mall' | 'outdoor' | 'fnb' | 'transit' | 'office'
  location: {
    address: string
    city: 'hanoi' | 'hcm' | 'danang' | string
    district: string
    lat: number
    lng: number
  }
  specs: {
    width_px: number
    height_px: number
    width_m: number
    height_m: number
    orientation: 'landscape' | 'portrait' | 'square'
    resolution: string
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

export interface TapOnBookingRequest {
  campaign_id: string
  creative_id: string
  line_items: Array<{
    screen_id: string
    date_from: string
    date_to: string
    slots_per_loop: number
    time_range: { from: string; to: string }
  }>
  payment_method: 'bank_transfer' | 'credit_card' | 'wallet'
  notes?: string
}

export type BookingStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'running'
  | 'completed'
  | 'cancelled'

export interface TapOnBookingResponse {
  booking_id: string
  campaign_id: string
  status: BookingStatus
  total_price_vnd: number
  line_items: Array<{
    line_item_id: string
    screen_id: string
    status: BookingStatus
    price_vnd: number
  }>
  created_at: string
  expires_at: string
}
```
