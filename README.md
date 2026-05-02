# Gridloan.ai v2 — Decentralised Compute Marketplace

Full stack waitlist platform — futuristic landing page + Node.js/Express API + PostgreSQL.

## Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JS (futuristic dark theme) |
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | PostgreSQL 16 |
| Security | helmet, cors, express-rate-limit, validator.js |
| Local DB | Docker Compose |

---

## Project Structure

```
gridloan-v2/
├── public/
│   └── index.html          # Futuristic landing page (served statically)
├── src/
│   ├── index.js            # Express entry point
│   ├── db/
│   │   ├── pool.js         # PostgreSQL connection pool
│   │   ├── migrate.js      # Creates tables and indexes
│   │   ├── queries.js      # All DB queries
│   │   └── export.js       # CSV export script
│   ├── middleware/
│   │   └── validate.js     # Input validation
│   └── routes/
│       └── waitlist.js     # API route handlers
├── Procfile                # Railway start command
├── docker-compose.yml      # Local PostgreSQL
├── .env.example            # Environment variable template
└── package.json
```

---

## Quick Start (local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Start local database
docker compose up -d

# 4. Run migration (creates tables)
npm run migrate

# 5. Start dev server
npm run dev
```

Server: **http://localhost:3001**
Landing page: **http://localhost:3001**

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/waitlist` | Register a new signup |
| `GET` | `/api/waitlist/count` | Get total signup count |
| `GET` | `/api/waitlist/breakdown` | Breakdown by user type |
| `GET` | `/health` | Health check |

### POST /api/waitlist — request body

```json
{
  "fullName": "Alex Johnson",
  "email": "alex@startup.ai",
  "userType": "Hardware Owner",
  "alphaBetaOptin": true
}
```

`userType` must be: `Hardware Owner`, `Compute Consumer`, or `Both`

---

## Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Select this repo
4. Click **Add Plugin → PostgreSQL**
5. Add environment variables:
   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://yourdomain.com
   ```
6. Railway injects `DATABASE_URL` and `PORT` automatically
7. Go to **Settings → Networking → Generate Domain**
8. Run the migration once via Railway's run command: `npm run migrate`

### Connect landing page to production API

In `public/index.html`, update:
```js
const API_BASE = 'https://your-app.up.railway.app/api';
```

---

## Export signups as CSV

```bash
npm run export
# Creates exports/waitlist_YYYY-MM-DD.csv
```

---

## Push to GitHub

```bash
git init
git add .
git commit -m "feat: Gridloan.ai v2 — futuristic landing page + waitlist API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gridloan-v2.git
git push -u origin main
```
