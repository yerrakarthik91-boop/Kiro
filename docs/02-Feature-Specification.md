# 02 — Feature Specification

Detailed feature list for Milk Management System (MMS) v1.0, derived from the PRD §8–§10 and §15 (MVP Scope).

## Legend
- **P0** — In MVP, must-have for launch
- **P1** — In MVP, should-have for launch
- **P2** — Post-launch (Phase 2 / Phase 3)

---

## A. Shared / Cross-Cutting

| ID | Feature | Priority |
|----|---------|----------|
| S-01 | Splash screen with session check | P0 |
| S-02 | User selection screen (Seller / Buyer) | P0 |
| S-03 | Mobile OTP login | P0 |
| S-04 | Email login (alternate) | P0 |
| S-05 | Seller registration | P0 |
| S-06 | Buyer registration | P0 |
| S-07 | Password recovery via OTP | P0 |
| S-08 | JWT auth + refresh tokens | P0 |
| S-09 | Light + dark theme (MD3) | P0 |
| S-10 | Localization (English, Hindi) | P0 |
| S-11 | Push notifications (FCM) | P0 |
| S-12 | SMS notifications | P0 |
| S-13 | WhatsApp notifications | P1 |
| S-14 | In-app notification center | P0 |
| S-15 | Help screen | P1 |
| S-16 | Profile management (name, phone, language) | P0 |
| S-17 | Crash & analytics (Firebase) | P0 |
| S-18 | App-version enforcer (soft/hard update) | P0 |

---

## B. Seller Panel Features

### B.1 Dashboard
| ID | Feature | Priority |
|----|---------|----------|
| SE-DB-01 | Summary cards: Total Milk Today, Delivered, Revenue Today, Active Customers, Pending Payments, Collections Today | P0 |
| SE-DB-02 | Quick actions: Add Customer, Generate Bill, Add Delivery, Record Payment, Export Report | P0 |
| SE-DB-03 | Charts: Milk Trend, Revenue Trend, Customer Growth | P0 |
| SE-DB-04 | Delivery summary: Pending, Completed, Missed | P0 |
| SE-DB-05 | Notifications: Due Payments, Missed Deliveries, New Customers | P0 |

### B.2 Customer Management
| ID | Feature | Priority |
|----|---------|----------|
| SE-CM-01 | Add customer (basic info + delivery settings + pricing + billing) | P0 |
| SE-CM-02 | Edit customer | P0 |
| SE-CM-03 | Delete customer (soft) | P0 |
| SE-CM-04 | Pause / resume customer | P0 |
| SE-CM-05 | Generate bill from customer profile | P0 |
| SE-CM-06 | Search by name / mobile | P0 |
| SE-CM-07 | Filter: Active / Paused / Due Payment | P0 |
| SE-CM-08 | Set delivery type (Morning / Evening / Both) | P0 |
| SE-CM-09 | Set morning & evening quantities independently | P0 |
| SE-CM-10 | Set per-customer milk rate | P0 |
| SE-CM-11 | Set billing cycle and start date | P0 |

### B.3 Delivery Recording
| ID | Feature | Priority |
|----|---------|----------|
| SE-DL-01 | Daily delivery list with date filter | P0 |
| SE-DL-02 | Filter by Morning / Evening | P0 |
| SE-DL-03 | Tap row → mark Delivered | P0 |
| SE-DL-04 | Swipe left → mark Missed | P0 |
| SE-DL-05 | Long press → edit quantity | P0 |
| SE-DL-06 | Footer summary: Total / Delivered / Pending | P0 |
| SE-DL-07 | Add ad-hoc delivery (extra request) | P0 |
| SE-DL-08 | Offline mode + sync queue | P0 |

### B.4 Product Management
| ID | Feature | Priority |
|----|---------|----------|
| SE-PR-01 | Pre-seeded milk types (Cow, Buffalo, Toned) | P0 |
| SE-PR-02 | Add / edit custom product | P0 |
| SE-PR-03 | Global pricing | P0 |
| SE-PR-04 | Per-customer pricing override | P0 |

### B.5 Billing & Invoices
| ID | Feature | Priority |
|----|---------|----------|
| SE-BL-01 | Auto generate monthly bills on cycle day | P0 |
| SE-BL-02 | Manual bill generation per customer | P0 |
| SE-BL-03 | Tabs: All / Pending / Paid / Overdue | P0 |
| SE-BL-04 | Invoice detail with delivery breakdown table | P0 |
| SE-BL-05 | Download PDF | P0 |
| SE-BL-06 | Share invoice (WhatsApp / Email) | P0 |
| SE-BL-07 | Print invoice | P1 |
| SE-BL-08 | Mark paid (cash) | P0 |
| SE-BL-09 | Send invoice via push / SMS / WhatsApp | P0 |

### B.6 Payment Management
| ID | Feature | Priority |
|----|---------|----------|
| SE-PY-01 | Record payment (Cash / UPI / Bank Transfer) | P0 |
| SE-PY-02 | Payment overview: Today / Pending / Overdue collection | P0 |
| SE-PY-03 | Allocate payment to invoice (FIFO default) | P0 |
| SE-PY-04 | Partial payment support | P0 |

### B.7 Reports & Analytics
| ID | Feature | Priority |
|----|---------|----------|
| SE-RP-01 | Profit & Loss tabs: Daily / Weekly / Monthly / Customer-wise | P0 |
| SE-RP-02 | Charts: Revenue Trend, Profit Trend, Consumption Trend | P0 |
| SE-RP-03 | Daily report: milk delivered, revenue | P0 |
| SE-RP-04 | Monthly report: customer billing, revenue summary | P0 |
| SE-RP-05 | Customer report: consumption + payment history | P0 |
| SE-RP-06 | Export PDF / Excel / CSV | P0 |

### B.8 Settings
| ID | Feature | Priority |
|----|---------|----------|
| SE-ST-01 | Business profile: name, address, GST number | P0 |
| SE-ST-02 | Notification preferences (push, SMS) | P0 |
| SE-ST-03 | Automatic daily backup | P0 |
| SE-ST-04 | Manual backup / restore | P0 |

---

## C. Buyer Panel Features

### C.1 Dashboard
| ID | Feature | Priority |
|----|---------|----------|
| BU-DB-01 | Welcome card with customer name | P0 |
| BU-DB-02 | Milk summary: morning qty, evening qty, monthly consumption | P0 |
| BU-DB-03 | Billing card: current bill, due date, status | P0 |
| BU-DB-04 | Quick actions: View Deliveries, View Bills, Pay Now, Raise Complaint | P0 |

### C.2 Delivery History
| ID | Feature | Priority |
|----|---------|----------|
| BU-DL-01 | History table (date / morning / evening / status) | P0 |
| BU-DL-02 | Filter by month | P0 |
| BU-DL-03 | Filter by date range | P0 |

### C.3 Bills & Payments
| ID | Feature | Priority |
|----|---------|----------|
| BU-BL-01 | Bills list (amount, due date, status) | P0 |
| BU-BL-02 | View invoice detail | P0 |
| BU-BL-03 | Download invoice PDF | P0 |
| BU-BL-04 | Pay online | P0 |
| BU-BL-05 | Payment history | P0 |

### C.4 Calendar View
| ID | Feature | Priority |
|----|---------|----------|
| BU-CV-01 | Color-coded calendar (Yellow=Morning, Blue=Evening, Green=Both, Red=Missed) | P0 |
| BU-CV-02 | Day-click detail: quantity, status, notes | P0 |

### C.5 Delivery Schedule Management
| ID | Feature | Priority |
|----|---------|----------|
| BU-SC-01 | Pause delivery | P0 |
| BU-SC-02 | Resume delivery | P0 |
| BU-SC-03 | Vacation mode (date range) | P0 |
| BU-SC-04 | Extra milk request | P0 |

### C.6 Complaint Management
| ID | Feature | Priority |
|----|---------|----------|
| BU-CP-01 | Create ticket (Delivery / Billing / Quantity / Other) | P0 |
| BU-CP-02 | Track status (Open / In Progress / Resolved) | P0 |
| BU-CP-03 | Attach photo to ticket | P1 |

### C.7 Profile Settings
| ID | Feature | Priority |
|----|---------|----------|
| BU-PR-01 | Update name, phone, address | P0 |
| BU-PR-02 | Notification preferences | P0 |
| BU-PR-03 | Language preference | P0 |

---

## D. Payment Methods Supported

| Method | Priority |
|--------|----------|
| UPI | P0 |
| Google Pay | P0 |
| PhonePe | P0 |
| Paytm | P0 |
| Debit Card | P0 |
| Credit Card | P0 |
| Net Banking | P0 |
| Cash (recorded by seller) | P0 |
| Bank Transfer (recorded by seller) | P0 |

Gateways: **Razorpay**, **PhonePe**, **Cashfree** (configurable per seller).

---

## E. Notification Triggers

| Event | Recipient | Channels |
|-------|-----------|----------|
| Bill Generated | Buyer | Push + SMS |
| Payment Due | Buyer | Push + SMS + WhatsApp |
| Delivery Completed | Buyer | Push |
| Delivery Missed | Buyer | Push |
| Payment Received | Seller + Buyer | Push |
| New Customer | Seller | Push |
| Complaint Raised | Seller | Push |
| Complaint Updated | Buyer | Push |

---

## F. Permissions Matrix

| Action | Seller | Buyer |
|--------|:------:|:-----:|
| Manage customers | ✅ | ❌ |
| Record deliveries | ✅ | ❌ |
| View own deliveries | n/a | ✅ |
| Generate / send bills | ✅ | ❌ |
| View own bills & invoices | n/a | ✅ |
| Pay online | n/a | ✅ |
| Record cash / UPI / bank payment | ✅ | ❌ |
| Manage products & pricing | ✅ | ❌ |
| Manage business settings | ✅ | ❌ |
| Pause / resume own delivery | n/a | ✅ |
| Vacation mode / extra milk request | n/a | ✅ |
| Raise complaint | n/a | ✅ |
| View reports | ✅ | ❌ |
| Export data | ✅ | ❌ |

---

## G. Future Enhancements (Out of v1)

### Phase 2
- SE-FUT-01 Route Optimization
- SE-FUT-02 GPS Delivery Tracking
- SE-FUT-03 QR Code Customer Identification
- SE-FUT-04 WhatsApp Billing Automation
- S-FUT-05  Multi-Language Support (beyond en/hi)

### Phase 3
- SE-FUT-06 AI Revenue Forecasting
- SE-FUT-07 Demand Prediction
- SE-FUT-08 Smart Collection Reminders
- SE-FUT-09 Voice-Based Delivery Entry
