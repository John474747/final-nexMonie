---
name: Nex Monie Project State
description: Current build status, what's done, what's pending for nex Monie Nigerian digital banking super-app
---

## Repo
github.com/John474747/final-nexMonie — Next.js 15, Tailwind, Firebase (Auth + Firestore + Storage), Vercel deployment.

## Founder emails (hardcoded gate)
- www.henryhart23@gmail.com
- atuchukwuarinze742@gmail.com

## What's Done (as of 2026-07-20 push)
- Supabase fully removed (deleted src/lib/supabase.ts, src/supabase/ directory)
- All @/supabase → @/firebase imports fixed across 15+ files
- user.id → user.uid fixed everywhere
- AuthGuard (Firebase) wraps entire app via layout.tsx
- /register — Firebase createUserWithEmailAndPassword + Firestore wallet + profile creation
- /login — Firebase signIn, founder redirect to /founder
- /founder — Full admin console: deposits (approve/reject), merchants (approve/suspend), users; dark theme; Firestore real-time
- /fund-account — 30-min countdown, Firestore bank details from app_config/bank_details, upload proof, writes to deposits collection
- /merchant/dashboard — Deposits tab, client-side Firestore runTransaction for atomic wallet credit
- /finance/p2p — Full rewrite to Firestore (p2p_ads + p2p_orders)
- buy-airtime, buy-data — Firebase runTransaction for wallet deduction
- scan-pay — Same pattern
- firestore.rules — Merchants can approve deposits, founders own app_config, wallets locked by role
- Pushed to GitHub (commit 7670670)

## What Still Needs Doing
- pay-bills/page.tsx — supabase.from() calls still present in handlePayment (blocked from finishing)
- src/services/opportunity.service.ts, transaction.service.ts — commented Supabase (harmless, no action needed)
- app_config/bank_details document — founder must manually create this doc in Firestore console
- Environment variables — user must add NEXT_PUBLIC_FIREBASE_* to Vercel + .env.local:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
- VTPass or real VTU API integration for airtime/data/bills (currently mocked)
- KYC / identity verification flow
- Investment + savings features
- Copy trading feature

## Data Model (Firestore)
- users/{uid} — displayName, email, phoneNumber, tier, isVerified, status, role, joinedAt
- wallets/{uid} — available, savings, investments, vault, lastUpdated
- deposits/{id} — userId, amount, senderBank, receiptUrl, status (pending/confirmed/rejected), expiresAt, createdAt
- transactions/{id} — userId, title, amount, type, category, status, referenceId, createdAt
- merchant_profiles/{uid} — status, totalTrades, completionRate, revenue, tradingVolume
- p2p_ads/{id} — type, asset, price, availableQuantity, minLimit, maxLimit, paymentMethods, createdBy, status
- p2p_orders/{id} — adId, buyerId, sellerId, asset, quantity, fiatAmount, status, expiresAt
- app_config/bank_details — bankName, accountNumber, accountName (founder sets this manually)
