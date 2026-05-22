# 08 — Development Roadmap

A pragmatic, phased plan to ship MilkFlow v1 with a small team (3 mobile, 2 backend, 1 designer, 1 QA, 1 PM).
Estimates assume 2-week sprints. **Total v1: ~16 weeks (8 sprints).**

---

## Phase 0 — Foundations (Sprint 0, 1 week)

**Goal:** Everything needed before product code starts.

- Repo + CI/CD (GitHub Actions, fastlane for store builds).
- Backend skeleton (Node + Express, Postgres, Redis, Docker, staging on AWS/GCP).
- Flutter project skeleton (theming, routing, networking, error reporting).
- Design system in Figma (MD3 tokens, light/dark, components) — based on reference design.
- Coding standards, lint rules, PR templates.
- Sentry / Firebase Crashlytics, analytics events doc.
- Sandbox accounts: Twilio/MSG91 (OTP), Razorpay test, FCM, S3.

**Exit:** "Hello world" CI pipeline that ships a Flutter app to internal testers.

---

## Phase 1 — Auth & Onboarding (Sprint 1, 2 weeks)

**Scope:** S-01 to S-06, AUTH-01..08, plus role splitter.

- OTP login (Twilio/MSG91).
- JWT access + refresh, secure storage.
- Role selection screen.
- Profile setup (Seller and Buyer variants).
- Theme (light/dark) and i18n (en, hi).
- Backend: `users`, `sellers`, `buyers`, `device_sessions`, auth APIs.

**Exit:** A user can sign in, choose role, set up profile.

---

## Phase 2 — Seller Core MVP (Sprints 2–3, 4 weeks)

**Scope:** All P0 in B.1, B.2, B.3, B.4.

- Customers CRUD + invite code.
- Routes management.
- Products catalog (single seller, default pricing).
- Subscriptions: create, pause, resume, qty modify.
- Daily delivery generation cron.
- Daily delivery sheet UI (route grouping, bulk mark, per-row mark, custom qty).
- Offline queue + `/sync` endpoint.
- FCM push to buyers on delivery marked.

**Exit:** A seller can add 50 customers, run 5 days of deliveries fully, with offline support.

---

## Phase 3 — Buyer Core MVP (Sprint 4, 2 weeks)

**Scope:** All P0 in C.1, C.2, C.3.

- Buyer onboarding via invite code/QR.
- Buyer Home (today's delivery, active subs, dues snapshot).
- Pause / resume / quantity-modify.
- Notifications inbox.

**Exit:** A buyer can pause, resume, change quantity in ≤ 3 taps. Seller is notified in real time.

---

## Phase 4 — Billing & Payments (Sprints 5–6, 4 weeks)

**Scope:** B.5, C.5, plus reminders & reports MVP.

- Invoice auto-generation cron.
- Invoice PDF rendering (server-side, S3-hosted).
- Seller record-payment flow (cash/UPI/online tagging).
- Razorpay integration (intent + webhook + verify).
- Buyer "Pay Now" flow + receipt.
- Auto reminders cadence.
- Seller billing dashboard with KPIs.
- Buyer ledger view.
- Reports v1 (Daily summary, Monthly revenue, Pending dues).

**Exit:** End-to-end billing cycle works for one seller across 30 days; payments reconcile correctly online and offline.

---

## Phase 5 — Polish, Engagement & Pre-Launch (Sprint 7, 2 weeks)

**Scope:** All P1 not yet built + bug bash.

- Staff sub-accounts (B.7).
- Announcements (B.8).
- Buyer ratings & complaints (C.6).
- Help & support, app-update enforcer (S-11, S-12).
- Biometric unlock (S-14).
- Accessibility audit (WCAG 2.1 AA).
- Performance pass (cold start < 2 s on mid-tier device).
- Analytics events verified.
- Beta with 5 real distributors (50–100 customers each).

**Exit:** Beta complete, < 5 P1 bugs, NPS > 30.

---

## Phase 6 — Launch (Sprint 8, 2 weeks)

- Play Store + App Store submission.
- Marketing site + onboarding video (for sellers).
- Customer support runbook.
- On-call rotation, incident playbooks.
- Post-launch dashboards (KPIs from PRD §8).

**Exit:** Public launch in 1 city / region.

---

## Post-v1 (P2 Backlog, Roadmap continues)

| Theme | Items |
|-------|-------|
| Buyer growth | Refer-and-earn, multi-address, auto-debit (UPI mandate). |
| Seller scale | CSV import, GST/tax module, web admin, route optimization. |
| Operations | Stock-out toggle, proof photo, delivery boy live tracking. |
| Engagement | In-app chat, ratings dashboards, loyalty rewards. |
| Platform | Multi-seller marketplace, web buyer portal. |

---

## Cross-cutting Workstreams (run continuously)

| Workstream | Owner | Notes |
|-----------|-------|-------|
| Design ↔ Reference design fidelity | Designer | Each sprint review compares to reference frames. |
| QA & test automation | QA | Unit ≥ 70 %, integration ≥ critical paths, E2E for OTP/billing/pay. |
| Security review | Backend lead | OWASP API Top-10 each phase. |
| Performance budgets | Mobile lead | Track cold start, frame rate on low-end. |
| Localization | PM | Hindi parity each sprint. |

---

## RACI (Phase 4 Example)

| Activity | Mobile | Backend | Designer | QA | PM |
|---------|:------:|:-------:|:--------:|:--:|:--:|
| Razorpay integration | C | R | I | C | A |
| Invoice PDF template | I | R | C | C | A |
| Buyer "Pay Now" flow | R | C | C | C | A |
| Cron auto-billing | I | R | I | C | A |

R = Responsible, A = Accountable, C = Consulted, I = Informed.

---

## Risks & Buffer

- 15 % schedule buffer per phase for store review delays.
- Razorpay KYC delays — start in Phase 1 not Phase 4.
- SMS deliverability variance — keep call-OTP fallback ready.
- iOS notification entitlements & push cert renewal — checklist in Phase 0.

---

## Definition of Done (per ticket)

- Code merged with passing CI.
- Lint + type check + unit tests green.
- Manual test on Android (low-end), Android (high-end), iOS.
- Localization keys updated in en + hi.
- Telemetry event added.
- Docs/CHANGELOG updated.
- Designer sign-off against reference design.
- PM acceptance against feature spec ID.
