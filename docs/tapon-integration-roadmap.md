# Lộ trình tích hợp OOHX ↔ TapON SSP

## Tổng quan luồng dữ liệu

```
OOHX (Marketplace)  ←→  TapON SSP  ←→  Media Owners (màn hình)
     Brands/Agencies                        Inventory
```

OOHX đóng vai **demand side** — gửi booking request, nhận inventory + reporting từ TapON SSP.

---

## Phase 1 — Auth & Base Client
**Mục tiêu:** Kết nối được API, xác thực thành công

- [ ] Cấu hình API Key / OAuth2 token
- [ ] Tạo `lib/tapon/client.ts` — base HTTP client với auth header
- [ ] Xử lý retry, timeout, error response chuẩn
- [ ] Environment: `sandbox` vs `production`

---

## Phase 2 — Inventory Sync
**Mục tiêu:** Đồng bộ danh sách màn hình từ TapON về OOHX

- [ ] `GET /inventory/screens` — lấy toàn bộ màn hình
- [ ] Map payload TapON → OOHX data model (`lib/data.ts`)
- [ ] Webhook nhận update khi inventory thay đổi
- [ ] Cron job sync định kỳ

---

## Phase 3 — Availability & Pricing
**Mục tiêu:** Kiểm tra slot trống + giá theo thời điểm

- [ ] `POST /availability/check` — kiểm tra khung giờ available
- [ ] `GET /pricing` — lấy rate card theo screen / venue type
- [ ] Hiển thị real-time trên trang `/browse` và `/screens/[id]`

---

## Phase 4 — Campaign Booking
**Mục tiêu:** Tạo và quản lý campaign từ OOHX

- [ ] `POST /campaigns` — tạo campaign mới
- [ ] `POST /creatives/upload` — upload file quảng cáo
- [ ] `POST /bookings` — đặt slot cụ thể
- [ ] `GET /bookings/:id/status` — theo dõi trạng thái
- [ ] Webhook nhận callback khi booking approved/rejected

---

## Phase 5 — Reporting
**Mục tiêu:** Kéo dữ liệu impression + performance về OOHX

- [ ] `GET /reports/impressions` — lượt hiển thị theo campaign
- [ ] `GET /reports/revenue` — doanh thu theo owner / screen
- [ ] Dashboard hiển thị trong `/planner`

---

## Phase 6 — Programmatic OpenRTB DOOH *(tùy chọn)*
**Mục tiêu:** Đấu thầu tự động theo chuẩn OpenRTB 2.6

- [ ] Bid request / Bid response
- [ ] Win notice / Loss notice
- [ ] Deal ID cho private marketplace

---

## Thứ tự ưu tiên

| Phase | Độ ưu tiên | Lý do |
|-------|-----------|-------|
| 1 — Auth | Critical | Bắt buộc trước tất cả |
| 2 — Inventory | Critical | Dữ liệu màn hình thật |
| 3 — Availability | Cao | UX cốt lõi khi book |
| 4 — Booking | Cao | Revenue flow chính |
| 5 — Reporting | Trung bình | Sau khi có booking |
| 6 — OpenRTB | Thấp | Programmatic sau cùng |
