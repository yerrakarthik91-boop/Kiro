# 05 — API Requirements

**Style:** REST + JSON
**Base URL:** `https://api.milkflow.app/v1`
**Auth:** Bearer JWT (access token); refresh token via `/auth/refresh`
**Versioning:** URL prefix `/v1`, then `/v2` etc.
**Pagination:** Cursor-based — `?cursor=xxx&limit=20`
**Idempotency:** `Idempotency-Key` header required for POST `/payments` and `/delivery-records/bulk-mark`.

---

## 1. Conventions

### Common headers
```
Authorization: Bearer <jwt>
X-Device-Id: <uuid>
X-App-Version: 1.0.3
X-Platform: android | ios
Accept-Language: en | hi
Idempotency-Key: <uuid>   (selected POSTs)
```

### Standard response envelope
```json
{
  "data": { ... },
  "meta": { "next_cursor": "abc", "limit": 20 },
  "error": null
}
```

### Standard error
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone is required",
    "fields": { "phone": "required" }
  }
}
```

### Status codes
- 200 OK, 201 Created, 204 No Content
- 400 validation, 401 unauthenticated, 403 forbidden, 404 not found
- 409 conflict (idempotency, version), 422 business-rule
- 429 rate-limited, 5xx server

---

## 2. Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/otp/request` | Body: `{ phone }`. Sends OTP. Rate-limited. |
| POST | `/auth/otp/verify`  | Body: `{ phone, otp, device_id }`. Returns `{ access, refresh, user, role }`. |
| POST | `/auth/refresh`     | Body: `{ refresh }`. Returns new access token. |
| POST | `/auth/logout`      | Invalidates refresh token. |
| POST | `/auth/role`        | First-time choose role. Body: `{ role: 'seller'\|'buyer' }`. |
| DELETE | `/auth/account`    | Soft-delete account. |

---

## 3. Profile (Both Roles)

| Method | Endpoint |
|--------|----------|
| GET | `/me` |
| PATCH | `/me` — update name, language, theme, photo |
| POST | `/me/fcm-token` — register push token |
| GET | `/me/notifications?cursor=` |
| PATCH | `/me/notifications/:id/read` |

---

## 4. Seller APIs

> All endpoints require `role=seller` (or `staff` with permission).

### 4.1 Customers
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/customers?route_id=&status=&q=&cursor=` |
| POST   | `/seller/customers` |
| GET    | `/seller/customers/:id` |
| PATCH  | `/seller/customers/:id` |
| DELETE | `/seller/customers/:id` (soft) |
| POST   | `/seller/customers/import-csv` |
| GET    | `/seller/customers/:id/ledger` |

### 4.2 Routes & Staff
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/routes` |
| POST   | `/seller/routes` |
| PATCH  | `/seller/routes/:id` |
| DELETE | `/seller/routes/:id` |
| GET    | `/seller/staff` |
| POST   | `/seller/staff` |
| PATCH  | `/seller/staff/:id` |
| DELETE | `/seller/staff/:id` |

### 4.3 Products
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/products` |
| POST   | `/seller/products` |
| PATCH  | `/seller/products/:id` |
| DELETE | `/seller/products/:id` |
| POST   | `/seller/products/bulk-price-update` |

### 4.4 Subscriptions
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/subscriptions?customer_id=` |
| POST   | `/seller/subscriptions` |
| PATCH  | `/seller/subscriptions/:id` |
| POST   | `/seller/subscriptions/:id/pause` — body: `{ from, to }` |
| POST   | `/seller/subscriptions/:id/resume` |
| DELETE | `/seller/subscriptions/:id` |

### 4.5 Delivery Records (Daily Sheet — critical)
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/deliveries?date=YYYY-MM-DD&route_id=` |
| PATCH  | `/seller/deliveries/:id` — body: `{ status, delivered_quantity, notes }` |
| POST   | `/seller/deliveries/bulk-mark` — body: `{ date, route_id, status: 'delivered' }` |
| POST   | `/seller/deliveries/sync` — offline batch sync |

**`/sync` payload:**
```json
{
  "changes": [
    { "id": "...", "delivered_quantity": 1.0, "status": "delivered",
      "marked_at": "2026-05-22T05:14:00Z", "client_revision": 3 }
  ]
}
```
Returns per-row `accepted | rejected | conflict`.

### 4.6 Invoices & Payments
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/invoices?status=&from=&to=&cursor=` |
| GET    | `/seller/invoices/:id` |
| POST   | `/seller/invoices/generate` — manual trigger for a customer/period |
| GET    | `/seller/invoices/:id/pdf` |
| POST   | `/seller/invoices/:id/send` — push + SMS |
| POST   | `/seller/payments` — record cash/UPI/online |
| GET    | `/seller/payments?from=&to=` |

### 4.7 Reports
| Method | Endpoint |
|--------|----------|
| GET | `/seller/reports/daily?date=` |
| GET | `/seller/reports/monthly?month=YYYY-MM` |
| GET | `/seller/reports/top-customers?period=` |
| GET | `/seller/reports/route-performance?route_id=&period=` |
| GET | `/seller/reports/export?type=csv\|pdf&...` |

### 4.8 Notifications
| Method | Endpoint |
|--------|----------|
| POST | `/seller/announcements` — broadcast |
| POST | `/seller/announcements/targeted` — body includes `customer_ids` or `route_id` |

---

## 5. Buyer APIs

### 5.1 Linking
| Method | Endpoint |
|--------|----------|
| POST | `/buyer/link-seller` — body: `{ invite_code }` |
| POST | `/buyer/unlink-seller/:seller_id` |
| GET  | `/buyer/sellers` |

### 5.2 Home & Subscriptions
| Method | Endpoint |
|--------|----------|
| GET    | `/buyer/home` — today's delivery, dues, subscriptions in one call |
| GET    | `/buyer/subscriptions` |
| POST   | `/buyer/subscriptions/:id/pause` — body: `{ from, to, reason }` |
| POST   | `/buyer/subscriptions/:id/resume` |
| PATCH  | `/buyer/subscriptions/:id/quantity` — body: `{ date?, quantity }` (date = single-day; absent = permanent) |
| POST   | `/buyer/subscriptions` — self-subscribe to seller's product |
| DELETE | `/buyer/subscriptions/:id` |

### 5.3 Catalog & One-time Orders
| Method | Endpoint |
|--------|----------|
| GET  | `/buyer/catalog?seller_id=` |
| POST | `/buyer/orders` |
| GET  | `/buyer/orders?status=&cursor=` |
| GET  | `/buyer/orders/:id` |
| POST | `/buyer/orders/:id/cancel` |

### 5.4 Ledger, Invoices, Payments
| Method | Endpoint |
|--------|----------|
| GET  | `/buyer/ledger?seller_id=&period=` |
| GET  | `/buyer/invoices?status=&cursor=` |
| GET  | `/buyer/invoices/:id` |
| GET  | `/buyer/invoices/:id/pdf` |
| POST | `/buyer/payments/intent` — body: `{ invoice_id, method }` returns gateway order id |
| POST | `/buyer/payments/verify` — gateway callback verification |
| GET  | `/buyer/payments` |

### 5.5 Engagement
| Method | Endpoint |
|--------|----------|
| POST | `/buyer/deliveries/:id/rate` — body: `{ rating, reason }` |
| POST | `/buyer/complaints` |
| GET  | `/buyer/complaints` |

---

## 6. Webhooks

| Event | Recipient | Endpoint (incoming) |
|-------|-----------|---------------------|
| `payment.success` | App backend | `/webhooks/razorpay` |
| `payment.failed`  | App backend | `/webhooks/razorpay` |

Signature verified via HMAC-SHA256.

---

## 7. Rate Limiting

| Scope | Limit |
|-------|-------|
| `/auth/otp/request` | 3 / hour / phone |
| `/auth/otp/verify` | 5 / 15 min / phone |
| Authenticated endpoints | 60 / min / user |
| `/seller/deliveries/sync` | 30 / min |

---

## 8. Sample Payloads

### POST `/seller/customers`
```json
{
  "name": "Priya Sharma",
  "phone": "+919812345678",
  "route_id": "uuid",
  "address": {
    "label": "Home",
    "line1": "Flat 3B, Maple Apt",
    "city": "Pune", "state": "MH", "pincode": "411001",
    "lat": 18.5204, "lng": 73.8567
  },
  "subscriptions": [
    { "product_id": "uuid", "quantity": 1.0, "frequency": "daily", "start_date": "2026-06-01" }
  ]
}
```

### POST `/seller/deliveries/bulk-mark`
```json
{
  "date": "2026-05-22",
  "route_id": "uuid",
  "status": "delivered"
}
```
Response: `{ "data": { "marked_count": 32, "skipped_count": 0 } }`

### POST `/buyer/subscriptions/:id/pause`
```json
{
  "from": "2026-06-05",
  "to": "2026-06-12",
  "reason": "Travel"
}
```

### POST `/buyer/payments/intent`
```json
{ "invoice_id": "uuid", "method": "upi" }
```
Response:
```json
{
  "data": {
    "gateway": "razorpay",
    "order_id": "order_xxx",
    "amount": 180000,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

---

## 9. Security

- HTTPS only; HSTS.
- JWT signed with RS256 (rotated yearly).
- Access token 30 min, refresh token 30 days, single-use rotation.
- PII encryption at rest (`pgcrypto` on phone/email).
- All PII fields scrubbed from logs.
- OWASP API Top-10 reviewed in CI.
