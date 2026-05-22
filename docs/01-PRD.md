# 01 — Product Requirements Document (PRD)

## 1. Document Info

| Field | Value |
|-------|-------|
| Product Name | **MilkFlow** (working title) |
| Version | 1.0 |
| Owner | Product / Engineering |
| Status | Draft |
| Platforms | Android, iOS |

## 2. Vision

Build the simplest, fastest mobile app for local milk distributors and their customers — replacing notebooks, paper bills, and WhatsApp coordination with a single tool that handles **subscriptions, daily deliveries, billing, and payments** in under 30 seconds per task.

## 3. Problem Statement

Milk distribution in most regions is still managed manually:

- Distributors track daily deliveries on paper, leading to billing disputes.
- Customers never know if a delivery was skipped or what they owe.
- Pausing delivery for vacation requires phone calls.
- Monthly billing takes hours to compute and is error-prone.
- Cash collection is opaque and hard to reconcile.

## 4. Goals & Non-Goals

### Goals
- Allow a seller to mark daily deliveries for **100+ customers in under 5 minutes**.
- Let a buyer pause delivery, change quantity, or pay a bill in **≤ 3 taps**.
- Generate accurate monthly invoices automatically.
- Work on low-end Android devices and intermittent connectivity (offline-first).
- Support multiple products (cow milk, buffalo milk, curd, ghee, paneer).

### Non-Goals (v1)
- Multi-distributor marketplace.
- In-app chat (use WhatsApp deep link instead).
- Inventory / cold-chain tracking.
- Web admin (mobile-only in v1; web in v2).

## 5. Target Users & Personas

### Persona A — Ramesh, the Milk Distributor (Seller)
- Age 35, runs a route of 80 households.
- Owns a basic Android phone (4 GB RAM).
- Wakes at 4 AM, finishes route by 8 AM.
- Pain: paper notebook, monthly billing takes a full day.

### Persona B — Priya, the Household Customer (Buyer)
- Age 32, working professional.
- Wants 1 L cow milk daily, skips on weekends she travels.
- Pain: never sure of pending dues, awkward to call distributor for changes.

### Persona C — Sunil, the Delivery Boy (Sub-role of Seller)
- Works for Ramesh, only needs the "mark delivered" view for his route.

## 6. Scope — Two Panels in One App

### Seller Panel (Admin / Distributor)
1. Customer management (CRUD, address, route assignment)
2. Product catalog (price, unit, availability)
3. Subscription management per customer
4. Daily delivery sheet (mark delivered / skipped / partial)
5. Auto monthly billing & invoice PDF
6. Payment recording (cash / online / UPI)
7. Reports: revenue, dues, top customers, route performance
8. Delivery staff sub-accounts with limited permissions
9. Push notifications to customers
10. Bulk price updates

### Buyer Panel (Customer)
1. Sign up via phone OTP, link to a seller via code/QR
2. View today's delivery & monthly schedule
3. Pause / resume delivery (date range)
4. Change quantity for a date or permanently
5. Browse products, place one-time orders
6. View ledger, current dues, invoice history
7. Pay online (UPI / card)
8. Rate delivery, raise complaints
9. Notifications (delivery confirmed, bill due, holiday)
10. Multi-address / multi-member household

## 7. Key Design Principles

- **Mobile-first**, single-hand operation, large tap targets (≥ 48 dp).
- **Material Design 3** with dynamic color, elevation tokens.
- **Light + Dark** themes from day one.
- **Minimum taps** for daily ops — Seller "mark all delivered" is one tap.
- **Offline-first** — daily delivery sheet works without network and syncs.
- **Role-based UI** — same app, two completely different homes.
- **Localization** — English + Hindi at launch; structure supports more.
- **Accessibility** — WCAG 2.1 AA, screen reader labels, scalable text.

> The visual structure of the provided reference design must be preserved. Improvements are limited to spacing, contrast, tap-target size, and state feedback — not layout reorganization.

## 8. Success Metrics

| Metric | Target (6 months post-launch) |
|--------|------------------------------|
| Active sellers | 500 |
| Active buyers | 25,000 |
| Daily delivery marking time | < 5 min for 100 customers |
| Buyer payment-on-time rate | > 80 % |
| App crash-free sessions | > 99.5 % |
| Day-1 retention (Buyer) | > 70 % |
| App store rating | ≥ 4.5 |

## 9. Constraints & Assumptions

- Sellers may have only intermittent 2G/3G — sync must be resilient.
- SMS OTP cost is borne by the platform; budget for 2 OTPs / signup.
- Initial launch: India region; currency INR; timezone IST.
- Compliance: data stored within region; PII encrypted at rest.

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Low digital literacy among sellers | Onboarding video, big icons, voice prompts |
| Payment failures break trust | Clear retry, offline cash recording fallback |
| Sync conflicts (offline edits) | Server-authoritative with conflict log |
| Seasonal demand spikes (festivals) | Auto-scaling backend, queue-based notifications |

## 11. Out-of-Scope Clarifications

If a "reference design" image is supplied separately, layout must match it 1:1; this PRD does not override the visual structure of that reference.
