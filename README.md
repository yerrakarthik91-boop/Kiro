# Milk Management System (MMS)

**Version 1.0 — Mobile + Web Application (Android, iOS, Web)**

A modern, dual-panel application that digitizes daily milk delivery operations, customer management, billing, collections, reporting, and customer communication — replacing manual registers and paper bills with a single, mobile-first app.

The same Flutter codebase contains two role-based panels:

1. **Milk Seller Panel** — distributors / dairy operators
2. **Milk Buyer Panel** — household customers

Built with **Material Design 3**, light + dark mode, role-based authentication, offline-first daily operations, integrated digital payments, and **server-rendered PDF invoices**.

---

## Try the hosted demo

Once deployed (see [09-Deployment.md](docs/09-Deployment.md)):

- **Web app:** `https://<your-username>.github.io/Kiro/`
- **API & Swagger:** `https://mms-backend.onrender.com/docs`

Demo credentials work with any phone number. The dev OTP is `123456`.

---

## Repository Layout

```
Kiro/
├── docs/                       # PRD, screens, schema, deployment, etc.
├── backend/                    # NestJS REST API + TypeORM migrations + PDF service
├── mobile/                     # Flutter app (Seller + Buyer panels)
│   └── web/                    # Web target entry point
├── scripts/
│   └── build-web.sh            # Used by Vercel / Netlify
├── .github/workflows/
│   ├── backend.yml             # Backend CI: build + tests
│   ├── mobile.yml              # Mobile CI: flutter analyze + format
│   └── deploy-web.yml          # Builds & publishes the web demo to GitHub Pages
├── docker-compose.yml          # Local dev stack: Postgres + Redis + backend
├── render.yaml                 # One-click backend deploy to Render
├── vercel.json                 # Vercel deployment config
└── netlify.toml                # Netlify deployment config
```

## Quick start (local)

```bash
# 1. Start backend + Postgres + Redis
docker compose up

# 2. Run migrations (in another terminal)
docker compose exec backend npm run migration:run

# 3. Run the Flutter app on a simulator/emulator
cd mobile
flutter create . --project-name mms --platforms android,ios,web
flutter pub get
flutter run

# OR run as a web app in Chrome
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000/v1
```

See `backend/README.md` and `mobile/README.md` for details.

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
| 09 | [Deployment Guide](docs/09-Deployment.md) | Render + GitHub Pages + Vercel + Netlify |

---

## Tech Stack (per PRD §13)

| Layer | Choice |
|-------|--------|
| Mobile App | **Flutter** (single codebase: Android, iOS, **Web**) |
| Backend | **Node.js + NestJS** |
| Database | PostgreSQL |
| Authentication | JWT (OTP / email) |
| Storage | AWS S3 |
| Notifications | Firebase Cloud Messaging + SMS + WhatsApp |
| Payments | Razorpay · PhonePe · Cashfree (mock gateway in dev) |
| PDF | pdfkit (server-side invoice rendering) |

## MVP Scope (per PRD §15)

**Included** — Authentication · Seller Dashboard · Buyer Dashboard · Customer Management · Delivery Recording · Billing · Invoice Generation (with PDF) · Payment Recording · Reports · Notifications · Calendar View · Complaint System · Schedule Management

**Excluded** — AI Analytics · GPS Tracking · Route Optimization · Multi-Seller Marketplace · IoT Milk Meter Integration

---

## Getting Started

See [09-Deployment.md](docs/09-Deployment.md) to deploy the demo, or [08-Development-Roadmap.md](docs/08-Development-Roadmap.md) for the phased plan.
