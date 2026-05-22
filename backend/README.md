# MMS Backend (NestJS)

NestJS REST API for the Milk Management System.

## Stack

- **NestJS 10** with TypeScript
- **TypeORM** + **PostgreSQL 15**
- **Redis 7** (cache, OTP store, queues)
- **JWT** auth (access + refresh)
- **Class-validator** for DTO validation
- **Swagger** (`/docs`) for API exploration

## Quick start

### Option 1 — Docker (recommended)
From the repository root:

```bash
docker compose up
```

This starts Postgres, Redis, and the backend at <http://localhost:3000>.

Run migrations once the stack is up:

```bash
docker compose exec backend npm run migration:run
```

### Option 2 — Local Node

```bash
cd backend
cp .env.example .env
npm install
# requires a running Postgres + Redis
npm run migration:run
npm run start:dev
```

API will be at <http://localhost:3000/v1>, Swagger UI at <http://localhost:3000/docs>.

## Project structure

```
src/
├── main.ts                  Bootstrap, global pipes, Swagger
├── app.module.ts            Root module wiring all features
├── config/                  ConfigModule, TypeORM datasource, JWT config
├── common/                  Filters, interceptors, decorators, guards
├── modules/
│   ├── auth/                OTP request/verify, JWT issuance
│   ├── users/               User entity & service (shared by sellers/buyers)
│   ├── sellers/             Seller business profile
│   ├── buyers/              Buyer profile
│   ├── customers/           Seller's customer list (link to buyer)
│   ├── products/            Milk products & pricing
│   ├── deliveries/          Daily delivery records (morning/evening)
│   ├── bills/               Monthly invoices
│   ├── payments/            Cash + online payments
│   └── complaints/          Buyer support tickets
└── database/
    └── migrations/          SQL migrations for all tables
```

## Auth in the skeleton

`POST /v1/auth/otp/request` — accepts `{ phone }`, generates a 6-digit code, stores it in Redis (or in-memory in dev) and returns `{ sent: true }`. In dev, the OTP is also returned in the response body (clearly marked) so you can test without an SMS provider.

`POST /v1/auth/otp/verify` — accepts `{ phone, otp, role? }` and returns `{ access, refresh, user }`.

`POST /v1/auth/refresh` — rotates tokens.

All other domain endpoints are scaffolded as empty modules to be implemented in Phases 2–7 of the roadmap.

## Migrations

The `src/database/migrations` directory contains TypeORM migration files that create all 15 tables documented in `docs/04-Database-Structure.md`, with the correct ENUMs, indexes, generated columns, and triggers.

```bash
npm run migration:run       # apply all pending migrations
npm run migration:revert    # roll back the latest migration
```
