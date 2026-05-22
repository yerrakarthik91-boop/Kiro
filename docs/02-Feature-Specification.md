# 02 — Feature Specification

This document lists every feature in MilkFlow v1, grouped by panel. Each feature has an ID for traceability into the roadmap and tickets.

## Legend

- **P0** — Must-have for launch
- **P1** — Should-have for launch
- **P2** — Nice-to-have, post-launch

---

## A. Shared / Cross-Cutting Features

| ID | Feature | Priority | Notes |
|----|---------|----------|-------|
| S-01 | Phone-OTP sign-up & login | P0 | Twilio / MSG91 |
| S-02 | Role-based routing (Seller vs Buyer) | P0 | Determined post-OTP |
| S-03 | JWT access + refresh token flow | P0 | Refresh on 401 |
| S-04 | Profile management | P0 | Name, photo, language |
| S-05 | Light & dark theme with system default | P0 | MD3 dynamic color |
| S-06 | Localization — English, Hindi | P0 | Add more via JSON |
| S-07 | Push notifications (FCM) | P0 | Topic + token-based |
| S-08 | In-app notification center | P1 | History of pushes |
| S-09 | Offline mode + sync queue | P0 | Critical for sellers |
| S-10 | App-wide search | P2 | Buyer: products; Seller: customers |
| S-11 | Help & support (FAQ + WhatsApp deep link) | P1 | |
| S-12 | App update enforcer (min version check) | P0 | Hard / soft update |
| S-13 | Crash & analytics (Firebase) | P0 | |
| S-14 | Biometric unlock (after first login) | P1 | Fingerprint / FaceID |

---

## B. Seller Panel Features

### B.1 Customer Management
| ID | Feature | Priority |
|----|---------|----------|
| SE-CM-01 | Add customer (name, phone, address, route, default products) | P0 |
| SE-CM-02 | Edit / archive / delete customer | P0 |
| SE-CM-03 | Generate invite code / QR for buyer to self-link | P0 |
| SE-CM-04 | Group customers into routes / areas | P0 |
| SE-CM-05 | Bulk import via CSV | P1 |
| SE-CM-06 | Customer notes / tags | P2 |

### B.2 Product Catalog
| ID | Feature | Priority |
|----|---------|----------|
| SE-PR-01 | Add / edit / disable product (name, unit, price, image) | P0 |
| SE-PR-02 | Bulk price update across customers | P1 |
| SE-PR-03 | Per-customer custom pricing (override) | P1 |
| SE-PR-04 | Stock-out toggle (auto-skip deliveries) | P2 |

### B.3 Subscriptions
| ID | Feature | Priority |
|----|---------|----------|
| SE-SU-01 | Create subscription (customer × product × quantity × frequency) | P0 |
| SE-SU-02 | Frequencies: daily / alternate / weekly / custom days | P0 |
| SE-SU-03 | Pause subscription (date range) | P0 |
| SE-SU-04 | Modify quantity for a date or permanently | P0 |
| SE-SU-05 | Multiple subscriptions per customer | P0 |

### B.4 Daily Delivery Operations
| ID | Feature | Priority |
|----|---------|----------|
| SE-DL-01 | Today's delivery sheet (grouped by route) | P0 |
| SE-DL-02 | One-tap "mark delivered" / "skip" / "partial qty" | P0 |
| SE-DL-03 | Bulk "mark all delivered for route" | P0 |
| SE-DL-04 | Add ad-hoc delivery (extra qty / new product today) | P0 |
| SE-DL-05 | Capture proof photo (optional) | P2 |
| SE-DL-06 | Map view of route with optimization | P2 |
| SE-DL-07 | Assign route to delivery staff | P1 |

### B.5 Billing & Payments
| ID | Feature | Priority |
|----|---------|----------|
| SE-BL-01 | Auto-generate monthly invoice on day-1 of next month | P0 |
| SE-BL-02 | Invoice PDF (download / share via WhatsApp) | P0 |
| SE-BL-03 | Record payment (cash / UPI / online / bank) | P0 |
| SE-BL-04 | Partial payments & running ledger | P0 |
| SE-BL-05 | Send payment reminders (push + SMS) | P0 |
| SE-BL-06 | Online payment links to buyers | P1 |
| SE-BL-07 | Adjustments (discount / refund / write-off) | P1 |
| SE-BL-08 | Tax / GST configuration | P2 |

### B.6 Reports & Analytics
| ID | Feature | Priority |
|----|---------|----------|
| SE-RP-01 | Daily summary (qty, revenue, skips) | P0 |
| SE-RP-02 | Monthly revenue, dues, collected | P0 |
| SE-RP-03 | Top customers, top products | P1 |
| SE-RP-04 | Route performance | P1 |
| SE-RP-05 | Export to CSV / PDF | P1 |

### B.7 Staff Management
| ID | Feature | Priority |
|----|---------|----------|
| SE-ST-01 | Add staff sub-account (delivery boy) | P1 |
| SE-ST-02 | Permissions: only mark-deliveries view | P1 |
| SE-ST-03 | Daily handover summary | P2 |

### B.8 Notifications & Communication
| ID | Feature | Priority |
|----|---------|----------|
| SE-NT-01 | Broadcast announcement (price change, holiday) | P0 |
| SE-NT-02 | Targeted push (a customer, a route) | P1 |
| SE-NT-03 | Auto reminders (bill due, payment overdue) | P0 |

---

## C. Buyer Panel Features

### C.1 Onboarding & Linking
| ID | Feature | Priority |
|----|---------|----------|
| BU-ON-01 | Phone-OTP sign-up | P0 |
| BU-ON-02 | Link to a seller via invite code or QR | P0 |
| BU-ON-03 | Address with geolocation pin | P0 |
| BU-ON-04 | Multiple addresses (home, parents) | P1 |

### C.2 Home / Dashboard
| ID | Feature | Priority |
|----|---------|----------|
| BU-HM-01 | Today's delivery card (status: pending / delivered / skipped) | P0 |
| BU-HM-02 | Upcoming bill snapshot | P0 |
| BU-HM-03 | Quick actions: pause, change qty, pay | P0 |
| BU-HM-04 | Active subscriptions list | P0 |

### C.3 Subscription Self-Service
| ID | Feature | Priority |
|----|---------|----------|
| BU-SU-01 | View subscription details | P0 |
| BU-SU-02 | Pause delivery (pick date range from calendar) | P0 |
| BU-SU-03 | Modify quantity (single date or permanent) | P0 |
| BU-SU-04 | Cancel subscription (with reason) | P1 |
| BU-SU-05 | Add new subscription from catalog | P1 |

### C.4 One-Time Orders
| ID | Feature | Priority |
|----|---------|----------|
| BU-OR-01 | Browse seller's catalog | P1 |
| BU-OR-02 | Place one-time order (extra paneer, ghee) | P1 |
| BU-OR-03 | Order status timeline | P1 |

### C.5 Payments & Ledger
| ID | Feature | Priority |
|----|---------|----------|
| BU-PY-01 | View current month consumption + estimated bill | P0 |
| BU-PY-02 | View past invoices (PDF) | P0 |
| BU-PY-03 | Pay online (UPI / card / netbanking) | P0 |
| BU-PY-04 | Payment history & receipts | P0 |
| BU-PY-05 | Auto-debit (UPI mandate) | P2 |

### C.6 Engagement
| ID | Feature | Priority |
|----|---------|----------|
| BU-EN-01 | Rate today's delivery (thumbs up / down + reason) | P1 |
| BU-EN-02 | Raise complaint (missed / spoiled / late) | P0 |
| BU-EN-03 | Refer & earn (invite friends to seller) | P2 |
| BU-EN-04 | Notifications inbox | P1 |

### C.7 Profile & Settings
| ID | Feature | Priority |
|----|---------|----------|
| BU-SE-01 | Edit profile, language, theme | P0 |
| BU-SE-02 | Manage addresses | P1 |
| BU-SE-03 | Logout, delete account | P0 |

---

## D. Permissions Matrix (Role-Based)

| Action | Seller (Admin) | Staff (Delivery) | Buyer |
|--------|:---:|:---:|:---:|
| Manage customers | ✅ | ❌ | ❌ |
| View assigned route | ✅ | ✅ | ❌ |
| Mark delivery | ✅ | ✅ | ❌ |
| View all reports | ✅ | ❌ | ❌ |
| View own ledger | n/a | n/a | ✅ |
| Pause own subscription | n/a | n/a | ✅ |
| Manage products & pricing | ✅ | ❌ | ❌ |
| Record payment | ✅ | ✅ (cash only) | ❌ |
| Online payment | n/a | n/a | ✅ |
