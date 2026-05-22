# 01 — Product Requirements Document (PRD)

**Product:** Milk Management System (MMS)
**Version:** 1.0
**Type:** Mobile Application (Android & iOS)

---

## 1. Executive Summary

The **Milk Management System (MMS)** digitizes daily milk delivery operations, customer management, billing, collections, reporting, and customer communication through a **single mobile application** containing two distinct panels:

1. **Milk Seller Panel** — for distributors / dairy operators
2. **Milk Buyer Panel** — for end customers

The system eliminates manual registers, paper bills, and calculation errors while providing real-time tracking and automated billing.

### Target Users
- **Milk Sellers** — small/medium dairy distributors managing 20–500 customers
- **Milk Buyers** — household customers receiving daily milk deliveries

---

## 2. Business Problem

Current milk businesses face:

- Manual customer records
- Paper-based delivery tracking
- Billing errors
- Delayed collections
- Missing delivery records
- Lack of customer transparency
- No performance analytics
- Difficult customer management
- No digital payment integration

---

## 3. Product Goals

| ID | Goal |
|----|------|
| G1 | Digitize complete milk delivery operations |
| G2 | Automate monthly billing generation |
| G3 | Improve payment collection efficiency |
| G4 | Provide transparent delivery history |
| G5 | Reduce operational workload by 80% |
| G6 | Enable data-driven business decisions |

---

## 4. Success Metrics (KPIs)

| KPI | Target |
|-----|--------|
| Delivery Recording Time | < 2 minutes |
| Bill Generation Time | < 30 seconds |
| App Response Time | < 2 seconds |
| Payment Collection Improvement | +40% |
| Delivery Accuracy | 99% |
| Customer Satisfaction | 4.5+ rating |
| Daily Active Users | 70%+ |
| Billing Errors | < 1% |

---

## 5. User Roles

### Role 1: Milk Seller
**Permissions**
- ✅ Manage Customers
- ✅ Record Deliveries
- ✅ Generate Bills
- ✅ Track Payments
- ✅ View Reports
- ✅ Export Data
- ✅ Manage Products
- ✅ Manage Pricing
- ✅ Manage Business Settings

### Role 2: Milk Buyer
**Permissions**
- ✅ View Deliveries
- ✅ View Bills
- ✅ Download Invoices
- ✅ Pay Bills
- ✅ Raise Complaints
- ✅ Manage Profile

---

## 6. User Journey

### Seller Journey
```
Open App → Select Milk Seller → Login → Dashboard
        → Record Daily Deliveries → Generate Monthly Bills
        → Collect Payments → Review Reports
```

### Buyer Journey
```
Open App → Select Milk Buyer → Login → View Deliveries
        → Check Bills → Make Payment → Track History
```

---

## 7. Application Flow

### Screen 1: Splash Screen
**Purpose:** Brand introduction and initialization.

**Components**
- App Logo
- App Name
- Loading Indicator

**Actions**
- Check Internet
- Verify Login Session
- Load User Preferences

### Screen 2: User Selection Screen
**Purpose:** Allow users to choose system role.

**Components**
- Button: **Milk Seller**
- Button: **Milk Buyer**

**Additional Links**
- Login
- Register
- Help
- Language

---

## 8. Seller Panel Requirements

### Seller Dashboard
**Purpose:** Provide operational overview.

**Summary Cards**
- Total Milk Today
- Delivered Milk
- Revenue Today
- Active Customers
- Pending Payments
- Collections Today

**Quick Actions**
- Add Customer
- Generate Bill
- Add Delivery
- Record Payment
- Export Report

**Charts**
- Milk Trend
- Revenue Trend
- Customer Growth

**Delivery Summary**
- Pending
- Completed
- Missed

**Notifications**
- Due Payments
- Missed Deliveries
- New Customers

### Delivery Report Screen
**Purpose:** Manage daily deliveries.

**Filters**
- Date
- Morning
- Evening

**Customer Row Fields**
- Customer Name
- Quantity
- Status

**Customer Row Actions**
- **Tap** → Delivered
- **Swipe Left** → Missed
- **Long Press** → Edit Quantity

**Footer Summary**
- Total Milk
- Delivered Milk
- Pending Milk

### Customer Management
**Search**
- Name
- Mobile Number

**Filters**
- Active
- Paused
- Due Payment

**Customer Information**
- Name
- Phone
- Address
- Quantity
- Rate
- Status

**Actions**
- Add
- Edit
- Delete
- Pause
- Generate Bill

### Add / Edit Customer
**Basic Information**
- Customer Name
- Mobile Number
- Alternate Number
- Address

**Delivery Settings**
- **Delivery Type:** Morning · Evening · Both
- Morning Quantity
- Evening Quantity

**Pricing**
- Milk Rate

**Billing**
- Start Date
- Billing Cycle

**Status**
- Active
- Pause

### Billing Management
**Tabs**
- All
- Pending
- Paid
- Overdue

**Bill Record**
- Customer Name
- Billing Period
- Amount
- Due Date
- Status

**Actions**
- Open Invoice
- Send Invoice
- Mark Paid
- Download PDF

### Invoice Details
**Customer Details**
- Name
- Phone
- Address

**Billing Details**
- Invoice Number
- Billing Period
- Generated Date

**Delivery Breakdown**
| Date | Morning | Evening |
|------|---------|---------|

**Payment Summary**
- Total Amount
- Paid Amount
- Pending Amount

**Actions**
- Download PDF
- Share
- Print
- Mark Paid

### Profit & Loss
**Tabs**
- Daily
- Weekly
- Monthly
- Customer Wise

**Metrics**
- Total Milk Sold
- Revenue
- Expenses
- Profit

**Charts**
- Revenue Trend
- Profit Trend
- Consumption Trend

**Export**
- PDF
- Excel
- CSV

### Payment Management
**Collection Overview**
- Today's Collection
- Pending Collection
- Overdue Collection

**Payment Entry — Fields**
- Customer
- Amount
- Date
- Method

**Payment Methods**
- Cash
- UPI
- Bank Transfer

### Product Management
**Milk Types**
- Cow Milk
- Buffalo Milk
- Toned Milk
- Custom Product

**Pricing Management**
- Global Pricing
- Customer Pricing

### Settings
**Business Profile**
- Business Name
- Address
- GST Number

**Notification Settings**
- Push Notifications
- SMS Alerts

**Data Settings**
- Backup
- Restore

---

## 9. Buyer Panel Requirements

### Buyer Dashboard
**Welcome Card** — Customer Name

**Milk Summary**
- Morning Quantity
- Evening Quantity
- Monthly Consumption

**Billing Card**
- Current Bill
- Due Date
- Status

**Quick Actions**
- View Deliveries
- View Bills
- Pay Now
- Raise Complaint

### Delivery History
| Date | Morning | Evening | Status |
|------|---------|---------|--------|

**Filters**
- Month
- Date Range

### Bills & Payments
**Bills List**
- Amount
- Due Date
- Status

**Actions**
- View Invoice
- Download PDF
- Pay Online

**Payment History**
- Date
- Amount
- Method

### Invoice Details
- Customer Details
- Delivery Details
- Billing Summary

**Actions**
- Download PDF

### Calendar View — Delivery Status Colors

| Color | Meaning |
|-------|---------|
| 🟡 Yellow | Morning Delivered |
| 🔵 Blue | Evening Delivered |
| 🟢 Green | Both Delivered |
| 🔴 Red | Missed Delivery |

**Day Click — Show**
- Quantity
- Status
- Notes

### Delivery Schedule Management
- Pause Delivery
- Resume Delivery
- Vacation Mode
- Extra Milk Request

### Complaint Management
**Create Ticket — Categories**
- Delivery Issue
- Billing Issue
- Quantity Issue
- Other

**Status**
- Open
- In Progress
- Resolved

### Profile Settings
**Personal Information**
- Name
- Phone
- Address

**Preferences**
- Notifications
- Language

---

## 10. Functional Requirements

### Authentication
**Login**
- Mobile OTP
- Email Login

**Registration**
- Seller Registration
- Buyer Registration

**Password Recovery**
- OTP Verification

### Notifications
**Types**
- Bill Generated
- Payment Due
- Delivery Completed
- Delivery Missed

**Channels**
- Push Notification
- SMS
- WhatsApp

### Payments — Supported Methods
- UPI
- Google Pay
- PhonePe
- Paytm
- Debit Card
- Credit Card
- Net Banking

### Reports
**Daily Report** — Milk Delivered, Revenue
**Monthly Report** — Customer Billing, Revenue Summary
**Customer Report** — Consumption, Payment History

---

## 11. Non-Functional Requirements

### Performance
- Response Time: **< 2 seconds**
- Bill Generation: **< 30 seconds**

### Security
- JWT Authentication
- HTTPS Encryption
- Password Hashing
- Secure APIs

### Availability
- Uptime: **99.9%**

### Scalability
- 100,000 Customers
- Multiple Routes
- Multiple Sellers

### Backup
- Automatic Daily Backup
- Manual Backup Option

---

## 12. Database Entities (High-level)

| Entity | Key Fields |
|--------|-----------|
| Users | UserID, Role, Name, Phone |
| Customers | CustomerID, Address, Status |
| Deliveries | DeliveryID, Date, Quantity |
| Bills | BillID, CustomerID, Amount |
| Payments | PaymentID, Amount, Method |
| Products | ProductID, ProductName, Rate |
| Complaints | TicketID, Status |

(Full schema in [04-Database-Structure.md](04-Database-Structure.md).)

---

## 13. Recommended Technology Stack

| Layer | Choice |
|-------|--------|
| Mobile App | **Flutter** (or React Native) |
| Backend | **Node.js + NestJS** |
| Database | PostgreSQL |
| Authentication | Firebase Authentication |
| Storage | AWS S3 |
| Notifications | Firebase Cloud Messaging |
| Payments | Razorpay · PhonePe · Cashfree |

---

## 14. Future Enhancements

### Phase 2
- Route Optimization
- GPS Delivery Tracking
- QR Code Customer Identification
- WhatsApp Billing Automation
- Multi-Language Support

### Phase 3
- AI Revenue Forecasting
- Demand Prediction
- Smart Collection Reminders
- Voice-Based Delivery Entry

---

## 15. MVP Scope (Version 1 Launch)

### Included
- ✅ Authentication
- ✅ Seller Dashboard
- ✅ Buyer Dashboard
- ✅ Customer Management
- ✅ Delivery Recording
- ✅ Billing
- ✅ Invoice Generation
- ✅ Payment Recording
- ✅ Reports
- ✅ Notifications
- ✅ Calendar View
- ✅ Complaint System

### Excluded
- ❌ AI Analytics
- ❌ GPS Tracking
- ❌ Route Optimization
- ❌ Multi-Seller Marketplace
- ❌ IoT Milk Meter Integration

---

## 16. Design Direction

- **Material Design 3** with light + dark themes
- **Mobile-first**, single-hand operation, ≥ 48 dp tap targets
- **Localization** ready (English + Hindi at launch)
- **Accessibility** WCAG 2.1 AA
- **Reference Design** layout (when supplied) must be preserved 1:1; only spacing, contrast, tap-target size, and state feedback may be tuned

This PRD provides sufficient detail for UI/UX design, database design, API development, Flutter/React Native implementation, backend architecture, testing, and deployment planning.
