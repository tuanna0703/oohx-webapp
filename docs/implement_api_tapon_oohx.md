# Triển khai tích hợp TapON SSP vào OOHX

> Tài liệu này ghi lại từng bước implementation thực tế.
> Cập nhật trạng thái sau mỗi bước hoàn thành.

---

## Hiện trạng OOHX (trước khi tích hợp)

| Thành phần | Trạng thái | Ghi chú |
|---|---|---|
| `lib/data.ts` | Dùng mock data | 12 screens cứng, cần thay bằng TapON API |
| `lib/types.ts` | Interface riêng của OOHX | Cần thêm TapOn types, viết mapper |
| `app/browse/page.tsx` | Client component, import trực tiếp mock | Cần chuyển sang fetch `/api/screens` |
| `app/screens/[id]/page.tsx` | Server component, `generateStaticParams` từ mock | Cần chuyển sang dynamic route + fetch `/api/screens/:id` |
| `components/MapBrowse.tsx` | Dùng `lat/lng` từ mock Screen | Không đổi — TapON cũng trả lat/lng |

---

## Mapping data model: TapON → OOHX

| TapON field | OOHX field | Ghi chú |
|---|---|---|
| `screen_id` (string) | `id` | Đổi type từ `number` → `string` |
| `name` | `name` | Giữ nguyên |
| `location.address + city` | `loc` | Ghép thành chuỗi hiển thị |
| `location.lat / lng` | `lat / lng` | Giữ nguyên |
| `venue_type` (mall/outdoor/fnb/transit/office) | `venue` (Retail/Outdoor/F&B/Transit/Office) | Cần mapper |
| `screen_type` (lcd/led/billboard) | `type` (LCD/LED/Billboard) | Capitalize |
| `specs.width_m x height_m` | `size` | Ghép thành "2.0×1.1m" |
| `price_per_slot_vnd` | `weekly` | Tính weekly = price × slots_per_loop × loops_per_day × 7 |
| `photos[0]` | `thumb` | Ảnh đầu tiên |
| `owner_id` | `owner` | Dùng làm key |
| `owner_name` | — | Lưu thêm vào Screen type |

---

## Các bước triển khai

---

### Bước 1 — Cấu hình môi trường
**Status:** ⬜ Chưa làm

**Việc cần làm:**
- Tạo `.env.local` với các biến:
  ```
  TAPON_CLIENT_SECRET=<lấy từ TapON team>
  TAPON_BASE_URL=https://ssp.tapon.vn/api/v1
  TAPON_WEBHOOK_SECRET=<tự đặt, min 16 ký tự>
  ```
- Thêm `.env.local` vào `.gitignore` (đã có sẵn)
- Thêm vào Vercel: Settings → Environment Variables

**File tạo mới:** `.env.local`

---

### Bước 2 — TapON TypeScript Types
**Status:** ⬜ Chưa làm

**File tạo mới:** `lib/tapon/types.ts`

```typescript
// TapOnScreen — schema từ GET /inventory/screens
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

export interface TapOnApiError {
  error: string
  message: string
  code: number
  details?: Array<{ field: string; issue: string; expected?: string }>
}
```

---

### Bước 3 — Base HTTP Client (auth + token cache)
**Status:** ⬜ Chưa làm

**File tạo mới:** `lib/tapon/client.ts`

Logic:
- Gọi `POST /auth/token` để lấy Bearer token
- Cache token trong memory, tự động refresh khi còn < 60 giây
- Nếu nhận 401 từ bất kỳ endpoint → clear cache, retry 1 lần
- Chỉ chạy ở server-side (Next.js API Routes), không expose `client_secret` ra browser

---

### Bước 4 — Inventory Service
**Status:** ⬜ Chưa làm

**File tạo mới:** `lib/tapon/inventory.ts`

Functions:
- `getScreens(params?)` — gọi `GET /inventory/screens` với query params
- `getScreen(screenId)` — gọi `GET /inventory/screens/:screen_id`

---

### Bước 5 — Data Mapper (TapOn → OOHX Screen)
**Status:** ⬜ Chưa làm

**File tạo mới:** `lib/tapon/mapper.ts`

Mục đích: Chuyển đổi `TapOnScreen` → `Screen` (OOHX internal type) để toàn bộ UI không cần đổi.

```typescript
// venue_type mapping
const VENUE_MAP = {
  mall: 'Retail',
  outdoor: 'Outdoor',
  fnb: 'F&B',
  transit: 'Transit',
  office: 'Office',
}

// screen_type mapping
const TYPE_MAP = {
  lcd: 'LCD',
  led: 'LED',
  billboard: 'Billboard',
}

// color theo venue
const COLOR_MAP = {
  Outdoor: 'orange',
  Retail: 'blue',
  'F&B': 'green',
  Transit: 'blue',
  Office: 'green',
}
```

**Đồng thời:** Cập nhật `lib/types.ts` — đổi `id` từ `number` → `string`, thêm `owner_name`.

---

### Bước 6 — Next.js API Routes (BFF Proxy)
**Status:** ⬜ Chưa làm

Tất cả call đến `ssp.tapon.vn` đi qua OOHX backend, browser chỉ gọi `/api/*`.

**File tạo mới:**

#### `app/api/screens/route.ts`
```
GET /api/screens?page=1&limit=20&city=hanoi&venue_type=mall
→ gọi TapON GET /inventory/screens
→ map từng item qua mapper
→ trả về { total, page, limit, data: Screen[] }
```

#### `app/api/screens/[id]/route.ts`
```
GET /api/screens/:id
→ gọi TapON GET /inventory/screens/:id
→ map qua mapper
→ trả về Screen
```

#### `app/api/webhooks/tapon/inventory/route.ts`
```
POST /api/webhooks/tapon/inventory
← TapON gọi vào đây khi screen thay đổi
→ verify HMAC signature (X-TapOn-Signature header)
→ revalidate cache của /api/screens (Next.js revalidatePath)
→ trả về 200 OK
```

---

### Bước 7 — Cập nhật Browse Page
**Status:** ⬜ Chưa làm

**File sửa:** `app/browse/page.tsx`

Thay đổi:
- Xóa `import { screens } from '@/lib/data'`
- Thêm `useEffect` + `useState` để fetch `/api/screens` khi filter thay đổi
- Truyền query params city, venue_type, screen_type lên API
- Hiển thị loading state khi đang fetch
- Filter logic chuyển về phía server (TapON đã hỗ trợ query params)

Giữ nguyên: toàn bộ UI components, MapBrowse, filter panel layout.

---

### Bước 8 — Cập nhật Screen Detail Page
**Status:** ⬜ Chưa làm

**File sửa:** `app/screens/[id]/page.tsx`

Thay đổi:
- Xóa `generateStaticParams` (không còn dùng mock data)
- Thêm `dynamic = 'force-dynamic'` hoặc fetch từ API route
- Gọi `GET /api/screens/:id` thay vì tìm trong mảng mock
- Nếu 404 → gọi `notFound()`

Giữ nguyên: toàn bộ UI layout, MapDetail.

---

### Bước 9 — Đăng ký Webhook (1 lần)
**Status:** ⬜ Chưa làm

Chạy 1 lần sau khi deploy để TapON biết gửi update về đâu:
```
POST https://ssp.tapon.vn/api/v1/inventory/webhook/register
{
  "url": "https://oohx.net/api/webhooks/tapon/inventory",
  "events": ["screen.created", "screen.updated", "screen.deactivated"],
  "secret": "<TAPON_WEBHOOK_SECRET>"
}
```

Có thể tạo script `scripts/register-webhook.ts` chạy 1 lần bằng `tsx`.

---

## Thứ tự thực hiện

```
Bước 1 (env)
  → Bước 2 (types)
  → Bước 3 (client)
  → Bước 4 (inventory)
  → Bước 5 (mapper)
  → Bước 6 (API routes)  ← có thể test độc lập ở đây
  → Bước 7 (browse page)
  → Bước 8 (detail page)
  → Bước 9 (webhook — sau khi deploy)
```

---

## Những gì KHÔNG thay đổi

- Toàn bộ UI components (Navbar, Footer, MapBrowse, MapDetail, Toast)
- CSS / globals.css
- Trang home, about, contact, request, owners, solutions, how-it-works
- Leaflet map logic (lat/lng giữ nguyên schema)

---

## Trạng thái tổng hợp

| Bước | Mô tả | Status |
|---|---|---|
| 1 | Env variables | ⬜ |
| 2 | `lib/tapon/types.ts` | ✅ |
| 3 | `lib/tapon/client.ts` | ✅ |
| 4 | `lib/tapon/inventory.ts` | ✅ |
| 5 | `lib/tapon/mapper.ts` + update types | ✅ |
| 6 | API Routes (BFF proxy) | ✅ |
| 7 | Browse page refactor | ✅ |
| 8 | Screen detail page refactor | ✅ |
| 9 | Webhook registration | ✅ |
