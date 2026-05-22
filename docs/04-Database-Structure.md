# 04 — Database Structure

**Database:** PostgreSQL 15+
**Cache / queue:** Redis 7+
**Encoding:** UTF-8, timezone stored as UTC, displayed in user TZ.
**ID strategy:** UUID v4 primary keys; short `code` columns for human-readable IDs (e.g., invite codes, invoice numbers).
**Soft delete:** `deleted_at` nullable timestamp on user-facing tables.
**Audit:** `created_at`, `updated_at` everywhere; auto-updated via trigger.

---

## 1. Entity-Relationship Overview

```
users ──┬──< sellers (1:1 if role=seller)
        └──< buyers  (1:1 if role=buyer)

sellers ──< staff
sellers ──< products
sellers ──< routes
sellers ──< customers ──> buyers           (link table; one buyer can be customer of many sellers)
customers ──< addresses
customers ──< subscriptions ──> products
subscriptions ──< subscription_pauses
subscriptions ──< delivery_records         (one per day per subscription)
customers ──< invoices ──< invoice_items
invoices ──< payments
customers ──< orders ──< order_items       (one-time orders)
sellers ──< notifications_log
customers ──< complaints
```

---

## 2. Tables

### 2.1 `users`
Holds anyone who logs in (sellers, buyers, staff).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `phone` | VARCHAR(15) UNIQUE | E.164 format |
| `role` | ENUM('seller','buyer','staff','admin') | Required |
| `name` | VARCHAR(120) | |
| `email` | VARCHAR(160) | Optional |
| `photo_url` | TEXT | |
| `language` | VARCHAR(8) | Default 'en' |
| `theme` | ENUM('system','light','dark') | |
| `fcm_token` | TEXT | For push |
| `is_active` | BOOLEAN | Default true |
| `last_login_at` | TIMESTAMPTZ | |
| `created_at` / `updated_at` / `deleted_at` | TIMESTAMPTZ | |

Indexes: `phone`, `role`.

### 2.2 `sellers`
Business profile of a distributor.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users.id | UNIQUE |
| `business_name` | VARCHAR(160) | |
| `gst_number` | VARCHAR(20) | Optional |
| `address` | TEXT | |
| `lat` / `lng` | NUMERIC(10,7) | |
| `invite_code` | VARCHAR(8) UNIQUE | Used by buyers |
| `currency` | VARCHAR(3) | Default 'INR' |
| `timezone` | VARCHAR(64) | Default 'Asia/Kolkata' |
| `billing_cycle_day` | SMALLINT | 1–28; day invoices generate |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### 2.3 `staff`
Delivery boys; sub-accounts under a seller.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `seller_id` | UUID FK → sellers.id | |
| `user_id` | UUID FK → users.id | UNIQUE |
| `assigned_route_ids` | UUID[] | Array |
| `permissions` | JSONB | Granular flags |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### 2.4 `buyers`
Customer profile (from buyer's perspective).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users.id | UNIQUE |
| `default_address_id` | UUID FK → addresses.id | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### 2.5 `customers`
Link between a seller and a buyer. A buyer can be a customer of multiple sellers.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `seller_id` | UUID FK → sellers.id | |
| `buyer_id` | UUID FK → buyers.id | NULL until buyer signs up |
| `name` | VARCHAR(120) | Snapshot for offline-added customers |
| `phone` | VARCHAR(15) | |
| `route_id` | UUID FK → routes.id | |
| `address_id` | UUID FK → addresses.id | |
| `status` | ENUM('active','paused','archived') | |
| `linked_at` | TIMESTAMPTZ | When buyer self-linked |
| `created_at` / `updated_at` / `deleted_at` | TIMESTAMPTZ | |

UNIQUE(`seller_id`, `phone`).

### 2.6 `addresses`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `owner_id` | UUID (buyer or customer) |
| `owner_type` | ENUM('buyer','customer') |
| `label` | VARCHAR(40) — Home/Office |
| `line1`, `line2`, `city`, `state`, `pincode` | TEXT |
| `lat`, `lng` | NUMERIC(10,7) |
| `landmark` | TEXT |

### 2.7 `routes`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `seller_id` | UUID FK |
| `name` | VARCHAR(60) |
| `sequence_order` | INTEGER |
| `default_staff_id` | UUID FK → staff.id |

### 2.8 `products`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `seller_id` | UUID FK | |
| `name` | VARCHAR(80) | Cow Milk, Buffalo Milk… |
| `unit` | ENUM('liter','ml','kg','g','piece') | |
| `default_price` | NUMERIC(10,2) | |
| `image_url` | TEXT | |
| `is_active` | BOOLEAN | |
| `tax_percent` | NUMERIC(5,2) | Default 0 |

### 2.9 `subscriptions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `customer_id` | UUID FK | |
| `product_id` | UUID FK | |
| `quantity` | NUMERIC(8,3) | e.g., 1.5 L |
| `frequency` | ENUM('daily','alternate','weekly','custom') | |
| `custom_days` | SMALLINT[] | 0–6 (Sun–Sat) |
| `price_override` | NUMERIC(10,2) | Optional per-customer price |
| `start_date` | DATE | |
| `end_date` | DATE | NULL = ongoing |
| `status` | ENUM('active','paused','cancelled') | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### 2.10 `subscription_pauses`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `subscription_id` | UUID FK |
| `from_date`, `to_date` | DATE |
| `created_by_role` | ENUM('seller','buyer') |
| `reason` | TEXT |

### 2.11 `delivery_records`
One row per (subscription, delivery_date). Generated daily by a job.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `subscription_id` | UUID FK | |
| `customer_id` | UUID FK | Denormalized for fast queries |
| `seller_id` | UUID FK | Denormalized |
| `route_id` | UUID FK | Denormalized snapshot |
| `delivery_date` | DATE | |
| `expected_quantity` | NUMERIC(8,3) | |
| `delivered_quantity` | NUMERIC(8,3) | NULL = not yet processed |
| `unit_price` | NUMERIC(10,2) | Snapshot |
| `status` | ENUM('pending','delivered','skipped','partial') | |
| `marked_by_user_id` | UUID FK → users.id | |
| `marked_at` | TIMESTAMPTZ | |
| `proof_photo_url` | TEXT | |
| `notes` | TEXT | |

UNIQUE(`subscription_id`, `delivery_date`).
Indexes: `(seller_id, delivery_date, route_id)`, `(customer_id, delivery_date)`.

### 2.12 `orders` (one-time)

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `customer_id` | UUID FK |
| `seller_id` | UUID FK |
| `delivery_date` | DATE |
| `status` | ENUM('pending','accepted','delivered','cancelled') |
| `total_amount` | NUMERIC(10,2) |
| `notes` | TEXT |

### 2.13 `order_items`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `order_id` | UUID FK |
| `product_id` | UUID FK |
| `quantity` | NUMERIC(8,3) |
| `unit_price` | NUMERIC(10,2) |

### 2.14 `invoices`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `invoice_number` | VARCHAR(20) UNIQUE | e.g., INV-2026-05-0001 |
| `seller_id` | UUID FK | |
| `customer_id` | UUID FK | |
| `period_start` | DATE | |
| `period_end` | DATE | |
| `subtotal` | NUMERIC(12,2) | |
| `tax_total` | NUMERIC(12,2) | |
| `discount` | NUMERIC(12,2) | |
| `total_amount` | NUMERIC(12,2) | |
| `paid_amount` | NUMERIC(12,2) | Default 0 |
| `balance` | NUMERIC(12,2) GENERATED | total - paid |
| `status` | ENUM('draft','issued','partial','paid','void') | |
| `due_date` | DATE | |
| `pdf_url` | TEXT | |

### 2.15 `invoice_items`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `invoice_id` | UUID FK |
| `product_id` | UUID FK |
| `description` | TEXT |
| `quantity_total` | NUMERIC(10,3) |
| `unit_price` | NUMERIC(10,2) |
| `line_total` | NUMERIC(12,2) |

### 2.16 `payments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `invoice_id` | UUID FK | NULL if advance |
| `customer_id` | UUID FK | |
| `seller_id` | UUID FK | |
| `amount` | NUMERIC(12,2) | |
| `method` | ENUM('cash','upi','card','netbanking','bank_transfer','adjustment') | |
| `reference` | VARCHAR(80) | UPI txn id, etc. |
| `gateway` | VARCHAR(40) | razorpay/stripe |
| `gateway_payment_id` | VARCHAR(80) | |
| `status` | ENUM('pending','success','failed','refunded') | |
| `recorded_by_user_id` | UUID FK | |
| `paid_at` | TIMESTAMPTZ | |

### 2.17 `complaints`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `customer_id` | UUID FK |
| `delivery_record_id` | UUID FK |
| `category` | ENUM('missed','spoiled','late','wrong_quantity','other') |
| `description` | TEXT |
| `photo_url` | TEXT |
| `status` | ENUM('open','in_progress','resolved','rejected') |
| `resolution_note` | TEXT |

### 2.18 `notifications_log`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `user_id` | UUID FK |
| `type` | VARCHAR(40) |
| `title` | VARCHAR(120) |
| `body` | TEXT |
| `data` | JSONB |
| `is_read` | BOOLEAN |
| `sent_at` | TIMESTAMPTZ |

### 2.19 `audit_log` (admin-level)

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `actor_user_id` | UUID FK |
| `action` | VARCHAR(60) |
| `entity_type` / `entity_id` | TEXT / UUID |
| `before` / `after` | JSONB |
| `created_at` | TIMESTAMPTZ |

### 2.20 `device_sessions`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `user_id` | UUID FK |
| `device_id` | TEXT |
| `platform` | ENUM('android','ios') |
| `app_version` | VARCHAR(20) |
| `refresh_token_hash` | TEXT |
| `expires_at` | TIMESTAMPTZ |

---

## 3. Indexing Strategy

| Index | Reason |
|-------|--------|
| `delivery_records (seller_id, delivery_date)` | Daily delivery sheet query |
| `delivery_records (customer_id, delivery_date DESC)` | Buyer history |
| `subscriptions (customer_id, status)` | Active subs lookup |
| `invoices (seller_id, status, due_date)` | Pending dues report |
| `payments (seller_id, paid_at DESC)` | Revenue report |
| `customers (seller_id, route_id)` | Route view |

---

## 4. Important Constraints & Triggers

- Trigger to auto-update `updated_at` on every UPDATE.
- `delivery_records` UNIQUE(`subscription_id`, `delivery_date`) — prevents duplicate generation.
- `invoices.balance` is a generated column.
- ON DELETE: archive (soft delete), never CASCADE on financial tables.
- Row-Level Security (RLS) enabled: each seller can only read their own rows; buyers only their own.

---

## 5. Caching (Redis)

| Key pattern | TTL | Use |
|-------------|-----|-----|
| `otp:{phone}` | 5 min | OTP verification |
| `session:{userId}` | 30 d | Active sessions |
| `today:{sellerId}:routes` | 5 min | Daily sheet pre-fetch |
| `rate:{ip}` | 1 min | Rate limiting |
| `notif:queue` | — | Pending push notifications |

---

## 6. Data Retention

- Active records: indefinite.
- Soft-deleted records: 12 months, then hard-purged.
- OTPs: never persisted past 5 min.
- Audit log: 24 months.
- Crash logs: 90 days.
