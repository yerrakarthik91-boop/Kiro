# 08 — Development Roadmap

Phased plan to ship Milk Management System (MMS) v1.0, organised around the MVP scope defined in PRD §15. Estimates assume 2-week sprints with a small team (3 mobile, 2 backend, 1 designer, 1 QA, 1 PM).

**Total v1 target: ~16 weeks (8 sprints).**

---

## Phase 0 — Foundations (Sprint 0, 1 week)

**Goal:** every prerequisite before product code begins.

- Repo + branching model + CI/CD (GitHub Actions, fastlane for store builds).
- Backend skeleton (Node.js + NestJS + PostgreSQL + Redis, Docker, staging on AWS/GCP).
- Mobile skeleton (Flutter — primary; React Native fallback) with theming, routing, networking layer, error reporting.
- Design system in Figma (MD3 tokens, light/dark, components) — once reference design is supplied.
- Coding standards, lint rules, PR templates.
- Sentry + Firebase Crashlytics + Firebase Analytics.
- Sandbox accounts: Twilio/MSG91 (OTP + SMS), Razorpay test, PhonePe test, Cashfree test, Firebase, AWS S3.
- WhatsApp Business API onboarding kicked off (long lead time).

**Exit:** "Hello world" CI pipeline that ships an internal-tester build.

---

## Phase 1 — Authentication & Onboarding (Sprint 1, 2 weeks)

**Scope (Feature IDs):** S-01..S-08, S-16, S-17, S-18.

- Splash screen + internet/session checks.
- User selection screen (Seller / Buyer).
- Mobile OTP login (Twilio/MSG91).
- Email login (alternate).
- Password recovery via OTP.
- Seller registration (business profile, GST optional).
- Buyer registration.
- JWT access + refresh + secure storage.
- Theme (light/dark) + i18n (en, hi).

**Exit:** A user can sign in via OTP or email, choose role at registration, and land on a stub dashboard.

---

## Phase 2 — Seller Core (Sprints 2–3, 4 weeks)

**Scope:** SE-DB-01..05, SE-CM-01..11, SE-DL-01..08, SE-PR-01..04.

**Sprint 2**
- Customer CRUD with morning / evening quantities, milk rate, billing cycle.
- Search, filters (Active / Paused / Due Payment).
- Pause / resume customer.
- Product management (Cow / Buffalo / Toned, custom).
- Global + per-customer pricing.

**Sprint 3**
- Daily delivery generation cron.
- Delivery Report screen with Date / Morning / Evening filters.
- Tap-to-deliver, swipe-to-miss, long-press to edit qty.
- Footer summary live-updates.
- Add ad-hoc delivery (extra request from seller side).
- Offline queue + `/seller/deliveries/sync` endpoint.
- Push to buyer on delivered/missed.
- Seller Dashboard (summary cards, quick actions, charts, delivery summary, notifications).

**Exit:** A seller can add 50 customers, run 5 days of deliveries (online + offline), with buyer pushes firing.

---

## Phase 3 — Buyer Core (Sprint 4, 2 weeks)

**Scope:** BU-DB-01..04, BU-DL-01..03, BU-CV-01..02, BU-SC-01..04, BU-PR-01..03.

- Buyer Dashboard (welcome, milk summary, billing card, quick actions).
- Delivery History table with month/range filters.
- Calendar View with color codes (Yellow=Morning, Blue=Evening, Green=Both, Red=Missed) + day-detail sheet.
- Schedule management: Pause · Resume · Vacation · Extra Milk Request.
- Profile management (name, phone, address, language, notifications).
- Notifications inbox.

**Exit:** A buyer can pause delivery and request extra milk in ≤ 3 taps; seller is notified in real time.

---

## Phase 4 — Billing & Invoices (Sprint 5, 2 weeks)

**Scope:** SE-BL-01..09, BU-BL-01..03, BU-BL-05.

- Auto monthly bill generation cron (per seller cycle day).
- Manual bill generation (per customer, per period).
- Bill PDF rendering (server-side) → S3.
- Billing tabs: All / Pending / Paid / Overdue.
- Invoice detail with delivery breakdown table.
- Send invoice via Push / SMS / WhatsApp.
- Mark Paid (cash shortcut).
- Buyer Bills list + PDF download.
- Auto reminders (Day 0, Day +3, Day +7).

**Exit:** End-to-end billing for one seller across 30 days.

---

## Phase 5 — Payments (Sprint 6, 2 weeks)

**Scope:** SE-PY-01..04, BU-BL-04, all of payment methods table (PRD §10).

- Seller record-payment (Cash / UPI / Bank Transfer).
- Razorpay integration (intent + webhook + verify).
- PhonePe integration.
- Cashfree integration.
- Buyer Pay Now flow (UPI / GPay / PhonePe / Paytm / Card / Net Banking).
- Payment Status (success / failure / retry).
- Payment History (both panels).
- FIFO allocation; partial payments; advance handling.
- Push to seller + buyer on success.

**Exit:** Payments reconcile correctly across all gateways and offline cash.

---

## Phase 6 — Reports, Complaints, Polish, Pre-Launch (Sprint 7, 2 weeks)

**Scope:** SE-RP-01..06, SE-ST-01..04, BU-CP-01..03, S-15.

- Profit & Loss (Daily / Weekly / Monthly / Customer-Wise).
- Charts (Revenue / Profit / Consumption Trend).
- Daily / Monthly / Customer reports.
- Export PDF / Excel / CSV.
- Business Profile, Notification settings.
- Backup (auto daily + manual).
- Buyer complaint creation + status tracking.
- Seller complaint inbox + responses.
- WhatsApp notification channel wired up (post WABA approval).
- Help screen, App-version enforcer.
- Accessibility audit (WCAG 2.1 AA).
- Performance pass: cold start < 2 s; API p95 < 2 s; bill generation p95 < 30 s.
- Beta with 5 real distributors (50–100 customers each).

**Exit:** Beta complete, < 5 P1 bugs, NPS > 30, all PRD §4 KPIs measurable.

---

## Phase 7 — Launch (Sprint 8, 2 weeks)

- Play Store + App Store submission.
- Onboarding video (for sellers).
- Marketing site.
- Customer support runbook + WhatsApp support line.
- On-call rotation, incident playbooks.
- Post-launch dashboards tracking KPIs from PRD §4.

**Exit:** Public launch in 1 city / region.

---

## Post-v1 Roadmap

### Phase 2 Enhancements (PRD §14)
- Route Optimization
- GPS Delivery Tracking
- QR Code Customer Identification
- WhatsApp Billing Automation
- Multi-Language Support (beyond en/hi)

### Phase 3 Enhancements (PRD §14)
- AI Revenue Forecasting
- Demand Prediction
- Smart Collection Reminders
- Voice-Based Delivery Entry

---

## Cross-Cutting Workstreams (continuous)

| Workstream | Owner | Notes |
|-----------|-------|-------|
| Reference design fidelity | Designer | Sprint review compares 1:1 vs reference frames |
| QA & test automation | QA | Unit ≥ 70 %, integration on critical paths, E2E for OTP / billing / payment |
| Security review | Backend lead | OWASP API Top-10 each phase |
| Performance budgets | Mobile lead | Cold start, frame rate on low-end Android |
| Localization | PM | Hindi parity each sprint |
| Compliance | PM | RBI / data-residency, GST formatting on invoices |

---

## RACI — Phase 5 (Payments) example

| Activity | Mobile | Backend | Designer | QA | PM |
|---------|:------:|:-------:|:--------:|:--:|:--:|
| Razorpay / PhonePe / Cashfree integrations | C | R | I | C | A |
| Buyer Pay Now flow | R | C | C | C | A |
| Webhook handlers | I | R | I | C | A |
| FIFO allocation engine | I | R | I | C | A |

R = Responsible · A = Accountable · C = Consulted · I = Informed.

---

## Risks & Buffers

- 15 % schedule buffer per phase for store-review delays.
- WhatsApp Business API approval — start in Phase 0 (long lead).
- Razorpay / PhonePe / Cashfree KYC delays — start in Phase 1.
- SMS deliverability variance — keep call-OTP fallback ready.
- iOS push entitlements + cert renewal — checklist in Phase 0.

---

## Definition of Done (per ticket)

- Code merged with passing CI.
- Lint + type check + unit tests green.
- Manual test on Android (low-end), Android (high-end), iOS.
- Localization keys updated (en + hi).
- Telemetry event added.
- Docs / CHANGELOG updated.
- Designer sign-off vs reference design.
- PM acceptance vs feature-spec ID.
