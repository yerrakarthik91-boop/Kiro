# MilkFlow — Milk Management Mobile Application

A modern, dual-panel mobile application for managing daily milk distribution between **Sellers (Distributors / Admin)** and **Buyers (Customers)**.

> Built mobile-first for Android & iOS using **Flutter** with **Material Design 3**, dark/light mode, role-based authentication, and offline-first daily operations.

## Documentation Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Product Requirements (PRD)](docs/01-PRD.md) | Vision, goals, personas, scope, success metrics |
| 02 | [Feature Specification](docs/02-Feature-Specification.md) | Detailed feature list per panel |
| 03 | [User Flow](docs/03-User-Flow.md) | End-to-end user journeys |
| 04 | [Database Structure](docs/04-Database-Structure.md) | Schemas, relationships, indexes |
| 05 | [API Requirements](docs/05-API-Requirements.md) | REST endpoints, payloads, auth |
| 06 | [Mobile App Screens](docs/06-Mobile-App-Screens.md) | Screen-by-screen specification |
| 07 | [Business Logic](docs/07-Business-Logic.md) | Billing, subscriptions, delivery rules |
| 08 | [Development Roadmap](docs/08-Development-Roadmap.md) | Phased delivery plan |

## Tech Stack (Recommended)

- **Mobile:** Flutter 3.x (single codebase, Android + iOS)
- **State:** Riverpod / BLoC
- **Backend:** Node.js + Express (or NestJS) — REST API
- **Database:** PostgreSQL (transactional) + Redis (cache/session)
- **Auth:** JWT (access + refresh) + OTP via SMS
- **Storage:** AWS S3 / Firebase Storage (product & profile images)
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Payments:** Razorpay / Stripe / UPI
- **Maps:** Google Maps SDK (delivery routes)

## Two Panels, One App

The app detects the logged-in user's role and routes them to the correct panel:

- **Seller Panel** — manage customers, products, deliveries, billing, reports
- **Buyer Panel** — subscribe, pause/resume, view ledger, pay, rate

## Getting Started

See [Development Roadmap](docs/08-Development-Roadmap.md) for the phased plan.
