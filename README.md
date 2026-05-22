# Milk Management System (MMS)

**Version 1.0 — Mobile Application (Android & iOS)**

A modern, dual-panel mobile application that digitizes daily milk delivery operations, customer management, billing, collections, reporting, and customer communication — replacing manual registers and paper bills with a single, mobile-first app.

The same app contains two role-based panels:

1. **Milk Seller Panel** — distributors / dairy operators
2. **Milk Buyer Panel** — household customers

Built with **Material Design 3**, light + dark mode, role-based authentication, offline-first daily operations, and integrated digital payments.

---

## Documentation Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Product Requirements (PRD)](docs/01-PRD.md) | Vision, KPIs, full panel specs, MVP scope |
| 02 | [Feature Specification](docs/02-Feature-Specification.md) | Every feature with traceable IDs and priorities |
| 03 | [User Flow](docs/03-User-Flow.md) | End-to-end user journeys for both roles |
| 04 | [Database Structure](docs/04-Database-Structure.md) | PostgreSQL schemas, indexes, RLS, retention |
| 05 | [API Requirements](docs/05-API-Requirements.md) | REST endpoints, payloads, auth, webhooks |
| 06 | [Mobile App Screens](docs/06-Mobile-App-Screens.md) | Screen-by-screen specification |
| 07 | [Business Logic](docs/07-Business-Logic.md) | Billing, deliveries, payments, conflicts |
| 08 | [Development Roadmap](docs/08-Development-Roadmap.md) | Phased 16-week delivery plan |

---

## Tech Stack (per PRD §13)

| Layer | Choice |
|-------|--------|
| Mobile App | **Flutter** (or React Native) |
| Backend | **Node.js + NestJS** |
| Database | PostgreSQL |
| Authentication | Firebase Authentication |
| Storage | AWS S3 |
| Notifications | Firebase Cloud Messaging + SMS + WhatsApp |
| Payments | Razorpay · PhonePe · Cashfree |

## MVP Scope (per PRD §15)

**Included** — Authentication · Seller Dashboard · Buyer Dashboard · Customer Management · Delivery Recording · Billing · Invoice Generation · Payment Recording · Reports · Notifications · Calendar View · Complaint System

**Excluded** — AI Analytics · GPS Tracking · Route Optimization · Multi-Seller Marketplace · IoT Milk Meter Integration

---

## Getting Started

See [08-Development-Roadmap.md](docs/08-Development-Roadmap.md) for the phased plan.
