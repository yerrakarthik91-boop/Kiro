# 09 — Deployment Guide

Three deployment surfaces, each independent:

1. **Backend** — Render (one-click via blueprint) or Docker anywhere
2. **Web frontend** — GitHub Pages, Vercel, or Netlify
3. **Mobile** — Play Store / App Store (out of scope for the hosted demo)

The web demo is the simplest to get running publicly because it does not need an emulator. End-to-end:

```
GitHub repo  ──▶  Render (backend + Postgres)
                      │
                      └──▶ exposes  https://mms-backend.onrender.com
                                          ▲
GitHub Pages ──▶ Flutter web build ──────┘
        URL: https://<owner>.github.io/Kiro/
```

---

## A. Deploy the backend (Render — recommended for demo)

Render is free for small workloads. The repo includes a [Render blueprint](../render.yaml) so deployment is automatic.

### Steps
1. Sign in at <https://render.com> with your GitHub account.
2. Click **New** → **Blueprint** → choose this repository.
3. Render reads `render.yaml`, provisions:
   - `mms-backend` web service (Node 20)
   - `mms-db` PostgreSQL database
4. Wait ~5 minutes for the first deploy. Migrations run automatically on startup.
5. Copy the live URL from the dashboard, e.g. `https://mms-backend.onrender.com`.
6. Test it: <https://mms-backend.onrender.com/docs> should show Swagger.

### Free-tier caveats
- Web service spins down after 15 minutes of inactivity. The first request after a cold start takes ~30 s.
- Postgres is free for 90 days, then needs an upgrade or migration.

### Alternative: self-host with Docker
The repo's `docker compose up` already gives you the full stack on any VM. Add a reverse proxy (Caddy / nginx) and TLS in front for production.

---

## B. Deploy the web frontend

The web build needs the backend URL baked in via `--dart-define=API_BASE_URL=...`.

### Option 1 — GitHub Pages (free, zero accounts)

Already wired via [`.github/workflows/deploy-web.yml`](../.github/workflows/deploy-web.yml).

1. In repo settings: **Settings → Pages → Source = GitHub Actions**.
2. In repo settings: **Settings → Secrets and variables → Actions → Variables**, add a variable named `API_BASE_URL` with your backend URL (e.g. `https://mms-backend.onrender.com/v1`).
3. Push to `main` (or run the workflow manually from the Actions tab).
4. Site goes live at `https://<owner>.github.io/Kiro/`.

The workflow uses `subosito/flutter-action` to install Flutter, runs `flutter create . --platforms web`, then `flutter build web --release --base-href "/Kiro/"` and uploads to Pages.

### Option 2 — Vercel

1. Sign in at <https://vercel.com> and import the repo.
2. Vercel reads [`vercel.json`](../vercel.json) and runs [`scripts/build-web.sh`](../scripts/build-web.sh).
3. Set environment variable `API_BASE_URL` in the project settings.
4. Deploy.

### Option 3 — Netlify

1. Sign in at <https://netlify.com> and link the repo.
2. Netlify reads [`netlify.toml`](../netlify.toml).
3. In **Site settings → Environment variables**, set `API_BASE_URL`.
4. Deploy.

### Building the web app locally

```bash
cd mobile
flutter create . --project-name mms --platforms web --org app.mms
flutter pub get
flutter build web --release \
  --dart-define=API_BASE_URL=http://localhost:3000/v1

# Serve it locally
python3 -m http.server -d build/web 8080
# Open http://localhost:8080
```

---

## C. CORS

The NestJS backend opens CORS to all origins by default (`NestFactory.create(AppModule, { cors: true })` in [main.ts](../backend/src/main.ts)). This is fine for a demo. **Tighten it to a whitelist before going to production**:

```typescript
const app = await NestFactory.create(AppModule, {
  cors: {
    origin: ['https://yerrakarthik91-boop.github.io', 'https://app.mms.app'],
    credentials: true,
  },
});
```

---

## D. Smoke test the deployed app

1. Open the web URL (Pages / Vercel / Netlify).
2. You'll land on **User Selection**.
3. Tap **I am a Milk Seller** → enter `+919812345678` → tap **Send OTP**.
4. The dev OTP is printed in the response body during sign-up; for a deployed environment in `NODE_ENV=production` this is suppressed and you'd need a real SMS provider — for the demo, set `NODE_ENV` env-var on Render to anything other than `production` so the dev OTP is returned.
5. Use the OTP, choose Seller, and you'll land on the dashboard with seeded products.

If the dashboard returns an error, check the browser DevTools Network tab — most likely the backend is cold-starting (Render free tier) or `API_BASE_URL` was not set correctly.
