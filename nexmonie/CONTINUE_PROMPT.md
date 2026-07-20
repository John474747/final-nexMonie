# Nex Monie — AI Continue Prompt
**Paste this entire document to any new AI agent/session to resume work instantly.**

---

## What This Project Is
**nex Monie** — a Nigerian digital banking super-app built on Next.js 15 + Tailwind CSS.  
GitHub repo: `https://github.com/John474747/final-nexMonie`  
Hosted on: **Vercel** (current) → **migrating to Cloudflare Pages** (next major task)  
Local clone path (Replit): `/home/runner/workspace/nexmonie`

---

## Current Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + custom design system |
| Auth | **Clerk** (migration in progress — was Firebase Auth) |
| Database | **Cloudflare D1** (migration in progress — was Firebase Firestore) |
| File Storage | **Cloudflare R2** (migration in progress — was Firebase Storage) |
| Hosting | **Cloudflare Pages** (migration in progress — was Vercel) |
| Crypto Data | **CoinGecko API** (free tier, no key needed; optional `COINGECKO_API_KEY` env var) |

> ⚠️ The Cloudflare + Clerk migration has NOT started yet. Firebase code is still live. The migration is the #1 pending task.

---

## Founder / Admin Accounts
Only these two emails get access to the `/founder` admin dashboard:
- `www.henryhart23@gmail.com`
- `atuchukwuarinze742@gmail.com`

---

## Core Product Model
**P2P-first funding. No payment processor.**
1. User requests deposit → sees merchant bank account + 30-minute countdown timer
2. User transfers money manually to that bank account
3. User uploads payment proof
4. Accredited merchant confirms in their dashboard
5. Firestore transaction atomically credits user's wallet
6. All other features (airtime, data, bills, P2P trading, crypto, investments) draw from this funded wallet

---

## What Has Been Completed
- ✅ Supabase fully removed (deleted `src/lib/supabase.ts`, `src/supabase/` directory)
- ✅ All `@/supabase` imports replaced with `@/firebase` across 15+ files
- ✅ `user.id` → `user.uid` fixed everywhere
- ✅ `AuthGuard` wraps entire app (Firebase Auth; redirects to `/login` if unauthenticated)
- ✅ `/register` — Firebase `createUserWithEmailAndPassword` + Firestore wallet + profile docs
- ✅ `/login` — Firebase sign-in; founder emails auto-redirect to `/founder`
- ✅ `/founder` — Full dark-themed admin console: approve/reject deposits, approve/suspend merchants, view all users (real-time Firestore)
- ✅ `/fund-account` — 30-min countdown, Firestore `app_config/bank_details`, receipt upload, writes to `deposits` collection
- ✅ `/merchant/dashboard` — Deposits tab with Confirm/Reject using client-side Firestore `runTransaction` (atomic wallet credit)
- ✅ `/finance/p2p` — Rewritten from Supabase → Firestore (`p2p_ads` + `p2p_orders`)
- ✅ `buy-airtime`, `buy-data`, `scan-pay` — Firebase `runTransaction` for atomic wallet deductions
- ✅ `firestore.rules` — Merchants can approve deposits; only founders can write `app_config`
- ✅ `MarketsFeed.tsx` — Live CoinGecko data (100 coins, 10-second polling, price flash animation, no UI changes)
- ✅ `/api/markets` — CoinGecko proxy route with 15-second server cache, graceful stale fallback

---

## What Still Needs Doing (Priority Order)

### 🔴 PRIORITY 1 — Cloudflare + Clerk Migration
The owner wants to move completely off Firebase:
- **Auth**: Firebase Auth → **Clerk** (Replit has native Clerk integration via `.local/skills/clerk-auth/SKILL.md`)
- **Database**: Firestore → **Cloudflare D1** (SQLite via Drizzle ORM)
- **Storage**: Firebase Storage → **Cloudflare R2**
- **Hosting**: Vercel → **Cloudflare Pages**

**Credentials needed before starting** (owner must provide):
1. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from clerk.com)
2. `CLERK_SECRET_KEY` (from clerk.com)
3. `CLOUDFLARE_ACCOUNT_ID` (from Cloudflare dashboard)
4. `CLOUDFLARE_API_TOKEN` (custom token: Pages Edit + D1 Edit + R2 Edit + Workers Edit)

**How to start**: Once credentials are in Replit Secrets, read `.local/skills/clerk-auth/SKILL.md` and follow Cloudflare D1 + R2 setup via Wrangler CLI.

### 🟡 PRIORITY 2 — pay-bills/page.tsx
`src/app/pay-bills/page.tsx` still has `supabase.from()` calls in `handlePayment`. Needs the same Firebase `runTransaction` treatment as buy-airtime/buy-data.

### 🟡 PRIORITY 3 — VTU Real API Integration
Airtime, data, and bills purchases are currently mocked (`/api/airtime/purchase`, `/api/data/purchase`, `/api/bills/pay` all return fake success). These need to be connected to **VTPass** (vtpass.com) or **BuyPower** for real purchases.

### 🟢 PRIORITY 4 — Outstanding Features
- KYC / identity verification flow
- Investment + savings features (vault, fixed savings, auto-invest)
- Copy trading feature
- Push notifications (deposit confirmed, trade completed)
- NexTips AI advisor (Genkit + Gemini already scaffolded in `src/ai/`)

---

## Important Technical Decisions

### Deposit Approval — Client-Side Firestore (No firebase-admin)
`firebase-admin` is **blocked** by Replit's security policy (`websocket-driver` package blocked).  
Deposit approval uses client-side Firestore `runTransaction` secured by Firestore rules.  
Do NOT try to install `firebase-admin` in this Replit environment.

### Firestore Data Model
```
users/{uid}             displayName, email, phoneNumber, tier, isVerified, status, role, joinedAt
wallets/{uid}           available, savings, investments, vault, lastUpdated
deposits/{id}           userId, amount, senderBank, receiptUrl, status (pending/confirmed/rejected), expiresAt
transactions/{id}       userId, title, amount, type, category, status, referenceId, createdAt
merchant_profiles/{uid} status, totalTrades, completionRate, revenue, tradingVolume
p2p_ads/{id}            type, asset, price, availableQuantity, minLimit, maxLimit, paymentMethods, createdBy, status
p2p_orders/{id}         adId, buyerId, sellerId, asset, quantity, fiatAmount, status, expiresAt
app_config/bank_details bankName, accountNumber, accountName  ← founder sets manually in Firebase console
```

### Replit Account Switching
The owner switches between Replit accounts frequently. All configuration is stored as **Replit Secrets** (not in code). Required env vars that must be re-added on each new Replit account:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
SESSION_SECRET
# After Clerk migration:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
# Optional:
COINGECKO_API_KEY
```

### CoinGecko API
- Free public endpoint: `https://api.coingecko.com/api/v3/coins/markets`
- Proxy route: `src/app/api/markets/route.ts` (15-second server cache)
- Client polls every 10 seconds
- CoinGecko does NOT have stock data — only crypto
- Existing "Stocks" category in MarketsFeed will not appear after migration to live data

---

## Key File Map
```
src/app/page.tsx                      Home dashboard
src/app/login/page.tsx                Login (Firebase)
src/app/register/page.tsx             Register (Firebase)
src/app/founder/page.tsx              Founder admin console
src/app/fund-account/page.tsx         Deposit flow with P2P timer
src/app/merchant/dashboard/page.tsx   Merchant console + deposit approval
src/app/finance/p2p/page.tsx          P2P marketplace (Firestore)
src/app/buy-airtime/page.tsx          Airtime VTU (mocked)
src/app/buy-data/page.tsx             Data VTU (mocked)
src/app/pay-bills/page.tsx            Bills (⚠️ still has supabase calls)
src/app/scan-pay/page.tsx             QR scanner
src/app/send-money/page.tsx           Transfer
src/app/transactions/page.tsx         Transaction history

src/components/MarketsFeed.tsx        Live CoinGecko feed (10s polling)
src/components/auth/AuthGuard.tsx     Firebase auth guard
src/components/layout/BottomNav.tsx   Bottom navigation

src/firebase/index.ts                 Firebase singleton (auth, db, storage)
src/firebase/config.ts                Firebase config from env vars
src/app/api/markets/route.ts          CoinGecko proxy (15s cache)
src/app/api/deposits/approve/route.ts Stub (501) — approval is client-side
firestore.rules                       Security rules

src/lib/firebase-admin.ts             Future use (currently blocked in Replit)
CONTINUE_PROMPT.md                    This file
```

---

## Design System
- Primary: `#005F56` (deep teal-green) — used in most CTA buttons, accents
- Secondary: `#008D83` (brighter teal) — used in MarketsFeed, some icons
- Coral: `#FF8882` — negative/loss indicators
- Background: `#F8FAF9`
- Card radius: `rounded-[32px]`
- Font: Poppins

**NEVER change existing UI on any screen unless explicitly asked. Only wire up data and logic.**

---

## How to Run / Deploy
```bash
cd /home/runner/workspace/nexmonie
npm install        # install dependencies
npm run dev        # local dev server
npm run build      # production build
```
Push to GitHub → auto-deploys to Vercel (until Cloudflare migration completes).
