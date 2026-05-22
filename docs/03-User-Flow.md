# 03 — User Flow

This document describes the primary end-to-end journeys for both roles. Diagrams use ASCII for portability; replace with Figma flows during design phase.

---

## 1. Splash → Role Detection (Both Roles)

```
┌──────────┐   ┌─────────────┐   ┌──────────────┐   ┌──────────┐
│  Splash  │──▶│  Auth check │──▶│ Has session? │──▶│ Role?    │
└──────────┘   └─────────────┘   └──────┬───────┘   └────┬─────┘
                                        │No              │
                                        ▼                │
                                 ┌────────────┐          │
                                 │ Onboarding │          │
                                 │ (3 slides) │          │
                                 └─────┬──────┘          │
                                       ▼                 │
                                 ┌────────────┐          │
                                 │ Phone+OTP  │          │
                                 └─────┬──────┘          │
                                       ▼                 │
                                 ┌────────────┐          │
                                 │ Choose role│          │
                                 │Seller/Buyer│          │
                                 └─────┬──────┘          │
                                       └────────┬────────┘
                                                ▼
                                       ┌──────────────────┐
                                       │  Seller Home  OR │
                                       │  Buyer  Home     │
                                       └──────────────────┘
```

---

## 2. Seller — First Run Onboarding

1. Sign up with phone → OTP verify.
2. Choose **"I am a Seller / Distributor"**.
3. Enter business name, address, default route name.
4. Add first product (e.g., Cow Milk, ₹60/L).
5. Generate invite code & share link to first customer (WhatsApp share sheet).
6. Land on **Seller Home** with empty-state CTA: *"Add your first customer"*.

---

## 3. Seller — Daily Delivery Marking (Critical Path)

```
Seller Home
    │
    ▼
[Today] tab ──▶ Routes grouped: "Route A (32 customers)"
    │
    ▼
Tap route ──▶ List of customers with default qty pre-filled
    │
    ├─▶ Long-press header: "Mark all delivered" ✅ (one tap = done)
    │
    ├─▶ Per row: Tap ✓ to mark delivered (default qty)
    │            Tap ✗ to mark skipped
    │            Tap pencil to enter custom qty
    │
    ▼
Sync ──▶ Push notification to each delivered customer
        "Your milk has been delivered ☑"
```

**Design rule:** Marking 100 customers must be possible in < 5 minutes. Defaults are pre-populated; "happy path" is one tap per customer.

---

## 4. Seller — Month-End Billing

```
Day 1 of new month, 6:00 AM
    │
    ▼
System cron generates invoices for all sellers
    │
    ▼
Seller opens app ──▶ "12 invoices ready" banner
    │
    ▼
[Billing] tab ──▶ List of invoices with status: Sent / Paid / Pending
    │
    ├─▶ Tap invoice ──▶ View details, share PDF on WhatsApp
    ├─▶ Bulk "Send all reminders" ──▶ Push + SMS to all unpaid
    └─▶ Per invoice: "Record payment" (cash / UPI / online)
```

---

## 5. Seller — Recording an Online + Cash Payment

```
Invoice detail
    │
    ▼
Tap "Record payment"
    │
    ▼
Modal:
  Amount     [₹ 1,800]   (pre-filled = balance due)
  Method     [○ Cash  ● UPI  ○ Bank]
  Reference  [_____________]
  Note       [_____________]
    │
    ▼
Save ──▶ Ledger updated, push to buyer "Payment received ✓"
```

---

## 6. Buyer — First Run Onboarding

1. Sign up with phone → OTP verify.
2. Choose **"I am a Buyer"**.
3. Enter name, address (geolocation pin assist).
4. Enter **invite code** received from seller (or scan QR).
5. App fetches seller's catalog; show suggestion: *"Subscribe to Cow Milk daily?"*.
6. Confirm subscription → Buyer Home.

---

## 7. Buyer — Pause Delivery for Vacation (Critical Path)

```
Buyer Home
    │
    ▼
Subscription card ──▶ Tap "Pause"
    │
    ▼
Calendar:
   Select start date  [Jun 5]
   Select end date    [Jun 12]
   (8 days will be paused)
    │
    ▼
Confirm ──▶
   Local optimistic update
   Push to seller "Priya paused Jun 5 – Jun 12"
   Buyer sees banner: "Resumes on Jun 13 ✓"
```

**Target:** ≤ 3 taps from home to confirmed pause.

---

## 8. Buyer — Pay Monthly Bill Online

```
Buyer Home ──▶ "Bill due ₹1,800" card
    │
    ▼
Tap "Pay now"
    │
    ▼
Payment screen
    Amount  ₹1,800
    Method  [● UPI  ○ Card  ○ Netbanking]
    │
    ▼
Razorpay/Stripe SDK ──▶ Success
    │
    ▼
Receipt screen ──▶ "Thanks! Receipt sent to WhatsApp."
                   Auto-update ledger, notify seller.
```

---

## 9. Buyer — Raise Complaint

```
Today's delivery card ──▶ Tap "Report issue"
    │
    ▼
Pick reason: [Missed | Spilled | Late | Wrong qty | Other]
Optional: Add photo, note
    │
    ▼
Submit ──▶ Push to seller, ticket appears in seller's "Issues" inbox
            Buyer gets ticket ID, status timeline
```

---

## 10. Edge & Error Flows

| Scenario | Flow |
|---------|------|
| OTP not received | After 30 s show "Resend"; after 3 fails offer call-OTP fallback. |
| Offline marking | Queue locally, sync banner: "12 changes will sync when online". |
| Payment failure | Show retry; offer alternate method; never double-charge. |
| Invite code invalid | Inline error; suggest "Ask your distributor for correct code". |
| Seller deletes a buyer | Buyer sees friendly screen: "You are unlinked. Enter new code." |
| Conflict (seller + buyer edited same date) | Seller wins; buyer notified of override. |
