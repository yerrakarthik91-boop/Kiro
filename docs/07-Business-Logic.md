# 07 — Business Logic

This document captures the rules that govern subscriptions, deliveries, billing, payments, and conflict resolution. The mobile app and backend must agree on these rules; the **server is authoritative** in every conflict.

---

## 1. Calendar & Delivery Generation

### 1.1 Daily delivery generation job
- Runs **every day at 03:00 local seller TZ** for that seller.
- For each `subscriptions` row where `status = 'active'` and the date falls within a delivery day per `frequency`:
  - Create one `delivery_records` row with `status = 'pending'` and `expected_quantity = subscriptions.quantity`.
  - Skip the date if any `subscription_pauses` covers it.
  - Snapshot `unit_price` from product (or `price_override`).
- Idempotent — UNIQUE(`subscription_id`, `delivery_date`) prevents duplicates.

### 1.2 Frequency rules
| Frequency | Generates a record on |
|-----------|----------------------|
| `daily` | Every date. |
| `alternate` | Every other day, starting from `start_date`. |
| `weekly` | Same weekday as `start_date`. |
| `custom` | Each weekday in `custom_days[]` (0–6, Sun–Sat). |

### 1.3 Pause behavior
- Pauses are **inclusive** of both `from_date` and `to_date`.
- Pauses **do not** generate `delivery_records`.
- A pause that overlaps with already-generated records voids those records (`status = 'skipped'`, reason: "paused").

### 1.4 Quantity overrides
- **Single-date override:** updates the `expected_quantity` of that day's `delivery_records` row only.
- **Permanent override:** updates `subscriptions.quantity`; future generation uses the new value.

---

## 2. Marking Deliveries

### 2.1 Allowed status transitions
```
pending → delivered
pending → skipped
pending → partial   (with delivered_quantity < expected)
delivered ⇄ skipped (only on same day, by seller)
```

### 2.2 Same-day vs past-day edits
- **Same day:** seller and assigned staff may edit freely.
- **Past day (≤ 7 days):** seller only, audit-logged.
- **> 7 days:** locked. Adjustments must go through invoice "manual adjustment".

### 2.3 Bulk mark
- "Mark all delivered for route" only affects `pending` rows for that route on that date.
- Already-skipped rows are left untouched.

### 2.4 Offline reconciliation
- Mobile generates a `client_revision` per record per change.
- On `/sync`, server applies in order:
  1. If server `marked_at` is newer, **server wins**, response = `conflict`.
  2. Else server applies the change.
- Conflicts are surfaced to the seller as a list with "Apply mine / Keep server".

---

## 3. Pricing

### 3.1 Resolution order (highest priority first)
1. `subscriptions.price_override` (per-customer custom price)
2. `products.default_price`

### 3.2 Price changes
- Updating a product's price affects **future** delivery records only.
- Already-generated records keep their snapshotted `unit_price`.
- "Bulk price update" always offers a confirmation modal showing affected customers.

---

## 4. Billing

### 4.1 Cycle
- Configurable per seller via `sellers.billing_cycle_day` (default: 1).
- Period = previous cycle's first day to current cycle's first day − 1.
  - Example, cycle day = 1: April invoice covers Apr 1 – Apr 30.
  - Example, cycle day = 15: April invoice covers Mar 15 – Apr 14.

### 4.2 Auto-generation
- Runs at 06:00 on `billing_cycle_day` for each customer with at least one delivered record in the period.
- Aggregates `delivery_records` where `status IN ('delivered','partial')`:
  - Group by `product_id`.
  - `quantity_total = SUM(delivered_quantity)`.
  - `line_total = SUM(delivered_quantity × unit_price)` (using each record's snapshot).
- Adds tax: `line_total × tax_percent / 100`.
- Subtotal, tax, discount, total computed.
- Initial status: `issued`. PDF rendered async; URL written when ready.
- Push notification: "Your bill of ₹X is ready" (buyer) and "12 invoices generated" (seller).

### 4.3 Manual adjustments
- Seller may add a discount or write-off line via `POST /seller/invoices/:id/adjust`.
- Each adjustment is its own ledger entry (audit trail).

### 4.4 Carry-forward
- Unpaid balance from previous invoice is shown as "Previous balance" line on the new one (not duplicated as charge).

### 4.5 Statuses
| Status | Meaning |
|--------|---------|
| `draft` | Not yet finalized. |
| `issued` | Customer can see it. |
| `partial` | `paid_amount > 0 && < total_amount`. |
| `paid` | `paid_amount >= total_amount`. |
| `void` | Cancelled, no longer due. |

---

## 5. Payments

### 5.1 Recording (offline-first)
- Cash payments recorded by seller/staff with method=`cash`.
- Successful UPI/online payments recorded automatically via webhook.
- All payments allocated to oldest outstanding invoice first (FIFO) unless seller selects manually.

### 5.2 Reconciliation
- A payment may overflow into the next invoice or sit as advance.
- Advance balance is shown as a credit on next invoice.

### 5.3 Refunds
- Initiated from invoice detail; creates a `payments` row with negative amount and `status = 'refunded'`.
- Online refunds go through gateway API; cash refunds recorded manually.

### 5.4 Reminders
- Auto reminder cadence (configurable):
  - Day +0 of issue: "Bill ready".
  - Day +3: "Friendly reminder".
  - Day +7: "Overdue notice" (also visible to seller).
- Seller may send manual reminders any time.

---

## 6. Subscriptions Lifecycle

```
draft → active → paused ⇄ active → cancelled
                       └────────→ cancelled
```

Rules:
- A `cancelled` subscription stops generating deliveries from `cancelled_at` onward, but past invoices remain.
- A buyer-initiated pause requires no seller approval.
- A buyer-initiated cancellation prompts a confirmation; seller is notified.

---

## 7. Notifications

### 7.1 Triggers
| Event | Recipient | Channel |
|-------|-----------|---------|
| Delivery marked | Buyer | Push |
| Delivery skipped | Buyer | Push (silent if buyer paused it) |
| Pause created (by buyer) | Seller | Push |
| Bill generated | Buyer | Push + SMS |
| Bill overdue | Buyer | Push + SMS |
| Payment received | Buyer | Push |
| Payment received (online) | Seller | Push |
| Complaint raised | Seller | Push |
| Announcement | Targeted users | Push |

### 7.2 Quiet hours
- No non-critical pushes 22:00 – 06:00 local.
- "Bill overdue" and "Payment received" bypass quiet hours.

---

## 8. Permissions Enforcement

- Enforced at API layer using middleware.
- Staff can only access `delivery_records` for their `assigned_route_ids` and only for current day.
- Buyers can only access resources where they appear as `buyer_id` or `customer_id`.
- Row-Level Security in PostgreSQL as a second line of defense.

---

## 9. Edge Cases & Business Rules

| Scenario | Rule |
|---------|------|
| Customer added mid-month | Bill prorated from join date. |
| Seller deletes a customer with outstanding balance | Soft-delete; ledger preserved; buyer sees "unlinked" with final invoice link. |
| Buyer changes phone number | Re-OTP; data preserved. |
| Two sellers, one buyer | Buyer sees combined Home; bills separated per seller. |
| Holiday declared by seller | Seller broadcasts; system auto-skips that date for all customers in selected route(s). |
| Product deleted | If referenced by active subs, must be replaced or subs cancelled first. |
| Negative inventory | Not tracked in v1; seller must manually skip if out-of-stock. |

---

## 10. Audit & Compliance

- Every write to `subscriptions`, `delivery_records`, `invoices`, `payments` writes to `audit_log`.
- Audit log retained 24 months.
- Right-to-be-forgotten request triggers anonymization (preserve invoice integrity, redact PII).
