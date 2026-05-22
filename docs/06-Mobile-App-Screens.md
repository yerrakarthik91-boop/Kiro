# 06 — Mobile App Screens

Screen inventory for Milk Management System (MMS) v1.0. Every screen described here maps directly to PRD §7–§9.

> **Visual structure** must follow the supplied reference design 1:1 when provided. Tokens below follow Material Design 3; tweak to reference once available. Improvements are limited to spacing, contrast, tap-target size, and state feedback — not layout reorganization.

---

## 0. Design System Foundations

| Token | Light | Dark |
|-------|-------|------|
| Primary | `#0A8754` (milk-green) | `#7BD9A2` |
| Secondary | `#F4A261` | `#F4A261` |
| Background | `#FFFFFF` | `#0E1411` |
| Surface | `#F6F7F6` | `#1A201D` |
| Error | `#B3261E` | `#F2B8B5` |

- Typography: MD3 scale (`displayLarge` … `labelSmall`) with Inter / Roboto.
- Spacing: 4-pt grid (4, 8, 12, 16, 24, 32).
- Min tap target: **48×48 dp**.
- Elevation: MD3 surface tints (0–3).
- Every screen has skeleton, empty, error, offline states.

---

## A. Authentication & Common Screens

| ID | Screen | Components & Notes |
|----|--------|--------------------|
| SCR-01 | **Splash** | Logo, app name, loader. Checks internet, session, preferences. |
| SCR-02 | **User Selection** | Two big role buttons (Milk Seller / Milk Buyer). Bottom links: Login · Register · Help · Language. |
| SCR-03 | Login (OTP) | Country code picker, phone field, T&C checkbox, "Use email login" link. |
| SCR-04 | OTP Verify | 6-digit OTP, "Resend" with timer. |
| SCR-05 | Login (Email) | Email, password, "Forgot password?". |
| SCR-06 | Forgot Password | Phone → OTP → New Password. |
| SCR-07 | Seller Registration | Name, phone, OTP, business name, address, GST (optional). |
| SCR-08 | Buyer Registration | Name, phone, OTP, address, optional invite code. |
| SCR-09 | Permissions Prompt | Notifications, location. |
| SCR-10 | Help | FAQ accordion, support phone, language switcher. |

---

## B. Seller Panel Screens

### B.1 Navigation
Bottom navigation (5 items): **Dashboard · Customers · Delivery · Billing · More**.

### B.2 Screens

| ID | Screen | Components / Notes |
|----|--------|--------------------|
| SE-01 | **Seller Dashboard** | Summary cards: Total Milk Today · Delivered · Revenue Today · Active Customers · Pending Payments · Collections Today. Quick actions: Add Customer · Generate Bill · Add Delivery · Record Payment · Export Report. Charts: Milk Trend · Revenue Trend · Customer Growth. Delivery summary: Pending · Completed · Missed. Notifications: Due Payments · Missed Deliveries · New Customers. |
| SE-02 | **Delivery Report** | Filters: Date · Morning · Evening. Customer rows: Name · Quantity · Status. Tap = Delivered. Swipe-left = Missed. Long-press = Edit Quantity. Footer: Total · Delivered · Pending. |
| SE-03 | Edit Quantity Sheet | Number stepper + save (long-press from SE-02). |
| SE-04 | Add Delivery (Ad-hoc) | Customer picker, slot, qty, product, notes. |
| SE-05 | Offline Sync Banner | Persistent banner, expandable to show pending changes count + retry. |
| SE-06 | **Customer List** | Search by name/mobile. Filters: Active · Paused · Due Payment. Row: Name, Phone, Address, Qty, Rate, Status. FAB "+ Add". |
| SE-07 | Customer Detail | Tabs: Overview · Deliveries · Bills · Ledger · Notes. Actions: Edit · Pause · Generate Bill · Delete. |
| SE-08 | **Add / Edit Customer** | Basic Info: Name, Mobile, Alt Mobile, Address. Delivery Settings: Type (Morning/Evening/Both), Morning Qty, Evening Qty. Pricing: Milk Rate. Billing: Start Date, Cycle. Status: Active/Pause. |
| SE-09 | **Billing** | Tabs: All · Pending · Paid · Overdue. Row: Customer, Period, Amount, Due Date, Status. Actions per row: Open Invoice · Send Invoice · Mark Paid · Download PDF. |
| SE-10 | **Invoice Detail** | Customer details · Bill details (Invoice #, Period, Generated Date) · Delivery breakdown table (Date / Morning / Evening). Payment summary: Total · Paid · Pending. Actions: Download PDF · Share · Print · Mark Paid. |
| SE-11 | Send Invoice Sheet | Channels: Push · SMS · WhatsApp; preview message. |
| SE-12 | Generate Bill (Manual) | Pick customer · period · confirm. |
| SE-13 | **Profit & Loss** | Tabs: Daily · Weekly · Monthly · Customer-Wise. Metrics: Total Milk Sold · Revenue · Expenses · Profit. Charts: Revenue Trend · Profit Trend · Consumption Trend. Export: PDF / Excel / CSV. |
| SE-14 | Reports — Customer Detail | Consumption + payment history for a single customer. |
| SE-15 | **Payment Management** | Collection overview: Today · Pending · Overdue. List of payments. FAB "+ Record Payment". |
| SE-16 | Record Payment | Customer · Amount · Date · Method (Cash · UPI · Bank Transfer) · Reference · Notes. |
| SE-17 | **Product Management** | Pre-seeded: Cow · Buffalo · Toned. Add Custom Product. Each product: name, image, unit, default rate, on/off. |
| SE-18 | Pricing Management | Global pricing per product, plus per-customer overrides table. |
| SE-19 | Bulk Price Update | Pick products → new rate → confirm with affected-customer count. |
| SE-20 | **More Tab** | Profile, Settings, Backup/Restore, Help, Logout. |
| SE-21 | Business Profile | Business Name, Address, GST Number. |
| SE-22 | Notification Settings | Push toggles, SMS toggles, WhatsApp toggle. |
| SE-23 | Backup / Restore | Auto-backup status, manual backup button, restore picker. |
| SE-24 | Issues / Complaints Inbox | List with category & status; tap to view detail and update status. |
| SE-25 | Complaint Detail | Read description, photo; update status (Open · In Progress · Resolved); add resolution note. |

---

## C. Buyer Panel Screens

### C.1 Navigation
Bottom navigation (4 items): **Dashboard · Deliveries · Bills · Profile**.

### C.2 Screens

| ID | Screen | Components / Notes |
|----|--------|--------------------|
| BU-01 | **Buyer Dashboard** | Welcome card (customer name). Milk summary: Morning Qty · Evening Qty · Monthly Consumption. Billing card: Current Bill · Due Date · Status. Quick actions: View Deliveries · View Bills · Pay Now · Raise Complaint. |
| BU-02 | **Delivery History** | Table: Date · Morning · Evening · Status. Filters: Month · Date Range. |
| BU-03 | **Calendar View** | Color-coded calendar — 🟡 Morning Delivered, 🔵 Evening Delivered, 🟢 Both, 🔴 Missed. Day click → bottom sheet (Quantity, Status, Notes). |
| BU-04 | **Bills List** | Cards: Amount · Due Date · Status. Actions: View Invoice · Download PDF · Pay Online. |
| BU-05 | **Invoice Detail** | Customer details · Delivery details (table) · Billing summary. Actions: Download PDF · Pay Online. |
| BU-06 | **Pay Bill** | Method selector: UPI · Google Pay · PhonePe · Paytm · Card · Net Banking. Amount confirm. |
| BU-07 | Payment Status | Success / Failure with retry. Receipt download. |
| BU-08 | Payment History | Date · Amount · Method · Reference. |
| BU-09 | **Manage Schedule** | Buttons: Pause Delivery · Resume Delivery · Vacation Mode · Extra Milk Request. |
| BU-10 | Pause Picker | Date range, optional reason. |
| BU-11 | Vacation Picker | Date range. |
| BU-12 | Extra Milk Request | Date, slot, qty, product. |
| BU-13 | **Raise Complaint** | Category: Delivery · Billing · Quantity · Other. Description. Optional photo. Submit. |
| BU-14 | Complaints List | Tickets with status (Open · In Progress · Resolved). |
| BU-15 | Complaint Detail | Status timeline, seller response. |
| BU-16 | **Profile** | Personal Info: Name, Phone, Address. Preferences: Notifications, Language. |
| BU-17 | Notifications Inbox | History list, mark read / read all. |
| BU-18 | Linked Sellers | List, add via invite code, unlink. |
| BU-19 | Settings | Theme, language, account deletion. |

---

## D. Shared Components

| Component | Used In |
|-----------|---------|
| Date range picker | Pause / Vacation / Reports / Billing |
| Month picker | Calendar view, monthly reports |
| Number stepper sheet | Edit quantity, extra request |
| Confirm dialog | Destructive actions |
| Share sheet | Invoice PDF, exports |
| Image preview | Complaint photos |
| Toast / SnackBar | All success / error feedback |
| Empty state | Each list with primary CTA |
| Loading skeleton | Each list and dashboard |
| Offline banner | Top of app while offline |

---

## E. Accessibility

- Semantic labels on all interactive elements.
- Color-coded status icons paired with text labels (color-blind safe).
- Text scales up to 200%.
- All sheets dismissible with system back gesture.
- High-contrast support; meets WCAG 2.1 AA.

---

## F. Reference-Design Mapping

Once the reference design is supplied:

1. Each screen ID above will be mapped to a Figma frame.
2. Visual structure (spacing, hierarchy, primary action placement) must match exactly.
3. Allowed deltas vs. reference:
   - Tap-target sizes raised to ≥ 48 dp.
   - Contrast raised to WCAG AA.
   - State feedback (loading / error / empty) added where missing.
   - MD3 color tokens applied for dark mode parity.
