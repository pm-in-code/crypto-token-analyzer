# CLAUDE.md - Crypto Token Analyzer

## Project Overview
AI-powered cryptocurrency token analysis platform with premium PDF reports. Frontend on GitHub Pages, backend on Netlify serverless functions. Uses OpenAI GPT-4o-mini for analysis, Stripe/PayPal for payments, CoinGecko for market data.

## Quick Start
```bash
# Start everything
./start-all.sh

# Or separately:
python3 server.py              # Frontend on http://localhost:8000
cd backend && npm install && npm start  # Backend on http://localhost:3001
```

## Architecture
- **Frontend:** Single-file React app (app.js, ~3500 lines) loaded via CDN (no build step). Uses React 18 + Tailwind CSS + Babel standalone for JSX transpilation.
- **Backend:** Express.js wrapped with serverless-http for Netlify. Standalone server also available.
- **State management:** React Context API (AppContext) with screen-based navigation (home/loading/result).
- **No root package.json** — frontend has no npm dependencies (all via CDN).

## Key Files
- `app.js` — Main React application (all components in one file)
- `index.html` — Frontend entry point with CDN imports
- `backend/netlify/functions/server.js` — Production backend (Netlify functions)
- `backend/server.js` — Development backend (Express standalone)
- `netlify.toml` — Netlify deployment config
- `.github/workflows/deploy.yml` — GitHub Actions CI/CD for GitHub Pages

## API Endpoints (Backend)
```
GET  /api/health                — Status + config validation
POST /api/analyze-token         — Core GPT-4o-mini token analysis
POST /api/get-pdf-template      — PDF generation
POST /api/create-checkout-session — Stripe checkout
POST /api/create-paypal-order   — PayPal payment
POST /api/capture-paypal-order  — PayPal confirmation
```

## Environment Variables
Required:
- `OPENAI_API_KEY` — For GPT-4o-mini analysis

Optional (payments):
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_API_URL`

Optional (advanced prompt management):
- `GIST_ID`, `GITHUB_TOKEN` — Dynamic prompt loading from GitHub Gist
- `ANALYSIS_PROMPT` or `ANALYSIS_PROMPT_1..N` — Multi-part prompt env vars

## Deployment
- **Frontend:** GitHub Pages via GitHub Actions (pushes to gh-pages branch on merge to main)
- **Backend:** Netlify serverless functions (https://dainty-malasada-96ee00.netlify.app/api)
- **Alternative:** Vercel backend (vercel-backend/ directory)

## Code Conventions
- Functional React components with hooks (useState, useEffect, useContext)
- Arrow functions, const-first declarations
- PascalCase for components, camelCase for functions/variables
- Tailwind CSS utility classes for styling
- Comments in Russian and English
- No TypeScript, no ESLint, no automated tests

## Important Notes
- Backend URL is hardcoded in app.js (`BACKEND_API_URL`) — update when changing deployment
- Analysis prompt can be loaded from GitHub Gist (primary) or env vars (fallback)
- 6-category scoring system: Market Metrics, Tokenomics, Development, Social, Team, Risk (0-100 each)
- PDF reports: free vs premium variants, generated client-side with jsPDF
- Paid tokens tracked in localStorage by token symbol

## Design System (Worth OS)
- Background: #FFF7E0 (warm cream)
- Primary accent: #D9FF00 (neon yellow)
- Font: Inter
- Mobile-first responsive design
