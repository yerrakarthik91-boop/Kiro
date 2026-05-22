# 06 — Mobile App Screens

Complete screen inventory for both panels. Each screen lists its purpose, key UI elements, primary actions, and any state variants. Screen IDs map to navigation routes.

> **Visual structure** must follow the supplied reference design 1:1. Tokens below (typography, spacing, color) follow Material Design 3 defaults; tweak to reference once available.

---

## 0. Design System Foundations

| Token | Light | Dark |
|-------|-------|------|
| Primary | `#0A8754` (milk-green) | `#7BD9A2` |
| Secondary | `#F4A261` | `#F4A261` |
| Background | `#FFFFFF` | `#0E1411` |
| Surface | `#F6F7F6` | `#1A201D` |
| Error | `#B3261E` | `#F2B8B5` |

- Type scale: MD3 (`displayLarge` … `labelSmall`) using Inter / Roboto.
- Spacing: 4-pt grid (4, 8, 12, 16, 24, 32).
- Min tap target: 48×48 dp.
- Elevation tokens: 0/1/2/3 with MD3 surface tints.
- All screens support: pull-to-refresh, empty state, loading skeleton, error retry.

---

## A. Shared / Authentication Screens

| ID | Screen | Purpose | Key Elements |
|----|--------|---------|--------------|
| AUTH-01 | Splash | Logo while session check runs | Logo, version |
| AUTH-02 | Onboarding (3 slides) | First-launch product intro | Pager, "Skip", "Get Started" |
| AUTH-03 | Phone Entry | Capture mobile + country code | Country picker, phone field, T&C checkbox |
| AUTH-04 | OTP Verify | Verify 6-digit OTP | OTP boxes, "Resend" timer, "Use call OTP" |
| AUTH-05 | Role Selection | First-time only | Two big cards: "I sell milk", "I buy milk" |
| AUTH-06 | Profile Setup (Seller) | Business name, address | Name, address w/ map pin, language |
| AUTH-07 | Profile Setup (Buyer) | Name + invite code/QR | Name, invite-code field, QR scan button, address |
| AUTH-08 | Permissions | Notifications, location | Native dialog wrappers |

---

## B. Seller Panel Screens

### B.1 Navigation
Bottom nav (5 items): **Today · Customers · Billing · Reports · More**.

| ID | Screen | Purpose / Notes |
|----|--------|-----------------|
| SE-HOME-01 | **Today** | Default tab. Card "Total today: 96 L · 80 customers". Routes list with progress chips. Big FAB "Mark all delivered" only when on a single route. |
| SE-HOME-02 | Route Detail (Daily Sheet) | Critical screen. List of customers with: avatar, name, default qty, status chip (Pending/Delivered/Skipped). Tap row → quick actions. Long-press header → bulk action sheet. Sticky header with route stats. |
| SE-HOME-03 | Quick Mark Sheet | Bottom sheet on row tap: ✓ Delivered · ✗ Skipped · ✎ Custom qty · 📷 Photo. |
| SE-HOME-04 | Add Ad-hoc Delivery | Add extra qty / one-time product for today only. |
| SE-HOME-05 | Offline Sync Status | Banner expands to show pending changes count + retry. |
| SE-CUS-01 | Customers List | Search, route filter, status filter. FAB "+ Add". |
| SE-CUS-02 | Customer Detail | Tabs: Overview · Subscriptions · Ledger · Invoices · Notes. |
| SE-CUS-03 | Add / Edit Customer | Form: name, phone, address (map pin), route, default subscriptions. |
| SE-CUS-04 | Invite Code / QR | Modal showing 6-char code + QR + share button. |
| SE-CUS-05 | Subscription Editor | Product, qty, frequency picker (daily/alt/weekly/custom days). |
| SE-CUS-06 | Pause Subscription | Calendar range picker. |
| SE-PRD-01 | Products List | All products with on/off toggle. |
| SE-PRD-02 | Product Detail / Edit | Name, image, unit, default price, tax%. |
| SE-PRD-03 | Bulk Price Update | Pick products → new price → confirm. |
| SE-BIL-01 | Billing Home | KPIs: Total billed, Paid, Pending, Overdue. List of invoices. |
| SE-BIL-02 | Invoice Detail | Period, line items, payments timeline, "Share PDF" CTA. |
| SE-BIL-03 | Record Payment | Method, amount, reference, date. |
| SE-BIL-04 | Send Reminders | Pick recipients → push + SMS preview → confirm. |
| SE-BIL-05 | Generate Invoice | Manual generation for a customer/period (edge case). |
| SE-RPT-01 | Reports Home | Date-range selector, tabs: Daily · Monthly · Customers · Routes. Charts (line, bar, donut). |
| SE-RPT-02 | Export | Choose CSV/PDF, period, fields. |
| SE-MOR-01 | More | Profile, Staff, Routes, Settings, Help, Logout. |
| SE-MOR-02 | Staff Management | List, add, permissions toggle. |
| SE-MOR-03 | Routes Management | Reorder, rename, assign staff. |
| SE-MOR-04 | Settings | Theme, language, billing cycle day, currency, GST. |
| SE-MOR-05 | Announcements | Compose broadcast or targeted push. |
| SE-MOR-06 | Issues / Complaints Inbox | List of complaints with status; respond. |

### B.2 State Variants per Screen
- **Empty state:** illustration + primary CTA.
- **Loading:** skeleton matching the final layout.
- **Error:** inline + retry button.
- **Offline:** persistent yellow banner; tappable to view sync queue.

---

## C. Buyer Panel Screens

### C.1 Navigation
Bottom nav (4 items): **Home · Orders · Bills · Profile**.

| ID | Screen | Purpose / Notes |
|----|--------|-----------------|
| BU-HOME-01 | **Home** | Cards: "Today's Delivery" status, "Active Subscriptions", "Bill Due ₹1,800 — Pay Now", quick actions row. |
| BU-HOME-02 | Today's Delivery Detail | Status timeline, rate delivery, report issue. |
| BU-SUB-01 | Subscriptions List | All active subs across linked sellers. |
| BU-SUB-02 | Subscription Detail | Product, qty, frequency, calendar of paused/skipped days. Actions: Pause · Modify Qty · Cancel. |
| BU-SUB-03 | Pause Picker | Date range, reason chip selection, confirm. |
| BU-SUB-04 | Quantity Modifier | Toggle: "For one date" vs "Permanently". Number stepper. |
| BU-SUB-05 | New Subscription | Pick seller → product → qty → frequency → start date. |
| BU-ORD-01 | Orders Tab | Tabs: Active · Past. One-time orders. |
| BU-ORD-02 | New One-time Order | Catalog grid; cart bottom sheet; delivery date. |
| BU-ORD-03 | Order Detail | Items, status timeline, cancel. |
| BU-BIL-01 | Bills Tab | Current month consumption + estimated bill. List of past invoices. |
| BU-BIL-02 | Invoice Detail | Items, total, balance, "Pay Now". Share PDF. |
| BU-BIL-03 | Pay Sheet | Method selector (UPI/Card/Netbanking), amount confirm. |
| BU-BIL-04 | Payment Status | Success / Failure with retry. Receipt download. |
| BU-BIL-05 | Ledger | Running list of debits & credits per seller. |
| BU-ENG-01 | Rate Delivery | Thumbs up/down, reason chips, optional note. |
| BU-ENG-02 | Raise Complaint | Category, photo, description. |
| BU-ENG-03 | Complaints List | Tickets with status. |
| BU-PRF-01 | Profile | Photo, name, phone, language, theme, biometric toggle. |
| BU-PRF-02 | Addresses | List, add/edit, set default. |
| BU-PRF-03 | Linked Sellers | View, add another via code/QR, unlink. |
| BU-PRF-04 | Notifications Inbox | History of pushes, mark all read. |
| BU-PRF-05 | Settings | Theme, language, account deletion. |
| BU-PRF-06 | Help & Support | FAQ accordions, "Chat on WhatsApp" deep link. |

---

## D. Modal / Sheet Components (Shared)

| Component | Used In |
|-----------|---------|
| Date range picker | Pause, reports, billing |
| Number stepper sheet | Quantity edit |
| Confirm dialog | Destructive actions |
| Share sheet | PDF invoice, invite |
| Image preview | Proof photo, complaints |
| Toast / SnackBar | All success / error feedback |

---

## E. Accessibility Notes

- All interactive elements have semantic labels.
- Color-blind safe icons accompany color-coded statuses.
- Text scales up to 200%.
- All sheets dismissible with system back gesture.

---

## F. Reference-Design Mapping

When the reference design is supplied:

1. Each screen ID above will be mapped to a Figma frame.
2. Visual structure (spacing, hierarchy, primary action placement) must match exactly.
3. Only the following may be tuned from the reference:
   - Tap-target sizes raised to ≥ 48 dp.
   - Contrast raised to WCAG AA.
   - State feedback (loading / error / empty) added where missing.
   - MD3 color tokens applied for dark mode parity.
