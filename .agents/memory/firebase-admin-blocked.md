---
name: Firebase Admin SDK Blocked in Replit
description: firebase-admin cannot be installed in this Replit environment
---

## Problem
`npm install firebase-admin` fails with HTTP 403 Forbidden from package-firewall.replit.local. The blocking dependency is `websocket-driver@0.7.4`.

**Why:** Replit security policy blocks this specific package version.

**How to apply:** Never attempt to install firebase-admin in this project's Replit environment. Use Firebase client SDK + Firestore rules for server-side operations, or use Firebase REST API with a service account token if absolutely needed.
