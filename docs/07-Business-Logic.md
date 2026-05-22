# 07 — Business Logic

Rules that govern customers, deliveries, billing, payments, and conflict resolution. The mobile app and backend must agree on these rules; the **server is authoritative** in every conflict.

---

## 1. Customer Lifecycle

```
draft → active → paused ⇄ active → archived
```

Rules:
- A new customer is `active` immediately upon creation by the seller.
- Paused customers do **not** generate deliveries until resumed.
- Archiving is a soft delete; ledger and past invoices are preserved.
- Buyer auto-link: if a buyer signs up with the same phone as an existing customer, the customer's `buyer_id` is set automatically and historical data becomes visible to the buyer.

---

## 2. Delivery Generation (Daily Cron)

**Schedule:** every day at **03:00 local seller TZ**.

For each `customers` row where `status='active'`:

- If `delivery_type` includes `morning` → create a `deliveries` row for tomorrow with `slot='morning'`, `expected_quantity = morning_quantity`, `status='pending'`.
- Same for `evening`.
- Skip if any active `schedule_changes` of type `pause` or `vacation` covers tomorrow.
- Snapshot `unit_rate` from customer rate, falling back to product `default_rate`, falling back to seller `default_milk_rate`.
- Idempotent — UNIQUE(`customer_id`, `delivery_date`, `slot`).

### 2.1 Extra Requests
Buyer-submitted extra requests insert a `deliveries` row with `status='extra'` for the requested date/slot, with the quantity from the request.

### 2.2 Pause / Vacation
- Inclusive of both `from_date` and `to_date`.
- Already-generated overlapping rows are set to `status='missed'` with note "paused/vacation".
- A buyer-initiated pause requires no seller approval and is reflected in real time.

---

## 3. Marking Deliveries

### 3.1 Allowed transitions
```
pending → delivered
pending → missed
pending → partial   (when delivered_quantity < expected_quantity)
delivered ⇄ missed  (only on same day, by seller)
```

### 3.2 Timing constraints
- **Same day:** seller may freely mark / re-mark.
- **Past day (≤ 7 days):** seller-only edit; written to audit log.
- **> 7 days:** locked. Adjustments must use invoice-level adjustments.

### 3.3 Bulk and gestures
- Tap row → mark `delivered`, `delivered_quantity = expected_quantity`.
- Swipe-left → mark `missed`.
- Long-press → opens edit-quantity sheet → recorded as `partial` if reduced, `delivered` if changed but ≥ expected.

### 3.4 Offline reconciliation
- Mobile assigns `client_revision` per change.
- On `/sync`:
  1. If server `marked_at` is newer or row is locked, **server wins**, response = `conflict`.
  2. Else apply the change.
- Conflicts are surfaced to seller as a list with options "Apply mine / Keep server".

---

## 4. Pricing Resolution

Order (highest priority first):

1. `customers.milk_rate` (per-customer override)
2. `products.default_rate`
3. `sellers.default_milk_rate`

### 4.1 Price changes
- Affect **future** delivery generation only.
- Already-generated `deliveries` retain their snapshotted `unit_rate`.
- Bulk price update prompts seller with affected-customer count before commit.

---

## 5. Billing

### 5.1 Cycle
- Configurable per seller via `sellers.billing_cycle_day` (default: 1).
- Period spans previous cycle day → current cycle day − 1.
  - Example, cycle day = 1: April invoice covers Apr 1 – Apr 30.
  - Example, cycle day = 15: April invoice covers Mar 15 – Apr 14.
- Customer-level `billing_start_date` and `billing_cycle` may override (rare).

### 5.2 Auto generation (cron)
**Schedule:** 06:00 on `billing_cycle_day` per seller.

For each customer with at least one delivered/partial record in the period:

1. Aggregate `deliveries` where `status IN ('delivered','partial','extra')`.
2. Group by (`product_id`, `delivery_date`, `slot`) for `bill_items`.
3. `subtotal = SUM(line_total)`.
4. Apply tax (if configured per product) → `tax_amount`.
5. Apply discount/adjustments → `total_amount`.
6. Render PDF asynchronously to S3, set `pdf_url`.
7. Status = `pending`, set `due_date = period_end + 7 days`.
8. Push + SMS to buyer: "Your bill of ₹X is ready".

### 5.3 Manual generation
- Allowed for any past period that has not already been billed.
- Server validates non-overlap with existing bills.

### 5.4 Adjustments
- Discount, write-off, credit note, late fee — each is a separate row that adjusts `total_amount` and is line-itemized in the PDF.
- All adjustments are audit-logged.

### 5.5 Bill statuses
| Status | Meaning |
|--------|---------|
| `draft` | Not visible to buyer |
| `pending` | Visible, unpaid |
| `partial` | `0 < paid_amount < total_amount` |
| `paid` | `paid_amount >= total_amount` |
| `overdue` | `pending`/`partial` and `due_date < today` |
| `void` | Cancelled, not collectable |

`overdue` is computed at read time; daily job also flips status for indexing purposes.

### 5.6 Carry-forward
- Unpaid balance from previous bill appears as a "Previous Balance" line on the next bill, not as a duplicated charge.

---

## 6. Payments

### 6.1 Recording
- **Cash / UPI / Bank Transfer:** recorded by seller via `POST /seller/payments`.
- **Online (UPI, GPay, PhonePe, Paytm, Card, Net Banking):** initiated by buyer through gateway (Razorpay / PhonePe / Cashfree); webhook marks `payments.status='success'`.

### 6.2 Allocation
- Default FIFO: oldest unpaid bill first.
- Seller may override allocation manually.
- Excess funds become an `advance` (no `bill_id`); next bill auto-applies advance as a credit line.

### 6.3 Refunds
- Recorded as a `payments` row with negative amount and `status='refunded'`.
- Online refunds go through the gateway API; cash/bank refunds are recorded manually.

### 6.4 Reminders
Cadence (configurable per seller):

- Day 0 of bill: "Bill ready" (push + SMS).
- Day +3: "Friendly reminder".
- Day +7 (overdue): "Overdue notice" (push + SMS + WhatsApp if enabled).
- Seller may also send manual reminders any time.

---

## 7. Notifications

| Trigger | Recipient | Channels | Quiet hours respected? |
|---------|-----------|----------|------------------------|
| Delivery completed | Buyer | Push | Yes |
| Delivery missed | Buyer | Push | Yes |
| Bill generated | Buyer | Push + SMS | Yes |
| Payment due (T-3 / T-0 / overdue) | Buyer | Push + SMS + WhatsApp | No (overdue) |
| Payment received | Seller + Buyer | Push | No |
| Complaint raised | Seller | Push | Yes |
| Complaint status changed | Buyer | Push | Yes |
| Schedule paused/resumed by buyer | Seller | Push | Yes |
| Holiday announcement | Targeted customers | Push | Yes |

Quiet hours: **22:00 – 06:00 local**, except payment-overdue and payment-received.

---

## 8. Permissions Enforcement

- Enforced at API layer via middleware that checks `role` and ownership of the resource.
- Sellers can only access rows where `seller_id = self`.
- Buyers can only access rows where they appear as `buyer_id`, or via `customer_id` linked to their `buyer_id`.
- PostgreSQL Row-Level Security is the second line of defense.

---

## 9. Edge Cases & Business Rules

| Scenario | Rule |
|----------|------|
| Customer added mid-period | First bill prorates from `billing_start_date`. |
| Seller deletes customer with outstanding balance | Soft delete; ledger preserved; final bill remains visible to buyer. |
| Buyer changes phone | Re-OTP; data preserved; old phone unlinked. |
| Two sellers, one buyer | Buyer dashboard aggregates milk summary across sellers; bills separated. |
| Holiday declared | Seller broadcasts; affected `deliveries` for that date are marked `missed` with note "holiday". |
| Stock-out (product disabled) | Active customer subscriptions to that product are auto-paused; seller is alerted. |
| Buyer's vacation overlaps with already-marked delivered | Audit warning; buyer can raise complaint to reverse. |
| Negative inventory | Not tracked in v1; seller manually skips. |
| Account deletion | Soft delete user; anonymize PII; preserve invoice integrity. |

---

## 10. Audit & Compliance

- Every write to `customers`, `deliveries`, `bills`, `payments`, `complaints` writes to `audit_log`.
- Audit log retained 24 months.
- Right-to-be-forgotten: anonymizes PII while preserving aggregate financial records.
- All financial rows are **append-only** at the storage layer (changes captured as new rows or audit entries).

---

## 11. KPI Computation Definitions

| KPI (PRD §4) | Definition |
|--------------|------------|
| Delivery Recording Time | Median time from opening Delivery Report to last row marked, per session, when ≥ 50 customers shown. |
| Bill Generation Time | Time from `POST /seller/bills/generate` to `pdf_url` ready, p95. |
| App Response Time | p95 of API request latency on authenticated endpoints excluding /sync. |
| Delivery Accuracy | (delivered + partial + missed marked) ÷ generated; alert if < 99%. |
| Billing Errors | Adjustments / void invoices ÷ invoices generated. |
| Daily Active Users | Unique users with ≥ 1 authenticated request in last 24 h ÷ active accounts. |
| Customer Satisfaction | Mean app store rating + in-app rating prompt average. |
