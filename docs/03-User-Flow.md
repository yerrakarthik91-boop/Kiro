# 03 — User Flow

End-to-end user journeys for Milk Management System (MMS) v1.0.
Diagrams use ASCII for portability; replace with Figma flows during design phase.

---

## 1. App Launch & Role Selection (Both Roles)

```
┌──────────┐   ┌─────────────┐   ┌──────────────┐
│  Splash  │──▶│ Session?    │──▶│  Has session?│
└──────────┘   │ Internet?   │   └──────┬───────┘
               │ Preferences │          │No
               └─────────────┘          ▼
                                ┌─────────────────┐
                                │ User Selection  │
                                │ ┌─────────────┐ │
                                │ │ Milk Seller │ │
                                │ ├─────────────┤ │
                                │ │ Milk Buyer  │ │
                                │ └─────────────┘ │
                                │ Login · Register│
                                │ Help · Language │
                                └────────┬────────┘
                                         ▼
                                ┌─────────────────┐
                                │  Login (OTP /   │
                                │  Email)         │
                                └────────┬────────┘
                                         ▼
                                ┌─────────────────┐
                                │  Dashboard      │
                                │  (Seller/Buyer) │
                                └─────────────────┘
```

---

## 2. Authentication

### 2.1 Mobile OTP Login
```
Phone entry → Send OTP → 6-digit verify → Backend issues JWT → Dashboard
                  │
                  └─ Resend (after 30 s)
                  └─ Use email login instead
```

### 2.2 Email Login
```
Email + Password → Verify → Issue JWT → Dashboard
              │
              └─ "Forgot password?" → OTP to phone → Reset
```

### 2.3 Seller Registration
```
Phone → OTP → Choose "Milk Seller" → Business profile (name, address, GST)
     → Add first product (e.g., Cow Milk @ ₹60/L) → Dashboard (empty state CTA)
```

### 2.4 Buyer Registration
```
Phone → OTP → Choose "Milk Buyer" → Personal info (name, address)
     → Linked to seller (auto if seller created customer with same phone,
       else via invite code) → Dashboard
```

---

## 3. Seller — Daily Delivery Recording (Critical Path, target < 2 min)

```
Seller Dashboard
    │
    ▼
[Delivery Report] screen  ──▶  Filter: Today · Morning
    │
    ▼
List of customers with default qty pre-filled
    │
    ├─▶ TAP row              → Marked Delivered ✅
    ├─▶ SWIPE LEFT row       → Marked Missed ✗
    └─▶ LONG PRESS row       → Edit Quantity sheet
    │
    ▼
Footer summary live-updates: Total · Delivered · Pending
    │
    ▼
Repeat with filter = Evening
    │
    ▼
Sync ──▶ Push to each delivered buyer:
        "Your milk has been delivered ☑"
```

**Design rule:** Marking 100 customers must be possible in **< 2 minutes**. Defaults pre-populated; happy path is one tap per row.

---

## 4. Seller — Add Customer

```
Customer tab → "+ Add Customer"
    │
    ▼
Form
  Basic Info
    Name, Mobile, Alternate Number, Address
  Delivery Settings
    Type: ○ Morning  ○ Evening  ● Both
    Morning Qty: 1.0   Evening Qty: 0.5
  Pricing
    Milk Rate: 60.00
  Billing
    Start Date: 2026-06-01   Cycle: Monthly
  Status
    ● Active
    │
    ▼
Save → Customer appears in list and tomorrow's delivery sheet
```

---

## 5. Seller — Bill Generation & Sending (target < 30 s)

### 5.1 Auto monthly billing (cron)
```
Day 1, 06:00 AM (cycle day) →  System aggregates all delivered records
    →  Creates invoice per customer for the previous period
    →  Renders PDF to S3
    →  Pushes "Your bill of ₹X is ready" to each buyer
    →  Seller sees "12 bills generated" banner on dashboard
```

### 5.2 Manual bill flow
```
Billing tab → Tab: All
    │
    ▼
Tap "+ Generate Bill" → Pick customer → Pick period → Confirm
    │
    ▼
Invoice detail → "Send Invoice" sheet
    Channels: ☑ Push  ☑ SMS  ☑ WhatsApp
    │
    ▼
Buyer receives notification + WhatsApp link to PDF
```

---

## 6. Seller — Record Payment

```
Billing tab → Invoice detail → "Mark Paid"
    │
    ▼
Modal
  Customer:  Priya Sharma     (locked)
  Amount:    ₹1,800           (pre-filled = balance due)
  Date:      Today
  Method:    ○ Cash  ● UPI  ○ Bank Transfer
  Reference: UPI-TXN-XXXX
    │
    ▼
Save → Ledger updated, push to buyer "Payment received ✓"
```

---

## 7. Seller — Reports / Profit & Loss

```
Reports tab
    │
    ▼
Profit & Loss screen
  Tabs: [Daily] [Weekly] [Monthly] [Customer Wise]
  Metrics: Total Milk Sold · Revenue · Expenses · Profit
  Charts: Revenue Trend · Profit Trend · Consumption Trend
    │
    ▼
"Export" → PDF / Excel / CSV → Share via OS share sheet
```

---

## 8. Buyer — View Deliveries (Calendar)

```
Buyer Dashboard
    │
    ▼
"View Deliveries" → Calendar View
    Days color-coded:
      🟡 Morning Delivered
      🔵 Evening Delivered
      🟢 Both Delivered
      🔴 Missed Delivery
    │
    ▼
Tap a day → Bottom sheet:
    Quantity, Status, Notes
```

---

## 9. Buyer — Pause Delivery / Vacation Mode (target ≤ 3 taps)

```
Buyer Dashboard → "Manage Schedule"
    │
    ▼
Options:
  Pause Delivery     →  Pick from / to dates → Confirm
  Resume Delivery    →  One tap if currently paused
  Vacation Mode      →  Pick from / to dates → Confirm
  Extra Milk Request →  Pick date + extra qty + product → Confirm
    │
    ▼
Push to seller "Priya paused Jun 5–12"
Buyer sees banner "Resumes on Jun 13 ✓"
```

---

## 10. Buyer — Pay Bill Online

```
Buyer Dashboard → "Pay Now" (or Bills tab → Invoice → Pay Online)
    │
    ▼
Payment screen
  Amount:  ₹1,800
  Method:  ● UPI  ○ Card  ○ Net Banking  ○ Wallet (GPay/PhonePe/Paytm)
    │
    ▼
Razorpay / PhonePe / Cashfree SDK
    │
    ▼
Success → Receipt → Push "Payment received" to seller
                    Buyer ledger auto-updated
Failure → Show retry, alternate method, support link
```

---

## 11. Buyer — Raise Complaint

```
Buyer Dashboard → "Raise Complaint"
    │
    ▼
Category: ○ Delivery  ○ Billing  ○ Quantity  ○ Other
Description (and optional photo)
    │
    ▼
Submit → Ticket ID generated → Status: Open
    │
    ▼
Seller sees in Issues inbox → Updates status (In Progress / Resolved)
    │
    ▼
Buyer gets push on each status change
```

---

## 12. Edge & Error Flows

| Scenario | Handling |
|----------|---------|
| OTP not received | Show "Resend" after 30 s, "Use email login" fallback |
| No internet | Show offline banner; deliveries can be marked locally and synced |
| Payment failure | Inline retry, alternate methods; never double-charge |
| Wrong invite code (buyer) | Inline error: "Ask your distributor for correct code" |
| Seller deletes customer with dues | Soft delete; buyer sees final invoice link |
| Buyer paused but seller marked delivered | Sync conflict — server (seller) wins; audit logged |
| Two sellers, one buyer | Buyer sees combined dashboard; bills separated per seller |
| Holiday declared | Seller broadcast → auto-skip date for all customers in selected route |
