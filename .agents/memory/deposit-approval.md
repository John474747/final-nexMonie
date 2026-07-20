---
name: Deposit Approval Architecture
description: How deposit approvals work — client-side Firestore runTransaction, not a server API
---

## Pattern
Deposit approval is done client-side (merchant dashboard + founder dashboard) using Firebase Firestore `runTransaction`. This atomically:
1. Reads the deposit doc → verifies status === 'pending'
2. Updates deposit.status → 'confirmed'
3. Reads wallet doc → increments wallet.available by deposit.amount
4. Creates a transaction record in transactions collection

**Why:** firebase-admin is blocked by Replit's security policy (websocket-driver package blocked). The /api/deposits/approve route is a stub (returns 501). Client-side runTransaction with Firestore rules is the correct substitute.

**How to apply:** Any future deposit approval logic must use Firestore client SDK runTransaction, NOT a server API route (unless firebase-admin becomes available or REST API approach is implemented).

## Firestore Security Rules
Merchants (merchant_profiles/{uid}.status == 'approved') and founders can:
- update deposits/{depositId}
- update wallets/{userId}

This enforces that only authorized parties can approve deposits without server-side verification.
