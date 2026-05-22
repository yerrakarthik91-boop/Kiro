# 05 — API Requirements

**Style:** REST + JSON
**Base URL:** `https://api.mms.app/v1`
**Auth:** Bearer JWT (access + refresh)
**Versioning:** URL prefix `/v1`, then `/v2`, etc.
**Pagination:** Cursor-based — `?cursor=xxx&limit=20`
**Idempotency:** `Idempotency-Key` header required for `POST /payments` and `POST /deliveries/sync`.

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

### Response envelope
```json
{
  "data": { ... },
  "meta": { "next_cursor": "abc", "limit": 20 },
  "error": null
}
```

### Error format
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
- 200 OK · 201 Created · 204 No Content
- 400 Validation · 401 Unauthenticated · 403 Forbidden · 404 Not Found
- 409 Conflict · 422 Business Rule Violation
- 429 Rate Limited · 5xx Server

---

## 2. Authentication

| Method | Endpoint | Body / Notes |
|--------|----------|--------------|
| POST | `/auth/otp/request` | `{ phone }` — send OTP. Rate-limited. |
| POST | `/auth/otp/verify` | `{ phone, otp, role?, device_id }` → `{ access, refresh, user }` |
| POST | `/auth/email/login` | `{ email, password }` → tokens |
| POST | `/auth/register/seller` | `{ name, phone, otp, business_name, address, gst_number? }` |
| POST | `/auth/register/buyer` | `{ name, phone, otp, address }` |
| POST | `/auth/forgot-password` | `{ phone }` — sends OTP |
| POST | `/auth/reset-password` | `{ phone, otp, new_password }` |
| POST | `/auth/refresh` | `{ refresh }` |
| POST | `/auth/logout` | invalidates refresh |
| DELETE | `/auth/account` | soft-delete |

---

## 3. Profile (Both Roles)

| Method | Endpoint |
|--------|----------|
| GET | `/me` |
| PATCH | `/me` — update name, language, theme, photo |
| POST | `/me/fcm-token` |
| GET | `/me/notifications?cursor=` |
| PATCH | `/me/notifications/:id/read` |
| PATCH | `/me/notifications/read-all` |

---

## 4. Seller APIs

> All endpoints below require `role=seller`.

### 4.1 Dashboard
| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/seller/dashboard` | Summary cards + delivery summary + notifications counts |
| GET | `/seller/dashboard/charts?range=day\|week\|month` | Milk Trend, Revenue Trend, Customer Growth |

### 4.2 Customers
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/customers?q=&status=&cursor=` |
| POST   | `/seller/customers` |
| GET    | `/seller/customers/:id` |
| PATCH  | `/seller/customers/:id` |
| DELETE | `/seller/customers/:id` |
| POST   | `/seller/customers/:id/pause` — `{ from, to }` |
| POST   | `/seller/customers/:id/resume` |
| GET    | `/seller/customers/:id/ledger` |

### 4.3 Products
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/products` |
| POST   | `/seller/products` |
| PATCH  | `/seller/products/:id` |
| DELETE | `/seller/products/:id` |
| POST   | `/seller/pricing/global` — `{ product_id, rate }` |
| POST   | `/seller/pricing/customer` — `{ customer_id, rate }` |

### 4.4 Deliveries (critical path)
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/deliveries?date=YYYY-MM-DD&slot=morning\|evening` |
| PATCH  | `/seller/deliveries/:id` — `{ status, delivered_quantity?, notes? }` |
| POST   | `/seller/deliveries/extra` — ad-hoc add |
| POST   | `/seller/deliveries/sync` — offline batch sync |

**`/sync` payload**
```json
{
  "changes": [
    { "id":"uuid", "status":"delivered", "delivered_quantity":1.0,
      "marked_at":"2026-05-22T05:14:00Z", "client_revision":3 }
  ]
}
```
Per-row response: `accepted | rejected | conflict`.

### 4.5 Bills
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/bills?status=&from=&to=&cursor=` |
| GET    | `/seller/bills/:id` |
| POST   | `/seller/bills/generate` — `{ customer_id, period_start, period_end }` |
| GET    | `/seller/bills/:id/pdf` |
| POST   | `/seller/bills/:id/send` — `{ channels: ["push","sms","whatsapp"] }` |
| PATCH  | `/seller/bills/:id/mark-paid` — record cash payment shortcut |
| POST   | `/seller/bills/:id/adjust` — discount / write-off |

### 4.6 Payments
| Method | Endpoint |
|--------|----------|
| POST | `/seller/payments` — `{ customer_id, bill_id?, amount, method, reference?, paid_at }` |
| GET  | `/seller/payments?from=&to=&method=&cursor=` |
| GET  | `/seller/payments/overview` — Today / Pending / Overdue |

### 4.7 Reports
| Method | Endpoint |
|--------|----------|
| GET | `/seller/reports/daily?date=` |
| GET | `/seller/reports/monthly?month=YYYY-MM` |
| GET | `/seller/reports/customer/:customer_id?period=` |
| GET | `/seller/reports/profit-loss?range=day\|week\|month\|customer` |
| GET | `/seller/reports/export?type=pdf\|excel\|csv&...` |

### 4.8 Settings
| Method | Endpoint |
|--------|----------|
| GET    | `/seller/settings/profile` |
| PATCH  | `/seller/settings/profile` |
| GET    | `/seller/settings/notifications` |
| PATCH  | `/seller/settings/notifications` |
| POST   | `/seller/settings/backup` — manual backup |
| POST   | `/seller/settings/restore` — pick a backup |

### 4.9 Complaints (inbox)
| Method | Endpoint |
|--------|----------|
| GET   | `/seller/complaints?status=&cursor=` |
| PATCH | `/seller/complaints/:id` — `{ status, resolution_note }` |

---

## 5. Buyer APIs

### 5.1 Dashboard & Profile
| Method | Endpoint |
|--------|----------|
| GET | `/buyer/dashboard` — welcome card, milk summary, current bill, quick actions |
| GET | `/buyer/profile` |
| PATCH | `/buyer/profile` |

### 5.2 Linking
| Method | Endpoint |
|--------|----------|
| POST | `/buyer/link-seller` — `{ invite_code }` |
| GET  | `/buyer/sellers` |

### 5.3 Deliveries
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/buyer/deliveries?from=&to=&cursor=` | History table |
| GET | `/buyer/deliveries/calendar?month=YYYY-MM` | Color-coded calendar map: `[{date, status}]` |
| GET | `/buyer/deliveries/:id` | Day detail (qty, status, notes) |

### 5.4 Schedule Management
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/buyer/schedule/pause` | `{ from, to, reason? }` |
| POST | `/buyer/schedule/resume` | `{}` |
| POST | `/buyer/schedule/vacation` | `{ from, to }` |
| POST | `/buyer/schedule/extra-request` | `{ date, slot, quantity, product_id? }` |

### 5.5 Bills & Payments
| Method | Endpoint |
|--------|----------|
| GET  | `/buyer/bills?status=&cursor=` |
| GET  | `/buyer/bills/:id` |
| GET  | `/buyer/bills/:id/pdf` |
| POST | `/buyer/payments/intent` — `{ bill_id, method }` returns gateway order id |
| POST | `/buyer/payments/verify` — gateway callback verification |
| GET  | `/buyer/payments` |

### 5.6 Complaints
| Method | Endpoint |
|--------|----------|
| POST | `/buyer/complaints` — `{ category, description, photo_url?, delivery_id?, bill_id? }` |
| GET  | `/buyer/complaints?status=&cursor=` |
| GET  | `/buyer/complaints/:id` |

---

## 6. Webhooks

| Provider | Endpoint | Event Types |
|----------|----------|-------------|
| Razorpay | `/webhooks/razorpay` | `payment.captured`, `payment.failed` |
| PhonePe | `/webhooks/phonepe` | `PAYMENT_SUCCESS`, `PAYMENT_FAILED` |
| Cashfree | `/webhooks/cashfree` | `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK` |

All webhooks verify signature via HMAC-SHA256 with shared secret.

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
  "alt_phone": "+919811112222",
  "address": "Flat 3B, Maple Apt, Pune 411001",
  "lat": 18.5204, "lng": 73.8567,
  "delivery_type": "both",
  "morning_quantity": 1.0,
  "evening_quantity": 0.5,
  "milk_rate": 60.0,
  "product_id": "uuid",
  "billing_cycle": "monthly",
  "billing_start_date": "2026-06-01",
  "status": "active"
}
```

### PATCH `/seller/deliveries/:id`
```json
{ "status": "delivered", "delivered_quantity": 1.0 }
```

### POST `/seller/bills/generate`
```json
{ "customer_id": "uuid", "period_start": "2026-05-01", "period_end": "2026-05-31" }
```

### POST `/buyer/payments/intent`
```json
{ "bill_id": "uuid", "method": "upi", "gateway": "razorpay" }
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

### POST `/buyer/schedule/pause`
```json
{ "from": "2026-06-05", "to": "2026-06-12", "reason": "Travel" }
```

---

## 9. Security

- HTTPS only; HSTS enabled.
- JWT signed with RS256 (rotated yearly).
- Access token 30 min, refresh token 30 days, single-use rotation.
- Passwords stored using bcrypt cost ≥ 12.
- All PII (`phone`, `email`) encrypted at rest with `pgcrypto`.
- Logs scrubbed of PII.
- OWASP API Top-10 reviewed every release.
- All write endpoints write to `audit_log`.
